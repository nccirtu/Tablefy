<?php

namespace Nccirtu\Tablefy\Kanban;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Wraps a KanbanAction that implements ShouldQueue so it runs on the queue.
 * The transition's request is not available in the worker (null).
 */
class KanbanActionJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    /** @param class-string<\Nccirtu\Tablefy\Kanban\Contracts\KanbanAction> $action */
    public function __construct(
        public string $action,
        public Model $record,
        public ?string $from,
        public string $to,
    ) {}

    public function handle(): void
    {
        app($this->action)->handle(
            $this->record,
            new KanbanTransition($this->record, $this->from, $this->to),
        );
    }
}
