---
title: Azure CLI
description: Point the Azure CLI at the LocalStack Azure emulator with lstk az.
template: doc
sidebar:
    order: 1
---

## Introduction

The Azure CLI tool (`az`) is a tool that allows you to manually create and mange Azure resources.
This guide will show you how to use it to interact with LocalStack.

## Getting started

This guide is designed for users who are new to LocalStack for Azure emulator and assumes basic knowledge of how the Azure CLI works.
We will demonstrate how to create, show and delete an Azure resource group.

### Prerequisites

This guide uses [`lstk`](/azure/developer-tools/running-localstack/lstk/) to point the `az` CLI at the Azure emulator.

To make sure the `az` tool sends requests to the Azure Emulator REST API, run the following command:

```
$ lstk az start-interception
```

### Create and manage the Resource Group

Run the following command to create a resource group in the Emulator:

```
$ az group create --name MyResourceGroup --location westeurope
```

To check the resource group details, run the following command:

```
$ az group show --name MyResourceGroup
```

To delete the resource group, run the following command:

```
$ az group delete --name MyResourceGroup --yes
```

### Teardown

When you're done using the Azure Emulator, you can run the following command:

```
$ lstk az stop-interception
```

The `az` CLI tool will now communicate with the Azure cloud on future invocations.

### Alternative: prefixed commands

Instead of interception, you can prefix each `az` command with `lstk az` individually, without changing your global `~/.azure` configuration. Run this once to prepare the integration:

```
$ lstk setup azure
```

Then prefix every command:

```
$ lstk az group create --name MyResourceGroup --location westeurope
$ lstk az group show --name MyResourceGroup
$ lstk az group delete --name MyResourceGroup --yes
```

