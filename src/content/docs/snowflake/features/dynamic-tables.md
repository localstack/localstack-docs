---
title: Dynamic Tables
description: Get started with Dynamic Tables in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

Snowflake Dynamic Tables enable a background process to continuously load new data from sources into the table, supporting both delta and full load operations. A dynamic table automatically updates to reflect query results, removing the need for a separate target table and custom code for data transformation. This table is kept current through regularly scheduled refreshes by an automated process.

The Snowflake emulator supports Dynamic tables, allowing you to create and manage Dynamic tables locally.

## Getting started

This guide is designed for users new to Dynamic tables and assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to it using an SQL client in order to execute the queries further below.

In this guide, you will create a table, create a dynamic table, insert data into the table, and query the dynamic table.

### Create a table

You can create a table using the `CREATE TABLE` statement. Run the following query to create a table:

```sql
CREATE TABLE example_table_name (id int, name text);
```

The output should be:

```sql
+-----------------------------------------------+ 
| status                                        |
| ----------------------------------------------+
| Table EXAMPLE_TABLE_NAME successfully created.|
+-----------------------------------------------+ 
```

### Create a dynamic table

You can create a dynamic table using the `CREATE DYNAMIC TABLE` statement. Run the following query to create a dynamic table:

```sql showLineNumbers
CREATE OR REPLACE DYNAMIC TABLE t_12345
    TARGET_LAG = '1 minute' WAREHOUSE = 'test' REFRESH_MODE = auto INITIALIZE = on_create
    AS SELECT id, name FROM example_table_name;
```

The output should be:

```sql
+-----------------------------------------------+
| result                                        |
| ----------------------------------------------+
Dynamic table T_12345 successfully created.     |
+-----------------------------------------------+
```

### Insert data into the table

You can insert data into the table using the `INSERT INTO` statement. Run the following query to insert data into the table:

```sql
INSERT INTO example_table_name(id, name) VALUES (1, 'foo'), (2, 'bar');
```

The output should be:

```sql
| count  |
| -----+ |
|   2    |
```

### Query the dynamic table

You can query the dynamic table using the `SELECT` statement. Run the following query to query the dynamic table:

```sql
SELECT * FROM t_12345;
```

The output should be:

```sql
+----+------+
| ID | NAME |
| ---+------+
| 1  | foo  |
| 2  | bar  |
+----+------+
```

## Dynamic Iceberg Tables

Dynamic Iceberg Tables combine the auto-refresh capabilities of Dynamic Tables with the Apache Iceberg open table format. This allows you to create materialized views that automatically update from source queries while storing data in Iceberg format on external object storage (such as S3).

A Dynamic Iceberg Table consists of three key concepts:
- **Dynamic table**: A materialized view that auto-refreshes from a source query on a schedule (controlled by `TARGET_LAG` and `WAREHOUSE`).
- **Iceberg table**: A table stored in Apache Iceberg format on external object storage (configured via `EXTERNAL_VOLUME`, `CATALOG`, and `BASE_LOCATION`).
- **External volume**: A Snowflake object that references an S3 bucket as the backing storage for Iceberg data files.

### Create an S3 bucket

Create a local S3 bucket using the `mb` command with the `awslocal` CLI:

```bash
awslocal s3 mb s3://test-bucket
```

### Create an external volume

Create an external volume to define the storage location for the Iceberg data files:

```sql showLineNumbers
CREATE OR REPLACE EXTERNAL VOLUME test_volume
    STORAGE_LOCATIONS = (
    (
        NAME = 'aws-s3-test'
        STORAGE_PROVIDER = 'S3'
        STORAGE_BASE_URL = 's3://test-bucket/'
        STORAGE_AWS_ROLE_ARN = 'arn:aws:iam::000000000000:role/s3-role'
    )
)
```

### Create a source table

Create a source table that the Dynamic Iceberg Table will refresh from:

```sql
CREATE TABLE source_table (id INT, name TEXT);
INSERT INTO source_table(id, name) VALUES (1, 'foo'), (2, 'bar');
```

### Create a Dynamic Iceberg Table

Create a Dynamic Iceberg Table using the `CREATE DYNAMIC ICEBERG TABLE` statement:

```sql showLineNumbers
CREATE DYNAMIC ICEBERG TABLE my_dynamic_iceberg_table
    TARGET_LAG = '2 minutes'
    WAREHOUSE = test
    REFRESH_MODE = INCREMENTAL
    INITIALIZE = on_create
    EXTERNAL_VOLUME = 'test_volume'
    CATALOG = 'SNOWFLAKE'
    BASE_LOCATION = 'my_table_data'
AS SELECT id, name FROM source_table;
```

The output should be:

```sql
+----------------------------------------------------------+
| result                                                   |
|----------------------------------------------------------+
| Dynamic table MY_DYNAMIC_ICEBERG_TABLE successfully created. |
+----------------------------------------------------------+
```

### Query the Dynamic Iceberg Table

You can query the Dynamic Iceberg Table using a standard `SELECT` statement:

```sql
SELECT * FROM my_dynamic_iceberg_table ORDER BY id;
```

The output should be:

```sql
+----+------+
| ID | NAME |
|----+------+
| 1  | foo  |
| 2  | bar  |
+----+------+
```

### Show Dynamic Tables

You can view the metadata of your Dynamic Iceberg Table using the `SHOW DYNAMIC TABLES` command. The `is_iceberg` column indicates whether the table is a Dynamic Iceberg Table:

```sql
SHOW DYNAMIC TABLES LIKE 'my_dynamic_iceberg_table';
```

### Rename a Dynamic Iceberg Table

You can rename a Dynamic Iceberg Table using the `ALTER DYNAMIC TABLE` statement:

```sql
ALTER DYNAMIC TABLE my_dynamic_iceberg_table RENAME TO my_renamed_table;
```

### Drop a Dynamic Iceberg Table

You can drop a Dynamic Iceberg Table using the `DROP DYNAMIC TABLE` statement:

```sql
DROP DYNAMIC TABLE my_renamed_table;
```

The output should be:

```sql
+------------------------------------------+
| status                                   |
|------------------------------------------+
| MY_RENAMED_TABLE successfully dropped.   |
+------------------------------------------+
```
