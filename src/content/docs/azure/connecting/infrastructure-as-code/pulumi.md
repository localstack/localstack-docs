---
title: Pulumi
description: Provision Azure resources on the LocalStack Azure emulator with Pulumi and the azure-native provider.
template: doc
sidebar:
    order: 4
---

## Introduction

[Pulumi](https://www.pulumi.com/azure/) provisions infrastructure using general-purpose programming
languages. Its [`azure-native`](https://www.pulumi.com/registry/packages/azure-native/) provider is
generated from the Azure Resource Manager API, so it reaches the LocalStack Azure emulator once you
point its endpoint discovery at the emulator.

## Getting started

This guide assumes basic familiarity with Pulumi. It creates a resource group and a storage account.

### Prerequisites

- [Pulumi](https://www.pulumi.com/docs/install/) installed.
- LocalStack for Azure running. See [Introduction to LocalStack for Azure](/azure/getting-started/).

### Configure the provider

Two settings do the work:

| Setting | Value | Why |
|---|---|---|
| `azure-native:metadataHost` | `localhost.localstack.cloud:4566` | Points ARM endpoint discovery at the emulator instead of `management.azure.com` |
| `azure-native:disableInstanceDiscovery` | `true` | Stops the Azure Identity library validating the authority against Microsoft Entra |

:::caution
There is no `resourceManagerEndpoint` setting on the `azure-native` provider. Pulumi will happily
store an unknown configuration key, and the provider will silently ignore it — the run then
authenticates against the real `login.microsoftonline.com` and fails with
`AADSTS900021: Requested tenant identifier ... is not valid`. `metadataHost` is the correct knob,
the same one the Terraform `azurerm` provider uses.
:::

### Create a project

```bash
mkdir pulumi-localstack && cd pulumi-localstack
pulumi new azure-python --generate-only --yes --name lsdocs-pulumi
pulumi install
pulumi stack init dev
```

Replace `__main__.py` with:

```python title="__main__.py"
import pulumi
from pulumi_azure_native import resources, storage

rg = resources.ResourceGroup("lsdocs-rg", location="westeurope")

sa = storage.StorageAccount(
    "lsdocssa",
    resource_group_name=rg.name,
    location="westeurope",
    sku={"name": storage.SkuName.STANDARD_LRS},
    kind=storage.Kind.STORAGE_V2,
)

pulumi.export("resource_group_name", rg.name)
pulumi.export("storage_account_name", sa.name)
```

### Point the stack at the emulator

```bash
pulumi config set azure-native:subscriptionId 00000000-0000-0000-0000-000000000000
pulumi config set azure-native:tenantId       00000000-0000-0000-0000-000000000000
pulumi config set azure-native:clientId       any-app
pulumi config set azure-native:clientSecret   dummy --secret
pulumi config set azure-native:metadataHost   localhost.localstack.cloud:4566
pulumi config set azure-native:disableInstanceDiscovery true
```

The emulator accepts any service principal, so the client ID and secret are placeholders. The
subscription and tenant are the emulator's fixed all-zero GUIDs.

### Deploy

```bash
pulumi up --yes
```

```bash title="Output"
     Type                                     Name               Status
 +   pulumi:pulumi:Stack                      lsdocs-pulumi-dev  created (4s)
 +   ├─ azure-native:resources:ResourceGroup  lsdocs-rg          created (0.04s)
 +   └─ azure-native:storage:StorageAccount   lsdocssa           created (4s)

Outputs:
    resource_group_name : "lsdocs-rgde41774d"
    storage_account_name: "lsdocssa97e3bb32"

Resources:
    + 3 created
```

Verify with the Azure CLI:

```bash
lstk az start-interception
az group list -o table
```

### Teardown

```bash
pulumi destroy --yes
```

## Notes

- Pulumi appends a random suffix to resource names by default. Set `name=` explicitly on a resource
  if you need a deterministic name — Azure resource types with global name scope, such as storage
  accounts and key vaults, will otherwise collide across runs.
- The equivalent environment variables (`ARM_METADATA_HOSTNAME`, `ARM_SUBSCRIPTION_ID`,
  `ARM_TENANT_ID`, `ARM_CLIENT_ID`, `ARM_CLIENT_SECRET`) work in CI where stack configuration is
  inconvenient.
- There is no Pulumi program in the
  [sample repositories](https://github.com/localstack/localstack-azure-samples) yet, so unlike the
  Azure CLI, Bicep and Terraform paths, Pulumi is not exercised by the samples CI.
