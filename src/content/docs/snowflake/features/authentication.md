---
title: Authentication
description: Get started with authentication in Snowflake.
---

## Introduction

Snowflake supports [multiple authentication methods](https://docs.snowflake.com/en/user-guide/authentication-policies). The Snowflake emulator supports the following authentication methods:

* Username and password
* RSA key pair authentication

This guide demonstrates how to use the Snowflake emulator to authenticate using both methods.

## Username and password

To authenticate using a username and password, you can set the `user` and `password` parameters in the connection string. The values for these parameters can be set to `test` in the Snowflake emulator. Since the Snowflake emulator is a local instance, the username and password can be the same, and the authentication mechanism is mocked.

Here's an example of how to connect to the Snowflake emulator using a username and password in a Python script:

```python lineNumbers
import snowflake.connector as sf

sf_conn_obj = sf.connect(
    user="test",
    password="test",
    account="test",
    database="test",
    host="snowflake.localhost.localstack.cloud",
)
```

The default username and password are set to `test` and can be changed using `SF_DEFAULT_USER` and `SF_DEFAULT_PASSWORD` when starting the Snowflake emulator.

:::note
It is not recommended to use your production credentials in the Snowflake emulator.
:::

## RSA key pair authentication

The Snowflake emulator supports RSA key-based authentication, allowing users to log in without a password by using a private key and a configured public key.

To enable this, create a private key and a public key pair.

```bash
openssl genrsa -out private_key.pem 2048
openssl rsa -in private_key.pem -pubout -out public_key.pem
```

Then set a public key for the user:

```sql
ALTER USER your_user_name SET RSA_PUBLIC_KEY='<public_key>';
```

Then authenticate with the private key using the Snowflake client:

```python lineNumbers
import snowflake.connector

conn = snowflake.connector.connect(
    user='your_user_name',
    account='your_account_identifier',
    private_key_file='/path/to/private_key.pem',
    # Add other parameters as needed
)
```

:::note
The Snowflake emulator does not validate key contents—RSA authentication is mocked for local testing only.
:::
