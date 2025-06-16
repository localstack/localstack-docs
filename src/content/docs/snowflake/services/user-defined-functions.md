---
title: User-Defined Functions
description: Get started with User-Defined Functions in Node.js & Python with LocalStack for Snowflake
---



## Introduction

User-Defined Functions (UDFs) are functions that you can create to extend the functionality of your SQL queries. Snowflake supports UDFs in different programming languages, including JavaScript, Python, Java, Scala, and SQL.

The Snowflake emulator supports User-Defined Functions (UDFs) in JavaScript and Python. You can create UDFs to extend the functionality of your SQL queries. This guide demonstrates how to create and execute UDFs in JavaScript and Python.

## JavaScript

In the Snowflake emulator, you can create JavaScript UDFs to extend the functionality of your SQL queries. Start your Snowflake emulator and connect to it using a SQL client to execute the queries below.

### Create a JavaScript UDF

You can create a JavaScript UDF using the `CREATE FUNCTION` statement. The following example creates a JavaScript UDF that receives a number as input and adds 5 to it.

```sql
CREATE OR REPLACE FUNCTION add5(n double)
  RETURNS double
  LANGUAGE JAVASCRIPT
  AS 'return N + 5;';
```

### Execute a JavaScript UDF

You can execute a JavaScript UDF using the `SELECT` statement. The following example executes the UDF created in the previous step.

```sql
SELECT add5(10);
```

The result of the query is `15`.

## Python

In the Snowflake emulator, you can create User-Defined Functions (UDFs) in Python to extend the functionality of your SQL queries. Start your Snowflake emulator and connect to it using a SQL client to execute the queries below.

### Create a Python UDF

You can create a Python UDF using the `CREATE FUNCTION` statement. The following example creates a Python UDF that takes a string as input and returns the string with a prefix.

```sql
CREATE OR REPLACE FUNCTION sample_func(sample_arg TEXT)
RETURNS VARCHAR LANGUAGE PYTHON
RUNTIME_VERSION='3.8' HANDLER='sample_func'
AS $$
def sample_func(i):
    return 'echo: ' + i
$$;
```

### Execute a Python UDF

You can execute a Python UDF using the `SELECT` statement. The following example executes the Python UDF created in the previous step.

```sql
SELECT sample_func('foobar');
```

The result of the query is `echo: foobar`.