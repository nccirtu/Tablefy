<?php

namespace Nccirtu\Tablefy;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Nccirtu\Tablefy\Http\Controllers\TablefyNotificationsController;
use Nccirtu\Tablefy\Commands\MakeTablefyChartCommand;
use Nccirtu\Tablefy\Commands\MakeTablefyKanbanActionCommand;
use Nccirtu\Tablefy\Commands\MakeTablefyKanbanCommand;
use Nccirtu\Tablefy\Commands\MakeTablefyRelationCommand;
use Nccirtu\Tablefy\Commands\MakeTablefyResourceCommand;
use Nccirtu\Tablefy\Commands\MakeTablefyStatCommand;
use Nccirtu\Tablefy\Navigation\NavigationManager;

class TablefyServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(NavigationManager::class);
    }

    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                MakeTablefyResourceCommand::class,
                MakeTablefyStatCommand::class,
                MakeTablefyRelationCommand::class,
                MakeTablefyKanbanCommand::class,
                MakeTablefyChartCommand::class,
                MakeTablefyKanbanActionCommand::class,
            ]);

            $this->publishes([
                __DIR__ . '/../stubs' => base_path('stubs/tablefy'),
            ], 'tablefy-stubs');
        }

        $this->registerTablefyMacro();
        $this->registerResourceRouteMacro();
        $this->registerNotificationsRouteMacro();
        $this->shareNavigation();
    }

    /** `Route::tablefyNotifications()` — bell endpoints (mark read / read-all / delete). */
    protected function registerNotificationsRouteMacro(): void
    {
        if (! Route::hasMacro('tablefyNotifications')) {
            Route::macro('tablefyNotifications', function () {
                Route::post('tablefy/notifications/read-all', [TablefyNotificationsController::class, 'markAllRead'])
                    ->name('tablefy.notifications.readAll');
                Route::post('tablefy/notifications/{id}/read', [TablefyNotificationsController::class, 'markRead'])
                    ->name('tablefy.notifications.read');
                Route::delete('tablefy/notifications/{id}', [TablefyNotificationsController::class, 'destroy'])
                    ->name('tablefy.notifications.destroy');
            });
        }
    }

    /**
     * `Route::tablefyResource('users', UserController::class)` — registers the
     * resource routes (without `show`). Pass `view: true` to also register the
     * `show` route (resource has a view page). Navigation is auto-discovered
     * from these routes, so this is just a tidy alias.
     */
    protected function registerResourceRouteMacro(): void
    {
        if (! Route::hasMacro('tablefyResource')) {
            Route::macro('tablefyResource', function (string $slug, string $controller, bool $view = false, bool $modal = false, bool $kanban = false) {
                // Bulk action endpoint (POST avoids clashing with the destroy
                // wildcard). Used by table bulk actions, e.g. bulk delete.
                Route::post("{$slug}/bulk-destroy", [$controller, 'bulkDestroy'])
                    ->name("{$slug}.bulkDestroy");

                // Kanban: persist a card move (status/position change).
                if ($kanban) {
                    Route::post("{$slug}/kanban/move", [$controller, 'kanbanMove'])
                        ->name("{$slug}.kanban.move");
                }

                // Relation-manager CRUD (Filament-style); runs through the parent
                // relationship so the FK is set server-side.
                Route::post("{$slug}/{parentId}/relations/{relation}", [$controller, 'relationStore'])
                    ->name("{$slug}.relations.store");
                Route::put("{$slug}/{parentId}/relations/{relation}/{relatedId}", [$controller, 'relationUpdate'])
                    ->name("{$slug}.relations.update");
                Route::delete("{$slug}/{parentId}/relations/{relation}/{relatedId}", [$controller, 'relationDestroy'])
                    ->name("{$slug}.relations.destroy");

                $except = [];

                // No view page → no show route.
                if (! $view) {
                    $except[] = 'show';
                }

                // Modal forms → the create/edit GET pages don't exist (store/update
                // stay, the modal posts there).
                if ($modal) {
                    $except[] = 'create';
                    $except[] = 'edit';
                }

                $registration = Route::resource($slug, $controller);

                return $except ? $registration->except($except) : $registration;
            });
        }
    }

    /** Share navigation + the user's notifications with every Inertia response (`tablefy.*`). */
    protected function shareNavigation(): void
    {
        Inertia::share('tablefy', fn () => [
            'navigation' => app(NavigationManager::class)->toArray(),
            'notifications' => $this->resolveNotifications(),
        ]);
    }

    /**
     * Recent + unread-count notifications for the auth user (header bell).
     *
     * @return array{items: array<int, array<string, mixed>>, unread: int}
     */
    protected function resolveNotifications(): array
    {
        $user = Auth::user();

        if (! $user || ! method_exists($user, 'notifications')) {
            return ['items' => [], 'unread' => 0];
        }

        $items = $user->notifications()->latest()->limit(15)->get()->map(fn ($n) => [
            'id' => $n->id,
            'read' => $n->read_at !== null,
            'time' => optional($n->created_at)->diffForHumans(),
            'title' => $n->data['title'] ?? '',
            'body' => $n->data['body'] ?? null,
            'type' => $n->data['type'] ?? 'info',
            'icon' => $n->data['icon'] ?? null,
        ])->all();

        return [
            'items' => $items,
            'unread' => $user->unreadNotifications()->count(),
        ];
    }

    /**
     * Eloquent query helper: applies ?search=, ?filter[col]=, ?sort=&direction=
     * from the request, guarded by the model's static whitelists:
     *   public static array $tablefySearchable / $tablefyFilterable / $tablefySortable
     *
     * Usage:  Customer::query()->tablefy($request)->paginate(15);
     */
    protected function registerTablefyMacro(): void
    {
        Builder::macro('tablefy', function (?Request $request = null) {
            /** @var Builder $this */
            $request = $request ?: request();
            $model = $this->getModel();
            $class = get_class($model);

            $whitelist = static function (string $prop) use ($class): array {
                return property_exists($class, $prop) ? (array) $class::${$prop} : [];
            };

            // 1) Search across the searchable columns.
            $search = trim((string) $request->query('search', ''));
            if ($search !== '') {
                $columns = $whitelist('tablefySearchable');
                if ($columns) {
                    $this->where(function (Builder $q) use ($columns, $search) {
                        foreach ($columns as $column) {
                            $q->orWhere($column, 'like', "%{$search}%");
                        }
                    });
                }
            }

            // 2) Filters (?filter[col]=val). Array → whereIn, scalar → where.
            $filterable = $whitelist('tablefyFilterable');
            foreach ((array) $request->query('filter', []) as $column => $value) {
                if (! in_array($column, $filterable, true)) {
                    continue;
                }
                if ($value === '' || $value === null) {
                    continue;
                }
                is_array($value)
                    ? $this->whereIn($column, $value)
                    : $this->where($column, $value);
            }

            // 3) Sort (?sort=col&direction=asc|desc), whitelisted against injection.
            $sort = $request->query('sort');
            if ($sort && in_array($sort, $whitelist('tablefySortable'), true)) {
                $direction = $request->query('direction') === 'desc' ? 'desc' : 'asc';
                $this->orderBy($sort, $direction);
            }

            return $this;
        });
    }
}
