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

### Prerequisites

This guide uses [`lstk`](/aws/developer-tools/running-localstack/lstk/), which proxies your host `az` CLI against the Azure emulator using an isolated configuration directory, so your global `~/.azure` setup is left untouched.

Run the following command once to prepare the integration:

```
$ lstk setup azure
```

### Create and manage the Resource Group

Run the following command to create a resource group in the Emulator, prefixing the same `az` command you would normally run with `lstk az`:

```
$ lstk az group create --name MyResourceGroup --location westeurope
```

To check the resource group details, run the following command:

```
$ lstk az group show --name MyResourceGroup
```

To delete the resource group, run the following command:

```
$ lstk az group delete --name MyResourceGroup --yes
```

