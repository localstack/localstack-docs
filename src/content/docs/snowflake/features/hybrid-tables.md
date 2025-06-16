---
title: Hybrid Tables
description: Get started with Hybrid Tables in LocalStack for Snowflake
---



## Introduction

Snowflake Hybrid tables, also known as Unistore hybrid tables, support fast, single-row operations by enforcing unique constraints for required primary keys and including indexes to speed up data retrieval. These tables are designed to optimize support for both analytical and transactional workloads simultaneously, underpinning Snowflake's Unistore architecture.

The Snowflake emulator supports Hybrid tables, allowing you to create and manage Hybrid tables locally. The following operations are supported:

* [`CREATE HYBRID TABLE`](https://docs.snowflake.com/en/sql-reference/sql/create-hybrid-table)
* [`DROP HYBRID TABLE`](https://docs.snowflake.com/en/sql-reference/sql/drop-hybrid-table)
* [`SHOW HYBRID TABLES`](https://docs.snowflake.com/en/sql-reference/sql/show-hybrid-tables)

## Getting started

This guide is designed for users new to Hybird tables and assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to it using an SQL client in order to execute the queries further below.

In this guide, you will create a Hybrid table, display the Hybrid tables, and drop the Hybrid table.

### Create a Hybrid table

You can create a Hybrid table using the `CREATE HYBRID TABLE` statement. In this example, you can create a Hybrid table called `test-table`:

```sql
CREATE HYBRID TABLE "test-table"(id int, name TEXT, PRIMARY KEY(id));
```

The output should be:

```sql
+------------------------------------------+                                    
| status                                   |
|------------------------------------------|
| Table "test-table" successfully created. |
+------------------------------------------+
```

### Show Hybrid tables

You can display the Hybrid tables using the `SHOW HYBRID TABLES` statement:

```sql
SHOW HYBRID TABLES LIKE 'test-table';
```

The output should be:

```sql
+-----------------------------------------------------------------------------------------------------+
created_on             |name      |database_name|schema_name|comment|rows|bytes|owner |owner_role_type|
-----------------------+----------+-------------+-----------+-------+----+-----+------+---------------+
1970-01-01 05:30:00.000|test-table|TEST         |PUBLIC     |       |1000| 1000|PUBLIC|ROLE           |
+-----------------------------------------------------------------------------------------------------+
```

### Drop Hybrid table

You can drop the Hybrid table using the `DROP HYBRID TABLE` statement:

```sql
DROP TABLE "test-table";
```

The output should be:

```sql
+------------------------------------------+  
| status                                   |
| -----------------------------------------+
| TEST-TABLE successfully dropped.         |
+------------------------------------------+
```