<?php

namespace Nccirtu\Tablefy\Kanban\Contracts;

use Illuminate\Database\Eloquent\Model;
use Nccirtu\Tablefy\Kanban\KanbanTransition;

/**
 * A stage action that runs when a card enters/leaves a column or on any move.
 * Implement ShouldQueue (additionally) to have it dispatched to the queue.
 */
interface KanbanAction
{
    public function handle(Model $record, KanbanTransition $transition): void;
}
