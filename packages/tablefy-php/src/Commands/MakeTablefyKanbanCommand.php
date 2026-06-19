<?php

namespace Nccirtu\Tablefy\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Retrofit a Kanban view onto an EXISTING Tablefy resource: generates the Card
 * schema file + a `position` migration, and prints the controller `kanban()`
 * method + route change to add by hand (the controller/list page are yours).
 */
class MakeTablefyKanbanCommand extends Command
{
    protected $signature = 'make:tablefy-kanban {name : The resource/model name (e.g. Building)}
        {--generate : Read the table to pre-fill groupBy + columns from the first enum}
        {--force : Overwrite the Card schema if it exists}';

    protected $description = 'Add a Kanban view (Card schema + migration + snippets) to an existing resource';

    public function handle(): int
    {
        $singular = Str::studly(Str::singular($this->argument('name')));
        $plural = Str::pluralStudly($singular);
        $camel = Str::camel($singular);
        $kebab = Str::kebab($singular);
        $table = Str::snake($plural);

        [$groupBy, $values, $title] = $this->detect($table);

        $palette = ['amber', 'blue', 'green', 'violet', 'rose', 'orange', 'cyan', 'slate'];
        if ($values !== []) {
            $columnsTs = [];
            foreach ($values as $i => $v) {
                $columnsTs[] = "        { id: '{$v}', label: '" . Str::headline($v) . "', color: '" . $palette[$i % count($palette)] . "' },";
            }
            $columnsTs = implode("\n", $columnsTs);
            $allowedLine = "\n            ->allowed(['" . implode("', '", $values) . "'])";
        } else {
            $columnsTs = "        // TODO: { id: 'open', label: 'Open', color: 'amber' },";
            $allowedLine = '';
        }

        $r = [
            '{{ singular }}' => $singular,
            '{{ singularCamel }}' => $camel,
            '{{ singularKebab }}' => $kebab,
            '{{ kanbanGroupBy }}' => $groupBy,
            '{{ kanbanColumns }}' => $columnsTs,
            '{{ kanbanTitleField }}' => $title,
            '{{ table }}' => $table,
        ];

        // Shared card-content schema (the Kanban card imports it; reusable for a
        // Card-Grid via <ServerCards>). Editable surface — never clobbered.
        $contentTarget = base_path("resources/js/pages/tablefy/{$plural}/Schemas/{$singular}CardContent.tsx");
        if (File::exists($contentTarget) && ! $this->option('force')) {
            $this->line('  <fg=yellow>skip</>   ' . $this->rel($contentTarget) . '  (exists, use --force)');
        } else {
            File::ensureDirectoryExists(dirname($contentTarget));
            File::put($contentTarget, strtr($this->stub('card-content.tsx'), $r));
            $this->line('  <fg=green>create</> ' . $this->rel($contentTarget));
        }

        // Kanban schema (editable surface) — imports the shared CardContent.
        $cardTarget = base_path("resources/js/pages/tablefy/{$plural}/Schemas/{$singular}Card.tsx");
        if (File::exists($cardTarget) && ! $this->option('force')) {
            $this->line('  <fg=yellow>skip</>   ' . $this->rel($cardTarget) . '  (exists, use --force)');
        } else {
            File::ensureDirectoryExists(dirname($cardTarget));
            File::put($cardTarget, strtr($this->stub('card.tsx'), $r));
            $this->line('  <fg=green>create</> ' . $this->rel($cardTarget));
        }

        // position migration (guarded, idempotent).
        $this->writeMigration($table, $singular);

        // Manual wiring (controller + route + list page are your files).
        $this->newLine();
        $this->info("Kanban scaffolded for [{$singular}]. Wire it up:");
        $this->line("\n<fg=cyan>1)</> Controller — add the import + method:");
        $this->line("   <fg=gray>use Nccirtu\\Tablefy\\Kanban\\Kanban;</>");
        $this->line("   <fg=gray>protected function kanban(): ?Kanban {</>");
        $this->line("   <fg=gray>    return Kanban::make()->groupBy('{$groupBy}')->sortable('position')->perColumn(15){$allowedLine};</>");
        $this->line("   <fg=gray>}</>");
        $this->line("\n<fg=cyan>2)</> Route — add <fg=gray>kanban: true</> to Route::tablefyResource('" . Str::kebab($plural) . "', ...).");
        $this->line("\n<fg=cyan>3)</> List page — render the toggle + <fg=gray><ServerKanban schema={ {$camel}Card } /></> (see docs/GUIDE.md §Kanban).");
        $this->line("\n<fg=cyan>4)</> Add <fg=cyan>'position'</> to the model \$fillable, then <fg=cyan>php artisan migrate</>.");

        return self::SUCCESS;
    }

    /** @return array{0:string,1:array<int,string>,2:string} [groupBy, enumValues, titleField] */
    protected function detect(string $table): array
    {
        $groupBy = 'status';
        $values = [];
        $title = 'name';

        if ($this->option('generate') && Schema::hasTable($table)) {
            $names = [];
            foreach (Schema::getColumns($table) as $c) {
                $names[] = $c['name'];
                $type = (string) ($c['type'] ?? $c['type_name'] ?? '');
                if ($values === [] && preg_match("/enum\\((.*)\\)/i", $type, $m)) {
                    $groupBy = $c['name'];
                    preg_match_all("/'([^']*)'/", $m[1], $vals);
                    $values = $vals[1];
                }
            }
            foreach (['name', 'title', 'label'] as $cand) {
                if (in_array($cand, $names, true)) {
                    $title = $cand;
                    break;
                }
            }
        }

        return [$groupBy, $values, $title];
    }

    protected function writeMigration(string $table, string $singular): void
    {
        $dir = base_path('database/migrations');
        File::ensureDirectoryExists($dir);

        foreach ((array) File::glob("{$dir}/*_add_position_to_{$table}_table.php") as $existing) {
            $this->line('  <fg=yellow>skip</>   ' . $this->rel($existing) . '  (migration exists)');

            return;
        }

        $target = "{$dir}/" . date('Y_m_d_His') . "_add_position_to_{$table}_table.php";
        File::put($target, strtr($this->stub('kanban-position-migration.php'), [
            '{{ table }}' => $table,
            '{{ singular }}' => $singular,
        ]));
        $this->line('  <fg=green>create</> ' . $this->rel($target));
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
