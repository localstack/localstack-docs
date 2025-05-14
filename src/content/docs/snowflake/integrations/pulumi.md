---
title: Pulumi
description: Use Pulumi to interact with the Snowflake emulator
---

{{< preview-notice >}}

## Introduction

[Pulumi](https://pulumi.com/) is an Infrastructure-as-Code (IaC) framework that allows you to define and provision infrastructure using familiar programming languages. Pulumi supports a wide range of cloud providers and services, including AWS, Azure, Google Cloud, and more.

The Snowflake emulator supports Pulumi, allowing you to define and provision Snowflake resources using the same commands and syntax as the Snowflake service. You can use Pulumi to create, update, and delete Snowflake resources locally, such as databases, schemas, tables, stages, and more.

## Configuring Pulumi

In this guide, you will learn how to configure Pulumi to interact with the Snowflake emulator.

### Set up Snowflake provider

To use Pulumi with the Snowflake emulator, you need to configure the Snowflake provider in your Pulumi configuration file. Create a blank Pulumi project, and add the following environment variables to your Pulumi stack:

{{< command>}}
$ pulumi config set snowflake:account test
$ pulumi config set snowflake:region test
$ pulumi config set snowflake:username test
$ pulumi config set snowflake:password test
$ pulumi config set snowflake:host snowflake.localhost.localstack.cloud
{{< /command >}}

You can install the Snowflake provider in any of the programming languages supported by Pulumi, such as Python, JavaScript, TypeScript, and Go. The following example shows how to install the Snowflake provider for your TypeScript project:

{{< command >}}
$ npm install @pulumi/snowflake
{{< /command >}}

### Create Snowflake resources

You can now use Pulumi to create Snowflake resources using the Snowflake provider. The following example shows how to create a Snowflake database using Pulumi:

```javascript
import * as snowflake from "@pulumi/snowflake";

const simple = new snowflake.Database("simple", {
    comment: "test comment",
    dataRetentionTimeInDays: 3,
});
```

### Deploy the Pulumi configuration

You can now deploy the Pulumi configuration to create the Snowflake resources locally. Run the following command to deploy the Pulumi configuration:

{{< command >}}
$ pulumi up
{{< /command >}}

The expected output should show the resources being created in the Snowflake emulator:

```bash
Enter your passphrase to unlock config/secrets
Previewing update (snowflake):
     Type                         Name                               Plan       Info
 +   pulumi:pulumi:Stack          pulumi-snowflake-sample-snowflake  create     
 +   └─ snowflake:index:Database  simple                             create     

Resources:
    + 2 to create

Do you want to perform this update? yes
Updating (snowflake):
     Type                         Name                               Status              Info
 +   pulumi:pulumi:Stack          pulumi-snowflake-sample-snowflake  created (0.48s)     2  

Resources:
    + 2 created

Duration: 5s
```