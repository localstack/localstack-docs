---
title: Clones
description: Get started with Clones in LocalStack for Snowflake
---

## Introduction

Cloning in Snowflake allows you to create a quick, zero-copy duplicate of an existing database, schema, or table. This feature enables users to replicate data structures and content for testing or development without duplicating the underlying storage.

The Snowflake emulator supports database cloning, enabling you to create quick duplicates of databases, schemas, or tables. Currently, [`CREATE ... CLONE`](https://docs.snowflake.com/en/sql-reference/sql/create-clone) is supported by LocalStack.

## Getting started

This guide assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to it using an SQL client to execute the queries below.

The following sections guide you through creating a database, inserting data into a table, and then cloning the database to verify data integrity.

### Create a Database

The following SQL snippet demonstrates how to create a database named `test_db`.

```sql
CREATE DATABASE test_db;` 
```

The expected output is:

```sql
+--------------------------------------------+
| status                                     |
|--------------------------------------------|
| Database TEST_DB successfully created.     |
+--------------------------------------------+
0 Row(s) produced. Time Elapsed: 0.123s
```

### Create a Table

Once the database is created, you can create a table within it. The following SQL statement demonstrates how to create a table named `test_table` with columns for `id` and `name`.

```sql
CREATE TABLE test_table (id INT, name TEXT);` 
```

The expected output is:

```sql
+----------------------------------------+
| status                                 |
|----------------------------------------|
| Table TEST_TABLE successfully created. |
+----------------------------------------+
0 Row(s) produced. Time Elapsed: 0.067s
```

### Insert Data

To insert data into the `test_table`, use the `INSERT INTO` statement. This example inserts a single row with the values `(1, 'test')`.

```sql
INSERT INTO test_table VALUES (1, 'test');
```

The expected output is:

```sql
+----------------------------------------+
| status                                 |
|----------------------------------------|
| 1 Row(s) inserted.                     |
+----------------------------------------+
1 Row(s) produced. Time Elapsed: 0.024s
```

### Create a Clone

With data now in `test_table`, you can create a clone of the entire `test_db` database. This will produce a new database, `test_db_clone`, containing all objects and data from the original `test_db`.

```sql
CREATE DATABASE test_db_clone CLONE test_db;
```

The expected output is:

```sql
+--------------------------------------------+
| status                                     |
|--------------------------------------------|
| Database TEST_DB_CLONE successfully created. |
+--------------------------------------------+
0 Row(s) produced. Time Elapsed: 0.101s
```

### Verify Data in Clone

To confirm that the data has been cloned, query the `test_table` in the `test_db_clone` database.

```sql
SELECT * FROM test_db_clone.test_table;
```

The expected output is:

```sql
+----+------+
| id | name |
|----|------|
|  1 | test |
+----+------+
1 Row(s) produced. Time Elapsed: 0.012s
```
