<?php

use App\Http\Controllers\Tablefy\CustomerController;
use Illuminate\Support\Facades\Route;

// @generated – in routes/web.php einbinden via:  require __DIR__.'/tablefy.php';
//
// Das Companion-Paket würde später ein Makro `Route::tablefyResource(...)` bereitstellen
// (identisch zu resource(), nur ohne `show`). Bis dahin: Standard-Resource-Routen.
Route::resource('customers', CustomerController::class)->except(['show']);
