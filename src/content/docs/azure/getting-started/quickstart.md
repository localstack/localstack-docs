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
- [LocalStack for Azure](/azure/getting-started/)
- A [LocalStack Auth Token](/azure/getting-started/auth-token/)

## Instructions

Before you begin, make sure that the Emulator is running, see the [installation instructions](/azure/getting-started/).

### Set up the `az` CLI integration

`lstk az` proxies your host `az` CLI against the Azure emulator, using an isolated configuration directory so your global `~/.azure` setup is left untouched.
Run the following command once to prepare it:

```
$ lstk setup azure
```

### Create a resource group

To create a resource group, prefix the same `az` command you would normally run with `lstk az`:

```
$ lstk az group create --name myResourceGroup --location westeurope
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
$ lstk az group show --name myResourceGroup
```

To list all the resource groups, run the following command:

```
$ lstk az group list
```

### Delete the resource group

To delete the resource group, run the following command:

```
$ lstk az group delete --name myResourceGroup --yes
```
