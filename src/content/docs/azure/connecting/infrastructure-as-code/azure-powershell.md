---
title: Azure PowerShell
description: Manage resources on the LocalStack Azure emulator with the Azure PowerShell Az module.
template: doc
sidebar:
    order: 5
---

## Introduction

[Azure PowerShell](https://learn.microsoft.com/en-us/powershell/azure/what-is-azure-powershell) is
the `Az` PowerShell module for managing Azure resources. It reaches the LocalStack Azure emulator
through a custom Azure environment registered with `Add-AzEnvironment`.

## Getting started

### Prerequisites

- [PowerShell 7](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell).
- The `Az.Accounts` and `Az.Resources` modules.
- LocalStack for Azure running. See [Introduction to LocalStack for Azure](/azure/getting-started/).

```powershell
Install-Module -Name Az.Accounts  -Scope CurrentUser -Force
Install-Module -Name Az.Resources -Scope CurrentUser -Force
```

Verified with `Az.Accounts` 5.5.2 and `Az.Resources` 10.1.0 on PowerShell 7.5.4.

### Disable instance discovery first

:::danger
Set this before anything else. Without it, **every Azure PowerShell cmdlet takes minutes**:

```powershell
Update-AzConfig -DisableInstanceDiscovery $true
```

By default the Az module asks Microsoft Entra to validate the authority it has been given. The
emulator's authority is not a known Microsoft one, so the lookup against the real
`login.microsoftonline.com` runs to a five-minute timeout before Az falls back and continues.

Measured against the emulator:

| `DisableInstanceDiscovery` | `Connect-AzAccount` | `New-AzResourceGroup` |
|---|---:|---:|
| `$false` (default) | 300.4s | 101.1s |
| `$true` | **0.5s** | **1.1s** |

The penalty is paid on every cmdlet, not just sign-in, because each token acquisition retries the
lookup. Both runs had telemetry and the upgrade check disabled, so this setting is the only
variable.

This is the same mechanism Pulumi's `azure-native` provider needs
(`disableInstanceDiscovery`) and Terraform's `azapi` provider needs
(`disable_instance_discovery`).

`Update-AzConfig` persists for the current user. Add `-Scope Process` to limit it to the session
so your real-Azure work is unaffected.
:::

### Register the environment

Supply every endpoint explicitly:

```powershell
Add-AzEnvironment -Name LocalStack `
  -ActiveDirectoryEndpoint "https://azure.localhost.localstack.cloud:4566/" `
  -ActiveDirectoryServiceEndpointResourceId "https://management.core.windows.net/" `
  -ResourceManagerEndpoint "https://localhost.localstack.cloud:4566/" `
  -GalleryEndpoint "https://localhost.localstack.cloud:4566/" `
  -GraphEndpoint "https://localhost.localstack.cloud:4566/" `
  -StorageEndpoint "core.azure.localhost.localstack.cloud"
```

:::caution
Do not use the `-ARMEndpoint` parameter set. It asks Azure PowerShell to discover the other
endpoints for itself, and it rejects the emulator with
`Endpoint provided is invalid. Please check the value and retry again with the correct value. (Parameter 'url')`
regardless of the URL form you give it — even though the emulator does serve the discovery document
at `/metadata/endpoints`. `-ARMEndpoint` and the explicit endpoint parameters belong to different,
mutually exclusive parameter sets; mixing them fails with
`Parameter set cannot be resolved using the specified named parameters`.
:::

### Sign in

The emulator accepts any service principal:

```powershell
$sec  = ConvertTo-SecureString "dummy" -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential("any-app", $sec)

Connect-AzAccount -Environment LocalStack -ServicePrincipal -Credential $cred `
  -Tenant "00000000-0000-0000-0000-000000000000"
```

```bash title="Output"
Subscription name                         Tenant
-----------------                         ------
Emulated Azure Subscription by LocalStack 00000000-0000-0000-0000-000000000000
```

:::note
`Connect-AzAccount` emits `WARNING: Unable to acquire token for tenant '' ...` during sign-in. It is
benign: the context is established and subsequent cmdlets work. Confirm with `Get-AzContext`.
:::

### Manage resources

```powershell
New-AzResourceGroup -Name MyResourceGroup -Location westeurope -Force
Get-AzResourceGroup | Select-Object ResourceGroupName, Location
Remove-AzResourceGroup -Name MyResourceGroup -Force
```

```bash title="Output"
ResourceGroupName : MyResourceGroup
Location          : westeurope
ProvisioningState : Succeeded
ResourceId        : /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/MyResourceGroup
```

### Teardown

```powershell
Disconnect-AzAccount
Remove-AzEnvironment -Name LocalStack
```

## Notes

- If a cmdlet appears to hang, check `Get-AzConfig DisableInstanceDiscovery`. A five-minute pause
  is the signature of that setting still being `False`.
- Resources created here are visible to the Azure CLI, and vice versa — both talk to the same
  emulator. Cross-check with `lstk az start-interception` followed by `az group list -o table`.
- No sample in the
  [sample repositories](https://github.com/localstack/localstack-azure-samples) uses Azure
  PowerShell, so it is not covered by the samples CI. Only resource group operations have been
  verified; broader cmdlet coverage follows the emulator's
  [API coverage](/azure/services/) per service.
