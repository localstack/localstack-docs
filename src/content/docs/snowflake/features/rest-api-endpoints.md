---
title: REST API Endpoints
description: Get started with REST API Endpoints in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

The [Snowflake REST Database API](https://docs.snowflake.com/en/developer-guide/snowflake-rest-api/snowflake-rest-api) provides REST API endpoints that allow you to manage database schemas and tables in Snowflake databases. Snowflake REST APIs let you use the programming language of your choice to build your integrations.  

LocalStack for Snowflake supports REST API Database endpoints that let you manage your Snowflake databases locally. You can create a database, list your databases, or fetch a specific one.

## Supported Snowflake REST Database API endpoints 

LocalStack for Snowflake supports the following REST API endpoints to manage your Snowflake databases locally:


| Supported Endpoint                                           | Description                                 |
|---------------------------------------------------|---------------------------------------------|
| `POST /api/v2/databases`                          | Creates a database.                         |
| `GET /api/v2/databases`                           | Lists accessible databases.                 |
| `GET /api/v2/databases/<name>`                    | Fetch a specific database.                   |
