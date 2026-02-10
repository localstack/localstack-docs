---
title: SQL API
description: Get started with SQL API in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

The [Snowflake SQL API](https://docs.snowflake.com/en/developer-guide/sql-api/about-sql-api) allows you to submit SQL statements for execution over HTTP. LocalStack for Snowflake supports the SQL API, enabling you to execute single or multiple SQL statements locally.

## Multi-Statement Execution

The Snowflake emulator supports [submitting multiple SQL statements in a single request](https://docs.snowflake.com/en/developer-guide/sql-api/submitting-multiple-statements). Separate each statement with a semicolon (`;`) and specify the statement count using one of the following methods:

### Session-level configuration

Set `MULTI_STATEMENT_COUNT` in the session parameters. This setting is persistent for the entire session. When set to `0`, the emulator accepts any number of statements without requiring an exact count. If set to a non-zero value, you must specify exactly that many statements in each batch.

```python showLineNumbers
conn = snowflake.connector.connect(
    user="test",
    password="test",
    account="test",
    host="snowflake.localhost.localstack.cloud",
    session_parameters={"MULTI_STATEMENT_COUNT": 0}
)

with conn.cursor() as cur:
    cur.execute("SELECT 1; SELECT 2; SELECT 3")
    print(list(cur))  # First result
    cur.nextset()
    print(list(cur))  # Second result
```

### Request-level configuration

Specify `num_statements` per query using the Python connector's `execute()` method.

```python showLineNumbers
with conn.cursor() as cur:
    cur.execute("SELECT 1; SELECT 2; SELECT 3", num_statements=3)
    print(list(cur))  # First result
    cur.nextset()
    print(list(cur))  # Second result
```

If `MULTI_STATEMENT_COUNT` does not match the actual number of statements, an error is returned:

```
Actual statement count <actual_count> did not match the desired statement count <desired_count>.
```
