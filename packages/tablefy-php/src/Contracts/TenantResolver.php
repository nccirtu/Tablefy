<?php

namespace Nccirtu\Tablefy\Contracts;

/**
 * Resolves the tenant (team / location / workspace) the current request belongs
 * to. Tablefy stays tenancy-agnostic: the host app binds an implementation, and
 * the base controller scopes every query through it.
 *
 * Bound via `config('tablefy.tenancy.resolver')` — a class string, not a
 * closure, so `config:cache` keeps working.
 */
interface TenantResolver
{
    /** The current tenant key, or null when the request has no tenant context. */
    public function id(): int|string|null;

    /** The column holding the tenant key on tenant-scoped models. */
    public function foreignKey(): string;

    /**
     * The route parameter carrying the tenant (e.g. "current_team"), or null
     * when tenancy is not expressed in the URL. Used to detect whether URLs can
     * be generated at all — see NavigationManager.
     */
    public function routeParameter(): ?string;
}
