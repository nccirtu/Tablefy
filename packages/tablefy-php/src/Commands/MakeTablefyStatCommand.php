<?php

namespace Nccirtu\Tablefy\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class MakeTablefyStatCommand extends Command
{
    protected $signature = 'make:tablefy-stat {name : The stat group name (e.g. CustomerStats)}
        {--resource= : Attach to a resource (e.g. Customer) — lands in that resource folder}
        {--detail : Detail stats for the resource view page (register in $viewStats; implies --resource)}
        {--component : Also scaffold an editable TS presentation schema (Stats.make())}
        {--force : Overwrite existing files}';

    protected $description = 'Scaffold a Tablefy stat group (backend numbers + optional TS schema).';

    public function handle(): int
    {
        $name = Str::studly($this->argument('name'));        // CustomerStats
        $resource = $this->option('resource');               // Customer | null
        $detail = (bool) $this->option('detail');

        if ($detail && ! $resource) {
            $this->error('--detail needs a resource: pass --resource=<Name>.');

            return self::FAILURE;
        }

        [$namespace, $phpTarget, $tsDir, $r] = $this->resolvePlacement($name, $resource);

        $this->writeStub('stat.php', base_path($phpTarget), $r);

        if ($this->option('component')) {
            $tsTarget = "{$tsDir}/{$name}.tsx";
            $this->writeStub('stat-schema.tsx', base_path($tsTarget), $r);
        }

        $this->newLine();
        $this->info("Tablefy stat group [{$name}] scaffolded.");
        $this->printNextSteps($name, $namespace, $resource, $detail);

        return self::SUCCESS;
    }

    /**
     * @return array{0:string,1:string,2:string,3:array<string,string>}
     */
    protected function resolvePlacement(string $name, ?string $resource): array
    {
        if ($resource) {
            $singular = Str::studly(Str::singular($resource));   // Customer
            $plural = Str::pluralStudly($singular);              // Customers

            $namespace = "App\\Tablefy\\{$plural}\\Stats";
            $phpTarget = "app/Tablefy/{$plural}/Stats/{$name}.php";
            $tsDir = "resources/js/pages/tablefy/{$plural}/Stats";

            $r = [
                '{{ name }}' => $name,
                '{{ namespace }}' => $namespace,
                '{{ modelImport }}' => "use App\\Models\\{$singular};\n",
                '{{ exampleStat }}' => $this->resourceExampleStat($singular, $plural),
            ];

            return [$namespace, $phpTarget, $tsDir, $r];
        }

        // General stat group → own Stats folder.
        $namespace = 'App\\Tablefy\\Stats';
        $phpTarget = "app/Tablefy/Stats/{$name}.php";
        $tsDir = 'resources/js/pages/tablefy/Stats';

        $r = [
            '{{ name }}' => $name,
            '{{ namespace }}' => $namespace,
            '{{ modelImport }}' => '',
            '{{ exampleStat }}' => $this->generalExampleStat(),
        ];

        return [$namespace, $phpTarget, $tsDir, $r];
    }

    protected function resourceExampleStat(string $singular, string $plural): string
    {
        return implode("\n", [
            "            Stat::make('total', {$singular}::count())",
            "                ->label('{$plural}')",
            "                ->description('gesamt')",
            "                ->icon('chart'),",
        ]);
    }

    protected function generalExampleStat(): string
    {
        return implode("\n", [
            "            Stat::make('example', 0)",
            "                ->label('Example')",
            "                ->description('TODO: compute your value')",
            "                ->icon('chart'),",
        ]);
    }

    protected function printNextSteps(string $name, string $namespace, ?string $resource, bool $detail = false): void
    {
        $fqcn = "\\{$namespace}\\{$name}";

        if ($resource) {
            $controller = Str::studly(Str::singular($resource)) . 'Controller';
            $property = $detail ? 'viewStats' : 'listStats';
            $where = $detail ? 'view page' : 'list page';
            $this->line("Next: register it on <fg=cyan>{$controller}</> ({$where}):");
            $this->line("  <fg=green>protected array \${$property} = [{$fqcn}::class];</>");
        } else {
            $this->line('Next: load it from a controller and render with <fg=cyan><TablefyStats></>:');
            $this->line("  <fg=green>'stats' => Inertia::defer(fn () => [app({$fqcn}::class)->resolve(\$request)]),</>");
        }
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
