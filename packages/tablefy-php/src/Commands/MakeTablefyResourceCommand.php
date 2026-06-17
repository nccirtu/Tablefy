<?php

namespace Nccirtu\Tablefy\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Nccirtu\Tablefy\Support\ColumnMapper;

class MakeTablefyResourceCommand extends Command
{
    protected $signature = 'make:tablefy-resource {name : The resource/model name (e.g. Customer)}
        {--generate : Read the table and pre-fill the type, columns, fields and rules}
        {--view : Also scaffold a view page (show route + View page with lazy relation tabs)}
        {--modal : Create/edit as dialogs instead of pages (no Create/Edit pages or GET routes)}
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
        ];

        $r = array_merge($r, $this->buildBodies($singular, $plural));

        $modal = (bool) $this->option('modal');
        $view = (bool) $this->option('view');
        $camel = $r['{{ singularCamel }}'];

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
            ? "{ label: \"Neu\", icon: \"plus\", form: { schema: {$camel}Form, url: {$singular}Resource.routes.store, method: \"post\" } }"
            : "{ label: \"Neu\", href: {$singular}Resource.routes.create, icon: \"plus\" }";

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

        foreach ($files as $target => [$stub, $editable]) {
            $this->writeStub($stub, base_path($target), $r, $editable);
        }

        $this->appendRoute($r['{{ routeSlug }}'], $singular, $view, $modal);

        $this->newLine();
        $this->info("Tablefy resource [{$singular}] scaffolded.");
        $this->line("Next: make sure routes/web.php contains  <fg=cyan>require __DIR__.'/tablefy.php';</>");

        return self::SUCCESS;
    }

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

        if ($columns) {
            $relations = $this->resolveRelations($columns);
            $parts = ColumnMapper::build($columns, $singular, $relations);

            return [
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
    protected function buildWith(array $relations): string
    {
        if ($relations === []) {
            return '';
        }
        $list = implode(', ', array_map(
            fn ($r) => "'{$r['relation']}'",
            $relations,
        ));

        return "    protected array \$with = [{$list}];\n";
    }

    /** @param array<string, array{relation:string, model:string, label:string, optionsProp:string}> $relations */
    protected function buildFormOptions(array $relations): string
    {
        if ($relations === []) {
            return '';
        }

        $lines = [];
        foreach ($relations as $r) {
            $lines[] = "            '{$r['optionsProp']}' => \\App\\Models\\{$r['model']}::orderBy('{$r['label']}')"
                . "->get(['id', '{$r['label']}'])"
                . "->map(fn (\$m) => ['value' => (string) \$m->id, 'label' => \$m->{$r['label']}])->all(),";
        }
        $body = implode("\n", $lines);

        return "\n    protected function formOptions(\\Illuminate\\Http\\Request \$request): array\n    {\n        return [\n{$body}\n        ];\n    }\n";
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

    protected function stub(string $name): string
    {
        $published = base_path("stubs/tablefy/{$name}.stub");
        if (File::exists($published)) {
            return File::get($published);
        }
        return File::get(__DIR__ . "/../../stubs/{$name}.stub");
    }

    protected function appendRoute(string $slug, string $singular, bool $view = false, bool $modal = false): void
    {
        $path = base_path('routes/tablefy.php');
        $controller = "\\App\\Http\\Controllers\\Tablefy\\{$singular}Controller::class";
        $args = "'{$slug}', {$controller}"
            . ($view ? ', view: true' : '')
            . ($modal ? ', modal: true' : '');
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

            File::put($path, preg_replace($pattern, $line, $current));
            $this->line("  <fg=blue>update</> routes/tablefy.php");

            return;
        }

        File::append($path, $line . "\n");
        $this->line("  <fg=green>route</>  routes/tablefy.php");
    }

    protected function rel(string $path): string
    {
        return Str::after($path, base_path() . DIRECTORY_SEPARATOR);
    }
}
