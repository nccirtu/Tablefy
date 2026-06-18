<?php

namespace Nccirtu\Tablefy\Kanban\Events;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/** Fired after a Kanban card has been moved (and persisted). */
class KanbanCardMoved
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public readonly Model $record,
        public readonly ?string $from,
        public readonly string $to,
    ) {}
}
