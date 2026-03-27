---
title: az
description: Get started with the az tool on LocalStack for Azure.
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

### Install the packages

Run the following command to install the required packages:

```
$ pip install azlocal
```

You now have access to the following LocalStack tools:

| CLI tool  | LocalStack tool | Purpose                       |
|-----------|-----------------|-------------------------------|
| az        | azlocal         | Interact with Azure resources |
| azd       | azdlocal        | Deploy ARM/Bicep templates    |
| func      | funclocal       | Deploy Azure Functions        |

The LocalStack variants are wrappers around the existing tools, so you keep the full  functionality of the original tool. It will just redirect all commands to the running LocalStack Emulator.

### Setup the az CLI

To make sure the `az` tool sends requests to the Azure Emulator REST API, run the following command:

```
$ azlocal start_interception
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
$ azlocal stop_interception
```

The `az` CLI tool will now communicate with the Azure REST API on future invocations.

