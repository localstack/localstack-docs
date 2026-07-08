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

- [`localstack` CLI](/snowflake/getting-started/) with a [`LOCALSTACK_AUTH_TOKEN`](/snowflake/getting-started/auth-token/)
- [LocalStack for Snowflake](/snowflake/getting-started/)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) & [`awslocal` wrapper](/aws/connecting/aws-cli/#localstack-aws-cli-awslocal)
- Python 3.10+ with `pyiceberg` and `pyarrow` installed

## Start LocalStack

Start your LocalStack container with the Snowflake emulator enabled.

```bash
export LOCALSTACK_AUTH_TOKEN=<your_auth_token>
localstack start --stack snowflake
```

## Create S3 Tables resources

Before configuring Snowflake, you need to create S3 Tables resources using the AWS CLI. This includes a table bucket and a namespace.

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

## Create and populate a table in S3 Tables

To query data from Snowflake using `CATALOG_TABLE_NAME`, the S3 Tables table must have a defined schema and contain data. Use PyIceberg to create a table with schema and populate it with data.

First, install the required Python packages:

```bash
pip install "pyiceberg[s3fs,pyarrow]" boto3
```

Create a Python script named `setup_s3_tables.py` with the following content:

```python
import pyarrow as pa
from pyiceberg.catalog.rest import RestCatalog
from pyiceberg.schema import Schema
from pyiceberg.types import NestedField, StringType, LongType

# Configuration
LOCALSTACK_URL = "http://localhost.localstack.cloud:4566"
S3TABLES_URL = "http://s3tables.localhost.localstack.cloud:4566"
TABLE_BUCKET_NAME = "my-table-bucket"
NAMESPACE = "my_namespace"
TABLE_NAME = "customer_orders"
REGION = "us-east-1"

# Create PyIceberg REST catalog pointing to S3 Tables
catalog = RestCatalog(
    name="s3tables_catalog",
    uri=f"{S3TABLES_URL}/iceberg",
    warehouse=TABLE_BUCKET_NAME,
    **{
        "s3.region": REGION,
        "s3.endpoint": LOCALSTACK_URL,
        "client.access-key-id": "000000000000",
        "client.secret-access-key": "test",
        "rest.sigv4-enabled": "true",
        "rest.signing-name": "s3tables",
        "rest.signing-region": REGION,
    },
)

# Define table schema
schema = Schema(
    NestedField(field_id=1, name="order_id", field_type=StringType(), required=False),
    NestedField(field_id=2, name="customer_name", field_type=StringType(), required=False),
    NestedField(field_id=3, name="amount", field_type=LongType(), required=False),
)

# Create table in S3 Tables
catalog.create_table(
    identifier=(NAMESPACE, TABLE_NAME),
    schema=schema,
)

print(f"Created table: {NAMESPACE}.{TABLE_NAME}")

# Reload the table to get the latest metadata
table = catalog.load_table((NAMESPACE, TABLE_NAME))

# Populate table with sample data
data = pa.table({
    "order_id": ["ORD001", "ORD002", "ORD003"],
    "customer_name": ["Alice", "Bob", "Charlie"],
    "amount": [100, 250, 175],
})

table.append(data)
print("Inserted sample data into table")

# Verify table exists
tables = catalog.list_tables(NAMESPACE)
print(f"Tables in namespace: {tables}")
```

Run the script to create the table and populate it with data:

```bash
python setup_s3_tables.py
```

```bash title="Output"
Created table: my_namespace.customer_orders
Inserted sample data into table
Tables in namespace: [('my_namespace', 'customer_orders')]
```

## Connect to the Snowflake emulator

Connect to the locally running Snowflake emulator using an SQL client of your choice (such as DBeaver). The Snowflake emulator runs on `snowflake.localhost.localstack.cloud`.

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

```sql
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
        AWS_ACCESS_KEY_ID='000000000000'
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

## Create an Iceberg table referencing S3 Tables

Create an Iceberg table in Snowflake that references the existing S3 Tables table using `CATALOG_TABLE_NAME`. The schema is automatically inferred from the external table.

```sql
CREATE OR REPLACE ICEBERG TABLE iceberg_customer_orders
    CATALOG='s3tables_catalog_integration'
    CATALOG_TABLE_NAME='my_namespace.customer_orders'
    AUTO_REFRESH=TRUE;
```

In the above query:

- `CATALOG` references the catalog integration created in the previous step.
- `CATALOG_TABLE_NAME` specifies the fully-qualified table name in the format `namespace.table_name`.
- `AUTO_REFRESH=TRUE` enables automatic refresh of table metadata.
- No column definitions are needed as the schema is inferred from the existing S3 Tables table.

## Query the Iceberg table

You can now query the Iceberg table like any other Snowflake table. The schema (columns) are automatically available from the external table.

```sql
SELECT * FROM iceberg_customer_orders;
```

```sql title="Output"
+----------+---------------+--------+
| order_id | customer_name | amount |
+----------+---------------+--------+
| ORD001   | Alice         | 100    |
| ORD002   | Bob           | 250    |
| ORD003   | Charlie       | 175    |
+----------+---------------+--------+
```

## Conclusion

In this tutorial, you learned how to integrate AWS S3 Tables with Snowflake using LocalStack. You created S3 Tables resources, populated a table with data using PyIceberg, configured a catalog integration in Snowflake, and queried Iceberg tables stored in S3 Tables buckets using `CATALOG_TABLE_NAME`.

The S3 Tables integration enables you to:

- Query data stored in S3 Tables using familiar Snowflake SQL syntax.
- Leverage automatic schema inference from external Iceberg catalogs.
- Develop and test your data lakehouse integrations locally without cloud resources.

LocalStack's Snowflake emulator combined with S3 Tables support provides a complete local environment for developing and testing multi-platform data analytics workflows.
