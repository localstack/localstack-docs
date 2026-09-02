---
title: 'Glue Iceberg REST Catalog'
description: Get started with Glue Iceberg REST Catalog in LocalStack for Snowflake
tags: ['Base']
---

## Introduction

[AWS Glue](https://docs.aws.amazon.com/glue/) exposes an [Iceberg REST endpoint](https://docs.aws.amazon.com/glue/latest/dg/connect-glu-iceberg-rest.html) that lets external query engines read and write Iceberg tables managed in the Glue Data Catalog. When the Glue catalog is federated to [S3 Tables](/aws/services/s3tables/), the REST endpoint serves Iceberg tables stored in S3 Tables buckets.

The Snowflake emulator can connect to this Glue Iceberg REST endpoint through a `CATALOG INTEGRATION` of source `ICEBERG_REST` with `CATALOG_API_TYPE = AWS_GLUE`. The integration uses AWS SigV4 to sign catalog requests and `VENDED_CREDENTIALS` to obtain scoped credentials for the underlying S3 Tables data files, so you can query the same tables from Snowflake and from PyIceberg without duplicating data.

## Getting started

This guide walks through creating an Iceberg table in S3 Tables through the Glue Iceberg REST endpoint, registering that table with the Snowflake emulator through a Glue catalog integration, and querying it with SQL. It assumes basic knowledge of the AWS CLI, our [`awslocal`](/aws/connecting/infrastructure-as-code/deprecated-wrapper-scripts/#awslocal) wrapper, and Snowflake.

In this guide, you will:

- Create an S3 Tables bucket and namespace
- Register a federated `s3tablescatalog` in Glue
- Create and populate an Iceberg table through the Glue Iceberg REST endpoint with PyIceberg
- Create a Snowflake catalog integration that points at the Glue REST endpoint
- Create an Iceberg table in Snowflake that references the remote Glue table and query it

Start your Snowflake emulator and connect to it using an SQL client in order to execute the queries below. Make sure to install Python and `pyiceberg[s3fs,pyarrow]` packages before starting.

### Create an S3 Tables bucket and namespace

The Glue Iceberg REST endpoint serves tables stored in S3 Tables. Create a table bucket:

```bash
awslocal s3tables create-table-bucket --name my-table-bucket
```

```bash title="Output"
{
    "arn": "arn:aws:s3tables:us-east-1:000000000000:bucket/my-table-bucket"
}
```

Now create a namespace to hold the Iceberg table:

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

### Register the Glue federated catalog

Glue exposes S3 Tables buckets through a federated catalog. Register a catalog named `s3tablescatalog` that federates to all S3 Tables buckets in the account:

```bash showLineNumbers
awslocal glue create-catalog \
    --name s3tablescatalog \
    --catalog-input '{
        "FederatedCatalog": {
            "Identifier": "arn:aws:s3tables:us-east-1:000000000000:bucket/*",
            "ConnectionName": "aws:s3tables"
        },
        "CreateTableDefaultPermissions": [],
        "CreateDatabaseDefaultPermissions": []
    }'
```

Confirm the catalog was registered:

```bash
awslocal glue get-catalogs
```

The response includes a `CatalogList` entry with `Name: s3tablescatalog` and a `FederatedCatalog` block pointing at S3 Tables. Snowflake will reference this catalog through its `WAREHOUSE` identifier in the form `<account-id>:s3tablescatalog/<table-bucket-name>`.

### Create and populate the table

Use PyIceberg to talk to the Glue Iceberg REST endpoint at `http://glue.localhost.localstack.cloud:4566/iceberg`. The same endpoint is later used by the Snowflake catalog integration, so creating the table through PyIceberg first lets you confirm that signing and federation are configured correctly.

Save the script as `setup_glue_iceberg.py`:

```python showLineNumbers
import pyarrow as pa
from pyiceberg.catalog.rest import RestCatalog
from pyiceberg.schema import Schema
from pyiceberg.types import NestedField, StringType, LongType

LOCALSTACK_URL = "http://localhost.localstack.cloud:4566"
GLUE_URL = "http://glue.localhost.localstack.cloud:4566"
ACCOUNT_ID = "000000000000"
TABLE_BUCKET_NAME = "my-table-bucket"
NAMESPACE = "my_namespace"
TABLE_NAME = "customer_orders"
REGION = "us-east-1"

catalog = RestCatalog(
    name="glue_catalog",
    uri=f"{GLUE_URL}/iceberg",
    warehouse=f"{ACCOUNT_ID}:s3tablescatalog/{TABLE_BUCKET_NAME}",
    **{
        "s3.region": REGION,
        "s3.endpoint": LOCALSTACK_URL,
        "client.access-key-id": ACCOUNT_ID,
        "client.secret-access-key": "test",
        "rest.sigv4-enabled": "true",
        "rest.signing-name": "glue",
        "rest.signing-region": REGION,
    },
)

schema = Schema(
    NestedField(field_id=1, name="order_id", field_type=StringType(), required=False),
    NestedField(field_id=2, name="customer_name", field_type=StringType(), required=False),
    NestedField(field_id=3, name="amount", field_type=LongType(), required=False),
)

catalog.create_table(identifier=(NAMESPACE, TABLE_NAME), schema=schema)
table = catalog.load_table((NAMESPACE, TABLE_NAME))

table.append(pa.table({
    "order_id": ["ORD001", "ORD002", "ORD003"],
    "customer_name": ["Alice", "Bob", "Charlie"],
    "amount": [100, 250, 175],
}))

print(f"Tables in {NAMESPACE}: {catalog.list_tables(NAMESPACE)}")
```

Run the script:

```bash
python setup_glue_iceberg.py
```

```bash title="Output"
Tables in my_namespace: [('my_namespace', 'customer_orders')]
```

### Create the catalog integration

Connect to the Snowflake emulator with your SQL client of choice and create the catalog integration. The `REST_CONFIG` block declares the Glue REST endpoint and warehouse, and the `REST_AUTHENTICATION` block configures AWS SigV4 signing against the `glue` service.

```sql showLineNumbers
CREATE OR REPLACE CATALOG INTEGRATION glue_rest_catalog_int
    CATALOG_SOURCE = ICEBERG_REST
    TABLE_FORMAT = ICEBERG
    CATALOG_NAMESPACE = 'my_namespace'
    REST_CONFIG = (
        CATALOG_URI = 'http://glue.localhost.localstack.cloud:4566/iceberg'
        CATALOG_API_TYPE = AWS_GLUE
        WAREHOUSE = '000000000000:s3tablescatalog/my-table-bucket'
        ACCESS_DELEGATION_MODE = VENDED_CREDENTIALS
    )
    REST_AUTHENTICATION = (
        TYPE = AWS_SIGV4
        AWS_ACCESS_KEY_ID = '000000000000'
        AWS_SECRET_ACCESS_KEY = 'test'
        AWS_REGION = 'us-east-1'
        AWS_SERVICE = 'glue'
    )
    ENABLED = TRUE
    REFRESH_INTERVAL_SECONDS = 60
    COMMENT = 'Glue Iceberg REST catalog integration';
```

The key fields are:

- `CATALOG_API_TYPE = AWS_GLUE` selects the Glue dialect of the Iceberg REST protocol. This skips the `/api/catalog` suffix that Polaris-style endpoints expect.
- `WAREHOUSE` is the Glue catalog identifier in the form `<account-id>:s3tablescatalog/<table-bucket-name>` and points at the federated catalog created above.
- `ACCESS_DELEGATION_MODE = VENDED_CREDENTIALS` instructs the catalog to return scoped S3 credentials so Snowflake can read the underlying data files without a separate external volume.
- `REST_AUTHENTICATION` uses `AWS_SIGV4` with `AWS_SERVICE = 'glue'`. `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` accept any LocalStack-compatible credentials.

You can verify the integration with:

```sql
SHOW CATALOG INTEGRATIONS;
```

### Create an Iceberg table referencing the Glue catalog

Reference the existing Glue table by its fully-qualified name and let Snowflake infer the schema from the catalog metadata:

```sql showLineNumbers
CREATE OR REPLACE ICEBERG TABLE iceberg_customer_orders
    CATALOG = 'glue_rest_catalog_int'
    CATALOG_TABLE_NAME = 'my_namespace.customer_orders'
    AUTO_REFRESH = TRUE;
```

`CATALOG_TABLE_NAME` uses the `<namespace>.<table>` format from the Glue catalog. With `AUTO_REFRESH = TRUE`, Snowflake re-reads the table metadata on the schedule defined by the integration's `REFRESH_INTERVAL_SECONDS`.

### Query the table

Query the table like any other Snowflake table:

```sql
SELECT * FROM iceberg_customer_orders;
```

```sql title="Output"
+----------+---------------+--------+
| ORDER_ID | CUSTOMER_NAME | AMOUNT |
+----------+---------------+--------+
| ORD001   | Alice         | 100    |
| ORD002   | Bob           | 250    |
| ORD003   | Charlie       | 175    |
+----------+---------------+--------+
```

Rows appended through PyIceberg are visible to Snowflake on the next metadata refresh, and any further changes you make on the Glue side propagate through the same `glue_rest_catalog_int` integration.
