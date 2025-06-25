---
title: Cross-Database Resource Sharing
description: Get started with cross-database resource sharing in the Snowflake emulator
---

## Introduction

Snowflake data providers can easily share data from various databases using secure views. These views can include schemas, tables, and other views from one or more databases, as long as they're part of the same account.

The Snowflake emulator supports cross-database resource sharing, allowing you to share a secure view that references objects from multiple databases. This guide walks you through the process of creating databases, schemas, tables, and views, and sharing them with other databases.

## Getting started

This guide is designed for users new to cross-database resource sharing and assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to the Snowflake emulator using an SQL client.

In this guide, we'll walk through a series of Snowflake SQL statements to create databases, schemas, tables, views, and a share.

### Create databases

Create three databases to represent the three different organizations that will share resources. In this example, we'll create databases for `db_name1`, `db_name2`, and `db_name3`.

```sql showLineNumbers
CREATE DATABASE db_name1_actual;
CREATE DATABASE db_name2_actual;
CREATE DATABASE db_name3_actual;
```

### Create schemas

Create a schema in each database to represent the shared resources. In this example, you can create a schema called `sch` in each database.

```sql showLineNumbers
CREATE SCHEMA db_name1_actual.sch;
CREATE SCHEMA db_name2_actual.sch;
CREATE SCHEMA db_name3_actual.sch;
```

### Create tables

Create a table in each schema to represent the shared resources. In this example, you can create a table called `table1` in `db_name1_actual.sch`, `table2` in `db_name2_actual.sch`, and `table3` in `db_name3_actual.sch`.

```sql showLineNumbers
CREATE TABLE db_name1_actual.sch.table1 (id INT);
CREATE TABLE db_name2_actual.sch.table2 (id INT);
CREATE TABLE db_name3_actual.sch.table3 (id INT);
```

### Insert Data into Tables

You can now insert data into the tables to represent the shared resources. In this example, we'll insert a single row into each table.

```sql showLineNumbers
INSERT INTO db_name1_actual.sch.table1 (id) VALUES (1);
INSERT INTO db_name2_actual.sch.table2 (id) VALUES (2);
INSERT INTO db_name3_actual.sch.table3 (id) VALUES (3);
```

### Create Views

You can create a view `view1` based on `table1` in `db_name1_actual`.

```sql
CREATE VIEW db_name1_actual.sch.view1 AS SELECT * FROM db_name1_actual.sch.table1;
```

### Create Secure View

You can creates a secure view `view3` in `db_name3_actual.sch` by joining data from different tables.

```sql showLineNumbers
CREATE SECURE VIEW db_name3_actual.sch.view3 AS
SELECT view1.id AS View1Id, table2.id AS table2id, table3.id AS table3id
FROM db_name1_actual.sch.view1 view1, db_name2_actual.sch.table2 table2, db_name3_actual.sch.table3 table3;
```

### Create Share and Grant Permissions

You can create a share `s_actual` and grant usage permissions on the `db_name3_actual` database and its schema.

```sql showLineNumbers
CREATE SHARE s_actual;
GRANT USAGE ON DATABASE db_name3_actual TO SHARE s_actual;
GRANT USAGE ON SCHEMA db_name3_actual.sch TO SHARE s_actual;
```

### Query Data from Secure View

You can now query data from the secure view `view3` in `db_name3_actual.sch`.

```sql
SELECT * FROM db_name3_actual.sch.view3;
```

The expected output is:

```plaintext
(1, 2, 3)
```
