<?php

namespace Nccirtu\Tablefy\Navigation;

use Illuminate\Routing\Router;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Nccirtu\Tablefy\Contracts\TenantResolver;
use Nccirtu\Tablefy\Http\Controllers\TablefyController;

/**
 * Builds the navigation array by scanning the registered routes for resource
 * `*.index` routes whose controller extends TablefyController. This is
 * route-cache safe (no registration side-effects) and auto-discovers every
 * Tablefy resource — no manual list to maintain.
 */
class NavigationManager
{
    public function __construct(protected Router $router)
    {
    }

    /** @return array<int, array{label:string, href:string, icon:?string, group:?string, badge:?string}> */
    public function toArray(): array
    {
        // Resource URLs need the tenant parameter, which is filled from
        // URL::defaults. On pages outside the tenant context (login, settings)
        // that default is absent and route() would throw — so there simply is
        // no resource navigation to show there.
        if (! $this->hasTenantContext()) {
            return [];
        }

        $items = [];

        foreach ($this->router->getRoutes() as $route) {
            $name = $route->getName();
            if (! $name || ! Str::endsWith($name, '.index')) {
                continue;
            }

            $action = $route->getActionName();
            if (! str_contains($action, '@')) {
                continue;
            }

            [$class] = explode('@', $action);
            if (! is_subclass_of($class, TablefyController::class)) {
                continue;
            }

            // One unbuildable item must not take the whole response down.
            $item = rescue(
                fn () => app($class)->tablefyNavigationItem(Str::beforeLast($name, '.index')),
                null,
                report: false,
            );

            if ($item !== null) {
                $items[] = $item;
            }
        }

        usort($items, fn ($a, $b) => $a['sort'] <=> $b['sort']);

        // drop the internal sort key from the payload
        return array_map(fn ($i) => [
            'label' => $i['label'],
            'href' => $i['href'],
            'icon' => $i['icon'],
            'group' => $i['group'],
            'badge' => $i['badge'],
        ], $items);
    }

    /**
     * Whether resource URLs can be generated at all: either the app is not
     * multi-tenant, or the tenant route parameter has a URL default set for
     * this request (done by the app's tenant middleware).
     */
    protected function hasTenantContext(): bool
    {
        $parameter = app(TenantResolver::class)->routeParameter();

        if ($parameter === null) {
            return true;
        }

        $defaults = URL::getDefaultParameters();

        // A present-but-empty default is no context: route() would either throw
        // or produce a URL with a hole where the tenant should be.
        return isset($defaults[$parameter]) && $defaults[$parameter] !== '';
    }
}
