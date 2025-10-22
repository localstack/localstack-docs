---
title: "API Integrations"
description: Get started with API Integrations in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

API integrations in Snowflake provide a secure way to configure trust between Snowflake and external cloud providers such as AWS API Gateway. They are typically used when creating external functions or API-based workflows.

The LocalStack Snowflake emulator now supports basic **CRUD operations** for API integrations, which are currently mocked and not functional. This is useful for testing Terraform configurations or other automation flows that depend on these objects.

Currently, this feature is partially mocked and designed primarily to unblock end-to-end test coverage. Behavior may not fully reflect production Snowflake semantics.

## Getting started

This guide assumes you already have the Snowflake emulator running and a SQL client connected.

You can manage API integrations using standard SQL statements such as `CREATE API INTEGRATION`, `ALTER API INTEGRATION`, and others.


## Create, alter, and drop an API integration

### Create an API integration

You can create a new API integration using the `CREATE API INTEGRATION` command:

```sql
CREATE API INTEGRATION my_integration
    API_PROVIDER = aws_api_gateway
    API_AWS_ROLE_ARN = 'arn:aws:iam::000000000000:role/r1'
    API_ALLOWED_PREFIXES = ('https://xyz.execute-api.us-east-1.amazonaws.com/test')
    ENABLED = TRUE;
```

### Show integrations

You can list all existing API integrations with:

```sql
SHOW API INTEGRATIONS;
```

### Describe integration

You can inspect the details of an integration using:

```sql
DESCRIBE API INTEGRATION my_integration;
```

### Alter an integration

You can modify an existing API integration, for example disabling it:

```sql
ALTER API INTEGRATION my_integration SET ENABLED = FALSE;
```

### Drop an integration

You can remove an integration with:

```sql
DROP API INTEGRATION my_integration;
```
