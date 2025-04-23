---
title: SnowSQL
description: Use SnowSQL to interact with the Snowflake emulator
---

{{< preview-notice >}}

## Introduction

[SnowSQL](https://docs.snowflake.com/en/user-guide/snowsql.html) is a command-line client for Snowflake that allows you to interact with the Snowflake service using SQL commands. SnowSQL provides a wide range of features, such as executing SQL statements, loading data, unloading data, and more.

The Snowflake emulator supports SnowSQL, allowing you to interact with the Snowflake emulator using the same commands and syntax as the Snowflake service. You can use SnowSQL to connect to the Snowflake emulator, execute SQL commands, and manage Snowflake resources locally, such as databases, schemas, tables, stages, and more.

## Configuring SnowSQL

In this guide, you will learn how to configure SnowSQL to interact with the Snowflake emulator.

### Install SnowSQL

To install SnowSQL, follow the instructions in the [official SnowSQL documentation](https://docs.snowflake.com/en/user-guide/snowsql-install-config.html).

### Start SnowSQL

To start SnowSQL, execute the following command:

{{< command >}}
$ export SNOWSQL_PWD=test
$ snowsql \
    -a test \
    -u test \
    -h snowflake.localhost.localstack.cloud \
    -p 4566 \
    -d test \
    -w test \
    -r test \
    -s test
{{< / command >}}

In the above command:

- `-a` specifies the account name.
- `-u` specifies the username.
- `-h` specifies the host name.
- `-p` specifies the port number.
- `-d` specifies the database name.
- `-w` specifies the warehouse name.
- `-r` specifies the role name.
- `-s` specifies the schema name.

After a successful configuration, you can use SnowSQL to interact with the Snowflake emulator.

```bash
* SnowSQL * v1.2.32
Type SQL statements or !help
test#test@test.test>
```

### Run SQL commands

You can execute SQL commands using SnowSQL. For example, to create a new database, execute the following command:

{{< command >}}
$ CREATE DATABASE test_db;
<disable-copy>
+----------------------------------------+                                      
| status                                 |
|----------------------------------------|
| Database TEST_DB successfully created. |
+----------------------------------------+
0 Row(s) produced. Time Elapsed: 0.198s
</disable-copy>
{{< / command >}}