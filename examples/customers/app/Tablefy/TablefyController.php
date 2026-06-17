<?php

namespace App\Tablefy;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * Generische Basis für alle Tablefy-Resources.
 *
 * Diese Klasse käme später aus dem Companion-Paket (composer require nccirtu/tablefy-php).
 * Sie erledigt index/create/store/edit/update/destroy generisch – der konkrete
 * Resource-Controller liefert nur Model, Pfade und Validierungsregeln.
 *
 * → Das ist der Kern von "der Entwickler macht sich kaum Gedanken über CRUD".
 */
abstract class TablefyController extends Controller
{
    /** @var class-string<Model> */
    protected string $model;

    /** Ordnername unter resources/js/pages/tablefy/  (z.B. "Customers") */
    protected string $folder;

    /** Singular für Page-Namen/Props (z.B. "Customer") */
    protected string $singular;

    /** Plural für Page-Namen/Props (z.B. "Customers") */
    protected string $plural;

    /** Route-Name-Präfix (z.B. "customers") */
    protected string $routeName;

    /** Validierungsregeln – einzige Validierungs-Wahrheit (Backend). */
    abstract protected function rules(?Model $record = null): array;

    protected function page(string $name): string
    {
        return "tablefy/{$this->folder}/Pages/{$name}";
    }

    public function index(Request $request)
    {
        $query = $this->model::query();

        // 1) Suche über die im Model definierten Spalten (?search=...).
        if ($search = trim((string) $request->query('search'))) {
            $columns = $this->model::$tablefySearchable ?? [];
            $query->where(function ($q) use ($columns, $search) {
                foreach ($columns as $col) {
                    $q->orWhere($col, 'like', "%{$search}%");
                }
            });
        }

        // 2) Filter (?filter[spalte]=wert) – gegen Whitelist abgesichert.
        //    Array-Werte → whereIn (Multi-Select), Skalare → where.
        $filterable = $this->model::$tablefyFilterable ?? [];
        foreach ((array) $request->query('filter', []) as $column => $value) {
            if (! in_array($column, $filterable, true)) {
                continue;
            }
            if ($value === '' || $value === null) {
                continue;
            }
            is_array($value)
                ? $query->whereIn($column, $value)
                : $query->where($column, $value);
        }

        // 3) Sortierung (?sort=spalte&direction=asc|desc) – gegen Whitelist abgesichert.
        $sort = $request->query('sort');
        $sortable = $this->model::$tablefySortable ?? [];
        if ($sort && in_array($sort, $sortable, true)) {
            $direction = $request->query('direction') === 'desc' ? 'desc' : 'asc';
            $query->orderBy($sort, $direction);
        } else {
            $query->latest();
        }

        // 4) Pagination (?page=...&per_page=...). Inertia serialisiert den Paginator
        //    zu { data, current_page, last_page, per_page, total, from, to } – exakt
        //    das, was <DataTable server={...} /> erwartet.
        $records = $query
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        // Prop-Name = camelCase(Plural), passt zu ListCustomers({ customers }).
        return Inertia::render($this->page("List{$this->plural}"), [
            Str::camel($this->plural) => $records,
        ]);
    }

    public function create()
    {
        return Inertia::render($this->page("Create{$this->singular}"));
    }

    public function store(Request $request)
    {
        $this->model::create($request->validate($this->rules()));

        return redirect()
            ->route("{$this->routeName}.index")
            ->with('success', "{$this->singular} wurde erstellt.");
    }

    public function edit(string $id)
    {
        $record = $this->model::findOrFail($id);

        // Prop-Name = camelCase(Singular), passt zu EditCustomer({ customer }).
        return Inertia::render($this->page("Edit{$this->singular}"), [
            Str::camel($this->singular) => $record,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $record = $this->model::findOrFail($id);
        $record->update($request->validate($this->rules($record)));

        return redirect()
            ->route("{$this->routeName}.index")
            ->with('success', "{$this->singular} wurde aktualisiert.");
    }

    public function destroy(string $id)
    {
        $this->model::findOrFail($id)->delete();

        return back()->with('success', "{$this->singular} wurde gelöscht.");
    }
}
