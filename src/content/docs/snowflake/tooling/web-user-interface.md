---
title: Web UI 
description: Get started with LocalStack for Snowflake Web User Interface
---

{{< preview-notice >}}

## Introduction

The Snowflake emulator provides a simple web user interface (UI) accessible via a web browser. The Web UI allows you to:

* Run SQL queries and view results using a Query Editor.
* View detailed request/response traces of API calls.
* Forward queries to a real Snowflake instance using a proxy.

Access the Web UI at [https://snowflake.localhost.localstack.cloud/](https://snowflake.localhost.localstack.cloud/). The Web UI is available only when the Snowflake emulator is running. It does not connect to the Snowflake service (except during a proxy connection) or any other external service on the Internet.

{{< alert title="Info" >}}
Please note that the LocalStack Snowflake Web UI is still experimental and under active development.
{{< /alert >}}

## Getting started

This guide is designed for users new to the Snowflake emulator Web UI. Start your Snowflake emulator using the following command:

```bash
EXTRA_CORS_ALLOWED_ORIGINS='*' IMAGE_NAME=localstack/snowflake DEBUG=1 localstack start
```

The `EXTRA_CORS_ALLOWED_ORIGINS` environment variable is used to allow CORS requests from the Web UI. Navigate to [https://snowflake.localhost.localstack.cloud/](https://snowflake.localhost.localstack.cloud/) to access the Web UI.

### Run SQL queries

The Web UI provides a Query Editor that allows you to run SQL queries and view the results.

<img src="run-sql-queries-web-ui.png" alt="Running SQL queries" width="700"/>
<br><br>

You can click on **Warehouses** and **Databases** on the left side of the screen to view the available warehouses and databases.

### View request/response traces

The Web UI provides a detailed view of request/response traces of API calls. You can view the request and response headers, body, and status code. Click on the **Request Logs** tab in the Web UI to view the request/response traces.

<img src="request-logs-web-ui.png" alt="View request/response traces" width="700"/>

### Forward queries to a real Snowflake instance

You can forward queries from the Snowflake emulator to a real Snowflake instance using a proxy.

To forward queries, click on the **Proxy** tab in the Web UI and enter the Snowflake account username & password. Click on the **Save** button to save the credentials. You can now run queries in the Query Editor, and they will be forwarded to the real Snowflake instance.
{{< alert title="Important" color="danger" >}}
Be careful when operating the proxy, as it can incur costs and access data in your real Snowflake account. For security reasons, please make sure to use scoped credentials with the least set of required permissions (ideally read-only). Only run the proxy against test/staging environments, and never against a production database.
{{< /alert >}}
<img src="proxy-web-ui.png" alt="Forward queries to a real Snowflake instance" width="700"/>