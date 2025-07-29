---
title: Data Metric Functions
description: Get started with Data Metric Functions in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

Snowflake [Data Metric Functions (DMFs)](https://docs.snowflake.com/en/user-guide/data-quality-intro) lets you monitor the freshness, completeness, and quality of your data by attaching system or user-defined metrics to tables and columns.

LocalStack for Snowflake supports you to add a metric schedule to table (enable functions in a table), attach DMFs to table column, run the DMFs manually, and get results from DMFs.

## Getting started

This guide is designed for users new to Data Metric Functions and assumes basic knowledge of SQL and Snowflake. Start LocalStack for Snowflake and connect to it using a SQL client in order to execute the queries further below.

In this guide, you will learn how to:

- Define system/user metrics like `COUNT`, `UNIQUE`, `NULL`, or `DUPLICATE`
- Schedule those metrics on tables
- Attach metrics to columns
- Run them manually or on a schedule
- Query results from the DMF state table

### 1. Create a Table with DMF Support

Run the following query to create a table with Data Metric Functions:

```sql
CREATE OR REPLACE FUNCTION check_values(ARG_T TABLE(c1 STRING))
RETURNS NUMBER
AS
$$
  SELECT COUNT(*) FROM ARG_T WHERE c1 IS NULL
$$;
```

### 2. Add a Metric Schedule to a Table 

Run the following query to add a metric to your table:

```sql
ALTER TABLE customers
  SET DATA_METRIC_SCHEDULE = 'TRIGGER_ON_CHANGES';
```

### 3. Attach a DMF to a Column

Run the following query to attach Data Metric Functions to a specific column:

``` sql
ALTER TABLE customers
  ADD DATA METRIC FUNCTION check_values ON (email);
```

### 4. Run a DMF Manually

Run the following query to manually run Data Metric Functions in your table:

``` sql
SELECT check_values(SELECT * FROM customers);
```

### 5. Query Results from the DMF

Run the following query to see the results of the Data Metric Functions in your table:

``` sql
SELECT *
FROM SNOWFLAKE.LOCAL.DATA_QUALITY_MONITORING_RESULTS
WHERE TABLE_NAME = 'CUSTOMERS';
```

