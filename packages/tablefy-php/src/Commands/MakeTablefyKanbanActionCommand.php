<?php

namespace Nccirtu\Tablefy\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class MakeTablefyKanbanActionCommand extends Command
{
    protected $signature = 'make:tablefy-kanban-action {name : The action name (e.g. MarkOrderWon)}
        {--resource= : Attach to a resource (e.g. Order) — lands in that resource folder}
        {--queued : Implement ShouldQueue (runs on the queue)}
        {--force : Overwrite an existing file}';

    protected $description = 'Scaffold a Kanban stage action (runs on a card transition).';

    public function handle(): int
    {
        $name = Str::studly($this->argument('name'));
        $resource = $this->option('resource');
        $queued = (bool) $this->option('queued');

        if ($resource) {
            $plural = Str::pluralStudly(Str::studly(Str::singular($resource)));
            $namespace = "App\\Tablefy\\{$plural}\\KanbanActions";
            $target = "app/Tablefy/{$plural}/KanbanActions/{$name}.php";
        } else {
            $namespace = 'App\\Tablefy\\KanbanActions';
            $target = "app/Tablefy/KanbanActions/{$name}.php";
        }

        $r = [
            '{{ name }}' => $name,
            '{{ namespace }}' => $namespace,
            '{{ queuedImport }}' => $queued ? "use Illuminate\\Contracts\\Queue\\ShouldQueue;\n" : '',
            '{{ queuedImplements }}' => $queued ? ', ShouldQueue' : '',
            '{{ queuedNote }}' => $queued ? 'Runs on the queue (ShouldQueue).' : 'Runs synchronously after the move commits.',
        ];

        $abs = base_path($target);
        if (File::exists($abs) && ! $this->option('force')) {
            $this->line('  <fg=yellow>skip</>   ' . $target . '  (exists, use --force)');

            return self::SUCCESS;
        }

        File::ensureDirectoryExists(dirname($abs));
        File::put($abs, strtr($this->stub('kanban-action.php'), $r));
        $this->line('  <fg=green>create</> ' . $target);

        $this->newLine();
        $this->info("Kanban action [{$name}] scaffolded.");
        $this->line("Register it in the controller's kanban():");
        $this->line("  <fg=green>->onEnter('<column>', \\{$namespace}\\{$name}::class)</>");

        return self::SUCCESS;
    }

    protected function stub(string $name): string
    {
        $published = base_path("stubs/tablefy/{$name}.stub");
        if (File::exists($published)) {
            return File::get($published);
        }

        return File::get(__DIR__ . "/../../stubs/{$name}.stub");
    }
}
