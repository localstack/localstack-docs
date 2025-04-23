---
title: Storage Integrations
description: Get started with Storage Integrations in LocalStack for Snowflake
---

{{< preview-notice >}}

## Introduction

Snowflake storage integrations enable access to external cloud storage like Amazon S3, Google Cloud Storage, and Azure Blob Storage. They manage authentication through generated IAM roles, enhancing security and simplifying data operations without exposing sensitive credentials. This approach centralizes and controls access, streamlining workflows across major cloud platforms.

The Snowflake emulator supports storage integrations, allowing you to test interactions with external storage using the same commands and syntax as the Snowflake service. The following operations are supported:

-   [`CREATE STORAGE INTEGRATION`](https://docs.snowflake.com/en/sql-reference/sql/create-storage-integration)
-   [`DESCRIBE STORAGE INTEGRATION`](https://docs.snowflake.com/en/sql-reference/sql/describe-storage-integration)
-   [`DROP STORAGE INTEGRATION`](https://docs.snowflake.com/en/sql-reference/sql/drop-storage-integration)

## Getting started

This guide is designed for users new to Storage Integration and assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to it using an SQL client in order to execute the queries further below.

In this guide, you will create a Snowflake Storage Integration with Amazon S3 and creating an external stage to load data.

### Create an S3 bucket

You can create a local S3 bucket using the `mb` command with the `awslocal` CLI.

```bash
$ awslocal s3 mb s3://testbucket
```

Upload some sample CSV file into the S3 bucket using the following command:

```bash 
awslocal s3 cp file.csv s3://testbucket
```

### Create a Storage Integration

You can now create a Storage Integration named `s_example` which will connect Snowflake to your S3 bucket using the following statement:

```sql
CREATE STORAGE INTEGRATION s_example
    TYPE = EXTERNAL_STAGE 
    ENABLED = TRUE 
    STORAGE_PROVIDER = 'S3'
    STORAGE_AWS_ROLE_ARN = 'arn:aws:iam::000000000000:role/testrole'
    STORAGE_ALLOWED_LOCATIONS = ('s3://testbucket');
```

The expected output is:

```sql
+---------------------------------------------+
| ?COLUMN?                                    |
|---------------------------------------------|
| Integration S_EXAMPLE successfully created. |
+---------------------------------------------+
```

### Describe the Storage Integration

After creating the storage integration, you can retrieve important configuration by running the following statement:

```sql 
DESCRIBE STORAGE INTEGRATION s_example;
```

The expected output is:

```sql
+---------------------------+---------------+-----------------------------------------+------------------+
| property                  | property_type | property_value                          | property_default |
|---------------------------+---------------+-----------------------------------------+------------------|
| ENABLED                   | Boolean       | true                                    | false            |
| STORAGE_PROVIDER          | String        | S3                                      |                  |
| STORAGE_ALLOWED_LOCATIONS | List          | s3://testbucket                         | []               |
| STORAGE_BLOCKED_LOCATIONS | List          |                                         | []               |
| STORAGE_AWS_IAM_USER_ARN  | String        | arn:aws:iam::000000000000:user/test     |                  |
| STORAGE_AWS_ROLE_ARN      | String        | arn:aws:iam::000000000000:role/testrole |                  |
| STORAGE_AWS_EXTERNAL_ID   | String        | TEST_SFCRole=test                       |                  |
| COMMENT                   | String        |                                         |                  |
+---------------------------+---------------+-----------------------------------------+------------------+
8 Row(s) produced. Time Elapsed: 0.050s
```

### Create a stage

You can now create an external stage using the following statement:

```sql 
CREATE STAGE stage_example
    STORAGE_INTEGRATION = s_example
    URL = 's3://testbucket'
    FILE_FORMAT = (TYPE = CSV);
```

The expected output is:

```sql
+------------------------------------------------+
| ?COLUMN?                                       |
|------------------------------------------------|
| Stage area STAGE_EXAMPLE successfully created. |
+------------------------------------------------+
0 Row(s) produced. Time Elapsed: 0.083s
```

### List the files

To list the files in the stage, you can run the following statement:

```sql
LIST @stage_example;
```

The output will show the `files.csv` file that we uploaded earlier to the S3 bucket.