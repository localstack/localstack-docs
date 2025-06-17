---
title: Quickstart
description: Get started with LocalStack for Snowflake in a few simple steps
template: doc
sidebar:
    order: 2
---

## Introduction

This guide explains how to set up the Snowflake emulator and develop a Python program using the Snowflake Connector for Python (`snowflake-connector-python`) to interact with emulated Snowflake running on your local machine.

## Prerequisites

- [`localstack` CLI](https://docs.localstack.cloud/getting-started/installation/#localstack-cli)
- [LocalStack for Snowflake](/snowflake/getting-started/)
- Python 3.10 or later 
- [`snowflake-connector-python` library](https://docs.snowflake.com/en/developer-guide/python-connector/python-connector-install)

## Instructions

Before you begin, pull the Snowflake emulator image (`localstack/snowflake`) and start the container:

```bash
export LOCALSTACK_AUTH_TOKEN=<your_auth_token>
IMAGE_NAME=localstack/snowflake:latest localstack start
```

Check the emulator's availability by running:

```bash
curl -d '{}' snowflake.localhost.localstack.cloud:4566/session
```

The response should be:

```bash
{"success": true}
```

### Connect to the Snowflake emulator

Create a new Python file named `main.py` and use the following code to connect to the Snowflake emulator:

```python
import snowflake.connector as sf

sf_conn_obj = sf.connect(
    user="test",
    password="test",
    account="test",
    database="test",
    host="snowflake.localhost.localstack.cloud",
)
```

Specify the `host` parameter as `snowflake.localhost.localstack.cloud` and the other parameters as `test` to avoid connecting to the real Snowflake instance.

### Create and execute a query

Extend the Python program to insert rows from a list object into the emulated Snowflake table. Create a cursor object and execute the query:

```python
print("1. Insert lot of rows from a list object to Snowflake table")
print("2. Creating a cursor object")
sf_cur_obj = sf_conn_obj.cursor()

print("3. Executing a query on cursor object")
try:
    sf_cur_obj.execute(
        "create or replace table "
        "ability(name string, skill string )")

    rows_to_insert = [('John', 'SQL'), ('Alex', 'Java'), ('Pete', 'Snowflake')]
    
    sf_cur_obj.executemany(
        " insert into ability (name, skill) values (%s,%s) " ,rows_to_insert)

    sf_cur_obj.execute("select name, skill from ability")

    print("4. Fetching the results")
    result = sf_cur_obj.fetchall()
    print("Total # of rows :" , len(result))
    print("Row-1 =>",result[0])
    print("Row-2 =>",result[1])
finally:
    sf_cur_obj.close()
```

This program creates a table named `ability`, inserts rows, and fetches the results.

### Run the Python program

Execute the Python program with:

```bash
python main.py
```

The output should be:

```bash
Insert lot of rows from a list object to Snowflake table
1. Insert lot of rows from a list object to Snowflake table
2. Creating a cursor object
3. Executing a query on cursor object
4. Fetching the results
Total # of rows : 3
Row-1 => ('John', 'SQL')
Row-2 => ('Alex', 'Java')
```

Verify the results by navigating to the LocalStack logs:

```bash
2024-02-22T06:03:13.627  INFO --- [   asgi_gw_0] localstack.request.http    : POST /session/v1/login-request => 200
2024-02-22T06:03:16.122  WARN --- [   asgi_gw_0] l.packages.core            : postgresql will be installed as an OS package, even though install target is _not_ set to be static.
2024-02-22T06:03:45.917  INFO --- [   asgi_gw_0] localstack.request.http    : POST /queries/v1/query-request => 200
2024-02-22T06:03:46.016  INFO --- [   asgi_gw_1] localstack.request.http    : POST /queries/v1/query-request => 200
2024-02-22T06:03:49.361  INFO --- [   asgi_gw_0] localstack.request.http    : POST /queries/v1/query-request => 200
2024-02-22T06:03:49.412  INFO --- [   asgi_gw_1] localstack.request.http    : POST /session => 200
```

### Destroy the local infrastructure

To stop LocalStack and remove locally created resources, use:

```bash
localstack stop
```

LocalStack is ephemeral and doesn't persist data across restarts. It runs inside a Docker container, and once it’s stopped, all locally created resources are automatically removed. In a future release of the Snowflake emulator, we will provide proper persistence and integration with our [Cloud Pods](https://docs.localstack.cloud/user-guide/state-management/cloud-pods/) feature as well.

## Next steps

You can now explore the following resources to learn more about the Snowflake emulator:

- [Features](/snowflake/features/): Learn about the Snowflake emulator's features and how to use them.
- [SQL Functions](/snowflake/sql-functions): Learn about the SQL functions supported by the Snowflake emulator.
- [Changelog](/snowflake/changelog): Find information about the Snowflake emulator's changelog.
