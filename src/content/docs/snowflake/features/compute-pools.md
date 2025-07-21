---
title: Compute Pools
description: Get started with Compute Pools in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

Compute Pools in Snowflake are account-level collections of virtual machine nodes. These pools automatically scale between configurable minimum and maximum node limits based on demand. They function as the foundational infrastructure for containerized data applications within Snowflake's ecosystem, similar to virtual warehouses.

The Snowflake emulator provides a CRUD (Create, Read, Update, Delete) interface for Compute Pools, allowing you to mock the creation and management of Compute Pools in your local environment.

## Getting started

This guide is designed for users new to Compute Pools and assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to it using an SQL client in order to execute the queries further below.

In this guide, you will create a Compute Pool, display the Compute Pool details, alter the Compute Pool configuration, and drop the Compute Pool.

### Create a Compute Pool

You can create a Compute Pool using the `CREATE COMPUTE POOL` statement. In this example, you can create a Compute Pool called `my_compute_pool`:

```sql
CREATE COMPUTE POOL my_compute_pool 
MIN_NODES = 1 
MAX_NODES = 1 
INSTANCE_FAMILY = CPU_X64_XS;
```

### Describe Compute Pool

You can view detailed information about a Compute Pool using the `DESCRIBE COMPUTE POOL` statement:

```sql
DESCRIBE COMPUTE POOL my_compute_pool;
```

The output should be:

```sql
name           |state   |min_nodes|max_nodes|instance_family|num_services|num_jobs|auto_suspend_secs|auto_resume|active_nodes|idle_nodes|target_nodes|created_on             |resumed_on             |updated_on             |owner |comment|is_exclusive|application|error_code|status_message                             |
---------------+--------+---------+---------+---------------+------------+--------+-----------------+-----------+------------+----------+------------+-----------------------+-----------------------+-----------------------+------+-------+------------+-----------+----------+-------------------------------------------+
MY_COMPUTE_POOL|STARTING|        1|        1|CPU_X64_XS     |           0|       0|             3600|true       |           0|         0|           1|1970-01-01 05:30:00.000|1970-01-01 05:30:00.000|1970-01-01 05:30:00.000|PUBLIC|       |false       |           |          |Compute pool is starting for last 0 minutes|
```

### Show Compute Pools

You can display the Compute Pools using the `SHOW COMPUTE POOLS` statement:

```sql
SHOW COMPUTE POOLS LIKE 'my_compute_pool';
```

The output should be:

```sql
name           |state   |min_nodes|max_nodes|instance_family|num_services|num_jobs|auto_suspend_secs|auto_resume|active_nodes|idle_nodes|target_nodes|created_on             |resumed_on             |updated_on             |owner |comment|is_exclusive|application|
---------------+--------+---------+---------+---------------+------------+--------+-----------------+-----------+------------+----------+------------+-----------------------+-----------------------+-----------------------+------+-------+------------+-----------+
MY_COMPUTE_POOL|STARTING|        1|        1|CPU_X64_XS     |           0|       0|             3600|true       |           0|         0|           1|1970-01-01 05:30:00.000|1970-01-01 05:30:00.000|1970-01-01 05:30:00.000|PUBLIC|       |false       |           |
```

### Alter Compute Pool

You can modify the configuration of an existing Compute Pool using the `ALTER COMPUTE POOL` statement. In this example, you can increase the maximum number of nodes:

```sql
ALTER COMPUTE POOL my_compute_pool SET MAX_NODES = 2;
```

You can verify the change by describing the Compute Pool again:

```sql
DESCRIBE COMPUTE POOL my_compute_pool;
```

### Drop Compute Pool

You can drop the Compute Pool using the `DROP COMPUTE POOL` statement:

```sql
DROP COMPUTE POOL my_compute_pool;
```
