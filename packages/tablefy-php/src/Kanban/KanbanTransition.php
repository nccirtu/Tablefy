<?php

namespace Nccirtu\Tablefy\Kanban;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/** Context for a Kanban card move, passed to stage actions/handlers. */
class KanbanTransition
{
    public function __construct(
        public readonly Model $record,
        public readonly ?string $from,
        public readonly string $to,
        public readonly ?Request $request = null,
    ) {}
}
