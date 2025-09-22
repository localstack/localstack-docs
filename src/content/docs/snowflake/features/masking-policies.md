---
title: "Masking Policies"
description: Get started with Masking Policies in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

Masking policies are schema-level objects that let you define column-level data protection rules in Snowflake. They determine how sensitive data is displayed depending on the context of the query and the role of the user. For example, a masking policy can ensure that full values are shown to administrators while obfuscating values for regular users.

The Snowflake emulator in LocalStack now supports **basic CRUD operations** for masking policies, which are currently mocked and not functional. While the full integration of masking policies with table data is not yet supported, you can use these operations to experiment with policy definitions and query their metadata locally.

## Getting started

Masking policies is intended for local development and testing. It is useful for validating schema migration scripts, Terraform workflows, or integration tests that reference masking policies.

## Create, alter, and drop a masking policy

### Create a masking policy
You can define a masking policy using the `CREATE MASKING POLICY` statement:

```sql
CREATE MASKING POLICY ssn_mask AS (val STRING) 
  RETURNS STRING ->
    CASE
      WHEN CURRENT_ROLE() IN ('FULL_ACCESS_ROLE') THEN val
      ELSE 'XXX-XX-XXXX'
    END;
```

This policy shows the full value of a column only to users with the `FULL_ACCESS_ROLE`. All other users see a masked version.

### Alter a masking policy

You can update an existing masking policy using `ALTER MASKING POLICY`:

```sql
ALTER MASKING POLICY ssn_mask 
  SET BODY ->
    CASE
      WHEN CURRENT_ROLE() IN ('FULL_ACCESS_ROLE', 'AUDITOR_ROLE') THEN val
      ELSE 'XXX-XX-XXXX'
    END;
```

This modification expands access to include the `AUDITOR_ROLE`.

### Show masking policies

List existing masking policies using:

```sql
SHOW MASKING POLICIES;
```

The result displays available masking policies and their properties.

### Drop a masking policy

Remove a policy using:

```sql
DROP MASKING POLICY ssn_mask;
```

This deletes the policy definition from the emulator.

:::note
## Limitations

- LocalStack currently supports only the CRUD operations (`CREATE`, `ALTER`, `SHOW`, `DROP`) for masking policies.
- Applying masking policies to tables and enforcing them during queries is not supported yet.
- Use this feature primarily for validating schema definitions and testing IaC workflows.
:::