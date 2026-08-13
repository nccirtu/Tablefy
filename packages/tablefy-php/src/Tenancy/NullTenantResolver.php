<?php

namespace Nccirtu\Tablefy\Tenancy;

use Nccirtu\Tablefy\Contracts\TenantResolver;

/** Default resolver: the app is single-tenant, nothing is scoped. */
class NullTenantResolver implements TenantResolver
{
    public function id(): int|string|null
    {
        return null;
    }

    public function foreignKey(): string
    {
        return 'tenant_id';
    }

    public function routeParameter(): ?string
    {
        return null;
    }
}
