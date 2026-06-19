<?php

namespace Nccirtu\Tablefy\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

/** Mark/clear the authenticated user's database notifications (header bell). */
class TablefyNotificationsController extends Controller
{
    public function markRead(Request $request, string $id)
    {
        $user = $request->user();
        abort_unless($user, 403);

        $user->notifications()->whereKey($id)->update(['read_at' => now()]);

        return back();
    }

    public function markAllRead(Request $request)
    {
        $user = $request->user();
        abort_unless($user, 403);

        $user->unreadNotifications()->update(['read_at' => now()]);

        return back();
    }

    public function destroy(Request $request, string $id)
    {
        $user = $request->user();
        abort_unless($user, 403);

        $user->notifications()->whereKey($id)->delete();

        return back();
    }
}
