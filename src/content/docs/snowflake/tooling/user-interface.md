---
title: User Interface
description: Get started with LocalStack for Snowflake Web User Interface
tags: ["Base"]
---

## Introduction

The Snowflake emulator provides a User Interface (UI) via the [LocalStack Web Application](https://app.localstack.cloud/). The User Interface allows you to:

* Run SQL queries and view results using a Query Editor.
* View detailed request/response traces of API calls.
* Forward queries to a real Snowflake instance using a proxy.

To access the User Interface, you need to start the Snowflake emulator and access the **Snowflake** tab in your default instance of the LocalStack Web Application. This User Interface is available only when the Snowflake emulator is running. Please note that it does not connect to the real Snowflake cloud environment (except during a proxy connection) or any other external service on the Internet.

:::note
Please note that the Snowflake User Interface is still experimental and under active development.
:::

## Getting started

This guide is designed for users new to the Snowflake emulator Web UI. Start your Snowflake emulator using the following command:

```bash
export LOCALSTACK_AUTH_TOKEN=<your_auth_token>
localstack start --stack snowflake
```

Navigate to [**https://app.localstack.cloud/inst/default/snowflake**](https://app.localstack.cloud/inst/default/snowflake) to access the User Interface.

### Run SQL queries

The User Interface provides a **SQL Worksheet** tab that allows you to run SQL queries and view results. The editor includes SQL syntax highlighting and autocomplete to help you write queries faster.

![Running SQL queries](/images/snowflake/new-run-sql-queries.png)

Use the **Local Resources** panel on the right to explore available databases, schemas, tables, and columns in a hierarchical view.

![Local Resources](/images/snowflake/local-resources.png)

You can run the current statement by placing your cursor inside it, or execute only a selected portion of SQL from the editor.


### View Query History

The User Interface provides a **Query History** tab that displays recently executed queries along with their execution details.

Each entry includes metadata such as the query ID, SQL text, execution status, duration, rows returned, and the database, schema, and warehouse used during execution.

You can search and filter the query history to quickly locate queries by text, execution status, or time range.

![Query history](/images/snowflake/query-history.png)
