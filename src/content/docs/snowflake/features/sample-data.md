---
title: Sample Data
description: Get started with Sample Data in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

Snowflake provides sample datasets that allow users to test and develop queries without needing to import their own data. These sample datasets include TPC-H benchmark data, which is commonly used for evaluating database performance and practicing SQL queries.

The Snowflake emulator supports importing Snowflake's sample datasets using the `FROM SHARE SFC_SAMPLES` syntax. This enables you to create a local `snowflake_sample_data` database with TPC-H benchmark data for testing and development purposes.

## Getting started

This guide is designed for users new to Sample Data and assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to it using a SQL client to execute the queries below.

The following sections guide you through importing sample data and querying the TPC-H benchmark dataset.

### Import Sample Data

To import the sample data, use the `CREATE DATABASE ... FROM SHARE` statement. The following example demonstrates how to import Snowflake's sample data.

```sql
CREATE DATABASE SNOWFLAKE_SAMPLE_DATA FROM SHARE SFC_SAMPLES.SAMPLE_DATA;
```

This creates a `snowflake_sample_data` database with the following structure:

| Object | Name |
| --- | --- |
| Database | `snowflake_sample_data` |
| Schema | `tpch_sf1` |
| Table | `orders` |

### Query the Sample Data

Once the sample data is imported, you can query the `orders` table in the `tpch_sf1` schema. The following example demonstrates how to query the sample data.

```sql
SELECT * FROM snowflake_sample_data.tpch_sf1.orders LIMIT 5;
```

You can also filter the data using the `WHERE` clause. The following example demonstrates how to filter the data by `O_ORDERKEY`.

```sql
SELECT * FROM snowflake_sample_data.tpch_sf1.orders WHERE O_ORDERKEY = 3000001;
```

### Schema Details

The `orders` table in the `snowflake_sample_data.tpch_sf1` schema follows the TPC-H benchmark schema with the following columns:

| Column | Type | Description |
| --- | --- | --- |
| O_ORDERKEY | NUMBER(38,0) | Order key |
| O_CUSTKEY | NUMBER(38,0) | Customer key |
| O_ORDERSTATUS | VARCHAR(1) | Order status |
| O_TOTALPRICE | NUMBER(12,2) | Total price |
| O_ORDERDATE | DATE | Order date |
| O_ORDERPRIORITY | VARCHAR(15) | Order priority |
| O_CLERK | VARCHAR(15) | Clerk identifier |
| O_SHIPPRIORITY | NUMBER(38,0) | Shipping priority |
| O_COMMENT | VARCHAR(79) | Comments |

## Current Limitations

The sample data feature currently has the following limitations:

- The dataset contains sample data with limited rows in the `orders` table.
- The full TPC-H dataset is not yet implemented.
- Only the `tpch_sf1` schema and `orders` table are available.

For more information on Snowflake's sample data, refer to the [official Snowflake documentation](https://docs.snowflake.com/en/user-guide/sample-data-using).
