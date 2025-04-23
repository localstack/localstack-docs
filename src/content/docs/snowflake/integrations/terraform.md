---
title: Terraform
description: Use Terraform to interact with the Snowflake emulator
---

{{< preview-notice >}}

## Introduction

[Terraform](https://terraform.io/) is an Infrastructure-as-Code (IaC) framework developed by HashiCorp. It enables users to define and provision infrastructure using a high-level configuration language. Terraform uses HashiCorp Configuration Language (HCL) as its configuration syntax.

The Snowflake emulator supports Terraform, allowing you to define and provision Snowflake resources using the same commands and syntax as the Snowflake service. You can use Terraform to create, update, and delete Snowflake resources locally, such as databases, schemas, tables, and stages.

## Configuring Terraform

In this guide, you will learn how to configure Terraform to interact with the Snowflake emulator.

### Setup Snowflake provider

To use Terraform with the Snowflake emulator, you need to configure the Snowflake provider in your Terraform configuration file. The following example shows how to configure the Snowflake provider:

```hcl
terraform {
  required_providers {
    snowflake = {
      source  = "Snowflake-Labs/snowflake"
      version = "= 0.92"
    }
  }
}

provider "snowflake" {
  account  = "test"
  user     = "test"
  password = "test"
  role     = "test"
  host     = "snowflake.localhost.localstack.cloud"
}
```

{{< alert type="info" title="Note" >}}
Instead of manually specifying the `host`, you can export the `SNOWFLAKE_HOST` environment variable to set the Snowflake host. Here is an example:
{{< command >}}
$ export SNOWFLAKE_HOST=snowflake.localhost.localstack.cloud
{{< /command >}}
{{< /alert >}}

### Create Snowflake resources

You can now use Terraform to create Snowflake resources using the Snowflake provider. The following example shows how to create a Snowflake database using Terraform:

```hcl
resource "snowflake_database" "example" {
  name                        = "example"
  comment                     = "example database"
  data_retention_time_in_days = 3
}
```

### Deploy the Terraform configuration

You can now deploy the Terraform configuration using the following command:

{{< command >}}
$ terraform init
$ terraform apply
{{< /command >}}

The `terraform init` command initializes the Terraform configuration, and the `terraform apply` command creates the Snowflake database.