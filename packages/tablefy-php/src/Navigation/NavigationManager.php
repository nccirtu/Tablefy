<?php

namespace Nccirtu\Tablefy\Navigation;

use Illuminate\Routing\Router;
use Illuminate\Support\Str;
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

            $item = app($class)->tablefyNavigationItem(Str::beforeLast($name, '.index'));
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
}
