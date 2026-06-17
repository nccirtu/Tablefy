<?php

namespace Nccirtu\Tablefy\Relations;

use Illuminate\Database\Eloquent\Model;

/**
 * A relation manager (Filament-style): owns the CRUD rules for a parent's
 * relationship. CRUD runs through the relationship (`$parent->relation()->…`),
 * so the foreign key is set automatically and never appears in the form.
 *
 * Referenced from a controller's $relationManagers; the base controller's
 * relationStore/Update/Destroy resolve and use it.
 */
abstract class RelationManager
{
    /** The parent relationship method name (e.g. 'buildings'). */
    protected string $relation;

    public function relation(): string
    {
        return $this->relation;
    }

    /**
     * Validation rules for a related record. The parent FK is NOT included — it
     * is set by the relationship.
     *
     * @return array<string, mixed>
     */
    abstract public function rules(?Model $record = null): array;
}
