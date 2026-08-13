<?php

namespace Nccirtu\Tablefy\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Nccirtu\Tablefy\Contracts\BelongsToTenant;
use Nccirtu\Tablefy\Contracts\TenantResolver;
use Nccirtu\Tablefy\Support\ColumnMapper;

class MakeTablefyResourceCommand extends Command
{
    protected $signature = 'make:tablefy-resource {name : The resource/model name (e.g. Customer)}
        {--generate : Read the table and pre-fill the type, columns, fields and rules}
        {--view : Also scaffold a view page (show route + View page with lazy relation tabs)}
        {--modal : Create/edit as dialogs instead of pages (no Create/Edit pages or GET routes)}
        {--kanban : Also scaffold a Kanban view (Card schema, list toggle, kanban() + move route, position migration)}
        {--cards : Also scaffold a Card-Grid view (shared CardContent schema, Cards tab, controller $cardsView)}
        {--force : Overwrite all files, including the editable Tables/Schemas}';

    protected $description = 'Scaffold a Tablefy resource (TS pages/schemas/tables + controller + routes).';

    public function handle(): int
    {
        $singular = Str::studly(Str::singular($this->argument('name')));   // Customer
        $plural = Str::pluralStudly($singular);                            // Customers

        $r = [
            '{{ singular }}' => $singular,
            '{{ plural }}' => $plural,
            '{{ singularCamel }}' => Str::camel($singular),                // customer
            '{{ pluralCamel }}' => Str::camel($plural),                    // customers
            '{{ singularKebab }}' => Str::kebab($singular),                // customer / blog-post
            '{{ routeSlug }}' => Str::kebab($plural),                      // customers / blog-posts
            // Route::resource's wildcard for this slug — the key Wayfinder
            // expects (customers → customer, blog-posts → blog_post).
            '{{ routeParam }}' => str_replace('-', '_', Str::snake(Str::singular(Str::kebab($plural)))),
        ];

        $r = array_merge($r, $this->buildBodies($singular, $plural));

        $modal = (bool) $this->option('modal');
        $view = (bool) $this->option('view');
        $kanban = (bool) $this->option('kanban');
        $cards = (bool) $this->option('cards');
        $camel = $r['{{ singularCamel }}'];
        $r['{{ table }}'] = $this->resolveTable($singular, $plural);

        // Kanban placeholders (controller method + use, card columns) + the
        // shared CardContent's title field. Derived from the schema (--generate).
        $r = array_merge($r, $this->buildKanban($kanban, $cards, $singular));

        // List-page placeholders: optional imports, the kanban-enabled hook and
        // the table/views content (Liste ⇄ Kanban ⇄ Karten via <TablefyViews>).
        $r = array_merge($r, $this->buildListPage($kanban, $cards, $singular, $plural, $camel, $r['{{ pluralCamel }}']));

        // Controller: enable the Card-Grid view (+ page size) when --cards.
        $r['{{ cardsProps }}'] = $cards
            ? "\n    // Card-Grid-Ansicht (--cards): liefert die `cards`-Prop (items + hasMore)."
                . "\n    protected bool \$cardsView = true;"
                . "\n    protected int \$cardsPerPage = 12;\n"
            : '';

        // Wayfinder-backed route map for the Resource file. Only the routes that
        // are actually registered are emitted — an unregistered one has no
        // Wayfinder action and would not type-check.
        $r['{{ resourceRoutes }}'] = $this->buildResourceRoutes($singular, $r['{{ routeParam }}'], $view, $modal);

        // Row action to the view page — only when the resource has one (--view),
        // otherwise the show route doesn't exist and the link would 404.
        $r['{{ viewAction }}'] = $view
            ? "      .view((r) => router.visit({$singular}Resource.routes.show(r.id)))\n"
            : '';

        // Form mode: modal opens dialogs (no create/edit pages); page navigates.
        $r['{{ formMode }}'] = $modal ? 'modal' : 'page';
        $r['{{ formImport }}'] = $modal
            ? "import { {$camel}Form } from \"../Schemas/{$singular}Form\";\n"
            : '';
        $r['{{ editAction }}'] = $modal
            ? "      .action({ label: \"Bearbeiten\", icon: \"pencil\", form: { schema: {$camel}Form, method: \"put\", url: (r) => {$singular}Resource.routes.update(r.id), data: (r) => r } })\n"
            : "      .edit((r) => router.visit({$singular}Resource.routes.edit(r.id)))\n";
        $r['{{ newAction }}'] = $modal
            ? "{ label: \"Neu\", icon: \"plus\", form: { schema: {$camel}Form, url: {$singular}Resource.routes.store(), method: \"post\" } }"
            : "{ label: \"Neu\", href: {$singular}Resource.routes.create(), icon: \"plus\" }";

        // Imports of the generated controller, sorted — Pint's ordered_imports
        // would otherwise rewrite the file on its first run.
        $r['{{ imports }}'] = $this->buildImports([
            "App\\Models\\{$singular}",
            \Illuminate\Database\Eloquent\Model::class,
            \Nccirtu\Tablefy\Http\Controllers\TablefyController::class,
            $kanban ? \Nccirtu\Tablefy\Kanban\Kanban::class : null,
            ...$this->formOptionImports,
        ]);

        // target => [stub, editable?]  (editable files are not overwritten without --force)
        $files = [
            "resources/js/types/tablefy/{$r['{{ singularKebab }}']}.ts" => ['type.ts', false],
            "resources/js/pages/tablefy/{$plural}/{$singular}Resource.tsx" => ['resource.tsx', false],
            "resources/js/pages/tablefy/{$plural}/Pages/List{$plural}.tsx" => ['list-page.tsx', false],
            "resources/js/pages/tablefy/{$plural}/Tables/{$plural}Table.tsx" => ['table.tsx', true],
            "resources/js/pages/tablefy/{$plural}/Schemas/{$singular}Form.tsx" => ['form.tsx', true],
            // editable: the controller is your customization surface (rules,
            // $listStats, nav) — preserve it on re-runs (overwrite with --force).
            "app/Http/Controllers/Tablefy/{$singular}Controller.php" => ['controller.php', true],
        ];

        // Modal mode → no Create/Edit pages (forms open as dialogs).
        if (! $modal) {
            $files["resources/js/pages/tablefy/{$plural}/Pages/Create{$singular}.tsx"] = ['create-page.tsx', false];
            $files["resources/js/pages/tablefy/{$plural}/Pages/Edit{$singular}.tsx"] = ['edit-page.tsx', false];
        }

        if ($view) {
            $files["resources/js/pages/tablefy/{$plural}/Pages/View{$singular}.tsx"] = ['view-page.tsx', false];
        }

        // Shared card-content schema (used by Kanban cards and/or the Card grid).
        if ($kanban || $cards) {
            // Editable: the card content is your customization surface.
            $files["resources/js/pages/tablefy/{$plural}/Schemas/{$singular}CardContent.tsx"] = ['card-content.tsx', true];
        }

        if ($kanban) {
            // Editable: the Kanban schema (columns/pipeline) is yours to tweak.
            $files["resources/js/pages/tablefy/{$plural}/Schemas/{$singular}Card.tsx"] = ['card.tsx', true];
        }

        foreach ($files as $target => [$stub, $editable]) {
            $this->writeStub($stub, base_path($target), $r, $editable);
        }

        if ($kanban) {
            $this->writeKanbanMigration($r['{{ table }}']);
        }

        $this->appendRoute($r['{{ routeSlug }}'], $singular, $view, $modal, $kanban);

        $this->newLine();
        $this->info("Tablefy resource [{$singular}] scaffolded.");
        $this->line("Next: make sure routes/web.php contains  <fg=cyan>require __DIR__.'/tablefy.php';</>");
        // The Resource file imports the Wayfinder action module for this
        // controller; until it is generated, the page does not type-check.
        $this->line("       then run <fg=cyan>php artisan wayfinder:generate --with-form</> so the new routes exist in TS.");

        if ($kanban) {
            $this->line("Kanban: add <fg=cyan>'position'</> to the model's \$fillable, then run <fg=cyan>php artisan migrate</>.");
            $this->line("        adjust columns/colors in <fg=cyan>Schemas/{$singular}Card.tsx</> and groupBy in the controller.");
        }

        if ($cards) {
            $this->line("Cards:  adjust image/heading/rows in <fg=cyan>Schemas/{$singular}CardContent.tsx</>.");
            $this->line("        controller has <fg=cyan>\$cardsView = true</> (existing controller? re-run with --force).");
        }

        return self::SUCCESS;
    }

    /** Columns read from the DB by --generate (for enum/kanban detection). */
    protected array $detectedColumns = [];

    /** @return array<string,string> */
    protected function buildBodies(string $singular, string $plural): array
    {
        $columns = [];

        if ($this->option('generate')) {
            $table = $this->resolveTable($singular, $plural);

            if (Schema::hasTable($table)) {
                foreach (Schema::getColumns($table) as $c) {
                    $columns[] = [
                        'name' => $c['name'],
                        // Full type first (keeps enum values like enum('a','b')).
                        'type' => $c['type'] ?? $c['type_name'] ?? 'string',
                        'nullable' => $c['nullable'] ?? true,
                    ];
                }
                $this->info("--generate: read " . count($columns) . " columns from [{$table}].");
            } else {
                $this->warn("Table [{$table}] not found — scaffolding with placeholders. Run --generate after migrating.");
            }
        }

        $this->detectedColumns = $columns;

        if ($columns) {
            $skip = $this->tenantColumns($singular);
            $relations = array_diff_key($this->resolveRelations($columns), array_flip($skip));
            $parts = ColumnMapper::build($columns, $singular, $relations, $skip);

            return [
                '{{ tableImports }}' => $this->usedBuilders($parts['tableColumns'], ['TableSchema', 'ActionsColumn']),
                '{{ formImports }}' => $this->usedBuilders($parts['formFields'], ['FormSchema']),
                '{{ typeBody }}' => $parts['type'],
                '{{ tableColumns }}' => $parts['tableColumns'],
                '{{ detailFields }}' => $parts['detailFields'],
                '{{ formFields }}' => $parts['formFields'],
                '{{ rules }}' => $parts['rules'],
                '{{ with }}' => $this->buildWith($relations),
                '{{ formOptions }}' => $this->buildFormOptions($relations),
            ];
        }

        $camel = Str::camel($singular);

        return [
            '{{ tableImports }}' => 'ActionsColumn, TableSchema, TextColumn',
            '{{ formImports }}' => 'FormSchema, TextInput',
            '{{ typeBody }}' => "  id: number;\n  // TODO: add your model's fields",
            '{{ tableColumns }}' => "    // TODO: add columns, z.B. TextColumn.make<{$singular}>(\"name\").label(\"Name\").sortable(),",
            '{{ detailFields }}' => "                      <Field label=\"ID\" value={{$camel}.id} />,\n                      {/* TODO: weitere Felder */}",
            '{{ formFields }}' => "    // TODO: add fields, z.B. TextInput.make<{$singular}>(\"name\").label(\"Name\").required(),",
            '{{ rules }}' => "            // 'name' => ['required', 'string', 'max:255'],",
            '{{ with }}' => '',
            '{{ formOptions }}' => '',
        ];
    }

    /**
     * Columns the resource must not expose: the tenant key is set by the
     * backend, so putting it in the form would make it a field nobody can
     * fill, and building its options would hand every tenant's rows to the
     * client.
     *
     * @return array<int, string>
     */
    protected function tenantColumns(string $singular): array
    {
        $model = "\\App\\Models\\{$singular}";

        if (! is_a($model, BelongsToTenant::class, true)) {
            return [];
        }

        return [app(TenantResolver::class)->foreignKey()];
    }

    /**
     * Kanban placeholders. The group field + columns are derived from the first
     * enum column found by --generate; without one, sensible TODO defaults.
     *
     * @return array<string,string>
     */
    protected function buildKanban(bool $kanban, bool $cards, string $singular): array
    {
        $empty = [

            '{{ kanbanMethod }}' => '',
            '{{ kanbanGroupBy }}' => 'status',
            '{{ kanbanColumns }}' => "        // TODO: { id: 'open', label: 'Open', color: 'amber' },",
            '{{ kanbanTitleField }}' => 'name',
        ];

        // Neither view → nothing to derive.
        if (! $kanban && ! $cards) {
            return $empty;
        }

        // A title field (the shared CardContent heading): prefer "name"/"title",
        // else fall back to "name". Needed for both --kanban and --cards.
        $title = 'name';
        $names = array_column($this->detectedColumns, 'name');
        foreach (['name', 'title', 'label'] as $cand) {
            if (in_array($cand, $names, true)) {
                $title = $cand;
                break;
            }
        }

        // Card-Grid only → just the heading field; no kanban() / columns needed.
        if (! $kanban) {
            return array_merge($empty, ['{{ kanbanTitleField }}' => $title]);
        }

        // First enum column → group field + its values → columns + allowed().
        $groupBy = 'status';
        $values = [];
        foreach ($this->detectedColumns as $col) {
            if (preg_match("/enum\\((.*)\\)/i", (string) $col['type'], $m)) {
                $groupBy = $col['name'];
                preg_match_all("/'([^']*)'/", $m[1], $vals);
                $values = $vals[1];
                break;
            }
        }

        $palette = ['amber', 'blue', 'green', 'violet', 'rose', 'orange', 'cyan', 'slate'];
        if ($values !== []) {
            $columnsTs = [];
            foreach ($values as $i => $v) {
                $color = $palette[$i % count($palette)];
                $columnsTs[] = "        { id: '{$v}', label: '" . Str::headline($v) . "', color: '{$color}' },";
            }
            $columnsTs = implode("\n", $columnsTs);
            $allowedLine = "\n            ->allowed(['" . implode("', '", $values) . "'])";
        } else {
            $columnsTs = "        // TODO: { id: 'open', label: 'Open', color: 'amber' },";
            $allowedLine = '';
        }

        $method = "\n    // Kanban-Ansicht: gruppiert nach `{$groupBy}`, mit Reorder (position)."
            . "\n    protected function kanban(): ?Kanban"
            . "\n    {"
            . "\n        return Kanban::make()"
            . "\n            ->groupBy('{$groupBy}')"
            . "\n            ->sortable('position')"
            . "\n            ->perColumn(15){$allowedLine};"
            . "\n    }\n";

        return [

            '{{ kanbanMethod }}' => $method,
            '{{ kanbanGroupBy }}' => $groupBy,
            '{{ kanbanColumns }}' => $columnsTs,
            '{{ kanbanTitleField }}' => $title,
        ];
    }

    /**
     * List-page placeholders. Without extra views → a plain <ServerDataTable>.
     * With --kanban / --cards → a <TablefyViews> switcher (Liste ⇄ Kanban ⇄ Karten),
     * the needed imports, and the kanban-enabled hook.
     *
     * @return array<string,string>
     */
    protected function buildListPage(bool $kanban, bool $cards, string $singular, string $plural, string $camel, string $pluralCamel): array
    {
        // Plain table — no view switcher.
        if (! $kanban && ! $cards) {
            $content = "          <ServerDataTable\n"
                . "            schema={ {$pluralCamel}Table }\n"
                . "            paginator={ {$pluralCamel} }\n"
                . "            url={ {$singular}Resource.routes.index() }\n"
                . "            only={['{$pluralCamel}']}\n"
                . "          />,";

            return [
                '{{ viewsImport }}' => '',
                '{{ listExtraImports }}' => '',
                '{{ listHooks }}' => '',
                '{{ listSectionDesc }}' => 'Suchen, filtern, sortieren',
                '{{ listContent }}' => $content,
            ];
        }

        // View switcher: collect icons + view-specific imports.
        $icons = ['LayoutList'];
        $imports = [];
        if ($kanban) {
            $icons[] = 'Columns3';
            $imports[] = 'import { ServerKanban, useKanbanEnabled } from "@nccirtu/tablefy-v2/kanban";';
            $imports[] = "import { {$camel}Card } from \"../Schemas/{$singular}Card\";";
        }
        if ($cards) {
            $icons[] = 'LayoutGrid';
            $imports[] = 'import { ServerCards } from "@nccirtu/tablefy-v2/cards";';
            $imports[] = "import { {$camel}CardContent } from \"../Schemas/{$singular}CardContent\";";
        }
        array_unshift($imports, 'import { ' . implode(', ', $icons) . ' } from "lucide-react";');
        $listExtraImports = implode("\n", $imports) . "\n";

        $listHooks = $kanban
            ? "  // Der Kanban-Tab erscheint nur, wenn der Controller kanban() liefert.\n"
                . "  const kanbanEnabled = useKanbanEnabled();\n\n"
            : '';

        $views = [];
        $views[] = "              {\n"
            . "                value: \"list\",\n"
            . "                label: \"Liste\",\n"
            . "                icon: <LayoutList className=\"h-4 w-4\" />,\n"
            . "                content: (\n"
            . "                  <ServerDataTable\n"
            . "                    schema={ {$pluralCamel}Table }\n"
            . "                    paginator={ {$pluralCamel} }\n"
            . "                    url={ {$singular}Resource.routes.index() }\n"
            . "                    only={['{$pluralCamel}']}\n"
            . "                  />\n"
            . "                ),\n"
            . "              },";
        if ($kanban) {
            $views[] = "              {\n"
                . "                value: \"kanban\",\n"
                . "                label: \"Kanban\",\n"
                . "                icon: <Columns3 className=\"h-4 w-4\" />,\n"
                . "                enabled: kanbanEnabled,\n"
                . "                content: <ServerKanban schema={ {$camel}Card } />,\n"
                . "              },";
        }
        if ($cards) {
            $views[] = "              {\n"
                . "                value: \"cards\",\n"
                . "                label: \"Karten\",\n"
                . "                icon: <LayoutGrid className=\"h-4 w-4\" />,\n"
                . "                content: <ServerCards schema={ {$camel}CardContent } columns={3} perPage={12} />,\n"
                . "              },";
        }

        $content = "          <TablefyViews\n"
            . "            views={[\n"
            . implode("\n", $views) . "\n"
            . "            ]}\n"
            . "          />,";

        $desc = 'Suchen, filtern, sortieren'
            . ($kanban && $cards ? ' — oder als Kanban / Karten' : ($kanban ? ' — oder als Kanban' : ' — oder als Karten'));

        return [
            '{{ viewsImport }}' => ', TablefyViews',
            '{{ listExtraImports }}' => $listExtraImports,
            '{{ listHooks }}' => $listHooks,
            '{{ listSectionDesc }}' => $desc,
            '{{ listContent }}' => $content,
        ];
    }

    /** Create a guarded `position` migration unless one already exists. */
    protected function writeKanbanMigration(string $table): void
    {
        $dir = base_path('database/migrations');
        File::ensureDirectoryExists($dir);

        foreach ((array) File::glob("{$dir}/*_add_position_to_{$table}_table.php") as $existing) {
            $this->line('  <fg=yellow>skip</>   ' . $this->rel($existing) . '  (migration exists)');

            return;
        }

        $name = date('Y_m_d_His') . "_add_position_to_{$table}_table.php";
        $target = "{$dir}/{$name}";
        File::put($target, strtr($this->stub('kanban-position-migration.php'), [
            '{{ table }}' => $table,
            '{{ singular }}' => Str::studly(Str::singular($this->argument('name'))),
        ]));
        $this->line('  <fg=green>create</> ' . $this->rel($target));
    }

    /**
     * Foreign keys (`*_id`) → relationship descriptors (relation/model/label/prop).
     *
     * @param  array<int, array{name:string, type:string, nullable:bool}>  $columns
     * @return array<string, array{relation:string, model:string, label:string, optionsProp:string}>
     */
    protected function resolveRelations(array $columns): array
    {
        $relations = [];
        foreach ($columns as $col) {
            $name = $col['name'];
            if ($name === 'id' || ! Str::endsWith($name, '_id')) {
                continue;
            }
            $base = Str::beforeLast($name, '_id');         // company
            $model = Str::studly(Str::singular($base));     // Company
            $relations[$name] = [
                'relation' => Str::camel($base),            // company
                'model' => $model,
                'label' => $this->resolveLabelColumn($model),
                'optionsProp' => Str::camel($model) . 'Options', // companyOptions
            ];
        }

        return $relations;
    }

    /** Best label column on the related table: name/title/label/email → first string → 'name'. */
    protected function resolveLabelColumn(string $model): string
    {
        $table = $this->resolveTable($model, Str::pluralStudly($model));
        if (! Schema::hasTable($table)) {
            return 'name';
        }

        $cols = Schema::getColumns($table);
        $names = array_column($cols, 'name');
        foreach (['name', 'title', 'label', 'email'] as $preferred) {
            if (in_array($preferred, $names, true)) {
                return $preferred;
            }
        }
        foreach ($cols as $c) {
            $type = strtolower($c['type_name'] ?? $c['type'] ?? '');
            if ((str_contains($type, 'char') || str_contains($type, 'text'))
                && ! in_array($c['name'], ['password', 'remember_token'], true)) {
                return $c['name'];
            }
        }

        return 'name';
    }

    /** @param array<string, array{relation:string, model:string, label:string, optionsProp:string}> $relations */
    /**
     * The builders a generated body actually calls, as a sorted import list.
     * Importing a fixed set instead would leave unused imports behind, which
     * the host's linter rejects.
     *
     * @param  array<int, string>  $always
     */
    protected function usedBuilders(string $body, array $always = []): string
    {
        preg_match_all('/\b([A-Z][A-Za-z0-9]*)\.make\b/', $body, $m);

        $names = array_values(array_unique([...$always, ...$m[1]]));
        sort($names);

        return implode(', ', $names);
    }

    /**
     * Classes the generated formOptions() needs — collected while building it.
     *
     * @var array<int, string>
     */
    protected array $formOptionImports = [];

    /**
     * A sorted `use` block. Nulls are dropped, duplicates collapsed.
     *
     * @param  array<int, string|null>  $classes
     */
    protected function buildImports(array $classes): string
    {
        $classes = array_values(array_unique(array_filter($classes)));
        sort($classes);

        return implode("\n", array_map(fn (string $c) => "use {$c};", $classes));
    }

    protected function buildWith(array $relations): string
    {
        if ($relations === []) {
            return '';
        }
        $list = implode(', ', array_map(
            fn ($r) => "'{$r['relation']}'",
            $relations,
        ));

        return "    /** @var array<int, string> */\n    protected array \$with = [{$list}];\n";
    }

    /** @param array<string, array{relation:string, model:string, label:string, optionsProp:string}> $relations */
    protected function buildFormOptions(array $relations): string
    {
        if ($relations === []) {
            return '';
        }

        $this->formOptionImports[] = \Illuminate\Http\Request::class;

        $lines = [];
        foreach ($relations as $r) {
            $this->formOptionImports[] = "App\\Models\\{$r['model']}";
            $lines[] = "            '{$r['optionsProp']}' => {$r['model']}::orderBy('{$r['label']}')"
                . "->get(['id', '{$r['label']}'])"
                . "->map(fn (\$m) => ['value' => (string) \$m->id, 'label' => \$m->{$r['label']}])->all(),";
        }
        $body = implode("\n", $lines);

        return "\n    /**\n     * Options for the relationship selects, shared as page props.\n     *\n     * @return array<string, mixed>\n     */\n"
            . "    protected function formOptions(Request \$request): array\n    {\n        return [\n{$body}\n        ];\n    }\n";
    }

    protected function resolveTable(string $singular, string $plural): string
    {
        $modelClass = "App\\Models\\{$singular}";
        if (class_exists($modelClass)) {
            return (new $modelClass)->getTable();
        }
        return Str::snake($plural);
    }

    /** @param array<string,string> $r */
    protected function writeStub(string $stub, string $target, array $r, bool $editable): void
    {
        if (File::exists($target) && $editable && ! $this->option('force')) {
            $this->line("  <fg=yellow>skip</>   " . $this->rel($target) . "  (editable, exists)");
            return;
        }

        $contents = strtr($this->stub($stub), $r);
        File::ensureDirectoryExists(dirname($target));
        $existed = File::exists($target);
        File::put($target, $contents);

        $verb = $existed ? '<fg=blue>update</>' : '<fg=green>create</>';
        $this->line("  {$verb} " . $this->rel($target));
    }

    /**
     * The `routes:` block of the Resource file, wired to the Wayfinder actions.
     *
     * Every entry is a function so the URL is built at call time and picks up
     * the URL defaults (tenant slug) — a value computed at import time would
     * miss them depending on module load order.
     */
    protected function buildResourceRoutes(string $singular, string $routeParam, bool $view, bool $modal): string
    {
        $controller = "{$singular}Controller";
        $key = "{ {$routeParam}: id }";

        $lines = [
            "    index: () => {$controller}.index.url(),",
            "    store: () => {$controller}.store.url(),",
        ];

        if (! $modal) {
            $lines[] = "    create: () => {$controller}.create.url(),";
            $lines[] = "    edit: (id: number | string) => {$controller}.edit.url({$key}),";
        }

        if ($view) {
            $lines[] = "    show: (id: number | string) => {$controller}.show.url({$key}),";
        }

        $lines[] = "    update: (id: number | string) => {$controller}.update.url({$key}),";
        $lines[] = "    destroy: (id: number | string) => {$controller}.destroy.url({$key}),";
        $lines[] = "    bulkDestroy: () => {$controller}.bulkDestroy.url(),";

        return implode("\n", $lines);
    }

    protected function stub(string $name): string
    {
        $published = base_path("stubs/tablefy/{$name}.stub");
        if (File::exists($published)) {
            return File::get($published);
        }
        return File::get(__DIR__ . "/../../stubs/{$name}.stub");
    }

    protected function appendRoute(string $slug, string $singular, bool $view = false, bool $modal = false, bool $kanban = false): void
    {
        $path = base_path('routes/tablefy.php');
        $controller = "{$singular}Controller";
        $args = "'{$slug}', {$controller}::class"
            . ($view ? ', view: true' : '')
            . ($modal ? ', modal: true' : '')
            . ($kanban ? ', kanban: true' : '');
        $line = "Route::tablefyResource({$args});";

        if (! File::exists($path)) {
            File::put($path, "<?php\n\nuse Illuminate\\Support\\Facades\\Route;\n\n");
        }

        $current = File::get($path);

        // Replace an existing registration for this slug so re-runs (e.g. adding
        // --view later) stay idempotent instead of duplicating the route.
        $pattern = "/^Route::tablefyResource\\(\\s*'" . preg_quote($slug, '/') . "'.*$/m";

        if (preg_match($pattern, $current)) {
            if (str_contains($current, $line)) {
                $this->line("  <fg=yellow>skip</>   routes/tablefy.php  (route exists)");

                return;
            }

            File::put($path, $this->withControllerImport(preg_replace($pattern, $line, $current), $singular));
            $this->line("  <fg=blue>update</> routes/tablefy.php");

            return;
        }

        File::put($path, $this->withControllerImport($current, $singular) . $line . "\n");
        $this->line("  <fg=green>route</>  routes/tablefy.php");
    }

    /**
     * Add the controller's `use` statement to the route file, keeping the
     * import block sorted — a fully-qualified name inline would be rewritten
     * by the host's formatter on its next run.
     */
    protected function withControllerImport(string $contents, string $singular): string
    {
        $import = "use App\\Http\\Controllers\\Tablefy\\{$singular}Controller;";

        if (str_contains($contents, $import)) {
            return $contents;
        }

        preg_match_all('/^use .+;$/m', $contents, $matches);
        $imports = [...$matches[0], $import];
        sort($imports);

        $body = preg_replace('/^use .+;\n/m', '', $contents);
        $body = preg_replace("/^<\?php\n+/", '', $body);

        return "<?php\n\n" . implode("\n", $imports) . "\n\n" . ltrim($body, "\n");
    }

    protected function rel(string $path): string
    {
        return Str::after($path, base_path() . DIRECTORY_SEPARATOR);
    }
}
