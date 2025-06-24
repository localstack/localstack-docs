---
title: "Polaris Catalog"
description: Get started with Polaris Catalog in LocalStack for Snowflake
---

## Introduction

[Polaris Catalog](https://github.com/apache/polaris) is a unified data catalog that provides a single view of all your data assets across Snowflake and external sources. It enables you to discover, understand, and govern your data assets, making it easier to find and use the right data for your analytics and machine learning projects.

The Snowflake emulator supports creating Iceberg tables with Polaris catalog. Currently, [`CREATE CATALOG INTEGRATION`](https://docs.snowflake.com/en/sql-reference/sql/create-catalog-integration-open-catalog) is supported by LocalStack. LocalStack also provides a `localstack/polaris` Docker image that can be used to create a local Polaris REST catalog.

## Getting started

This guide is designed for users new to Iceberg tables with Polaris catalog and assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to it using an SQL client in order to execute the queries further below.

This guide shows how to use the Polaris REST catalog to create Iceberg tables in the Snowflake emulator, by:

- Launching the Polaris Catalog service
- Setting up an external volume
- Creating a catalog integration
- Creating an Iceberg table
- Querying the Iceberg table

### Start Polaris catalog container

The following command starts the Polaris catalog container using the `localstack/polaris` Docker image:

```bash showLineNumbers
docker run -d --name polaris-test \
  -p 8181:8181 -p 8182:8182 \
  -e AWS_REGION=us-east-1 \
  -e AWS_ACCESS_KEY_ID=test \
  -e AWS_SECRET_ACCESS_KEY=test \
  -e AWS_ENDPOINT_URL=http://localhost:4566 \
  -e POLARIS_BOOTSTRAP_CREDENTIALS=default-realm,root,s3cr3t \
  -e polaris.realm-context.realms=default-realm \
  -e quarkus.otel.sdk.disabled=true \
  localstack/polaris:latest
```

Wait for Polaris to become healthy:

```bash 
curl -X GET http://localhost:8182/health
```

### Authenticate and create Polaris catalog

Set variables and retrieve an access token:

```bash showLineNumbers
REALM="default-realm"
CLIENT_ID="root"
CLIENT_SECRET="s3cr3t"
BUCKET_NAME="test-bucket-$(openssl rand -hex 4)"
CATALOG_NAME="polaris"

TOKEN=$(curl -s -X POST http://localhost:8181/api/catalog/v1/oauth/tokens \
  -H "Polaris-Realm: $REALM" \
  -d "grant_type=client_credentials&client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&scope=PRINCIPAL_ROLE:ALL" | jq -r '.access_token')
```

The `TOKEN` variable will contain the access token.

Create a catalog:

```bash showLineNumbers
curl -s -X POST http://localhost:8181/api/management/v1/catalogs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "catalog": {
      "name": "'"$CATALOG_NAME"'",
      "type": "INTERNAL",
      "properties": {
        "default-base-location": "s3://'"$BUCKET_NAME"'/test"
      },
      "storageConfigInfo": {
        "storageType": "S3_COMPATIBLE",
        "allowedLocations": ["s3://'"$BUCKET_NAME"'/"],
        "s3.roleArn": "arn:aws:iam::000000000000:role/'"$BUCKET_NAME"'",
        "region": "us-east-1",
        "s3.pathStyleAccess": true,
        "s3.endpoint": "http://localhost:4566"
      }
    }
  }'
```

Grant necessary permissions to the catalog:

```bash showLineNumbers
curl -s -X PUT http://localhost:8181/api/management/v1/catalogs/polaris/catalog-roles/catalog_admin/grants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "catalog", "privilege": "TABLE_WRITE_DATA"}'
```

### Create a bucket

Create a bucket using the `awslocal` command:

```bash
awslocal s3 mb s3://$BUCKET_NAME
```

### Create an external volume

In your SQL client, create an external volume using the `CREATE EXTERNAL VOLUME` statement:

```sql showLineNumbers
CREATE EXTERNAL VOLUME polaris_volume
STORAGE_LOCATIONS = (
  (
    NAME = aws_s3_test
    STORAGE_PROVIDER = S3
    STORAGE_BASE_URL = 's3://test-bucket/'
    STORAGE_AWS_ROLE_ARN = 'arn:aws:iam::000000000000:role/test-bucket'
    ENCRYPTION = (TYPE = AWS_SSE_S3)
  )
)
ALLOW_WRITES = TRUE;
```

### Create catalog integration

Create a catalog integration using the `CREATE CATALOG INTEGRATION` statement:

```sql showLineNumbers
CREATE CATALOG INTEGRATION polaris_catalog
CATALOG_SOURCE = ICEBERG_REST
TABLE_FORMAT = ICEBERG
CATALOG_NAMESPACE = 'test_namespace'
REST_CONFIG = (
  CATALOG_URI = 'http://localhost:8181',
  CATALOG_NAME = 'polaris'
)
REST_AUTHENTICATION = (
  TYPE = OAUTH,
  OAUTH_CLIENT_ID = 'root',
  OAUTH_CLIENT_SECRET = 's3cr3t',
  OAUTH_ALLOWED_SCOPES = (PRINCIPAL_ROLE:ALL)
)
ENABLED = TRUE
REFRESH_INTERVAL_SECONDS = 60
COMMENT = 'Polaris catalog integration';
```

### Create and query an Iceberg table

Now create the table using the Polaris catalog and volume:

```sql showLineNumbers
CREATE ICEBERG TABLE polaris_iceberg_table (c1 TEXT)
CATALOG = 'polaris_catalog',
EXTERNAL_VOLUME = 'polaris_volume',
BASE_LOCATION = 'test/test_namespace';
```

Insert and query data:

```sql
INSERT INTO polaris_iceberg_table(c1) VALUES ('test'), ('polaris'), ('iceberg');

SELECT * FROM polaris_iceberg_table;
```

The output should be:

```sql
+----------+
| c1       |
|----------|
| iceberg  |
| foobar   |
| test     |
+----------+
```

All data will be persisted under:

```bash
awslocal s3 ls s3://$BUCKET_NAME/test/test_namespace/
```

You will see:

-   `data/` with `.parquet` files
-   `metadata/` with Iceberg metadata files

## Configuration options

The following configuration options are available for the Polaris Catalog Docker image provided by LocalStack:

| Environment Variable | Description | Default Value | Required |
|---------------------|-------------|---------------|----------|
| `AWS_REGION` | The AWS region to use | `us-east-1` | Yes |
| `AWS_ACCESS_KEY_ID` | AWS access key ID for accessing AWS services | - | Yes when using AWS services |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key for accessing AWS services | - | Yes when using AWS services |
| `AWS_ENDPOINT_URL` | Custom endpoint URL for AWS services (e.g., for LocalStack) | - | No |
| `POLARIS_BOOTSTRAP_CREDENTIALS` | Initial realm, username, and password in format: `realm,username,password` | - | Yes |
| `polaris.realm-context.realms` | List of realms to create/use | - | Yes |
| `quarkus.otel.sdk.disabled` | Disable OpenTelemetry SDK | `false` | No |

The following logging options are available for the Polaris Catalog Docker image:

| Logging Option | Description |
|----------------|-------------|
| `quarkus.log.level` | Sets the overall logging level (e.g., DEBUG) |
| `quarkus.log.console.level` | Sets the console logging level (e.g., DEBUG) |
| `quarkus.log.category."org.apache.polaris".level` | Sets the logging level specifically for the Polaris components |
| `quarkus.log.category."org.apache.polaris".min-level` | Sets the minimum logging level for the Polaris components (e.g., TRACE) |
