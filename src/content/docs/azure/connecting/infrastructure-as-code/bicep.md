---
title: Bicep
description: Deploy Bicep templates to the LocalStack Azure emulator with the Azure CLI.
template: doc
sidebar:
    order: 1
---

## Introduction

[Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview) is a
domain-specific language for declaring Azure resources. It is the recommended authoring format for
Azure Resource Manager: the Azure CLI transpiles Bicep to
[ARM JSON](/azure/connecting/infrastructure-as-code/arm-templates/) and submits that to Resource
Manager, so anything Bicep expresses is an ARM deployment underneath.

Bicep needs no special configuration for the emulator. Once `lstk az start-interception` is active,
`az deployment group create` targets the emulator like any other `az` command. Bicep is the most
widely used IaC format across the
[Azure samples](https://github.com/localstack/localstack-azure-samples) — 74 `.bicep` files across
11 of the 13 samples, with nine of them deployed by CI on every pull request.

## Getting started

### Prerequisites

- The Azure CLI, with the Bicep tooling (`az bicep install`, or the CLI installs it on first use).
- LocalStack for Azure running. See [Introduction to LocalStack for Azure](/azure/getting-started/).

```bash
lstk az start-interception
az bicep version
```

### Write a template

```bicep title="main.bicep"
@minLength(3)
param storageAccountName string

param location string = resourceGroup().location

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource container 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'activities'
  properties: {
    publicAccess: 'None'
  }
}

output storageAccountId string = storageAccount.id
```

A parameter file keeps values out of the template:

```bicep title="main.bicepparam"
using 'main.bicep'

param storageAccountName = 'lsdocsbicep001'
```

### Check the template before deploying

`az bicep build` transpiles to ARM JSON without contacting Azure — a fast syntax and type check:

```bash
az bicep build --file main.bicep --stdout
```

### Deploy

```bash
az group create --name MyResourceGroup --location westeurope

az deployment group create \
  --resource-group MyResourceGroup \
  --name my-deployment \
  --template-file main.bicep \
  --parameters main.bicepparam
```

```bash title="Output"
{
  "state": "Succeeded"
}
```

### Inspect what was deployed

```bash
az resource list --resource-group MyResourceGroup -o table
```

```bash title="Output"
Name             ResourceGroup     Location    Type                               Status
---------------  ----------------  ----------  ---------------------------------  ---------
lsdocsbicep001   MyResourceGroup   westeurope  Microsoft.Storage/storageAccounts  Succeeded
```

When a deployment reports `Failed`, ask Resource Manager which resource failed and why rather than
reading the whole response:

```bash
az deployment operation group list \
  --resource-group MyResourceGroup --name my-deployment \
  --query "[].{resource:properties.targetResource.resourceType, \
              state:properties.provisioningState, \
              message:properties.statusMessage.error.message}" -o table
```

### Teardown

```bash
az group delete --name MyResourceGroup --yes
lstk az stop-interception
```

## Modules

Bicep modules work as they do against Azure. The
[Function App with Service Bus sample](https://github.com/localstack/localstack-azure-samples/tree/main/samples/function-app-service-bus/dotnet/bicep)
splits a nine-module deployment across virtual networks, private endpoints, private DNS zones, a NAT
gateway, Log Analytics and the Function App itself:

```bicep
module network 'modules/virtual_network.bicep' = {
  name: 'network'
  params: {
    prefix: prefix
    location: location
  }
}
```

## Validate and what-if

Both subcommands work against the emulator:

```bash
az deployment group validate --resource-group MyResourceGroup --template-file main.bicep
az deployment group what-if  --resource-group MyResourceGroup --template-file main.bicep
```

:::note
`validate` returns a result with null fields on success rather than a populated report. Treat a
zero exit code as the signal, and use `what-if` when you want to see the change set.
:::

## Examples

Every Bicep sample lives beside an Azure CLI and (usually) a Terraform variant of the same stack:

- [Container Instances with Blob Storage and Key Vault](https://github.com/localstack/localstack-azure-samples/tree/main/samples/aci-blob-storage/python/bicep)
- [Function App with Service Bus over private endpoints](https://github.com/localstack/localstack-azure-samples/tree/main/samples/function-app-service-bus/dotnet/bicep)
- [Function App with storage triggers and bindings](https://github.com/localstack/localstack-azure-samples/tree/main/samples/function-app-storage-http/dotnet/bicep)
- [Web App with PostgreSQL Flexible Server](https://github.com/localstack/localstack-azure-samples/tree/main/samples/web-app-postgresql-flexible-server/python/bicep)
- [Full AKS stack with tags, labels and taints](/azure/tutorials/aks-bicep-tags-labels-taints/)

## Notes

- Resource types with **global** name scope — storage accounts, key vaults, container registries —
  collide across deployments just as they do in Azure. Give each stack a distinct prefix or suffix,
  or reset emulator state between runs.
- Key Vault creation can take up to two minutes on the emulator. Allow for that in pipeline
  timeouts.
- A template that references a container image expects the image to already exist in the registry.
  The samples build and push before deploying; a template-only deployment will leave the container
  resource in a failed state.
