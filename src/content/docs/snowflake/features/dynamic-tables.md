---
title: Dynamic Tables
description: Get started with Dynamic Tables in LocalStack for Snowflake
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

```sql
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
