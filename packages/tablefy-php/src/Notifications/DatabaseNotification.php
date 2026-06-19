<?php

namespace Nccirtu\Tablefy\Notifications;

use Illuminate\Notifications\Notification as LaravelNotification;

/** Stores a Tablefy notification's payload in the `notifications` table. */
class DatabaseNotification extends LaravelNotification
{
    /** @param array<string, mixed> $payload */
    public function __construct(public array $payload) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return $this->payload;
    }
}
