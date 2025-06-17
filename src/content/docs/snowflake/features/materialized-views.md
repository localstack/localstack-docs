---
title: "Materialized Views"
description: Get started with Materialized Views in LocalStack for Snowflake
---

## Introduction

Materialized views are a feature of Snowflake that allows you to create a persistent view of a table. This view is pre-computed and stored in the database, allowing for faster queries and improved performance.

The Snowflake emulator supports Materialized Views, allowing you to accurately test materialized view logic and behavior in local development environments.

## Getting started

This guide is designed for users new to Materialized Views and assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to it using an SQL client to execute the queries below.

The following sections guide you through creating materialized views, inserting data into source tables, querying from views, and performing operations like rename, describe, and drop.

### Create a materialized view

To create a materialized view, use the `CREATE MATERIALIZED VIEW` statement. The following example creates a view `order_view` that selects specific columns from the `orders` table.

```sql 
CREATE TABLE IF NOT EXISTS orders (
  id INT,
  product TEXT,
  shipped BOOLEAN
);

CREATE MATERIALIZED VIEW IF NOT EXISTS order_view AS
SELECT id, product FROM orders;
```

### Insert data into source table

Inserting new data into the base table automatically refreshes the materialized view in the background.

```sql 
INSERT INTO orders(id, product, shipped)
VALUES (1, 'Book', FALSE), (2, 'Pen', TRUE);
```

### Query from materialized view

You can query a materialized view just like a regular table. The view reflects the data from the source table as of its most recent refresh.

```sql
SELECT * FROM order_view;
```

The output should be:

```sql 
ID|PRODUCT|
--+-------+
 1|Book   |
 2|Pen    |
```

### Describe the view

Use `DESCRIBE MATERIALIZED VIEW` to inspect the schema of the view, including column names and types.

```sql
DESCRIBE MATERIALIZED VIEW order_view;
```

The output should be:

```sql 
name   |type|kind  |null?|default|primary key|unique key|check|expression|comment|policy name|privacy domain|
-------+----+------+-----+-------+-----------+----------+-----+----------+-------+-----------+--------------+
ID     |INT4|COLUMN|Y    |       |N          |N         |     |          |       |           |              |
PRODUCT|TEXT|COLUMN|Y    |       |N          |N         |     |          |       |           |              |
```

### Rename and drop view

You can rename and drop materialized views using standard SQL statements.

```sql
ALTER MATERIALIZED VIEW order_view RENAME TO order_view_new;

DROP MATERIALIZED VIEW IF EXISTS order_view_new;
```
