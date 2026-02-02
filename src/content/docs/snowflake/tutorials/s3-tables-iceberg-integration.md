---
title: Querying S3 Tables with Snowflake
description: In this tutorial, you will learn how to integrate AWS S3 Tables with Snowflake to query Iceberg tables stored in S3 Tables buckets through LocalStack.
template: doc
nav: 
label: 
---

## Introduction

In this tutorial, you will explore how to connect Snowflake to AWS S3 Tables locally using LocalStack. S3 Tables is a managed Apache Iceberg table catalog that uses S3 storage, providing built-in maintenance features like automatic compaction and snapshot management.

With LocalStack's Snowflake emulator, you can create catalog integrations that connect to S3 Tables and query Iceberg tables without needing cloud resources. This integration allows you to:

- Create catalog integrations to connect Snowflake to S3 Tables.
- Query existing Iceberg tables stored in S3 Tables buckets.
- Leverage automatic schema inference from external Iceberg tables.

## Prerequisites

- [`localstack` CLI](/snowflake/getting-started/) with a [`LOCALSTACK_AUTH_TOKEN`](/aws/getting-started/auth-token/)
- [LocalStack for Snowflake](/snowflake/getting-started/)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) & [`awslocal` wrapper](/aws/integrations/aws-native-tools/aws-cli/#localstack-aws-cli-awslocal)

## Start LocalStack

Start your LocalStack container with the Snowflake emulator enabled.

```bash
export LOCALSTACK_AUTH_TOKEN=<your_auth_token>
localstack start --stack snowflake
```

## Create S3 Tables resources

Before configuring Snowflake, you need to create S3 Tables resources using the AWS CLI. This includes a table bucket, a namespace, and a table.

### Create a table bucket

Create a table bucket to store your Iceberg tables.

```bash
awslocal s3tables create-table-bucket --name my-table-bucket
```

```bash title="Output"
{
    "arn": "arn:aws:s3tables:us-east-1:000000000000:bucket/my-table-bucket"
}
```

### Create a namespace

Create a namespace within the table bucket to organize your tables.

```bash
awslocal s3tables create-namespace \
    --table-bucket-arn arn:aws:s3tables:us-east-1:000000000000:bucket/my-table-bucket \
    --namespace my_namespace
```

```bash title="Output"
{
    "tableBucketARN": "arn:aws:s3tables:us-east-1:000000000000:bucket/my-table-bucket",
    "namespace": [
        "my_namespace"
    ]
}
```

### Create a table

Create a table named `customer_orders` within the namespace.

```bash
awslocal s3tables create-table \
    --table-bucket-arn arn:aws:s3tables:us-east-1:000000000000:bucket/my-table-bucket \
    --namespace my_namespace \
    --name customer_orders \
    --format ICEBERG
```

```bash title="Output"
{
    "tableARN": "arn:aws:s3tables:us-east-1:000000000000:bucket/my-table-bucket/table/customer_orders",
    "versionToken": "..."
}
```

You can verify the table was created by listing tables in the namespace:

```bash
awslocal s3tables list-tables \
    --table-bucket-arn arn:aws:s3tables:us-east-1:000000000000:bucket/my-table-bucket \
    --namespace my_namespace
```

## Connect to the Snowflake emulator

Connect to the locally running Snowflake emulator using an SQL client of your choice. The Snowflake emulator runs on `snowflake.localhost.localstack.cloud`.

You can use the following connection parameters:

| Parameter | Value |
|-----------|-------|
| Host | `snowflake.localhost.localstack.cloud` |
| User | `test` |
| Password | `test` |
| Account | `test` |
| Warehouse | `test` |

## Create a catalog integration

Create a catalog integration to connect Snowflake to your S3 Tables bucket. The catalog integration defines how Snowflake connects to the external Iceberg REST catalog provided by S3 Tables.

```sql showLineNumbers
CREATE OR REPLACE CATALOG INTEGRATION s3tables_catalog_integration
    CATALOG_SOURCE=ICEBERG_REST
    TABLE_FORMAT=ICEBERG
    CATALOG_NAMESPACE='my_namespace'
    REST_CONFIG=(
        CATALOG_URI='http://s3tables.localhost.localstack.cloud:4566/iceberg'
        CATALOG_NAME='my-table-bucket'
    )
    REST_AUTHENTICATION=(
        TYPE=AWS_SIGV4
        AWS_ACCESS_KEY_ID='test'
        AWS_SECRET_ACCESS_KEY='test'
        AWS_REGION='us-east-1'
        AWS_SERVICE='s3tables'
    )
    ENABLED=TRUE
    REFRESH_INTERVAL_SECONDS=60;
```

In the above query:

- `CATALOG_SOURCE=ICEBERG_REST` specifies that the catalog uses the Iceberg REST protocol.
- `TABLE_FORMAT=ICEBERG` indicates the table format.
- `CATALOG_NAMESPACE='my_namespace'` sets the default namespace to query tables from.
- `REST_CONFIG` configures the connection to the LocalStack S3 Tables REST API endpoint.
- `REST_AUTHENTICATION` configures AWS SigV4 authentication for the S3 Tables service.
- `REFRESH_INTERVAL_SECONDS=60` sets how often Snowflake refreshes metadata from the catalog.

## Create an Iceberg table

Create an Iceberg table in Snowflake that references the existing S3 Tables table. The schema is automatically inferred from the external table, so you don't need to define columns.

```sql showLineNumbers
CREATE OR REPLACE ICEBERG TABLE iceberg_customer_orders
    CATALOG='s3tables_catalog_integration'
    CATALOG_TABLE_NAME='my_namespace.customer_orders'
    AUTO_REFRESH=TRUE;
```

In the above query:

- `CATALOG` references the catalog integration created in the previous step.
- `CATALOG_TABLE_NAME` specifies the fully-qualified table name in the format `namespace.table_name`.
- `AUTO_REFRESH=TRUE` enables automatic refresh of table metadata.

## Query the Iceberg table

You can now query the Iceberg table like any other Snowflake table. The schema (columns) are automatically available from the external table.

```sql showLineNumbers
SELECT * FROM iceberg_customer_orders;
```

You can also run aggregate queries and use all standard SQL operations:

```sql showLineNumbers
SELECT COUNT(*) FROM iceberg_customer_orders;
```

## View catalog integration details

You can view the details of your catalog integration using the `DESCRIBE` command:

```sql showLineNumbers
DESCRIBE CATALOG INTEGRATION s3tables_catalog_integration;
```

To list all catalog integrations:

```sql showLineNumbers
SHOW CATALOG INTEGRATIONS;
```

## Conclusion

In this tutorial, you learned how to integrate AWS S3 Tables with Snowflake using LocalStack. You created S3 Tables resources, configured a catalog integration in Snowflake, and queried Iceberg tables stored in S3 Tables buckets.

This integration enables you to:

- Query data stored in S3 Tables using familiar Snowflake SQL syntax.
- Leverage automatic schema inference from external Iceberg catalogs.
- Develop and test your data lakehouse integrations locally without cloud resources.

LocalStack's Snowflake emulator combined with S3 Tables support provides a complete local environment for developing and testing multi-platform data analytics workflows.
