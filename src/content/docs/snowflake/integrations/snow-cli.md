---
title: Snow CLI
description: Use Snow CLI to interact with the Snowflake emulator.
---



## Introduction

Snow CLI is a command-line interface (CLI) for Snowflake. You can use Snow CLI to interact with the Snowflake emulator. Snow CLI provides a set of commands to manage and interact with Snowflake accounts, databases, warehouses, and more.

You can connect Snow CLI to the Snowflake emulator using a connection profile. A connection profile is a set of parameters that define the connection to a Snowflake account. You can create, list, and test connection profiles using Snow CLI.

{{<alert type="info">}}
Snow CLI is still under [active development](https://docs.snowflake.com/LIMITEDACCESS/snowcli/snowcli-guide), hence the commands and features might change in future releases.
{{</alert>}}

## Installation

You can install Snow CLI using the following methods:

{{< tabpane >}}
{{< tab header="PyPI" lang="bash" >}}
pip install snowflake-cli-labs
snow --help
{{< /tab >}}
{{< tab header="Homebrew" lang="bash" >}}
brew tap Snowflake-Labs/snowflake-cli
brew install snowcli
snow --help
{{< /tab >}}
{{< /tabpane >}}

## Configuring Snow CLI

In this guide, you will learn how to configure Snow CLI to interact with the Snowflake emulator using a `localstack` connection profile.

### Create a connection profile

To configure Snow CLI to interact with the Snowflake emulator, create a connection profile using the following command:

{{< command >}}
$ snow connection add \
    --connection-name localstack \
    --user test \
    --password test \
    --account test \
    --host snowflake.localhost.localstack.cloud
{{< / command >}}

You might be prompted to enter more optional parameters, such as the connection port, database name, warehouse name, authentication method, and more. These are however optional and can be skipped.

After a successful configuration, you can the `localstack` connection profile is ready to use.

### List your connection profiles

To list all the connection profiles configured in Snow CLI, execute the following command:

{{< command >}}
$ snow connection list
{{< / command >}}

The output should be:

```bash
+-----------------------------------------------------------------------------------+
| connection_name | parameters                                                      |
|-----------------+-----------------------------------------------------------------|
| localstack      | {'account': 'test', 'user': 'test', 'password': '****',         |
|                 | 'host': 'snowflake.localhost.localstack.cloud'}                 |
+-----------------------------------------------------------------------------------+
```

### Test the connection

To test the connection to the Snowflake emulator, execute the following command:

{{< command >}}
$ snow connection test --connection localstack
{{< / command >}}

The output should be:

```bash
+--------------------------------------------------------+
| key             | value                                |
|-----------------+--------------------------------------|
| Connection name | localstack                           |
| Status          | OK                                   |
| Host            | snowflake.localhost.localstack.cloud |
| Account         | test                                 |
| User            | test                                 |
+--------------------------------------------------------+
```

### Run a query using the connection profile

To run a query using the connection profile, execute the following command:

{{< command >}}
$ snow sql --query "CREATE DATABASE mytestdb;" --connection localstack
{{< / command >}}

You can see all the databases in your Snowflake emulator using the following command:

{{< command >}}
$ snow sql --query "SHOW DATABASES;" --connection localstack
{{< / command >}}

You can create a schema using the following commands:

{{< command >}}
$ snow sql --query "CREATE SCHEMA mytestdb.mytestschema;" --connection localstack
{{< / command >}}