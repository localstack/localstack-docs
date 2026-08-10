---
title: Azure Resource Manager (ARM)
description: Deploy ARM JSON templates to the LocalStack Azure emulator.
template: doc
sidebar:
    order: 2
---

## Introduction

[Azure Resource Manager](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/overview)
is the deployment and management layer for Azure. Every request — from the portal, the CLI, an SDK,
Terraform or Bicep — arrives at Resource Manager as an ARM operation, and declarative deployments
arrive as **ARM JSON templates**.

LocalStack for Azure implements the Resource Manager control plane, which is what makes every other
tool on this page work. ARM templates deploy against the emulator with no extra configuration:
`lstk az start-interception`, then `az deployment group create`.

:::tip
For new work, prefer [Bicep](/azure/connecting/infrastructure-as-code/bicep/). It compiles to the
ARM JSON described here and is considerably easier to read and maintain. This page is for existing
ARM templates and for understanding what Bicep produces.
:::

## Getting started

### Prerequisites

- The Azure CLI.
- LocalStack for Azure running. See [Introduction to LocalStack for Azure](/azure/getting-started/).

```bash
lstk az start-interception
```

### Write a template

```json title="azuredeploy.json"
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "storageAccountName": {
      "type": "string",
      "metadata": { "description": "Globally unique storage account name." }
    },
    "location": {
      "type": "string",
      "defaultValue": "[resourceGroup().location]"
    }
  },
  "resources": [
    {
      "type": "Microsoft.Storage/storageAccounts",
      "apiVersion": "2023-01-01",
      "name": "[parameters('storageAccountName')]",
      "location": "[parameters('location')]",
      "sku": { "name": "Standard_LRS" },
      "kind": "StorageV2"
    }
  ],
  "outputs": {
    "storageId": {
      "type": "string",
      "value": "[resourceId('Microsoft.Storage/storageAccounts', parameters('storageAccountName'))]"
    }
  }
}
```

### Deploy

```bash
az group create --name MyResourceGroup --location westeurope

az deployment group create \
  --resource-group MyResourceGroup \
  --name my-arm-deployment \
  --template-file azuredeploy.json \
  --parameters storageAccountName=lsdocsarm001
```

```bash title="Output"
{
  "outputs": {
    "storageId": {
      "type": "String",
      "value": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/MyResourceGroup/providers/Microsoft.Storage/storageAccounts/lsdocsarm001"
    }
  },
  "state": "Succeeded"
}
```

Template functions are evaluated by the emulator's Resource Manager implementation, so
`resourceGroup()`, `parameters()`, `resourceId()` and template outputs all resolve as they do
against Azure.

### Parameter files

```json title="azuredeploy.parameters.json"
{
  "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "storageAccountName": { "value": "lsdocsarm001" }
  }
}
```

```bash
az deployment group create \
  --resource-group MyResourceGroup \
  --template-file azuredeploy.json \
  --parameters @azuredeploy.parameters.json
```

### Inspect a deployment

```bash
az deployment group show --resource-group MyResourceGroup --name my-arm-deployment
az deployment group list --resource-group MyResourceGroup -o table
```

Per-resource results, which is where a failing deployment explains itself:

```bash
az deployment operation group list \
  --resource-group MyResourceGroup --name my-arm-deployment \
  --query "[].{resource:properties.targetResource.resourceType, \
              state:properties.provisioningState, \
              message:properties.statusMessage.error.message}" -o table
```

### Teardown

```bash
az group delete --name MyResourceGroup --yes
lstk az stop-interception
```

## Seeing the ARM JSON behind a Bicep file

Useful when debugging a Bicep deployment, or when migrating templates:

```bash
az bicep build --file main.bicep --stdout
```

The emitted JSON is exactly what Resource Manager receives, complete with a `metadata._generator`
block recording the Bicep version and a template hash.

## Deployment mode

`az deployment group create` defaults to **Incremental** mode, which leaves resources not named in
the template untouched. Complete mode — which deletes them — is selected with `--mode Complete`.

:::caution
Complete mode has not been verified against the emulator. Prefer Incremental, and delete the
resource group when you want a clean slate.
:::

## Notes

- No sample in the
  [sample repositories](https://github.com/localstack/localstack-azure-samples) authors raw ARM
  JSON — Bicep is the authoring layer everywhere, and `az` transpiles it. The ARM path is verified
  independently rather than through the samples CI.
- Verified operations: `deployment group create` with parameters, inline and file-based; template
  functions; outputs; `deployment group show` / `list`; `deployment operation group list`.
- Subscription- and tenant-scoped deployments (`az deployment sub create`,
  `az deployment tenant create`) are not covered here. The emulator's
  [Resource Manager coverage](/azure/services/resource-manager/) lists which operations are
  implemented.
