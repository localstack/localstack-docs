---
title: User-Defined Functions
description: Get started with User-Defined Functions in Node.js, Java & Python with LocalStack for Snowflake
---

## Introduction

User-Defined Functions (UDFs) are functions that you can create to extend the functionality of your SQL queries. Snowflake supports UDFs in different programming languages, including JavaScript, Python, Java, Scala, and SQL.

The Snowflake emulator supports User-Defined Functions (UDFs) in JavaScript, Java and Python. You can create UDFs to extend the functionality of your SQL queries. This guide demonstrates how to create and execute UDFs in JavaScript, Java and Python.

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
