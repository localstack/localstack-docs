---
title: Streamlit
description: Get started with Streamlit in LocalStack for Snowflake
---

## Introduction

Snowflake provides SQL commands to create and modify a `STREAMLIT` object. Streamlit is a Python library that allows you to create web applications with simple Python scripts. With Streamlit, you can create interactive web applications without having to learn complex web development technologies.

The Snowflake emulator supports Streamlit, allowing you to create Streamlit applications using the same commands and syntax as the Snowflake service. The following operations are supported:

- [`CREATE STREAMLIT`](https://docs.snowflake.com/en/sql-reference/sql/create-streamlit)
- [`SHOW STREAMLITS`](https://docs.snowflake.com/en/sql-reference/sql/show-streamlits)
- [`DESCRIBE STREAMLIT`](https://docs.snowflake.com/en/sql-reference/sql/describe-streamlit)
- [`ALTER STREAMLIT`](https://docs.snowflake.com/en/sql-reference/sql/alter-streamlit)
- [`DROP STREAMLIT`](https://docs.snowflake.com/en/sql-reference/sql/drop-streamlit)

## Getting started

This guide is designed for users new to Streamlit and assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to it using an SQL client in order to execute the queries further below.

In this guide, you will create a Streamlit application, describe the Streamlit application, and drop the Streamlit application.

### Create an application

You can create a Streamlit application using the `CREATE STREAMLIT` command. In this example, you can create a Streamlit application called `testapp` with a `@teststage` stage and a `test.py` script:

```sql
CREATE STREAMLIT TESTAPP ROOT_LOCATION = '@teststage' MAIN_FILE = 'test.py';
```

The output shows that the Streamlit application `testapp` was successfully created.

```sql
+-----------------------------------------+                                     
| ?COLUMN?                                |
|-----------------------------------------|
| Streamlit TESTAPP successfully created. |
+-----------------------------------------+
```

### Describe the application

You can show the Streamlit application using the `DESCRIBE STREAMLIT` command. In this example, you can describe the Streamlit application `testapp`:

```sql
DESCRIBE STREAMLIT testapp;
```

The output shows the details of the Streamlit application `testapp`.

```sql
+---------+-------+---------------+-----------+-----------------+---------+------------------+---------------+
| name    | title | root_location | main_file | query_warehouse | url_id  | default_packages | user_packages |
|---------+-------+---------------+-----------+-----------------+---------+------------------+---------------|
| TESTAPP | NULL  | @teststage    | test.py   | NULL            | testurl | ...              |               |
```

### Drop the application

You can drop the Streamlit application using the `DROP STREAMLIT` command. In this example, you can drop the Streamlit application `testapp`:

```sql
DROP STREAMLIT testapp;
```

The output shows that the Streamlit application `testapp` was successfully dropped.

```sql
+-----------------------------------------+                                     
| ?COLUMN?                                |
|-----------------------------------------|
| Streamlit TESTAPP successfully dropped. |
+-----------------------------------------+
```

## Connecting Streamlit to Snowflake emulator

To connect to the Snowflake emulator while developing locally, Streamlit provides a way to store secrets and connection details in the project.

To run the sample against Snowflake emulator, your local `~/.streamlit/secrets.toml` should look like this:

```toml
[snowpark]
user = "test"
password = "test"
account = "test"
warehouse = "test"
database = "STREAMLIT_DEMO"
schema = "STREAMLIT_USER_PROFILER"
role = "test"
host = "snowflake.localhost.localstack.cloud"
```

## Limitations

Currently, the Snowflake emulator supports CRUD operations to create Streamlit application entries in the Snowflake emulator, but support for hosting the Web UIs of these Streamlit apps is not yet available.

Users can run Streamlit apps locally by using the `streamlit run main.py` command and connecting to the local Snowflake instance.
