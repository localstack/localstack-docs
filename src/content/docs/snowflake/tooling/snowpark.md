---
title: Snowpark 
description: Get started with Snowpark in LocalStack for Snowflake
---

{{< preview-notice >}}

## Introduction

Snowpark library is a developer library for querying and processing data at scale in Snowflake. Snowflake currently provides Snowpark libraries for three languages: Java, Python, and Scala. The Snowflake emulator facilitates testing Snowpark queries without connecting to the actual Snowflake instance. This guide provides instructions on using the Snowflake emulator in conjunction with Snowpark.

## Snowpark for Python

The Snowflake emulator supports the development and testing of Snowpark Python code in a local development environment. You can install the Snowpark Python library using the following command:

{{< command >}}
$ pip install snowflake-snowpark-python
{{< /command >}}

In this getting started guide, we'll use the Snowpark Python library to establish a connection to the Snowflake emulator and employ a DataFrame to query a table named `sample_product_data`.

### Create a Snowpark Session

The Snowflake emulator operates on `snowflake.localhost.localstack.cloud`. To create a Snowpark session in Python, use the following code:

```python
from snowflake.snowpark import *
from snowflake.snowpark.functions import *

connection_parameters = {
    "user": "test",
    "password": "test",
    "account": "test",
    "warehouse": "test",
    "host": "snowflake.localhost.localstack.cloud",
}

session = Session.builder.configs(connection_parameters).create()
```

### Create a table

You can create a table named `sample_product_data` and fill the table with some data by executing SQL statements. Add the following Python code to create the table:

```python
session.sql('CREATE OR REPLACE TABLE sample_product_data (id INT, parent_id INT, category_id INT, name VARCHAR, serial_number VARCHAR, key INT, "3rd" INT)').collect()
[Row(status='Table SAMPLE_PRODUCT_DATA successfully created.')]
session.sql("""
    INSERT INTO sample_product_data VALUES
    (1, 0, 5, 'Product 1', 'prod-1', 1, 10),
    (2, 1, 5, 'Product 1A', 'prod-1-A', 1, 20),
    (3, 1, 5, 'Product 1B', 'prod-1-B', 1, 30),
    (4, 0, 10, 'Product 2', 'prod-2', 2, 40),
    (5, 4, 10, 'Product 2A', 'prod-2-A', 2, 50),
    (6, 4, 10, 'Product 2B', 'prod-2-B', 2, 60),
    (7, 0, 20, 'Product 3', 'prod-3', 3, 70),
    (8, 7, 20, 'Product 3A', 'prod-3-A', 3, 80),
    (9, 7, 20, 'Product 3B', 'prod-3-B', 3, 90),
    (10, 0, 50, 'Product 4', 'prod-4', 4, 100),
    (11, 10, 50, 'Product 4A', 'prod-4-A', 4, 100),
    (12, 10, 50, 'Product 4B', 'prod-4-B', 4, 100)
""").collect()
```

You can verify that the table was created and the data was inserted by executing the following Python code:

```python
session.sql("SELECT count(*) FROM sample_product_data").collect()
```

The following output should be displayed:

```bash
[Row(COUNT=12)]
```

### Construct a DataFrame

You can now construct a DataFrame from the data in the `sample_product_data` table using the following Python code:

```python
df_table = session.table("sample_product_data")
```

You can see the first 10 rows of the DataFrame by executing the following Python code:

```python
df_table.show(10)
```

The following output should be displayed:

```bash
-------------------------------------------------------------------------------------
|"ID"  |"PARENT_ID"  |"CATEGORY_ID"  |"NAME"      |"SERIAL_NUMBER"  |"KEY"  |"3RD"  |
-------------------------------------------------------------------------------------
|1     |0            |5              |Product 1   |prod-1           |1      |10     |
|2     |1            |5              |Product 1A  |prod-1-A         |1      |20     |
|3     |1            |5              |Product 1B  |prod-1-B         |1      |30     |
|4     |0            |10             |Product 2   |prod-2           |2      |40     |
|5     |4            |10             |Product 2A  |prod-2-A         |2      |50     |
|6     |4            |10             |Product 2B  |prod-2-B         |2      |60     |
|7     |0            |20             |Product 3   |prod-3           |3      |70     |
|8     |7            |20             |Product 3A  |prod-3-A         |3      |80     |
|9     |7            |20             |Product 3B  |prod-3-B         |3      |90     |
|10    |0            |50             |Product 4   |prod-4           |4      |100    |
-------------------------------------------------------------------------------------
```

### Transform the DataFrame

You can perform local transformations on the DataFrame. For example, you can filter rows with the value of 'id' equal to 1:

```python
df = session.table("sample_product_data").filter(col("id") == 1)
df.show()
```

The following output should be displayed:

```bash
------------------------------------------------------------------------------------
|"ID"  |"PARENT_ID"  |"CATEGORY_ID"  |"NAME"     |"SERIAL_NUMBER"  |"KEY"  |"3RD"  |
------------------------------------------------------------------------------------
|1     |0            |5              |Product 1  |prod-1           |1      |10     |
------------------------------------------------------------------------------------
```

Furthermore, you can also select specific columns:

```python
df = session.table("sample_product_data").select(col("id"), col("name"), col("serial_number"))
df.show()
```

The following output should be displayed:

```bash
---------------------------------------
|"ID"  |"NAME"      |"SERIAL_NUMBER"  |
---------------------------------------
|1     |Product 1   |prod-1           |
|2     |Product 1A  |prod-1-A         |
|3     |Product 1B  |prod-1-B         |
|4     |Product 2   |prod-2           |
|5     |Product 2A  |prod-2-A         |
|6     |Product 2B  |prod-2-B         |
|7     |Product 3   |prod-3           |
|8     |Product 3A  |prod-3-A         |
|9     |Product 3B  |prod-3-B         |
|10    |Product 4   |prod-4           |
---------------------------------------
```