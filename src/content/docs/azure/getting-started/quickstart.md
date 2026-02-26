---
title: Quickstart
description: Get started with LocalStack for Azure in a few simple steps.
template: doc
sidebar:
    order: 1
---

## Introduction

This guide explains how to set up the Azure emulator and interact with it using the [`az` CLI](https://learn.microsoft.com/en-us/cli/azure/).
In this guide, you will run some basic Azure CLI commands to manage resource groups in an local Azure development environment without connecting to the real cloud services.

## Prerequisites

- [`localstack`  CLI](https://docs.localstack.cloud/getting-started/installation/#localstack-cli)
- [`azlocal` CLI](https://pypi.org/project/azlocal/)
- [LocalStack for Azure]({{< ref "installation" >}})

## Instructions

Before you begin, make sure that the Emulator is running - see the [Installation Instructions]({{< ref "installation" >}}).

### Setup the `azlocal` tool

To instruct the regular `az` CLI tool to communicate with the Azure emulator, run the following command:

```
$ azlocal start_interception
```

You may see some warnings about experimental commands - you can safely ignore these.

### Create a resource group

To create a resource group, you can now the same `az` command as you would normally:

```
$ az group create --name MyResourceGroup --location westeurope
```

The following output would be displayed:

```bash
{
  "id": "/subscriptions/some-generated-id/resourceGroups/MyResourceGroup",
  "location": "westeurope",
  "managedBy": null,
  "name": "MyResourceGroup",
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
$ az group show --name MyResourceGroup
```

To list all the resource groups, run the following command:

```
$ azlocal group list
```

### Delete the resource group

To delete the resource group, run the following command:

```
$ az group delete --name MyResourceGroup --yes
```

### Teardown

When you're done using the Azure Emulator, you can run the following command:

```
$ azlocal stop_interception
```

All invocations of the `az` CLI tool will now talk to the real Azure Cloud again.