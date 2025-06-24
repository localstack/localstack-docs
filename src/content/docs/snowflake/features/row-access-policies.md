---
title: "Row Access Policies"
description: Get started with Row Access Policies in LocalStack for Snowflake
---

## Introduction

Row access policies (RAPs) are a feature of Snowflake that allows you to control access to specific rows in a table. This is useful for implementing security policies, such as restricting access to certain users or groups.

The Snowflake emulator supports Row Access Policies, allowing developers to implement and test fine-grained, row-level access controls locally. These policies define conditions that determine which rows are visible to the querying user.

## Getting started

This guide is designed for users new to Row Access Policies and assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to it using an SQL client to execute the queries below.

The following sections demonstrate how to create a row access policy, attach it to a table, and observe how it filters rows during queries based on policy logic.

### Create row access policy

Use the `CREATE ROW ACCESS POLICY` statement to define a filter condition. This policy will restrict row visibility based on column values.

```sql showLineNumbers
CREATE OR REPLACE ROW ACCESS POLICY id_filter_policy
AS (id INT) RETURNS BOOLEAN ->
  id IN (1, 2);
```

### Apply policy to a table

Create a table and bind the row access policy to one of its columns using the `WITH ROW ACCESS POLICY` clause.

```sql showLineNumbers
CREATE TABLE accounts (
  id INT
)
WITH ROW ACCESS POLICY id_filter_policy ON (id);
```

Insert sample data into the table:

```sql
INSERT INTO accounts(id) VALUES (1), (2), (3);
```

### Query table with policy applied

Querying the table will now return only rows that match the access policy condition.

```sql
SELECT * FROM accounts;
```

The output should be:

```sql
ID|
--+
 1|
 2|
```

### Remove access policy

You can remove a row access policy from a table using the `ALTER TABLE ... DROP ROW ACCESS POLICY` statement.

```sql
ALTER TABLE accounts DROP ROW ACCESS POLICY id_filter_policy;
```

Re-run the query to view all rows:

```sql
SELECT * FROM accounts;
```

The output should be:

```sql
ID|
--+
 1|
 2|
 3|
```
