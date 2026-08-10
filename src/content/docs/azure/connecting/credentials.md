---
title: Credentials
description: How authentication works against the LocalStack Azure emulator.
template: doc
sidebar:
    order: 3
---

## Introduction

The emulator implements the Azure authentication surface but does not verify credentials. Any
service principal is accepted, and the subscription and tenant are fixed. This is what lets you run
the same code against the emulator and against Azure without a real directory.

Two things to keep separate:

- **Your LocalStack Auth Token** — a real credential that licenses the emulator. Keep it secret.
  See [Auth Token](/azure/getting-started/auth-token/).
- **The Azure credentials below** — placeholders the emulator accepts. Not secret, and not usable
  against Azure.

## Fixed identifiers

| Value | Setting |
|---|---|
| Subscription ID | `00000000-0000-0000-0000-000000000000` |
| Tenant ID | `00000000-0000-0000-0000-000000000000` |
| Subscription name | `Emulated Azure Subscription by LocalStack` |
| Client ID | any value — the examples here use `any-app` |
| Client secret | any value — the examples here use `dummy` |

Confirm with the Azure CLI:

```bash
lstk az start-interception
az account show
```

```json title="Output"
{
  "environmentName": "LocalStack",
  "homeTenantId": "00000000-0000-0000-0000-000000000000",
  "id": "00000000-0000-0000-0000-000000000000",
  "isDefault": true,
  "name": "Emulated Azure Subscription by LocalStack",
  "state": "Enabled",
  "tenantId": "00000000-0000-0000-0000-000000000000",
  "user": { "name": "any-app", "type": "servicePrincipal" }
}
```

## Endpoints

The emulator serves everything on port `4566`, including the Azure Resource Manager metadata
discovery document at `/metadata/endpoints`. Most tools only need to be pointed at it once.

| Purpose | Value |
|---|---|
| Resource Manager | `https://localhost.localstack.cloud:4566` |
| Entra ID authority | `https://azure.localhost.localstack.cloud:4566` |
| Metadata host | `localhost.localstack.cloud:4566` |
| Storage suffix | `core.azure.localhost.localstack.cloud` |

`localhost.localstack.cloud` and its subdomains resolve to `127.0.0.1` through public DNS, so
per-resource hostnames such as `mystorageaccount.blob.core.azure.localhost.localstack.cloud:4566`
work without any hosts-file entry.

## Per-tool configuration

| Tool | How it authenticates |
|---|---|
| [Azure CLI](/azure/connecting/azure-cli/) | `lstk az start-interception` — handles credentials for you |
| [Terraform `azurerm`](/azure/connecting/infrastructure-as-code/terraform/) | `metadata_host` plus the all-zero `subscription_id` |
| Terraform `azapi` | explicit `endpoint` block plus `disable_instance_discovery` |
| [Pulumi](/azure/connecting/infrastructure-as-code/pulumi/) | `metadataHost` plus `disableInstanceDiscovery` |
| [Azure PowerShell](/azure/connecting/infrastructure-as-code/azure-powershell/) | `Add-AzEnvironment` with explicit endpoints, and `DisableInstanceDiscovery` |
| [Python SDK](/azure/connecting/azure-sdks/python/) | `azlocal`'s `PythonLocalSdk` helper |

:::caution
A recurring failure across tools is **Entra instance discovery**. Client libraries validate the
authority they are given against the real Microsoft Entra service; the emulator's authority is not
one it knows, so the call fails or hangs. Every tool that needs it has an equivalent switch —
`disable_instance_discovery`, `disableInstanceDiscovery`, `DisableInstanceDiscovery`. If a tool
appears to hang for minutes on sign-in, this is almost always why. See the
[Azure PowerShell page](/azure/connecting/infrastructure-as-code/azure-powershell/) for a measured
example: 300 seconds versus 0.5 seconds.
:::

## Managed identity

The emulator supports managed identities, including user-assigned identities and the federated
identity credentials behind Entra Workload ID. Applications can use `DefaultAzureCredential`
unchanged. Working examples:

- [Function App with Managed Identity](/azure/sample-apps/)
- [Web App with Managed Identity](/azure/sample-apps/)
- [AKS with Entra Workload ID](/azure/tutorials/aks-keda-queue-storage-autoscaling/)

## Related

- [Auth Token](/azure/getting-started/auth-token/)
- [Azure CLI](/azure/connecting/azure-cli/)
- [Managed Identity](/azure/services/managed-identity/)
