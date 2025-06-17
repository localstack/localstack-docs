---
title: Snowflake Drivers
description: Get started with Snowflake Drivers in LocalStack for Snowflake
---

## Introduction

Snowflake Drivers enable the use of programming languages like Go, C#, and Python for developing applications that interact with Snowflake. The Snowflake emulator facilitates testing Snowflake integration without connecting to the actual Snowflake instance. This guide provides instructions on connecting the Snowflake emulator with various drivers.

## Snowflake Connector for Python

The Snowflake Connector for Python (`snowflake-connector-python`) is a Python library that facilitates connecting Python programs to Snowflake databases and executing operations. Utilize this connector to link to the Snowflake emulator for testing your Snowflake integrations in Python.

To install the Snowflake Connector for Python, execute the following command:

```bash
pip install snowflake-connector-python
```

The Snowflake emulator operates on `snowflake.localhost.localstack.cloud` - note that this is a DNS name that resolves to a local IP address (`127.0.0.1`) to make sure the connector interacts with the local APIs. Connect to the emulator using the following Python code:

```python
import snowflake.connector as sf

conn = sf.connect(
    user="test",
    password="test",
    account="test",
    database="test",
    host="snowflake.localhost.localstack.cloud",
)
```

Subsequently, create a warehouse named `test_warehouse`, a database named `testdb`, and a schema named `testschema` using the Snowflake Connector for Python:

```python
conn.cursor().execute("CREATE WAREHOUSE IF NOT EXISTS test_warehouse")
conn.cursor().execute("CREATE DATABASE IF NOT EXISTS testdb")
conn.cursor().execute("USE DATABASE testdb")
conn.cursor().execute("CREATE SCHEMA IF NOT EXISTS testschema")
```

## Node.js Driver

The Snowflake Node.js driver facilitates connecting to Snowflake and executing operations on Snowflake databases using Node.js. Use this driver to link to the Snowflake emulator for testing Snowflake integration.

To install the Snowflake Node.js driver, execute the following command:

```bash
npm install snowflake-sdk
```

The Snowflake emulator runs on `snowflake.localhost.localstack.cloud`. Connect to the emulator using the following JavaScript code:

```javascript
var snowflake = require('snowflake-sdk');
var connection = snowflake.createConnection({
    username: 'test',
    password: 'test',
    account: 'test',
    database: 'test',
    // snowflake-sdk version 1.9.3 and later supports host property and can be used instead of accessUrl like:
    // host: 'snowflake.localhost.localstack.cloud',
    accessUrl: 'https://snowflake.localhost.localstack.cloud',
});
connection.connect(function(err, conn) {
  if (err) {
    console.error('Unable to connect: ' + err.message);
  } else {
    console.log('Successfully connected as id: ' + connection.getId());
  }
});
```

Execute a query to create a database named `testdb` and verify the results using the following JavaScript code:

```javascript
connection.execute({
    sqlText: 'CREATE DATABASE testdb',
    complete: function(err, stmt, rows) {
      if (err) {
        console.error('Failed to execute statement due to the following error: ' + err.message);
      } else {
        console.log('Successfully executed statement: ' + stmt.getSqlText());
      }
    }
  });
```

## Go Driver

The Go Snowflake driver provides a way to connect to Snowflake and perform database operations using Go. You can use this driver to connect to the Snowflake emulator for testing your Snowflake integrations in Go.

To install the Go Snowflake driver, execute the following command:

```bash
go get github.com/snowflakedb/gosnowflake
```

The connection string follows the format `username:password@host:port/database?account=account_name`. For the emulator use:
`test:test@snowflake.localhost.localstack.cloud:4566/test?account=test`

Here's an example of how to connect to the Snowflake emulator using Go:

```go
package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/snowflakedb/gosnowflake"
)

func main() {
	// Connection string
	connectionString := "test:test@snowflake.localhost.localstack.cloud:4566/test?account=test"

	// Connect to LocalStack Snowflake
	db, err := sql.Open("snowflake", connectionString)
	if err != nil {
		log.Fatalf("Failed to connect to Snowflake: %v", err)
	}
	defer db.Close()

	// Ping the database to verify the connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping Snowflake: %v", err)
	}
	fmt.Println("Successfully connected to Snowflake!")

	// Execute a simple query
	rows, err := db.Query("SELECT 123")
	if err != nil {
		log.Fatalf("Failed to execute query: %v", err)
	}
	defer rows.Close()

	// Process the result
	var version string
	for rows.Next() {
		if err := rows.Scan(&version); err != nil {
			log.Fatalf("Failed to scan row: %v", err)
		}
		fmt.Printf("Query result: %s\n", version)
	}

	if err := rows.Err(); err != nil {
		log.Fatalf("Error iterating rows: %v", err)
	}
}
```
