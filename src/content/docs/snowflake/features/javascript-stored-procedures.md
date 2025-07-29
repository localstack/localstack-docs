---
title: JavaScript Stored Procedures
description: Get started with JavaScript Stored Procedures in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

JavaScript Stored Procedures uses [Snowflake JavaScript Procedures API](https://docs.snowflake.com/en/developer-guide/stored-procedure/stored-procedures-api). The API consists of JavaScript objects and the methods in those objects. You can declare JavaScript stored procedures, execute SQL via embedded JavaScript, call these using Snowflake’s supported methods.

The methods that we support thus far are:
- `snowflake.execute()`
- `snowflake.createStatement()`
- `statement.execute()`
- `resultSet.next()`
- `resultSet.getColumnValue()`

## Getting started

This guide is designed for users new to JavaScript Stored Procedures and assumes basic knowledge of JavaScript and Snowflake. Start LocalStack for Snowflake and execute [Snowflake stored procedures in JavaScript](https://docs.snowflake.com/en/developer-guide/stored-procedure/stored-procedures-api#object-snowflake). 

## Creating a simple JavaScript procedure

You can declare JavaScript procedures like this:

```javascript showLineNumbers
CREATE OR REPLACE PROCEDURE minimal_proc()
RETURNS STRING
LANGUAGE JAVASCRIPT
AS
$$
    var stmt = snowflake.createStatement({sqlText: "SELECT 'hello world'"});
    var rs = stmt.execute();
    ...
$$;
```