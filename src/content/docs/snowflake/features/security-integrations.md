---
title: Security Integrations
description: Get started with Security Integrations in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

Security Integration is a Snowflake object that acts as a bridge between Snowflake and an external identity, API, or provisioning service. Security Integrations simplify single sign-on, token-based API access, and automated user/role management while keeping sensitive keys encrypted and auditable within Snowflake.

The Snowflake emulator lets you test Security Integrations locally by mocking their creation and management. You can set up a Snowflake OAuth-based security integration that handle user authentication for Snowflake access.

## Getting started

This guide is designed for users new to Security Integrations and assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to it using an SQL client in order to execute the queries further below.

In this guide, you will create a Security Integration, display the Security Integration details, alter the Security Integration configuration, and drop the Security Integration.

### Create a Security Integration

You can create a Security Integration using the `CREATE SECURITY INTEGRATION` statement. In this example, you can create an OAuth-based Security Integration called `my_oauth_integration`:

```sql
CREATE SECURITY INTEGRATION my_oauth_integration
TYPE = OAUTH
ENABLED = true
OAUTH_CLIENT = CUSTOM
OAUTH_CLIENT_TYPE = 'PUBLIC'
OAUTH_REDIRECT_URI = 'https://example.com/callback'
OAUTH_ISSUE_REFRESH_TOKENS = true;
```

### Describe Security Integration

You can view detailed information about a Security Integration using the `DESCRIBE SECURITY INTEGRATION` statement:

```sql
DESCRIBE SECURITY INTEGRATION my_oauth_integration;
```

The output should display various properties of the Security Integration:

```sql
property                                  |property_type|property_value                    |property_default|
------------------------------------------+-------------+----------------------------------+----------------+
BLOCKED_ROLES_LIST                        |List         |[]                                |[]              |
COMMENT                                   |String       |                                  |                |
ENABLED                                   |Boolean      |RuntimeException: Unknow json type|false           |
NETWORK_POLICY                            |String       |                                  |                |
OAUTH_ALLOWED_AUTHORIZATION_ENDPOINTS     |List         |[]                                |[]              |
OAUTH_ALLOWED_TOKEN_ENDPOINTS             |List         |[]                                |[]              |
OAUTH_ALLOW_NON_TLS_REDIRECT_URI          |Boolean      |false                             |false           |
OAUTH_AUTHORIZATION_ENDPOINT              |String       |                                  |                |
OAUTH_CLIENT_ID                           |String       |                                  |                |
OAUTH_CLIENT_RSA_PUBLIC_KEY_2_FP          |String       |                                  |                |
OAUTH_CLIENT_RSA_PUBLIC_KEY_FP            |String       |                                  |                |
OAUTH_CLIENT_TYPE                         |String       |PUBLIC                            |CONFIDENTIAL    |
OAUTH_ENFORCE_PKCE                        |Boolean      |false                             |false           |
OAUTH_ISSUE_REFRESH_TOKENS                |Boolean      |RuntimeException: Unknow json type|true            |
OAUTH_REDIRECT_URI                        |String       |https://example.com/callback      |                |
OAUTH_REFRESH_TOKEN_VALIDITY              |Integer      |7776000                           |7776000         |
OAUTH_SINGLE_USE_REFRESH_TOKENS_REQUIRED  |Boolean      |false                             |false           |
OAUTH_TOKEN_ENDPOINT                      |String       |                                  |                |
OAUTH_USE_SECONDARY_ROLES                 |String       |NONE                              |NONE            |
PRE_AUTHORIZED_ROLES_LIST                 |List         |[]                                |[]              |
USE_PRIVATELINK_FOR_AUTHORIZATION_ENDPOINT|Boolean      |false                             |false           |
```

### Alter Security Integration

You can modify the configuration of an existing Security Integration using the `ALTER SECURITY INTEGRATION` statement. In this example, you can disable the integration:

```sql
ALTER SECURITY INTEGRATION my_oauth_integration SET ENABLED = false;
```

### Show Security Integrations

You can display the Security Integrations using the `SHOW SECURITY INTEGRATIONS` statement:

```sql
SHOW SECURITY INTEGRATIONS LIKE 'my_oauth_integration';
```

### Drop Security Integration

You can drop the Security Integration using the `DROP SECURITY INTEGRATION` statement:

```sql
DROP SECURITY INTEGRATION my_oauth_integration;
```
