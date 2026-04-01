---
title: azd
description: Get started with the azd tool on LocalStack for Azure.
template: doc
sidebar:
    order: 2
---

## Introduction

The Azure Developer tool (`azd`) is a tool that allows you to provision Azure resources.
This guide will show you how to use it to interact with LocalStack.

## Getting started

This guide is designed for users who are new to LocalStack for Azure emulator and assumes basic knowledge of how ARM/Bicep templates work in Azure.
We will demonstrate how to create an Azure resource group using a Bicep template.

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

The LocalStack variants are wrappers around the existing tools, so you keep the full functionality of the original tool. It will just redirect all commands to the running LocalStack Emulator.

### Create a template

You can now use `azdlocal` to provision infrastructure in LocalStack, just like you would use `azd` to do this in Azure.

Create the following three files:

A configuration file called `azure.yaml`:

```shell azure.yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/Azure/azure-dev/main/schemas/v1.0/azure.yaml.json

name: simple-template
```

A templated in `infra/main.bicep`:

```shell
targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param name string

var tags = { 'azd-env-name': name }

resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: '${name}-rg'
  location: 'westeurope'
  tags: tags
}
```

And a parameter-file in `infra/main.parameters.json`:

```shell
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "name": {
      "value": "${AZURE_ENV_NAME}"
    }
  }
}
```

### Deploy the template

You can now deploy the template using `azdlocal`:

```
$ azdlocal up
```

The `azd` tool will ask a few questions about the environment name, subscription and location that you want your resources deployed in - just like you would see in Azure.

When the deployment has finished, you should see the following:

```bash
SUCCESS: Your up workflow to provision and deploy to Azure completed in 33 seconds.
```

You can now verify that the resource exist by using the `azlocal` tool:

```shell
azlocal login
azlocal group list
```
