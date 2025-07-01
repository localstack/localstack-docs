---
title: Streams
description: Get started with Streams in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

Streams allow you to track changes made to a table. Streams capture changes made to a table, such as inserts, updates, and deletes, and store the changes in a log that you can query to see what changes have been made. 

The Snowflake emulator supports managed streams. You can create a stream locally to track changes made to an emulated Snowflake table and query the stream to see what changes have been made.

## Getting started

This guide is designed for users new to Streams and assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to it using an SQL client to execute the queries below.

The following sections guide you through a simple example of using Streams to track changes in a table that stores information about gym members. We will create tables to store member information and their signup dates, and then use a stream to capture changes made to the members' table.

### Create tables

The following SQL snippet demonstrates how to create a table named `members` to store the names and fees paid by members of a gym, and a table named `signup` to store the dates when gym members joined.

```sql showLineNumbers
-- Create a table to store the names and fees paid by members of a gym
CREATE TABLE IF NOT EXISTS members (
  id NUMBER(8) NOT NULL,
  name VARCHAR(255) DEFAULT NULL,
  fee NUMBER(3) NULL
);

-- Create a table to store the dates when gym members joined
CREATE TABLE IF NOT EXISTS signup (
  id NUMBER(8),
  dt DATE
);
```

### Create a Stream

To create a stream, use the `CREATE STREAM` statement. The following example demonstrates how to create a stream named `member_check` to track changes made to the `members` table.

```sql
CREATE STREAM IF NOT EXISTS member_check ON TABLE members;
```

### Insert Data

To insert data into the `members` and `signup` tables, use the `INSERT INTO` statement. The following example demonstrates how to insert data into the `members` and `signup` tables.

```sql showLineNumbers
INSERT INTO members (id,name,fee)
VALUES
(1,'Joe',0),
(2,'Jane',0),
(3,'George',0),
(4,'Betty',0),
(5,'Sally',0);

INSERT INTO signup
VALUES
(1,'2018-01-01'),
(2,'2018-02-15'),
(3,'2018-05-01'),
(4,'2018-07-16'),
(5,'2018-08-21');
```

### Query Stream for Changes

To query the stream for changes, use the `SELECT` statement. The following example demonstrates how to query the `member_check` stream for changes.

```sql
SELECT * FROM member_check;
```

The expected output is:

```sql
+----+--------+-----+-----------------+-------------------+---------------------+
| ID | NAME   | FEE | METADATA$ACTION | METADATA$ISUPDATE | METADATA$ROW_ID                          |
|+----+--------+-----+-----------------+-------------------+--------------------|
| 1  | Joe    | 0   | INSERT          | False             | f05ac800-394b-4007-ab6b-28e1a915769e     |
| 2  | Jane   | 0   | INSERT          | False             | ab54a93e-3eb5-45fb-85f9-0e5f208e02dc     |
| 3  | George | 0   | INSERT          | False             | 0e061182-fb1b-4a54-b018-61ada3feba35     |
| 4  | Betty  | 0   | INSERT          | False             | 4dcf24c3-c25e-4e89-b0ec-cb20fbf1275c     |
| 5  | Sally  | 0   | INSERT          | False             | 1e3abb7e-f3f0-4a78-8fc1-d80e2dfdaaf7     |
+----+--------+-----+-----------------+-------------------+---------------------+
```
