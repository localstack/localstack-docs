---
title: Quickstart
description: Get started with LocalStack for Azure in a few simple steps.
template: doc
sidebar:
    order: 2
---

## Introduction

This guide explains how to set up the Azure emulator and interact with it using the [`az` CLI](https://learn.microsoft.com/en-us/cli/azure/).
In this guide, you will run some basic Azure CLI commands to manage resource groups in an local Azure development environment without connecting to the real cloud services.

## Prerequisites

- [`lstk`](/azure/getting-started/installation/#lstk)
- [Azure CLI (`az`)](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
- A LocalStack account with a license that covers Azure usage — `lstk` handles authentication for you (see [Authentication](/azure/getting-started/auth-token/))

## Instructions

Start the Azure emulator:

```
$ lstk start
```

For more installation details, see the [installation instructions](/azure/getting-started/).

### Set up the `az` CLI integration

To make sure the `az` tool sends requests to the Azure Emulator REST API, run the following command:

```
$ lstk az start-interception
```

### Create a resource group

To create a resource group, you can now run the same `az` command as you would normally:

```
$ az group create --name myResourceGroup --location westeurope
```

The following output would be displayed:

```bash
{
  "id": "/subscriptions/some-generated-id/resourceGroups/myResourceGroup",
  "location": "westeurope",
  "managedBy": null,
  "name": "myResourceGroup",
  "properties": {
    "provisioningState": "Succeeded"
  },
  "tags": null,
  "type": "Microsoft.Resources/resourceGroups"
}
```

### Check & list resource groups

To check the resource group details, run the following command:

```
$ az group show --name myResourceGroup
```

To list all the resource groups, run the following command:

```
$ az group list
```

### Delete the resource group

To delete the resource group, run the following command:

```
$ az group delete --name myResourceGroup --yes
```

### Teardown

When you're done, disable interception and stop the emulator:

```
$ lstk az stop-interception
$ lstk stop
```

### Alternative: prefixed commands

Instead of interception, you can prefix each `az` command with `lstk az` individually, without changing your global `~/.azure` configuration. Run this once to prepare the integration:

```
$ lstk setup azure
```

Then prefix every command:

```
$ lstk az group create --name myResourceGroup --location westeurope
$ lstk az group show --name myResourceGroup
$ lstk az group list
$ lstk az group delete --name myResourceGroup --yes
```
