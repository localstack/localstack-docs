---
title: Accounts
description: Get started with Accounts in LocalStack for Snowflake
---

## Introduction

An account is a unique identifier for a Snowflake instance within an organization. It acts as a container
for resources and operations related to data storage, processing, and management.

The Snowflake emulator lets you connect to and manage resources in different accounts.

## Getting Started

This guide explains how to start and connect to the Snowflake emulator using specific accounts.

You can specify any account name when connecting to the Snowflake emulator. If you don't, all resources
will be managed by the default `test` account.

Depending on the Snowflake Driver you choose, you can pass `account` accordingly.

### Connect using Snowflake Connection Object

If the Snowflake driver provides a connection object, you can pass the `account` parameter in the connection object.

Example using the Snowflake Connector for Python:

```python
sf_conn_obj = sf.connect(
    account="your_account",
    # other parameters
)
```

Example using the NodeJS Driver for Snowflake:

```javascript
var connection = snowflake.createConnection({
  account: "your_account",
  // other parameters
});
```

### Connect using Connection String

You can also specify the account for Snowflake drivers that let you connect with a connection string.

Example establishing a JDBC connection:

```text
jdbc:snowflake://snowflake.localhost.localstack.cloud:4566/?account=your_account
```

### Check Current Account

Once successfully connected, you can verify which account you are connected to by executing the following SQL command:

```sql
SELECT CURRENT_ACCOUNT_NAME();
```

The query statement will return the name of the account you are currently connected to. Output should look like:

```sql
+------------------------------------------+
| CURRENT_ACCOUNT_NAME()                   |
|------------------------------------------|
| YOUR_ACCOUNT                             |
+------------------------------------------+
```
