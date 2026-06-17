<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'name',
        'email',
        'status',
        'total_spent',
    ];

    protected $casts = [
        'total_spent' => 'decimal:2',
    ];

    /** Von TablefyController::index() für die Suche genutzt. */
    public static array $tablefySearchable = ['name', 'email'];

    /** Whitelist sortierbarer Spalten (verhindert SQL-Injection über ?sort=...). */
    public static array $tablefySortable = ['name', 'total_spent', 'created_at'];

    /** Whitelist filterbarer Spalten (von ?filter[...] gelesen). */
    public static array $tablefyFilterable = ['status'];
}
