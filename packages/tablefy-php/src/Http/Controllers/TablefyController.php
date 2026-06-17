<?php

namespace Nccirtu\Tablefy\Http\Controllers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Nccirtu\Tablefy\Kanban\Kanban;

/**
 * Generic CRUD base for Tablefy resources. A concrete resource controller only
 * declares the model, the page folder/names, and the validation rules; all of
 * index/create/store/edit/update/destroy is inherited.
 */
abstract class TablefyController extends Controller
{
    /** @var class-string<Model> */
    protected string $model;

    /** Folder under resources/js/pages/tablefy/ (e.g. "Customers"). */
    protected string $folder;

    /** Singular for page names + props (e.g. "Customer"). */
    protected string $singular;

    /** Plural for page names + props (e.g. "Customers"). */
    protected string $plural;

    /** Route-name prefix (e.g. "customers"). */
    protected string $routeName;

    // --- Navigation (resource appears in the sidebar; override per resource) ---

    /** Sidebar label (defaults to the plural name). */
    protected ?string $navigationLabel = null;

    /** lucide icon name, e.g. "users", "box", "tag". */
    protected ?string $navigationIcon = null;

    /** Optional group heading the item is listed under. */
    protected ?string $navigationGroup = null;

    /** Sort order within the navigation (lower = higher up). */
    protected int $navigationSort = 0;

    /** Set false to hide this resource from the navigation. */
    protected bool $shouldRegisterNavigation = true;

    // --- Stats (overview cards; computed on the backend, deferred to the page) ---

    /**
     * Stat groups shown on the list page. Filled by `make:tablefy-stat`.
     *
     * @var array<class-string<\Nccirtu\Tablefy\Stats\StatGroup>>
     */
    protected array $listStats = [];

    /**
     * Stat groups shown on the view page (detail stats).
     *
     * @var array<class-string<\Nccirtu\Tablefy\Stats\StatGroup>>
     */
    protected array $viewStats = [];

    /**
     * Relations rendered as lazy tabs on the view page (method names, e.g.
     * ['posts', 'orders']). Each loads only when its tab is first opened.
     *
     * @var array<int, string>
     */
    protected array $viewRelations = [];

    /**
     * Relations eager-loaded for the table/record so columns can show related
     * attributes (e.g. `company.name` instead of `company_id`).
     *
     * @var array<int, string>
     */
    protected array $with = [];

    /**
     * Relation managers (Filament-style) for view-page relation tabs that can
     * create/edit/delete related records. Filled by `make:tablefy-relation --modal`.
     *
     * @var array<class-string<\Nccirtu\Tablefy\Relations\RelationManager>>
     */
    protected array $relationManagers = [];

    /** Validation rules — the single source of validation truth (backend). */
    abstract protected function rules(?Model $record = null): array;

    /**
     * Kanban configuration for the list page, or null to disable the Kanban
     * view. Override per resource. When set, register the route with
     * `Route::tablefyResource(..., kanban: true)`.
     */
    protected function kanban(): ?Kanban
    {
        return null;
    }

    /**
     * Options for relationship/enum selects, shared as page props so form
     * `Select.optionsFrom("companyOptions")` can resolve them (in pages AND
     * modals). Filled by the generator for FK columns; override to customize.
     *
     * @return array<string, mixed>
     */
    protected function formOptions(Request $request): array
    {
        return [];
    }

    /** Optional live badge next to the nav item (e.g. a count). */
    public function navigationBadge(): ?string
    {
        return null;
    }

    /**
     * The navigation entry for this resource, or null if it should not appear.
     * Built per-request so badges/counts are live. Called by NavigationManager.
     */
    public function tablefyNavigationItem(string $slug): ?array
    {
        if (! $this->shouldRegisterNavigation) {
            return null;
        }

        return [
            'label' => $this->navigationLabel ?? $this->plural,
            'href' => route("{$slug}.index", absolute: false),
            'icon' => $this->navigationIcon,
            'group' => $this->navigationGroup,
            'sort' => $this->navigationSort,
            'badge' => $this->navigationBadge(),
        ];
    }

    protected function page(string $name): string
    {
        return "tablefy/{$this->folder}/Pages/{$name}";
    }

    public function index(Request $request)
    {
        // Deferred so the page shell renders instantly and the table shows its
        // skeleton until the data streams in. Server-table navigation requests
        // this prop by name (`only`), so it resolves in a single request.
        $props = [
            'hasStats' => $this->listStats !== [],
            ...$this->formOptions($request),
            Str::camel($this->plural) => Inertia::defer(
                fn () => $this->model::query()
                    ->with($this->with)
                    ->tablefy($request)
                    ->paginate($request->integer('per_page', 15))
                    ->withQueryString()
            ),
        ];

        // Stats stream in their own deferred group so the table never waits on
        // them (and vice versa); each shows its skeleton independently.
        if ($this->listStats !== []) {
            $props['stats'] = Inertia::defer(
                fn () => $this->resolveStats($this->listStats, $request),
                'stats',
            );
        }

        // Kanban: the config is sent inline (cheap metadata); the grouped,
        // per-column data is optional and resolved only when the Kanban view
        // requests it (partial reload `only: ['kanbanColumns']`).
        if ($kanban = $this->kanban()) {
            $props['kanban'] = $kanban->toArray($this->routeName);
            $props['kanbanColumns'] = Inertia::optional(
                fn () => $this->resolveKanbanColumns($kanban, $request),
            );
        }

        return Inertia::render($this->page("List{$this->plural}"), $props);
    }

    /**
     * Build `{ columnId: { items, total } }` for the Kanban board. Each column
     * is limited to `perColumn`; "load more" raises a single column's limit via
     * the `kanban_limits[<id>]` query param (the board re-resolves this prop).
     *
     * @return array<string, array{items: mixed, total: int}>
     */
    protected function resolveKanbanColumns(Kanban $kanban, Request $request): array
    {
        $group = $kanban->getGroupBy();
        $sort = $kanban->getSortColumn();
        $limits = (array) $request->input('kanban_limits', []);

        $ids = $kanban->columnIds()
            ?? $this->model::query()->distinct()->pluck($group)->filter()->map('strval')->all();

        $out = [];
        foreach ($ids as $id) {
            $base = $this->model::query()->with($this->with)->where($group, $id);
            if ($sort) {
                $base->orderBy($sort);
            }
            $limit = (int) ($limits[$id] ?? $kanban->getPerColumn());
            $out[(string) $id] = [
                'items' => (clone $base)->limit($limit)->get(),
                'total' => (clone $base)->count(),
            ];
        }

        return $out;
    }

    /** Move a card to another column and renumber the target column's order. */
    public function kanbanMove(Request $request)
    {
        $kanban = $this->kanban();
        abort_unless($kanban, 404);

        $data = $request->validate([
            'id' => ['required'],
            'column' => ['required', 'string'],
            'position' => ['nullable', 'integer'],
            'ids' => ['nullable', 'array'],
            'ids.*' => ['required'],
        ]);

        $allowed = $kanban->allowedColumns();
        abort_if($allowed !== null && ! in_array($data['column'], $allowed, true), 422, 'Invalid column.');

        $group = $kanban->getGroupBy();
        $sort = $kanban->getSortColumn();
        $key = (new $this->model)->getKeyName();

        \Illuminate\Support\Facades\DB::transaction(function () use ($data, $group, $sort, $key) {
            $record = $this->model::findOrFail($data['id']);
            $this->authorizeMove($record);
            $record->{$group} = $data['column'];
            if ($sort && $data['position'] !== null) {
                $record->{$sort} = $data['position'];
            }
            $record->save();

            // Stable order: renumber every card in the target column 0..n by the
            // order the client sent (siblings keep a consistent `position`).
            if ($sort && ! empty($data['ids'])) {
                foreach (array_values($data['ids']) as $i => $rid) {
                    $this->model::where($key, $rid)->update([$sort => $i]);
                }
            }
        });

        return back()->with('success', "{$this->singular} moved.");
    }

    /**
     * Authorize a Kanban move. Enforces the model's `update` policy when one is
     * registered (non-breaking for apps without policies). Override to customize.
     */
    protected function authorizeMove(Model $record): void
    {
        if (Gate::getPolicyFor($record) !== null) {
            Gate::authorize('update', $record);
        }
    }

    /**
     * Resolve stat-group classes to the `StatGroupData[]` the frontend renders.
     *
     * @param  array<class-string<\Nccirtu\Tablefy\Stats\StatGroup>>  $groups
     * @return array<int, array<string, mixed>>
     */
    protected function resolveStats(array $groups, Request $request): array
    {
        return array_map(
            fn (string $group) => app($group)->resolve($request),
            array_values($groups),
        );
    }

    public function create(Request $request)
    {
        return Inertia::render($this->page("Create{$this->singular}"), $this->formOptions($request));
    }

    public function store(Request $request)
    {
        $this->model::create($request->validate($this->rules()));

        return $this->redirectAfterWrite($request, "{$this->singular} created.");
    }

    /**
     * After create/update: modal submits (header `X-Tablefy-Modal`) stay on the
     * originating page via back() — deferred props re-resolve, so the table/stats
     * refresh without a navigation. Full-page form submits go to the index.
     */
    protected function redirectAfterWrite(Request $request, string $message)
    {
        return $request->header('X-Tablefy-Modal')
            ? back()->with('success', $message)
            : redirect()->route("{$this->routeName}.index")->with('success', $message);
    }

    public function edit(Request $request, string $id)
    {
        $record = $this->model::findOrFail($id);

        return Inertia::render($this->page("Edit{$this->singular}"), [
            Str::camel($this->singular) => $record,
            ...$this->formOptions($request),
        ]);
    }

    /**
     * View page (only registered when the resource has `view: true`). The record
     * renders instantly; detail stats are deferred, and each relation is an
     * optional prop that loads only when its tab is opened.
     */
    public function show(Request $request, string $id)
    {
        $record = $this->model::with($this->with)->findOrFail($id);

        $props = [
            Str::camel($this->singular) => $record,
            'hasStats' => $this->viewStats !== [],
        ];

        if ($this->viewStats !== []) {
            $props['stats'] = Inertia::defer(
                fn () => $this->resolveStats($this->viewStats, $request),
                'stats',
            );
        }

        // Lazy relation tabs: optional props are resolved only when a partial
        // reload requests them by name (`only: ['posts']`), i.e. on tab click.
        foreach ($this->viewRelations as $relation) {
            $props[$relation] = Inertia::optional(
                fn () => $record->{$relation}
            );
        }

        return Inertia::render($this->page("View{$this->singular}"), $props);
    }

    public function update(Request $request, string $id)
    {
        $record = $this->model::findOrFail($id);
        $record->update($request->validate($this->rules($record)));

        return $this->redirectAfterWrite($request, "{$this->singular} updated.");
    }

    public function destroy(string $id)
    {
        $this->model::findOrFail($id)->delete();

        return back()->with('success', "{$this->singular} deleted.");
    }

    /** Delete the selected rows (table bulk action). */
    public function bulkDestroy(Request $request)
    {
        $ids = (array) $request->input('ids', []);

        if ($ids !== []) {
            $this->model::whereIn((new $this->model)->getKeyName(), $ids)->delete();
        }

        return back()->with('success', count($ids) . " {$this->plural} deleted.");
    }

    // --- Relation managers (view-page relation tabs with CRUD) ---

    protected function resolveRelationManager(string $relation): \Nccirtu\Tablefy\Relations\RelationManager
    {
        foreach ($this->relationManagers as $class) {
            $manager = app($class);
            if ($manager->relation() === $relation) {
                return $manager;
            }
        }

        abort(404, "Unknown relation [{$relation}].");
    }

    /** Create a related record through the relationship (FK auto-set). */
    public function relationStore(Request $request, string $parentId, string $relation)
    {
        $parent = $this->model::findOrFail($parentId);
        $manager = $this->resolveRelationManager($relation);
        $parent->{$relation}()->create($request->validate($manager->rules()));

        return back()->with('success', "{$this->singular} relation created.");
    }

    public function relationUpdate(Request $request, string $parentId, string $relation, string $relatedId)
    {
        $parent = $this->model::findOrFail($parentId);
        $manager = $this->resolveRelationManager($relation);
        $record = $parent->{$relation}()->findOrFail($relatedId);
        $record->update($request->validate($manager->rules($record)));

        return back()->with('success', "{$this->singular} relation updated.");
    }

    public function relationDestroy(string $parentId, string $relation, string $relatedId)
    {
        $parent = $this->model::findOrFail($parentId);
        $this->resolveRelationManager($relation);
        $parent->{$relation}()->findOrFail($relatedId)->delete();

        return back()->with('success', "{$this->singular} relation deleted.");
    }
}
