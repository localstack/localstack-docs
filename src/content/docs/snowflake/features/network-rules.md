---
title: "Network Rules"
description: Get started with Network Rules in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

Network rules are schema-level objects in Snowflake that allow you to group network identifiers (such as IP addresses, ports, or private endpoints) into logical units. They are used to define which network traffic should be allowed or blocked.

The Snowflake emulator in LocalStack supports basic CRUD operations (`CREATE`, `ALTER`, `DROP`, `SHOW`) for network rules. This enables you to create and manage network rule objects locally for testing and schema validation.

:::note
While you can create and manage network rules, their use in enforcing network access policies is not yet supported in the emulator.
::: 

## Getting started

This guide is designed for users new to network rules and assumes you are already connected to your Snowflake emulator with a SQL client. The following examples demonstrate how to create, alter, show, and drop network rules.

### Create a network rule

You can create a network rule using the `CREATE NETWORK RULE` statement. The example below creates a network rule that allows ingress traffic from a specific IPv4 address:

```sql showLineNumbers
CREATE NETWORK RULE allow_ip_rule
  TYPE = IPV4
  MODE = INGRESS
  VALUE_LIST = ('192.168.1.1')
  COMMENT = 'Allow traffic from 192.168.1.1';
```

### Show network rules

You can list all network rules in your schema using the `SHOW NETWORK RULES` statement:

```sql
SHOW NETWORK RULES;
```

### Alter a network rule

You can modify an existing network rule using the `ALTER NETWORK RULE` statement. The example below updates the comment:

```sql
ALTER NETWORK RULE allow_ip_rule
  SET COMMENT = 'Updated description';
```

### Drop a network rule

You can delete an existing network rule with the `DROP NETWORK RULE` statement:

```sql
DROP NETWORK RULE allow_ip_rule;
```

:::note
## Limitations

- Only CRUD operations are supported in the emulator.
- Network rules cannot yet be enforced or attached to other Snowflake objects.
- Use this feature for schema validation and testing SQL workflows, not for actual network access control.
:::
