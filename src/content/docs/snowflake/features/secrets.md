---
title: Secrets
description: Get started with Secrets in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction
Secrets in Snowflake provide a secure way to store sensitive credentials, such as usernames and passwords, for use with external integrations. They allow you to centralize authentication information and manage access consistently across your Snowflake environment. 

The Snowflake emulator offers CRUD support,  which are currently mocked and not functional.  This makes it possible to test workloads locally that rely on secure credential management without needing a live Snowflake account.

## Getting started
This guide is designed for users new to Secrets and assumes basic knowledge of SQL and Snowflake. Start your Snowflake emulator and connect to it using an SQL client in order to execute the queries below.

In this guide, you will:

1. Create a secret.  
2. Show and describe existing secrets.  
3. Alter a secret.  
4. Drop a secret.  

### Create a Secret
You can create a secret using the `CREATE SECRET` statement.  

The following example creates a password-based secret:

```sql
CREATE SECRET my_secret
  TYPE = PASSWORD
  USERNAME = 'myuser'
  PASSWORD = 'mypassword123';
```

### Show Secrets

You can list all secrets in the account using the `SHOW SECRETS` command:

```sql
SHOW SECRETS;
```

### Describe Secret

You can view the details of a specific secret using the `DESCRIBE SECRET` command:

```sql
DESCRIBE SECRET my_secret;
```

### Alter Secret

You can update the properties of an existing secret with the `ALTER SECRET` command.

For example, changing the password:

```sql
ALTER SECRET my_secret SET PASSWORD = 'newpassword456';
```

### Drop Secret

You can remove a secret using the `DROP SECRET` statement:

```sql
DROP SECRET IF EXISTS my_secret;
```

