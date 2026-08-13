<?php

namespace Nccirtu\Tablefy\Contracts;

/**
 * Marker for models that belong to a tenant. Implementing it tells
 * TablefyController to scope every query, and every new record, to the tenant
 * returned by the bound TenantResolver.
 *
 * Enforcement should *also* live in the model (a global scope), because stat
 * groups, chart widgets and relation managers query the model directly and
 * never pass through the controller.
 */
interface BelongsToTenant
{
}
