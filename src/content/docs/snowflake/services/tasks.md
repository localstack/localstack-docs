---
title: Tasks
description: Get started with Tasks in LocalStack for Snowflake
---



## Introduction

Tasks are user-defined objects that enable the automation of repetitive SQL operations in Snowflake. You can use tasks to schedule SQL statements, such as queries, DDL, and DML operations, to run at a specific time or at regular intervals.

The Snowflake emulator provides a CRUD (Create, Read, Update, Delete) interface to manage tasks. The following operations are supported:

- [`CREATE TASK`](https://docs.snowflake.com/en/sql-reference/sql/create-task)
- [`DESCRIBE TASK`](https://docs.snowflake.com/en/sql-reference/sql/desc-task)
- [`DROP TASK`](https://docs.snowflake.com/en/sql-reference/sql/drop-task)
- [`SHOW TASKS`](https://docs.snowflake.com/en/sql-reference/sql/show-tasks)

## Getting started

This guide is designed for users new to Tasks and assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to the Snowflake emulator using an SQL client.

### Create a Task

To create a task, use the `CREATE TASK` statement. The following example demonstrates how to create a task named `test_task` that inserts a record into a table named `sample_table` every minute.

```sql
CREATE TASK test_task
WAREHOUSE = 'test'
SCHEDULE = '1 MINUTE'
AS
INSERT INTO sample_table(ID) VALUES (123);
```

### Drop a Task

To drop a task, use the `DROP TASK` statement. The following example demonstrates how to drop the `test_task` task.

```sql
DROP TASK IF EXISTS test_task;
```

### Resume a Task

To start or resume a task, use the `ALTER TASK` statement. The following example demonstrates how to resume the `test_task` task.

```sql
ALTER TASK test_task RESUME;
```

### Query the table

To query the table, use the `SELECT` statement. The following example demonstrates how to query the `sample_table` table.

```sql
SELECT * FROM sample_table;
```

The expected output is:

```plaintext
123
```