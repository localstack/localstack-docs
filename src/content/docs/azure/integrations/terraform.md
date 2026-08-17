---
title: Terraform
description: Get started with the `terraform` tool on LocalStack.
template: doc
sidebar:
    order: 4
---

## Introduction

Terraform is an Infrastructure-as-Code (IaC) tool that can deploy your full infrastructure with a few simple commands, in a reproducible manner.
This guide will show you how to use it with LocalStack.

## Getting started

This guide is designed for users who are new to LocalStack for Azure emulator and assumes basic knowledge of how Terraform works.
We will demonstrate how to create an Azure resource group using Terraform.

### Terraform configuration

Create the following two files:

A Terraform template with the provider information called `provider.tf`:

```shell provider.tf
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "5.1.0"
    }

    # only needed for the `random_uuid` resource 
    random = {
      source  = "hashicorp/random"
      version = "3.9.0"
    }
  }
}

provider "azurerm" {
  features {}

  metadata_host   = "localhost.localstack.cloud:4566"
  subscription_id = "00000000-0000-0000-0000-000000000000"
}
```

Please note the `metadata_host` attribute!
This is essential to ensure that the infrastructure is deployed to the LocalStack Emulator, instead of to the real cloud.

A Terraform file that contains the resource group information called `main.tf`:

```shell main.tf
resource "random_uuid" "uuid" {}

resource "azurerm_resource_group" "rg" {
  name     = "rg-hello-tf-${random_uuid.uuid.result}"
  location = "westeurope"
}
```

### Deploy Terraform

You can now use Terraform like you would normally.

First initialize the repository, and download the specified provider:

```
terraform init
```

Second, apply (create) the specified resources:

```
terraform apply
```

The `terraform` tool will now create the resource group.

If you've followed our guide on how to configure the `az` CLI tool to point to LocalStack, you can verify that the resource exist by using the `az` tool:

```shell
az group list
```
