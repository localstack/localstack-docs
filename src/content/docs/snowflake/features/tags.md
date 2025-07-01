---
title: Tags
description: Get started with Tags in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

Snowflake tags allow you to categorize and manage Snowflake objects by associating custom metadata with them. These tags support governance, cost tracking, and data lineage by enabling organizations to label resources with business-relevant information.

The Snowflake emulator supports tags, allowing you to apply these tags to the local Snowflake tables, views, and databases using the same commands and syntax as the Snowflake service.

## Getting started

This guide is designed for users new to tagging in Snowflake and assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to it using an SQL client to execute the queries below.

The following sections guide you through an example of creating a database, adding a tag, and using the tag to track metadata in Snowflake.

### Create a Database

The following SQL snippet demonstrates how to create a database named `tag_test_db`.

```sql
CREATE DATABASE IF NOT EXISTS tag_test_db;
```

The expected output is:

```sql
+--------------------------------------------+
| status                                     |
|--------------------------------------------|
| Database TAG_TEST_DB successfully created. |
+--------------------------------------------+
0 Row(s) produced. Time Elapsed: 0.163s
```

### Create a Tag

To create a tag, use the `CREATE TAG` statement. The following example demonstrates how to create a tag named `tag1`.

```sql
CREATE TAG tag1;
```

The expected output is:

```sql
+--------------------------------+
| ?COLUMN?                       |
|--------------------------------|
| Tag TAG1 successfully created. |
+--------------------------------+
0 Row(s) produced. Time Elapsed: 0.057s
```

### Assign Tag to Database

To assign a tag to a database, use the `ALTER DATABASE` statement. The following example demonstrates how to assign the tag `tag1` with the value `'test 123'` to the `tag_test_db` database.

```sql
ALTER DATABASE tag_test_db SET TAG tag1 = 'test 123';
```

The expected output is:

```sql
+----------------------------------+
| ?column?                         |
|----------------------------------|
| Statement executed successfully. |
+----------------------------------+
0 Row(s) produced. Time Elapsed: 0.026s
```

### Query Tag Value

To retrieve the value of a tag assigned to a database, use the `SELECT SYSTEM$GET_TAG` statement. The following example demonstrates how to query the value of `tag1` assigned to the `tag_test_db` database.

```sql
SELECT SYSTEM$GET_TAG('tag1', 'tag_test_db', 'database');
```

The expected output is:

```sql
+----------------+
| SYSTEM$GET_TAG |
|----------------|
| test 123       |
+----------------+
1 Row(s) produced. Time Elapsed: 0.565s
```

### Query Tag References

To view all references of a tag within a database, use the `INFORMATION_SCHEMA.TAG_REFERENCES` function. The following example demonstrates how to query the `tag_test_db` database for references to the `tag1` tag.

```sql
SELECT *
FROM TABLE(tag_test_db.INFORMATION_SCHEMA.TAG_REFERENCES('tag_test_db', 'database'));
```

The expected output is:

```sql
+--------------+------------+----------+-----------+----------+-----------------+---------------+-------------+----------+-------------+
| TAG_DATABASE | TAG_SCHEMA | TAG_NAME | TAG_VALUE | LEVEL    | OBJECT_DATABASE | OBJECT_SCHEMA | OBJECT_NAME | DOMAIN   | COLUMN_NAME |
|--------------+------------+----------+-----------+----------+-----------------+---------------+-------------+----------+-------------|
| TAG_TEST_DB  | PUBLIC     | TAG1     | test 123  | DATABASE | NULL            | NULL          | TAG_TEST_DB | DATABASE | NULL        |
+--------------+------------+----------+-----------+----------+-----------------+---------------+-------------+----------+-------------+
1 Row(s) produced. Time Elapsed: 0.528s
```
