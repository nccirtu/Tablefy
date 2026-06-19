<?php

namespace Nccirtu\Tablefy\Notifications;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/**
 * Filament-style notification builder. The same notification can be flashed as
 * a toast (`send()`) or persisted to the database for the header bell
 * (`sendToDatabase()`).
 *
 *   Notification::make('Gespeichert')->success()->send();
 *   Notification::make('Neuer Auftrag')->info()->sendToDatabase($user);
 */
class Notification
{
    protected string $title = '';

    protected ?string $body = null;

    /** success | info | warning | danger */
    protected string $type = 'success';

    protected ?string $icon = null;

    public static function make(string $title = ''): static
    {
        $notification = new static();
        $notification->title = $title;

        return $notification;
    }

    public function title(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function body(?string $body): static
    {
        $this->body = $body;

        return $this;
    }

    public function icon(?string $icon): static
    {
        $this->icon = $icon;

        return $this;
    }

    public function success(): static
    {
        return $this->type('success');
    }

    public function info(): static
    {
        return $this->type('info');
    }

    public function warning(): static
    {
        return $this->type('warning');
    }

    public function danger(): static
    {
        return $this->type('danger');
    }

    public function type(string $type): static
    {
        $this->type = $type;

        return $this;
    }

    /** Payload stored in the DB / shared with the frontend. */
    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'body' => $this->body,
            'type' => $this->type,
            'icon' => $this->icon,
        ];
    }

    /** Flash as a toast (picked up by the frontend flash listener / sonner). */
    public function send(): static
    {
        // sonner uses "error" rather than "danger".
        $toastType = $this->type === 'danger' ? 'error' : $this->type;

        Inertia::flash('toast', [
            'type' => $toastType,
            'message' => $this->title,
            'body' => $this->body,
        ]);

        return $this;
    }

    /**
     * Persist to the database (shows in the header bell). Defaults to the
     * authenticated user.
     */
    public function sendToDatabase(mixed $notifiable = null): static
    {
        $notifiable ??= Auth::user();

        if ($notifiable && method_exists($notifiable, 'notify')) {
            $notifiable->notify(new DatabaseNotification($this->toArray()));
        }

        return $this;
    }
}
