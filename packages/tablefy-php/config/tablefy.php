<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Tenancy
    |--------------------------------------------------------------------------
    |
    | Tablefy resources can be scoped to a tenant (a team, location or
    | workspace). Bind a resolver that answers "which tenant is this request
    | for?" and mark the scoped models with the `BelongsToTenant` interface.
    |
    | This must be a class string, never a closure — `config:cache` cannot
    | serialize closures, and caching config is mandatory in production.
    |
    */

    'tenancy' => [
        'resolver' => Nccirtu\Tablefy\Tenancy\NullTenantResolver::class,
    ],

];
