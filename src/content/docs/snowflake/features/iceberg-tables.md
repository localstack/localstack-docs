---
title: Iceberg Tables
description: Get started with Iceberg Tables in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

Iceberg tables uses [Apache Iceberg](https://iceberg.apache.org/) open table format specification to provide an abstraction layer on data files stored in open formats. Iceberg tables for Snowflake offer schema evolution, partitioning, and snapshot isolation to manage the table data efficiently.

The Snowflake emulator supports Iceberg tables, allowing you to create and manage Iceberg tables locally. You can use Iceberg tables to query data in Snowflake tables using the Iceberg table format by using external volumes, with data stored in local/remote S3 buckets.

## Getting started

This guide is designed for users new to Iceberg tables and assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to it using an SQL client in order to execute the queries further below.

In this guide, you will create an external volume, and an Iceberg table to store and query data using the Iceberg table format.

### Create an S3 bucket

You can create a local S3 bucket using the `mb` command with the `awslocal` CLI.

```bash
$ awslocal s3 mb s3://test-bucket
```

### Create an external volume

You can create an external volume using the `CREATE OR REPLACE EXTERNAL VOLUME` statement. The external volume is used to define the location of the files that Iceberg will use to store the table data.

```sql showLineNumbers
CREATE OR REPLACE EXTERNAL VOLUME test_volume
    STORAGE_LOCATIONS = (
    (
        NAME = 'aws-s3-test'
        STORAGE_PROVIDER = 'S3'
        STORAGE_BASE_URL = 's3://test-bucket/'
        STORAGE_AWS_ROLE_ARN = 'arn:aws:iam::000000000000:role/s3-role'
        ENCRYPTION=(TYPE='AWS_SSE_S3')
    )
)
```

### Grant access to Snowflake role

You can grant access to the Snowflake role using the `GRANT USAGE ON EXTERNAL VOLUME` statement.

```sql
GRANT USAGE ON EXTERNAL VOLUME test_volume TO ROLE PUBLIC
```

### Create Iceberg table

You can create an Iceberg table using the `CREATE ICEBERG TABLE` statement. The Iceberg table is used to define the schema and location of the table data.

```sql
CREATE ICEBERG TABLE test_table (c1 TEXT)
CATALOG='SNOWFLAKE', EXTERNAL_VOLUME='test_volume', BASE_LOCATION='test'
```

### Insert and select data

You can insert and select data from the Iceberg table using the `INSERT INTO` and `SELECT` statements.

```sql
INSERT INTO test_table(c1) VALUES ('test'), ('foobar')
SELECT * FROM test_table
```

The output should be:

```plaintext
+------+
| C1   |
|------|
| test |
| foobar |
+------+
```

You can also list the content of the S3 bucket:

```bash
awslocal s3 ls --recursive s3://test-bucket/
```
