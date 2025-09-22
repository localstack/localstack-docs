---
title: "Resource Monitors"
description: Get started with Resource Monitors in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

Resource monitors in Snowflake allow administrators to track and control credit usage for warehouses and accounts. They help manage costs by defining limits and triggering actions (such as suspending warehouses) when thresholds are reached.

The Snowflake emulator offers CRUD support for resource monitors. These objects are placeholders only, they do not track usage or enforce limits. This allows you to test Terraform configurations or automation flows that reference resource monitors without enabling their actual functionality.

## Getting started

This guide is designed for users new to resource monitors and assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to it using an SQL client in order to execute the queries below.

In this guide, you will:

- Create a resource monitor.
- View its properties.
- Alter it to adjust quotas.
- Drop it when it is no longer needed.

### Create a resource monitor

You can create a resource monitor with the `CREATE RESOURCE MONITOR` statement:

```sql
CREATE RESOURCE MONITOR test_monitor
  WITH CREDIT_QUOTA = 100
  TRIGGERS ON 80 PERCENT DO SUSPEND;
```

This example creates a monitor named `test_monitor` with a quota of 100 credits. When 80% of the quota is reached, it suspends associated warehouses.

### Show resource monitors

You can list all resource monitors in the emulator with:

```sql
SHOW RESOURCE MONITORS;
```

### Describe a resource monitor

You can view the properties of a specific monitor with:

```sql
DESCRIBE RESOURCE MONITOR test_monitor;
```

### Alter a resource monitor

You can change the quota or triggers of an existing resource monitor using `ALTER RESOURCE MONITOR`:

```sql
ALTER RESOURCE MONITOR test_monitor
  SET CREDIT_QUOTA = 200;
```

### Drop a resource monitor

When a monitor is no longer needed, you can drop it with:

```sql
DROP RESOURCE MONITOR IF EXISTS test_monitor;
```

