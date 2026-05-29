---
title: User-Defined Functions
description: Get started with User-Defined Functions in SQL, Node.js, Java & Python with LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

User-Defined Functions (UDFs) are functions that you can create to extend the functionality of your SQL queries. Snowflake supports UDFs in different programming languages, including SQL, JavaScript, Python, Java, and Scala.

The Snowflake emulator supports User-Defined Functions (UDFs) in SQL, JavaScript, Java, and Python. You can create UDFs to extend the functionality of your SQL queries. This guide demonstrates how to create and execute UDFs in SQL, JavaScript, Java, and Python.

## SQL

In the Snowflake emulator, you can create scalar SQL UDFs and table-returning SQL UDFs, also known as User-Defined Table Functions (UDTFs). Start your Snowflake emulator and connect to it using a SQL client to execute the queries below.

### Create a Scalar SQL UDF

You can create a scalar SQL UDF using the `CREATE FUNCTION` statement. The following example creates a SQL UDF that receives an amount and percentage as input and returns the amount with the percentage added.

```sql showLineNumbers
CREATE OR REPLACE FUNCTION add_percentage(amount FLOAT, percentage FLOAT)
  RETURNS FLOAT
  AS 'amount + (amount * percentage / 100)';
```

### Execute a Scalar SQL UDF

You can execute a scalar SQL UDF using the `SELECT` statement.

```sql
SELECT add_percentage(100, 8);
```

The result of the query is `108`.

### Create a Table-Returning SQL UDF

You can create a table-returning SQL UDF using the `RETURNS TABLE` clause. The following example creates a SQL UDF that returns rows matching the specified minimum amount.

```sql showLineNumbers
CREATE OR REPLACE FUNCTION orders_above(min_amount FLOAT)
  RETURNS TABLE (order_id INTEGER, total FLOAT)
  AS
  $$
    SELECT order_id, total
    FROM (
      SELECT 1 AS order_id, 42.50 AS total
      UNION ALL
      SELECT 2 AS order_id, 120.00 AS total
      UNION ALL
      SELECT 3 AS order_id, 255.25 AS total
    ) AS orders
    WHERE total >= min_amount
  $$;
```

### Execute a Table-Returning SQL UDF

You can execute a table-returning SQL UDF from a `FROM` clause using the `TABLE` keyword.

```sql
SELECT * FROM TABLE(orders_above(100));
```

The result of the query is:

```sql
+----------+--------+
| ORDER_ID | TOTAL  |
|----------+--------|
| 2        | 120.00 |
| 3        | 255.25 |
+----------+--------+
```

## JavaScript

In the Snowflake emulator, you can create JavaScript UDFs to extend the functionality of your SQL queries. Start your Snowflake emulator and connect to it using a SQL client to execute the queries below.

### Create a JavaScript UDF

You can create a JavaScript UDF using the `CREATE FUNCTION` statement. The following example creates a JavaScript UDF that receives a number as input and adds 5 to it.

```sql showLineNumbers
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

## Java

In the Snowflake emulator, you can create Java UDFs to extend the functionality of your SQL queries. The following modes are supported:

-   **Inline Java Code** via the `AS` clause
-   **Staged JAR Files** via the `IMPORTS` clause.

Start your Snowflake emulator and connect to it using a SQL client to execute the queries below.

### Create a Java UDF (inline code)

You can define a Java UDF using the `CREATE FUNCTION` statement and provide the Java source inline with the `AS` clause.

```sql showLineNumbers
CREATE OR REPLACE FUNCTION echo_inline(x VARCHAR)
RETURNS VARCHAR
LANGUAGE JAVA
CALLED ON NULL INPUT
HANDLER = 'TestFunc.echoVarchar'
AS '
class TestFunc {
  public static String echoVarchar(String x) {
    return x;
  }
}
';
```

### Execute the Java UDF (inline code)

Once created, you can call the Java UDF using a standard `SELECT` statement.

```sql
SELECT echo_inline('hello world');
```

The result of the query is:

```sql
+---------------------+
| ECHO_INLINE         |
|---------------------|
| hello world         |
+---------------------+
```

### Create a Java UDF from a JAR file

You can also compile your Java code into a `.jar` file, upload it to a Snowflake stage, and reference it using the `IMPORTS` clause.

```sql showLineNumbers
-- Assume the JAR file has been uploaded to @mystage/testfunc.jar
CREATE OR REPLACE FUNCTION echo_from_jar(x VARCHAR)
RETURNS VARCHAR
LANGUAGE JAVA
CALLED ON NULL INPUT
HANDLER = 'TestFunc.echoVarchar'
IMPORTS = ('@mystage/testfunc.jar');
```

### Execute the Java UDF from a JAR file

Once created, you can call the Java UDF using a standard `SELECT` statement.

```sql
SELECT echo_from_jar('from jar');
```

The result of the query is:

```sql
+---------------------+
| ECHO_FROM_JAR       |
|---------------------|
| from jar            |
+---------------------+
```

## Python

In the Snowflake emulator, you can create User-Defined Functions (UDFs) in Python to extend the functionality of your SQL queries. Start your Snowflake emulator and connect to it using a SQL client to execute the queries below.

### Create a Python UDF

You can create a Python UDF using the `CREATE FUNCTION` statement. The following example creates a Python UDF that takes a string as input and returns the string with a prefix.

```sql showLineNumbers
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

## Secure Functions

 Secure UDFs are user-defined functions that protect sensitive information and prevent unauthorized users from viewing function definitions, underlying data, or implementation details.

LocalStack supports Secure UDFs, allowing you to tests sensitive data privacy & security controls. To create a Secure UDF, you need to use the `SECURE` keyword in the `CREATE FUNCTION` statement.

```sql
CREATE OR REPLACE SECURE FUNCTION secure_func(x VARCHAR)
RETURNS VARCHAR
LANGUAGE PYTHON
RUNTIME_VERSION='3.8' HANDLER='secure_func'
AS $$
def secure_func(i):
    return 'echo: ' + i
$$;
```
