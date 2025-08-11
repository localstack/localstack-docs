---
title: REST API
description: Get started with REST API Endpoints in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

The [Snowflake REST API](https://docs.snowflake.com/en/developer-guide/snowflake-rest-api/snowflake-rest-api) provides REST API endpoints that allow you to manage schemas and tables in Snowflake. Snowflake REST APIs let you use the programming language of your choice to build your integrations.  

LocalStack for Snowflake supports REST API endpoints that let you manage your Snowflake data locally. 

## Supported Snowflake REST API endpoints 

LocalStack for Snowflake supports the following REST API endpoints to manage your Snowflake data locally:


| Supported Endpoint                                           | Description                                 |
|---------------------------------------------------|---------------------------------------------|
| `POST /api/v2/databases`                          | Creates a database.                         |
| `GET /api/v2/databases`                           | Lists accessible databases.                 |
| `GET /api/v2/databases/<name>`                    | Fetch a specific database.                   |
