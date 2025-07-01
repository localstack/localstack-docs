---
title: "Transaction Management"
description: Get started with Transaction Management in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

Transaction Management is a feature that allows you to manage transactions in Snowflake. You can use Transaction Management to create a transaction management system that is specific to your application.

The Snowflake emulator supports Transaction Management, allowing you to emulate realistic database operations that require precise control over when changes are committed or rolled back.

## Getting started

This guide is designed for users new to Transaction Management and assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to it using an SQL client to execute the queries below.

The following sections demonstrate how to start and manage named transactions, check transaction state, control visibility across sessions, and monitor all active transactions using a simple orders table.

### Create a table

The following SQL snippet creates a table named orders to store order IDs. We will use this table to test transactional behavior.

```sql
CREATE TABLE IF NOT EXISTS orders (
  id INT
);
```

### Begin transaction and insert data

Use the `BEGIN` or `START TRANSACTION` statement to begin a transaction and optionally assign it a name. Data inserted during the transaction will not be visible to other sessions until committed.

```sql 
BEGIN NAME mytxn;

INSERT INTO orders VALUES (1), (2);
```

### Commit transaction

Use the `COMMIT` statement to save the changes made during the transaction.

```sql 
COMMIT;
```

The expected output is:

```sql
+------------------------+
| status                 |
|------------------------|
| Transaction committed  |
+------------------------+
```

### View the current transaction

Use the `CURRENT_TRANSACTION()` function to get the ID of the currently active transaction.

```sql 
SELECT CURRENT_TRANSACTION() AS txn;
```

After starting a transaction, this function returns a non-null ID.

```sql 
START TRANSACTION NAME mytxn2;

SELECT CURRENT_TRANSACTION() AS txn;
```

The expected output is:

```sql
+--------------------------------------+
| TXN                                  |
|--------------------------------------|
| 6f9bfa42-88d7-4c8c-bc7c-3db1d69d1552 |
+--------------------------------------+
```

### Show all active transactions

Use the `SHOW TRANSACTIONS` statement to view all active transactions.

```sql 
SHOW TRANSACTIONS;
```

### Rollback transaction

To undo uncommitted changes, use the `ROLLBACK` statement. Subsequent rollbacks have no effect.

```sql showLineNumbers
BEGIN;

INSERT INTO orders VALUES (3), (4);

ROLLBACK;
```
