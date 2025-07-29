---
title: Stored Procedures
description: Get started with Stored Procedures in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

Stored Procedures uses [Snowflake's Procedures API](https://docs.snowflake.com/en/developer-guide/stored-procedure/stored-procedures-api). The API consists of objects and the methods in those objects. You can create stored procedures, execute SQL via embedded scripts, and call these using Snowflake’s supported methods.

The methods that we support thus far are:
- `snowflake.execute()`
- `snowflake.createStatement()`
- `statement.execute()`
- `resultSet.next()`
- `resultSet.getColumnValue()`

## Getting started

This guide is designed for users new to Stored Procedures and assumes basic knowledge of Snowflake. Start LocalStack for Snowflake and execute [Snowflake stored procedures](https://docs.snowflake.com/en/developer-guide/stored-procedure/stored-procedures-api#object-snowflake). 

## JavaScript

In LocalStack for Snowflake, you can create JavaScript Stored Procedures to define reusable logic using Snowflake’s JavaScript API. These procedures allow you to embed SQL execution inside JavaScript functions, enabling flexible control flow, conditionals, and result handling within your data workflows.

### Creating a simple JavaScript procedure

The following is a simple JavaScript procedure that makes use of some of the most important methods of Snowflake JavasScript Procedures API:

```javascript showLineNumbers
CREATE OR REPLACE PROCEDURE minimal_proc()
RETURNS STRING
LANGUAGE JAVASCRIPT
AS
$$
    var stmt = snowflake.createStatement({sqlText: "SELECT 'hello world'"});
    var rs = stmt.execute();
    rs.next();
    return rs.getColumnValue(1);
$$;
```
