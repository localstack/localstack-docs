/**
 * Azure resource provider taxonomy for the LocalStack for Azure documentation.
 *
 * The `Local Azure Services` page can be browsed two ways: a flat alphabetical
 * grid (the original), and a hierarchy grouped by resource provider that mirrors
 * how the official Azure documentation organizes resource types
 * (https://learn.microsoft.com/en-us/azure/templates/).
 *
 * Two things live here because neither can be derived from the coverage data:
 *
 * 1. `DATA_PLANE_PARENTS` — the coverage generator emits separate namespaces for
 *    data-plane APIs (`Microsoft.BlobStorage`, `Microsoft.ServiceBus.DataPlane`, …)
 *    because they are served on different hostnames. They are not real ARM
 *    resource providers, so displaying them as siblings of `Microsoft.Storage`
 *    would invent a taxonomy Azure does not have. They fold into their parent.
 *
 * 2. `PROVIDER_METADATA` — friendly names, descriptions and ordering. The
 *    namespace alone (`Microsoft.Cdn`) is not what a user is looking for when
 *    they want Front Door.
 *
 * The set of providers and resource types themselves is NOT hardcoded — it comes
 * from the `resourceProvider` frontmatter on each service page, which in turn is
 * kept honest against `src/data/azure-coverage/*.json`.
 */

/** Data-plane and vendor-prefixed namespaces → their real ARM resource provider. */
export const DATA_PLANE_PARENTS: Record<string, string> = {
  'Microsoft.BlobStorage': 'Microsoft.Storage',
  'Microsoft.QueueStorage': 'Microsoft.Storage',
  'Microsoft.TableStorage': 'Microsoft.Storage',
  'Microsoft.Tables': 'Microsoft.Storage',
  'Microsoft.EventGrid.DataPlane': 'Microsoft.EventGrid',
  'Microsoft.ServiceBus.DataPlane': 'Microsoft.ServiceBus',
  'Microsoft.Insights.DataPlane': 'Microsoft.Insights',
  'Azure.ContainerRegistry': 'Microsoft.ContainerRegistry',
};

export interface ProviderMetadata {
  /** Friendly name, as an Azure user would search for it. */
  displayName: string;
  /** One line describing what the provider covers. */
  description: string;
  /** Lower sorts first. Providers without metadata sort last, alphabetically. */
  order: number;
}

/**
 * Display names are the resource provider's own name — the segment after
 * "Microsoft." — matching how Azure lists them at
 * learn.microsoft.com/azure/templates. So `Microsoft.Web` is "Web", not "App
 * Service and Functions". Marketing names drift and vary per resource type
 * inside a provider; the namespace does not.
 *
 * The description carries the friendly explanation instead.
 */
export const PROVIDER_METADATA: Record<string, ProviderMetadata> = {
  'Microsoft.Network': {
    displayName: 'Network',
    description:
      'Azure networking: virtual networks, subnets, private endpoints, private DNS, NAT gateways, route tables and network interfaces.',
    order: 10,
  },
  'Microsoft.Web': {
    displayName: 'Web',
    description: 'App Service and Azure Functions: web apps, function apps and their App Service plans.',
    order: 20,
  },
  'Microsoft.Storage': {
    displayName: 'Storage',
    description: 'Storage accounts and the blob, queue and table data-plane services.',
    order: 30,
  },
  'Microsoft.Insights': {
    displayName: 'Insights',
    description:
      'Azure Monitor: metrics, alerts, action groups, autoscale, diagnostic settings, workbooks and Application Insights.',
    order: 40,
  },
  'Microsoft.OperationalInsights': {
    displayName: 'OperationalInsights',
    description: 'Log Analytics workspaces and the queries that run against them.',
    order: 50,
  },
  'Microsoft.Resources': {
    displayName: 'Resources',
    description: 'Azure Resource Manager: subscriptions, resource groups and template deployments.',
    order: 60,
  },
  'Microsoft.ResourceGraph': {
    displayName: 'ResourceGraph',
    description: 'KQL queries across the resources in a subscription.',
    order: 70,
  },
  'Microsoft.Authorization': {
    displayName: 'Authorization',
    description: 'Azure RBAC role definitions and role assignments.',
    order: 80,
  },
  'Microsoft.ManagedIdentity': {
    displayName: 'ManagedIdentity',
    description: 'User-assigned identities and federated identity credentials.',
    order: 90,
  },
  'Microsoft.KeyVault': {
    displayName: 'KeyVault',
    description: 'Vaults, secrets, keys and certificates.',
    order: 100,
  },
  'Microsoft.Sql': {
    displayName: 'Sql',
    description: 'Azure SQL Database: logical servers and the databases they host.',
    order: 110,
  },
  'Microsoft.DBforPostgreSQL': {
    displayName: 'DBforPostgreSQL',
    description: 'Azure Database for PostgreSQL: flexible servers.',
    order: 120,
  },
  'Microsoft.DocumentDB': {
    displayName: 'DocumentDB',
    description: 'Cosmos DB accounts for the NoSQL and MongoDB APIs.',
    order: 130,
  },
  'Microsoft.ServiceBus': {
    displayName: 'ServiceBus',
    description: 'Namespaces, queues, topics and subscriptions, with their data plane.',
    order: 140,
  },
  'Microsoft.EventGrid': {
    displayName: 'EventGrid',
    description: 'Topics, subscriptions and event publishing.',
    order: 150,
  },
  'Microsoft.ContainerService': {
    displayName: 'ContainerService',
    description: 'Azure Kubernetes Service: managed clusters, node pools and cluster credentials.',
    order: 155,
  },
  'Microsoft.ContainerInstance': {
    displayName: 'ContainerInstance',
    description: 'Serverless container groups.',
    order: 160,
  },
  'Microsoft.ContainerRegistry': {
    displayName: 'ContainerRegistry',
    description: 'Private container registries, with their data plane.',
    order: 170,
  },
  'Microsoft.ApiManagement': {
    displayName: 'ApiManagement',
    description: 'API gateways, products and policies.',
    order: 180,
  },
  'Microsoft.Cdn': {
    displayName: 'Cdn',
    description: 'Azure Front Door and CDN: profiles, endpoints, routes and rules engines.',
    order: 190,
  },
};

/** Fold a data-plane namespace into its real ARM parent. Pass-through otherwise. */
export function canonicalProvider(namespace: string): string {
  return DATA_PLANE_PARENTS[namespace] ?? namespace;
}

/**
 * Metadata for a provider, with a usable fallback so a newly-added provider
 * renders sensibly before anyone gets round to describing it.
 */
export function providerMetadata(namespace: string): ProviderMetadata {
  return (
    PROVIDER_METADATA[namespace] ?? {
      displayName: namespace.replace(/^Microsoft\./, ''),
      description: `Resource types under the ${namespace} resource provider.`,
      order: 9999,
    }
  );
}

/** Slug used in the provider-grouped view, e.g. "Microsoft.Network" → "microsoft-network". */
export function providerSlug(namespace: string): string {
  return namespace.toLowerCase().replace(/\./g, '-');
}
