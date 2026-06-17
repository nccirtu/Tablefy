<?php

namespace Nccirtu\Tablefy\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Nccirtu\Tablefy\Support\ColumnMapper;

class MakeTablefyRelationCommand extends Command
{
    protected $signature = 'make:tablefy-relation {resource : Owning resource (e.g. Company)}
        {relation : Relation method name (e.g. users)}
        {--model= : Related model (default: singular of the relation, e.g. User)}
        {--generate : Read the related table to pre-fill columns + the TS type}
        {--modal : Full relation manager (Filament-style): own form + create/edit/delete modals}
        {--register : Also add the relation to the controller $viewRelations}
        {--force : Overwrite an existing schema file}';

    protected $description = 'Scaffold a relation table (or, with --modal, a full relation manager) for a view-page tab.';

    public function handle(): int
    {
        $resourceSingular = Str::studly(Str::singular($this->argument('resource'))); // Company
        $resourcePlural = Str::pluralStudly($resourceSingular);                       // Companies
        $relation = Str::camel($this->argument('relation'));                          // users
        $relationStudly = Str::studly($relation);                                     // Users
        $modelSingular = $this->option('model')
            ? Str::studly($this->option('model'))
            : Str::studly(Str::singular($relation));                                  // User

        if ($this->option('modal')) {
            return $this->handleModal($resourceSingular, $resourcePlural, $relation, $relationStudly, $modelSingular);
        }

        $typeName = $resourceSingular . Str::studly(Str::singular($relation));        // CompanyUser
        $tableConst = Str::camel($resourceSingular) . $relationStudly . 'Table';      // companyUsersTable
        $target = "resources/js/pages/tablefy/{$resourcePlural}/Tables/{$resourceSingular}{$relationStudly}Table.tsx";

        $r = array_merge(
            [
                '{{ resourceSingular }}' => $resourceSingular,
                '{{ relation }}' => $relation,
                '{{ typeName }}' => $typeName,
                '{{ tableConst }}' => $tableConst,
            ],
            $this->buildColumns($modelSingular, $typeName),
        );

        $this->writeStub('relation-table.tsx', base_path($target), $r);

        $inserted = false;
        if ($this->option('register')) {
            $this->registerViewRelation($resourceSingular, $relation);
            $inserted = $this->insertViewTab($resourceSingular, $resourcePlural, $relation, $relationStudly, $typeName, $tableConst);
        }

        $this->newLine();
        $this->info("Relation table [{$tableConst}] scaffolded.");

        // Only print the manual snippet if the tab wasn't inserted automatically.
        if (! $inserted) {
            $this->printTabSnippet($resourceSingular, $resourcePlural, $relation, $relationStudly, $typeName, $tableConst);
        }

        return self::SUCCESS;
    }

    /** Full relation manager (Filament-style): PHP manager + TS relation component. */
    protected function handleModal(
        string $resourceSingular,
        string $resourcePlural,
        string $relation,
        string $relationStudly,
        string $modelSingular,
    ): int {
        $relatedType = $modelSingular;                                      // Building
        $relatedKebab = Str::kebab($modelSingular);                          // building
        $managerName = $resourceSingular . $relationStudly . 'Manager';      // CompanyBuildingsManager
        $componentName = $resourceSingular . $relationStudly . 'Relation';   // CompanyBuildingsRelation
        $formConst = Str::camel($resourceSingular) . $relationStudly . 'Form'; // companyBuildingsForm
        $namespace = "App\\Tablefy\\{$resourcePlural}\\Relations";
        $resourceSlug = Str::kebab($resourcePlural);                         // companies
        $parentFk = Str::snake($resourceSingular) . '_id';                  // company_id

        $parts = $this->buildRelationParts($modelSingular, $relatedType, $parentFk);

        $r = [
            '{{ namespace }}' => $namespace,
            '{{ managerName }}' => $managerName,
            '{{ componentName }}' => $componentName,
            '{{ resourceSingular }}' => $resourceSingular,
            '{{ relation }}' => $relation,
            '{{ relationStudly }}' => $relationStudly,
            '{{ relatedType }}' => $relatedType,
            '{{ relatedKebab }}' => $relatedKebab,
            '{{ formConst }}' => $formConst,
            '{{ resourceSlug }}' => $resourceSlug,
            '{{ rules }}' => $parts['rules'],
            '{{ formFields }}' => $parts['formFields'],
            '{{ tableColumns }}' => $parts['tableColumns'],
        ];

        $this->writeStub('relation-manager.php', base_path("app/Tablefy/{$resourcePlural}/Relations/{$managerName}.php"), $r);
        $this->writeStub('relation-component.tsx', base_path("resources/js/pages/tablefy/{$resourcePlural}/Relations/{$componentName}.tsx"), $r);

        $inserted = false;
        if ($this->option('register')) {
            $this->registerViewRelation($resourceSingular, $relation);
            $this->registerRelationManager($resourceSingular, $namespace, $managerName);
            $inserted = $this->insertViewTabModal($resourceSingular, $resourcePlural, $relation, $relationStudly, $relatedType, $relatedKebab, $componentName);
        }

        $this->newLine();
        $this->info("Relation manager [{$managerName}] scaffolded.");

        if (! $inserted) {
            $this->printModalTabSnippet($resourceSingular, $relation, $relationStudly, $relatedType, $componentName);
        }

        return self::SUCCESS;
    }

    /**
     * Build form fields / table columns / rules for the related model, excluding
     * the parent FK (set via the relationship).
     *
     * @return array{formFields:string, tableColumns:string, rules:string}
     */
    protected function buildRelationParts(string $modelSingular, string $relatedType, string $parentFk): array
    {
        if ($this->option('generate')) {
            $table = $this->resolveTable($modelSingular);

            if (Schema::hasTable($table)) {
                $columns = [];
                foreach (Schema::getColumns($table) as $c) {
                    if ($c['name'] === $parentFk) {
                        continue; // FK is set through the relationship
                    }
                    $columns[] = [
                        'name' => $c['name'],
                        'type' => $c['type'] ?? $c['type_name'] ?? 'string',
                        'nullable' => $c['nullable'] ?? true,
                    ];
                }
                $parts = ColumnMapper::build($columns, $relatedType);
                $this->info('--generate: read ' . count($columns) . " columns from [{$table}] (excluding {$parentFk}).");

                return [
                    'formFields' => $parts['formFields'],
                    'tableColumns' => $parts['tableColumns'],
                    'rules' => $parts['rules'],
                ];
            }

            $this->warn("Table [{$table}] not found — scaffolding with placeholders.");
        }

        return [
            'formFields' => "    TextInput.make<{$relatedType}>(\"name\").label(\"Name\").required(),",
            'tableColumns' => "    TextColumn.make<{$relatedType}>(\"name\").label(\"Name\").sortable(),",
            'rules' => "            'name' => ['required', 'string', 'max:255'],",
        ];
    }

    /** Best-effort: add the manager class to the controller's $relationManagers. */
    protected function registerRelationManager(string $resourceSingular, string $namespace, string $managerName): void
    {
        $path = base_path("app/Http/Controllers/Tablefy/{$resourceSingular}Controller.php");
        if (! File::exists($path)) {
            $this->warn("Controller not found — add {$managerName}::class to \$relationManagers manually.");

            return;
        }

        $content = File::get($path);
        $fqcn = "\\{$namespace}\\{$managerName}";
        $pattern = '/^\s*protected array \$relationManagers = \[(.*?)\];/m';

        if (preg_match($pattern, $content, $m)) {
            if (str_contains($m[1], $managerName)) {
                $this->line("  <fg=yellow>skip</>   \$relationManagers already lists {$managerName}");

                return;
            }
            $items = trim($m[1]) === '' ? "{$fqcn}::class" : trim($m[1]) . ", {$fqcn}::class";
            $content = preg_replace($pattern, "    protected array \$relationManagers = [{$items}];", $content, 1);
        } else {
            $content = preg_replace(
                '/^(\s*)protected function rules\(/m',
                "    protected array \$relationManagers = [{$fqcn}::class];\n\n$1protected function rules(",
                $content,
                1,
            );
        }

        File::put($path, $content);
        $this->line("  <fg=green>update</> {$resourceSingular}Controller  (\$relationManagers += {$managerName})");
    }

    /** Insert a relation-manager tab (rendering the component) into the view page. */
    protected function insertViewTabModal(
        string $resourceSingular,
        string $resourcePlural,
        string $relation,
        string $relationStudly,
        string $relatedType,
        string $relatedKebab,
        string $componentName,
    ): bool {
        $path = base_path("resources/js/pages/tablefy/{$resourcePlural}/Pages/View{$resourceSingular}.tsx");
        if (! File::exists($path)) {
            return false;
        }

        $content = File::get($path);
        if (preg_match('/value:\s*["\']' . preg_quote($relation, '/') . '["\']/', $content)) {
            $this->line("  <fg=yellow>skip</>   View{$resourceSingular}  (tab '{$relation}' already present)");

            return true;
        }
        if (! str_contains($content, '// @tablefy-relation-tabs')) {
            return false;
        }

        $recordVar = Str::camel($resourceSingular); // company

        $imports = "import { {$componentName} } from \"../Relations/{$componentName}\";";
        if (! str_contains($content, "@/types/tablefy/{$relatedKebab}")) {
            $imports .= "\nimport type { {$relatedType} } from \"@/types/tablefy/{$relatedKebab}\";";
        }
        if (! str_contains($content, "../Relations/{$componentName}")) {
            $content = preg_replace(
                '/(from ["\']\.\.\/' . preg_quote($resourceSingular, '/') . 'Resource["\'];?\n)/',
                "$1{$imports}\n",
                $content,
                1,
                $count,
            );
            if (! $count) {
                return false;
            }
        }

        $tab = implode("\n", [
            '{',
            "            value: \"{$relation}\",",
            "            label: \"{$relationStudly}\",",
            "            lazy: \"{$relation}\",",
            "            content: ({$relation}) => (",
            "              <{$componentName} parentId={" . $recordVar . ".id} " . $relation . "={" . $relation . " as " . $relatedType . "[]} />",
            '            ),',
            '          },',
        ]);

        $content = str_replace(
            '// @tablefy-relation-tabs',
            $tab . "\n\n          // @tablefy-relation-tabs",
            $content,
        );

        File::put($path, $content);
        $this->line("  <fg=green>update</> View{$resourceSingular}  (relation tab '{$relation}' inserted)");

        return true;
    }

    protected function printModalTabSnippet(
        string $resourceSingular,
        string $relation,
        string $relationStudly,
        string $relatedType,
        string $componentName,
    ): void {
        $recordVar = Str::camel($resourceSingular);
        $this->line("Add to View{$resourceSingular}.tsx:");
        $this->line("  <fg=cyan>import { {$componentName} } from \"../Relations/{$componentName}\";</>");
        $this->line("  <fg=cyan>{ value: \"{$relation}\", label: \"{$relationStudly}\", lazy: \"{$relation}\",</>");
        $this->line("  <fg=cyan>  content: ({$relation}) => <{$componentName} parentId={{$recordVar}.id} {$relation}={{$relation} as {$relatedType}[]} /> },</>");
    }

    /**
     * Insert the relation tab into View<Resource>.tsx at the `@tablefy-relation-tabs`
     * marker (+ the needed imports). Idempotent. Returns false (→ print the snippet
     * instead) if the page/marker is missing or an import can't be anchored.
     */
    protected function insertViewTab(
        string $resourceSingular,
        string $resourcePlural,
        string $relation,
        string $relationStudly,
        string $typeName,
        string $tableConst,
    ): bool {
        $path = base_path("resources/js/pages/tablefy/{$resourcePlural}/Pages/View{$resourceSingular}.tsx");

        if (! File::exists($path)) {
            return false;
        }

        $content = File::get($path);

        // Idempotent: a tab for this relation already exists.
        if (preg_match('/value:\s*["\']' . preg_quote($relation, '/') . '["\']/', $content)) {
            $this->line("  <fg=yellow>skip</>   View{$resourceSingular}  (tab '{$relation}' already present)");

            return true;
        }

        if (! str_contains($content, '// @tablefy-relation-tabs')) {
            return false; // marker removed → fall back to printing the snippet
        }

        // 1) Import the relation table schema (anchored after the Resource import).
        $tablePath = "../Tables/{$resourceSingular}{$relationStudly}Table";
        if (! str_contains($content, $tablePath)) {
            $importLine = "import { {$tableConst}, type {$typeName} } from \"{$tablePath}\";";
            $content = preg_replace(
                '/(from ["\']\.\.\/' . preg_quote($resourceSingular, '/') . 'Resource["\'];?\n)/',
                "$1{$importLine}\n",
                $content,
                1,
                $count,
            );
            if (! $count) {
                return false; // couldn't anchor the import → print instead
            }
        }

        // 2) Ensure DataTable is imported from the main package.
        if (! preg_match('/import \{[^}]*\bDataTable\b[^}]*\} from ["\']@nccirtu\/tablefy["\']/s', $content)) {
            $content = preg_replace(
                '/(import \{)([^}]*\} from ["\']@nccirtu\/tablefy["\'];?)/s',
                '$1 DataTable,$2',
                $content,
                1,
            );
        }

        // 3) Insert the tab object before the marker (marker stays for further relations).
        $tab = implode("\n", [
            '{',
            "            value: \"{$relation}\",",
            "            label: \"{$relationStudly}\",",
            "            lazy: \"{$relation}\",",
            "            content: ({$relation}) => (",
            '              <TablefySchema',
            '                schema={[',
            "                  Section.make(\"{$relationStudly}\").schema([",
            '                    <DataTable schema={' . $tableConst . '} data={' . $relation . ' as ' . $typeName . '[]} />,',
            '                  ]),',
            '                ]}',
            '              />',
            '            ),',
            '          },',
        ]);

        $content = str_replace(
            '// @tablefy-relation-tabs',
            $tab . "\n\n          // @tablefy-relation-tabs",
            $content,
        );

        File::put($path, $content);
        $this->line("  <fg=green>update</> View{$resourceSingular}  (tab '{$relation}' inserted)");

        return true;
    }

    /** @return array<string,string> */
    protected function buildColumns(string $modelSingular, string $typeName): array
    {
        if ($this->option('generate')) {
            $table = $this->resolveTable($modelSingular);

            if (Schema::hasTable($table)) {
                $columns = [];
                foreach (Schema::getColumns($table) as $c) {
                    $columns[] = [
                        'name' => $c['name'],
                        'type' => $c['type_name'] ?? $c['type'] ?? 'string',
                        'nullable' => $c['nullable'] ?? true,
                    ];
                }
                $parts = ColumnMapper::build($columns, $typeName);
                $this->info('--generate: read ' . count($columns) . " columns from [{$table}].");

                return [
                    '{{ typeBody }}' => $parts['type'],
                    '{{ tableColumns }}' => $parts['tableColumns'],
                ];
            }

            $this->warn("Table [{$table}] not found — scaffolding with placeholders.");
        }

        return [
            '{{ typeBody }}' => "  id: number;\n  // TODO: Felder der Relation",
            '{{ tableColumns }}' => "    // TODO: Spalten, z.B. TextColumn.make<{$typeName}>(\"name\").label(\"Name\").sortable(),",
        ];
    }

    protected function resolveTable(string $modelSingular): string
    {
        $modelClass = "App\\Models\\{$modelSingular}";
        if (class_exists($modelClass)) {
            return (new $modelClass)->getTable();
        }

        return Str::snake(Str::pluralStudly($modelSingular));
    }

    /** Best-effort: add the relation to an active $viewRelations, or insert one. */
    protected function registerViewRelation(string $resourceSingular, string $relation): void
    {
        $path = base_path("app/Http/Controllers/Tablefy/{$resourceSingular}Controller.php");

        if (! File::exists($path)) {
            $this->warn("Controller not found — add  protected array \$viewRelations = ['{$relation}'];  manually.");

            return;
        }

        $content = File::get($path);
        $pattern = '/^\s*protected array \$viewRelations = \[(.*?)\];/m';

        if (preg_match($pattern, $content, $m)) {
            if (str_contains($m[1], "'{$relation}'") || str_contains($m[1], "\"{$relation}\"")) {
                $this->line("  <fg=yellow>skip</>   \$viewRelations already lists '{$relation}'");

                return;
            }
            $items = trim($m[1]) === '' ? "'{$relation}'" : trim($m[1]) . ", '{$relation}'";
            $content = preg_replace($pattern, "    protected array \$viewRelations = [{$items}];", $content, 1);
        } else {
            $content = preg_replace(
                '/^(\s*)protected function rules\(/m',
                "    protected array \$viewRelations = ['{$relation}'];\n\n$1protected function rules(",
                $content,
                1,
            );
        }

        File::put($path, $content);
        $this->line("  <fg=green>update</> {$resourceSingular}Controller  (\$viewRelations += '{$relation}')");
    }

    protected function printTabSnippet(
        string $resourceSingular,
        string $resourcePlural,
        string $relation,
        string $relationStudly,
        string $typeName,
        string $tableConst,
    ): void {
        $resourceCamel = Str::camel($resourceSingular);
        $this->line("Add to View{$resourceSingular}.tsx:");
        $this->line("  <fg=cyan>import { {$tableConst}, type {$typeName} } from \"../Tables/{$resourceSingular}{$relationStudly}Table\";</>");
        $this->line('  <fg=cyan>{</>');
        $this->line("  <fg=cyan>  value: \"{$relation}\", label: \"{$relationStudly}\", lazy: \"{$relation}\",</>");
        $this->line("  <fg=cyan>  content: ({$relation}) => (</>");
        $this->line("  <fg=cyan>    <TablefySchema schema={[ Section.make(\"{$relationStudly}\").schema([</>");
        $this->line("  <fg=cyan>      <DataTable schema={ {$tableConst} } data={ {$relation} as {$typeName}[] } />,</>");
        $this->line('  <fg=cyan>    ]) ]} />) },</>');
    }

    /** @param array<string,string> $r */
    protected function writeStub(string $stub, string $target, array $r): void
    {
        if (File::exists($target) && ! $this->option('force')) {
            $this->line('  <fg=yellow>skip</>   ' . $this->rel($target) . '  (exists, use --force)');

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

    protected function rel(string $path): string
    {
        return Str::after($path, base_path() . DIRECTORY_SEPARATOR);
    }
}
