<?php

namespace Nccirtu\Tablefy\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class MakeTablefyChartCommand extends Command
{
    protected $signature = 'make:tablefy-chart {name : The chart name (e.g. RevenueChart)}
        {--resource= : Attach to a resource (e.g. Building) — lands in that resource folder}
        {--detail : Chart for the resource view page (register in $viewCharts; implies --resource)}
        {--type= : Chart type (area|bar|bar-multiple|line|radar|radial|pie) — prompted if omitted}
        {--component : Also scaffold an editable TS override schema (ChartSchema.make())}
        {--force : Overwrite existing files}';

    protected $description = 'Scaffold a Tablefy chart (shadcn/recharts; backend data + optional TS schema).';

    private const TYPES = ['area', 'bar', 'bar-multiple', 'line', 'radar', 'radial', 'pie'];

    public function handle(): int
    {
        $name = Str::studly($this->argument('name'));
        $resource = $this->option('resource');
        $detail = (bool) $this->option('detail');

        if ($detail && ! $resource) {
            $this->error('--detail needs a resource: pass --resource=<Name>.');

            return self::FAILURE;
        }

        $type = $this->option('type')
            ?: $this->choice('Welche Chart-Art?', self::TYPES, 'bar');
        if (! in_array($type, self::TYPES, true)) {
            $this->error("Unknown --type '{$type}'. One of: " . implode(', ', self::TYPES));

            return self::FAILURE;
        }

        [$namespace, $phpTarget, $tsDir, $r] = $this->resolvePlacement($name, $resource, $type);

        $this->writeStub('chart.php', base_path($phpTarget), $r);

        if ($this->option('component')) {
            $this->writeStub('chart-schema.tsx', base_path("{$tsDir}/{$name}.tsx"), $r);
        }

        $this->newLine();
        $this->info("Tablefy chart [{$name}] ({$type}) scaffolded.");
        $this->printNextSteps($name, $namespace, $resource, $detail);

        return self::SUCCESS;
    }

    /**
     * @return array{0:string,1:string,2:string,3:array<string,string>}
     */
    protected function resolvePlacement(string $name, ?string $resource, string $type): array
    {
        $example = $this->example($type);

        if ($resource) {
            $singular = Str::studly(Str::singular($resource));
            $plural = Str::pluralStudly($singular);

            $namespace = "App\\Tablefy\\{$plural}\\Charts";
            $phpTarget = "app/Tablefy/{$plural}/Charts/{$name}.php";
            $tsDir = "resources/js/pages/tablefy/{$plural}/Charts";
            $modelImport = "use App\\Models\\{$singular};\n";
        } else {
            $namespace = 'App\\Tablefy\\Charts';
            $phpTarget = "app/Tablefy/Charts/{$name}.php";
            $tsDir = 'resources/js/pages/tablefy/Charts';
            $modelImport = '';
        }

        $r = [
            '{{ name }}' => $name,
            '{{ namespace }}' => $namespace,
            '{{ modelImport }}' => $modelImport,
            '{{ type }}' => $type,
            '{{ heading }}' => Str::headline($name),
            '{{ description }}' => 'TODO: Beschreibung',
            '{{ xKey }}' => $example['xKey'],
            '{{ seriesProp }}' => $example['seriesProp'],
            '{{ optionsProp }}' => $example['optionsProp'],
            '{{ dataBody }}' => $example['data'],
            '{{ configBody }}' => $example['config'],
        ];

        return [$namespace, $phpTarget, $tsDir, $r];
    }

    /**
     * Per-type example data()/config() bodies + xKey/series/options properties.
     *
     * @return array{xKey:string, seriesProp:string, optionsProp:string, data:string, config:string}
     */
    protected function example(string $type): array
    {
        $cat = fn (array $rows) => implode("\n", $rows);

        // pie + radial share a category/value shape with per-slice colors.
        if ($type === 'pie' || $type === 'radial') {
            return [
                'xKey' => 'browser',
                'seriesProp' => "\n    /** @var array<int, string> */\n    protected array \$series = ['visitors'];\n",
                'optionsProp' => '',
                'data' => $cat([
                    "            ['browser' => 'chrome', 'visitors' => 275],",
                    "            ['browser' => 'safari', 'visitors' => 200],",
                    "            ['browser' => 'firefox', 'visitors' => 187],",
                    "            ['browser' => 'edge', 'visitors' => 173],",
                    "            ['browser' => 'other', 'visitors' => 90],",
                ]),
                'config' => $cat([
                    "            'visitors' => ['label' => 'Visitors'],",
                    "            'chrome' => ['label' => 'Chrome', 'color' => 'var(--chart-1)'],",
                    "            'safari' => ['label' => 'Safari', 'color' => 'var(--chart-2)'],",
                    "            'firefox' => ['label' => 'Firefox', 'color' => 'var(--chart-3)'],",
                    "            'edge' => ['label' => 'Edge', 'color' => 'var(--chart-4)'],",
                    "            'other' => ['label' => 'Other', 'color' => 'var(--chart-5)'],",
                ]),
            ];
        }

        if ($type === 'area') {
            return [
                'xKey' => 'date',
                'seriesProp' => '',
                'optionsProp' => "\n    protected array \$options = ['interactive' => true];\n",
                'data' => $cat([
                    "            ['date' => '2024-04-01', 'desktop' => 222, 'mobile' => 150],",
                    "            ['date' => '2024-05-01', 'desktop' => 165, 'mobile' => 220],",
                    "            ['date' => '2024-06-01', 'desktop' => 178, 'mobile' => 200],",
                    "            ['date' => '2024-06-30', 'desktop' => 446, 'mobile' => 400],",
                ]),
                'config' => $cat([
                    "            'desktop' => ['label' => 'Desktop', 'color' => 'var(--chart-1)'],",
                    "            'mobile' => ['label' => 'Mobile', 'color' => 'var(--chart-2)'],",
                ]),
            ];
        }

        // bar-multiple → two series; bar/line/radar → one.
        $multi = $type === 'bar-multiple';
        $rows = [
            "            ['month' => 'January', 'desktop' => 186" . ($multi ? ", 'mobile' => 80" : '') . '],',
            "            ['month' => 'February', 'desktop' => 305" . ($multi ? ", 'mobile' => 200" : '') . '],',
            "            ['month' => 'March', 'desktop' => 237" . ($multi ? ", 'mobile' => 120" : '') . '],',
            "            ['month' => 'April', 'desktop' => 73" . ($multi ? ", 'mobile' => 190" : '') . '],',
            "            ['month' => 'May', 'desktop' => 209" . ($multi ? ", 'mobile' => 130" : '') . '],',
            "            ['month' => 'June', 'desktop' => 214" . ($multi ? ", 'mobile' => 140" : '') . '],',
        ];
        $config = ["            'desktop' => ['label' => 'Desktop', 'color' => 'var(--chart-1)'],"];
        if ($multi) {
            $config[] = "            'mobile' => ['label' => 'Mobile', 'color' => 'var(--chart-2)'],";
        }

        return [
            'xKey' => 'month',
            'seriesProp' => '',
            'optionsProp' => '',
            'data' => $cat($rows),
            'config' => $cat($config),
        ];
    }

    protected function printNextSteps(string $name, string $namespace, ?string $resource, bool $detail): void
    {
        $fqcn = "\\{$namespace}\\{$name}";

        if ($resource) {
            $controller = Str::studly(Str::singular($resource)) . 'Controller';
            $property = $detail ? 'viewCharts' : 'listCharts';
            $where = $detail ? 'view page' : 'list page';
            $this->line("Next: register it on <fg=cyan>{$controller}</> ({$where}):");
            $this->line("  <fg=green>protected array \${$property} = [{$fqcn}::class];</>");
            $this->line("The generated page renders it via <fg=cyan><TablefyCharts data={charts} /></> (regenerate the page or add it).");
        } else {
            $this->line('Next: load it from a controller and render with <fg=cyan><TablefyCharts></>:');
            $this->line("  <fg=green>'charts' => Inertia::defer(fn () => [app({$fqcn}::class)->resolve(\$request)]),</>");
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
