---
title: "Openflow"
description: Get started with Openflow in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction
Openflow is Snowflake’s data movement service that provides a unified platform for building, scaling, and managing data pipelines. It is powered by Apache NiFi and enables flexible data ingestion, transformation, and integration across diverse sources and destinations.

The Snowflake emulator in LocalStack supports **basic Openflow functionality** by using Apache NiFi. This allows you to experiment locally with Openflow concepts, such as creating processors and running SQL queries against the Snowflake emulator.

You can access the Openflow UI when the emulator is running at:

```
https://snowflake.localhost.localstack.cloud:4566/openflow/
```

:::note
Openflow in LocalStack for Snowflake is intended for local experimentation. It does not provide the full set of managed Openflow capabilities available in Snowflake’s cloud platform.
:::

## Getting started
To begin using Openflow in LocalStack:

1. Start your Snowflake emulator.
2. Open the following URL in your browser: `https://snowflake.localhost.localstack.cloud:4566/openflow/`

![Openflow running locally via Apache NiFi](/images/snowflake/openflow-feature/openflow-nifi.png)

The first load may take some time, as Apache NiFi dependencies are downloaded and initialized.

Once the UI is available, you can create and configure NiFi processors directly in your browser.

### Running a query with ExecuteSQL
The following example demonstrates how to run a simple query against the Snowflake emulator using the `ExecuteSQL` processor.

1. Add an ExecuteSQL processor: Drag the `ExecuteSQL` processor onto the canvas in the Openflow UI.

2. Configure the processor:
- Set the **Database Connection Pooling Service** to use the default `Snowflake Connection Pool`.

![Processor](/images/snowflake/openflow-feature/processor.png)

- Enter a query, for example:

```sql
SELECT 123;
```

- In the **Relationships** tab, configure the processor to terminate or retry on `failure` and `success`.

![Terminate Processor](/images/snowflake/openflow-feature/terminate-processor.png)


3. Start the processor: Right-click the processor and choose **Start**. The processor will run the SQL query against the Snowflake emulator.

![Start Processor](/images/snowflake/openflow-feature/start-processor.png)


4. Verify execution: In the emulator logs, you should see the executed query:

```sql
Running query (account/DB/schema TEST/TEST/public): SELECT 123
```



:::note
## Limitations
- The initial download of Apache NiFi is large (~750 MB) and may take several minutes.  
- Only basic UI and processor creation are supported. Advanced Openflow functionality, including governance, AI capabilities, and managed connectors, is not included in the local emulator.
:::
