---
title: Snowpipe
description: Get started with Snowpipe in LocalStack for Snowflake
---



## Introduction

Snowpipe allows you to load data into Snowflake tables from files stored in an external stage. Snowpipe continuously loads data from files in a stage into a table as soon as the files are available. Snowpipe uses a queue to manage the data loading process, which allows you to load data into Snowflake tables in near real-time.

The Snowflake emulator supports Snowpipe, allowing you to create and manage Snowpipe objects in the emulator. You can use Snowpipe to load data into Snowflake tables from files stored in a local directory or a local/remote S3 bucket. The following operations are supported:

* `CREATE PIPE`
* `DESCRIBE PIPE`
* `DROP PIPE`
* `SHOW PIPES`

## Getting started

This guide is designed for users new to Snowpipe and assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to it using an SQL client in order to execute the queries further below.

In this guide, you will create a stage, and a pipe to load data from a local S3 bucket into a Snowflake table.

### Create an S3 bucket

You can create a local S3 bucket using the `mb` command with the `awslocal` CLI.

{{< command >}}
$ awslocal s3 mb s3://test-bucket
{{< / command >}}

### Create a stage

You can create a stage using the `CREATE STAGE` command. The stage is used to define the location of the files that Snowpipe will load into the table.

```sql
CREATE STAGE test_stage
  URL='s3://test-bucket'
  CREDENTIALS = (
    aws_key_id='test'
    aws_secret_key='test'
  )
  FILE_FORMAT = (TYPE = 'JSON')
```

### Create a table

You can create a table using the `CREATE TABLE` command. The table is used to store the data that Snowpipe loads from the stage.

```sql
CREATE TABLE my_test_table(record VARIANT)
```

### Create a pipe

You can create a pipe using the `CREATE PIPE` command. The pipe is used to define the data loading process from the stage to the table.

```sql
CREATE PIPE test_pipe AUTO_INGEST = TRUE
  AS COPY INTO my_test_table FROM @test_stage/ FILE_FORMAT = (TYPE = 'JSON')
```

### Get pipe details

You can use the `DESC PIPE` command to get the details of the pipe you created.

```sql
DESC PIPE test_pipe
```

Retrieve the `notification_channel` value from the output of the `DESC PIPE` query. You will use this value to add a notification configuration to the S3 bucket.

### Create bucket notification

You can use the [`PutBucketNotificationConfiguration`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketNotificationConfiguration.html) API to create a bucket notification configuration that sends notifications to Snowflake when new files are uploaded to the S3 bucket.

{{< command >}}
$ awslocal s3api put-bucket-notification-configuration \
    --bucket test-bucket \
    --notification-configuration file://notification.json
{{< / command >}}

The `notification.json` file should contain the following configuration:

```json
{
  "QueueConfigurations": [
    {
      "Id": "test-queue",
      "QueueArn": "arn:aws:sqs:us-east-1:000000000000:sf-snowpipe-test",
      "Events": ["s3:ObjectCreated:*"]
    }
  ],
  "EventBridgeConfiguration": {}
}
```

Replace the `QueueArn` with the ARN of the queue provided in the `SHOW PIPE` query output.

### Copy data to the stage

Copy a JSON file to the S3 bucket to trigger the pipe to load the data into the table. Create a JSON file named `test.json` with the following content:

```json
{"name": "Alice", "age": 30}
{"name": "Bob", "age": 42}
```

Upload the file to the S3 bucket:

{{< command >}}
$ awslocal s3 cp test.json s3://test-bucket/
{{< / command >}}

### Check the data

After uploading the file to the S3 bucket in the previous step, the contents of the JSON file should get inserted into the table automatically by the `test_pipe` pipe. You can check the data in the table using the following query:

```sql
SELECT * FROM my_test_table
```