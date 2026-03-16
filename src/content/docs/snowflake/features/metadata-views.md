---
title: Metadata Views
description: Get started with Metadata Views in LocalStack for Snowflake
tags: ["Base"]
---

## Introduction

Snowflake provides metadata views and table functions to query information about database objects, schemas, tables, columns, and query history. These views are available through two schemas:

- **INFORMATION_SCHEMA**: A read-only schema present in every Snowflake database, scoped to that database's objects.
- **ACCOUNT_USAGE**: Available in the special `SNOWFLAKE` database, providing account-wide views that span all databases.

The Snowflake emulator supports querying metadata views, allowing you to inspect the structure of your local Snowflake objects using the same SQL syntax as the Snowflake service.

## INFORMATION_SCHEMA

The `INFORMATION_SCHEMA` schema contains views that return metadata about objects within the current database. You can query it using `<database_name>.INFORMATION_SCHEMA.<view_name>` or simply `INFORMATION_SCHEMA.<view_name>` when a database context is active.

### TABLES

The `TABLES` view returns metadata about tables and views in the current database.

The following columns are returned:

| Column | Data Type | Description |
| --- | --- | --- |
| TABLE_CATALOG | TEXT | Name of the database containing the table |
| TABLE_SCHEMA | TEXT | Name of the schema containing the table |
| TABLE_NAME | TEXT | Name of the table |
| TABLE_OWNER | TEXT | Owner of the table |
| TABLE_TYPE | TEXT | Type of object (BASE TABLE, VIEW, etc.) |
| IS_TRANSIENT | TEXT | Whether the table is transient |
| CLUSTERING_KEY | TEXT | Clustering key expression |
| ROW_COUNT | INTEGER | Approximate number of rows |
| BYTES | INTEGER | Approximate size in bytes |
| RETENTION_TIME | INTEGER | Data retention period in days |
| SELF_REFERENCING_COLUMN_NAME | TEXT | Name of the self-referencing column for typed tables |
| REFERENCE_GENERATION | TEXT | How the self-referencing column value is generated |
| USER_DEFINED_TYPE_CATALOG | TEXT | Database of the user-defined type for typed tables |
| USER_DEFINED_TYPE_SCHEMA | TEXT | Schema of the user-defined type for typed tables |
| USER_DEFINED_TYPE_NAME | TEXT | Name of the user-defined type for typed tables |
| IS_INSERTABLE_INTO | TEXT | Whether rows can be inserted into the table |
| IS_TYPED | TEXT | Whether this is a typed table |
| COMMIT_ACTION | TEXT | Action taken on commit for temporary tables |
| CREATED | TIMESTAMP_LTZ | Timestamp when the table was created |
| LAST_ALTERED | TIMESTAMP_LTZ | Timestamp when the table was last modified |
| LAST_DDL | TIMESTAMP_LTZ | Timestamp of the last DDL operation |
| LAST_DDL_BY | TEXT | User who last performed a DDL operation |
| AUTO_CLUSTERING_ON | TEXT | Whether automatic clustering is enabled |
| COMMENT | TEXT | Comment on the table |
| IS_TEMPORARY | TEXT | Whether the table is temporary |
| IS_ICEBERG | TEXT | Whether the table is an Iceberg table |
| IS_DYNAMIC | TEXT | Whether the table is a Dynamic table |
| IS_IMMUTABLE | TEXT | Whether the table is immutable |
| IS_HYBRID | TEXT | Whether the table is a Hybrid table |

### COLUMNS

The `COLUMNS` view returns metadata about the columns of tables and views in the current database.

The following columns are returned:

| Column | Data Type | Description |
| --- | --- | --- |
| TABLE_CATALOG | TEXT | Name of the database |
| TABLE_SCHEMA | TEXT | Name of the schema |
| TABLE_NAME | TEXT | Name of the table |
| COLUMN_NAME | TEXT | Name of the column |
| ORDINAL_POSITION | INTEGER | Position of the column within the table |
| COLUMN_DEFAULT | TEXT | Default value expression of the column |
| IS_NULLABLE | TEXT | Whether the column allows NULL values |
| DATA_TYPE | TEXT | Snowflake data type of the column |
| CHARACTER_MAXIMUM_LENGTH | INTEGER | Maximum length for character data types |
| CHARACTER_OCTET_LENGTH | INTEGER | Maximum octet length for character data types |
| NUMERIC_PRECISION | INTEGER | Precision for numeric data types |
| NUMERIC_PRECISION_RADIX | INTEGER | Radix for numeric precision |
| NUMERIC_SCALE | INTEGER | Scale for numeric data types |
| DATETIME_PRECISION | INTEGER | Fractional seconds precision for datetime types |
| INTERVAL_TYPE | TEXT | Interval type qualifier |
| INTERVAL_PRECISION | INTEGER | Interval precision |
| CHARACTER_SET_CATALOG | TEXT | Not applicable in Snowflake (always NULL) |
| CHARACTER_SET_SCHEMA | TEXT | Not applicable in Snowflake (always NULL) |
| CHARACTER_SET_NAME | TEXT | Not applicable in Snowflake (always NULL) |
| COLLATION_CATALOG | TEXT | Not applicable in Snowflake (always NULL) |
| COLLATION_SCHEMA | TEXT | Not applicable in Snowflake (always NULL) |
| COLLATION_NAME | TEXT | Not applicable in Snowflake (always NULL) |
| DOMAIN_CATALOG | TEXT | Not applicable in Snowflake (always NULL) |
| DOMAIN_SCHEMA | TEXT | Not applicable in Snowflake (always NULL) |
| DOMAIN_NAME | TEXT | Not applicable in Snowflake (always NULL) |
| UDT_CATALOG | TEXT | Not applicable in Snowflake (always NULL) |
| UDT_SCHEMA | TEXT | Not applicable in Snowflake (always NULL) |
| UDT_NAME | TEXT | Not applicable in Snowflake (always NULL) |
| SCOPE_CATALOG | TEXT | Not applicable in Snowflake (always NULL) |
| SCOPE_SCHEMA | TEXT | Not applicable in Snowflake (always NULL) |
| SCOPE_NAME | TEXT | Not applicable in Snowflake (always NULL) |
| MAXIMUM_CARDINALITY | INTEGER | Not applicable in Snowflake (always NULL) |
| DTD_IDENTIFIER | TEXT | Not applicable in Snowflake (always NULL) |
| IS_SELF_REFERENCING | TEXT | Whether the column is self-referencing |
| IS_IDENTITY | TEXT | Whether the column is an identity column |
| IDENTITY_GENERATION | TEXT | How identity values are generated |
| IDENTITY_START | TEXT | Start value for identity columns |
| IDENTITY_INCREMENT | TEXT | Increment for identity columns |
| IDENTITY_MAXIMUM | TEXT | Maximum value for identity columns |
| IDENTITY_MINIMUM | TEXT | Minimum value for identity columns |
| IDENTITY_CYCLE | TEXT | Whether the identity column cycles |
| IDENTITY_ORDERED | TEXT | Whether the identity column is ordered |
| SCHEMA_EVOLUTION_RECORD | TEXT | Schema evolution record for the column |
| COMMENT | TEXT | Comment on the column |

### SCHEMATA

The `SCHEMATA` view returns metadata about schemas in the current database.

The following columns are returned:

| Column | Data Type | Description |
| --- | --- | --- |
| CATALOG_NAME | TEXT | Name of the database |
| SCHEMA_NAME | TEXT | Name of the schema |
| SCHEMA_OWNER | TEXT | Owner of the schema (NULL for INFORMATION_SCHEMA) |
| IS_TRANSIENT | TEXT | Whether the schema is transient |
| IS_MANAGED_ACCESS | TEXT | Whether managed access is enabled |
| RETENTION_TIME | NUMBER | Data retention period in days |
| DEFAULT_CHARACTER_SET_CATALOG | TEXT | Not applicable in Snowflake (always NULL) |
| DEFAULT_CHARACTER_SET_SCHEMA | TEXT | Not applicable in Snowflake (always NULL) |
| DEFAULT_CHARACTER_SET_NAME | TEXT | Not applicable in Snowflake (always NULL) |
| SQL_PATH | TEXT | Not applicable in Snowflake (always NULL) |
| CREATED | TIMESTAMP_LTZ | Timestamp when the schema was created |
| LAST_ALTERED | TIMESTAMP_LTZ | Timestamp when the schema was last modified |
| COMMENT | TEXT | Comment on the schema |
| REPLICABLE_WITH_FAILOVER_GROUPS | TEXT | Whether the schema can be replicated with failover groups |
| OWNER_ROLE_TYPE | TEXT | Type of role that owns the schema |

### VIEWS

The `VIEWS` view returns metadata about views in the current database.

The following columns are returned:

| Column | Data Type | Description |
| --- | --- | --- |
| TABLE_CATALOG | TEXT | Name of the database |
| TABLE_SCHEMA | TEXT | Name of the schema |
| TABLE_NAME | TEXT | Name of the view |
| TABLE_OWNER | TEXT | Owner of the view |
| VIEW_DEFINITION | TEXT | Full SQL definition of the view, prefixed with `CREATE VIEW <schema>.<name> AS` |
| CHECK_OPTION | TEXT | Check option (always `NONE`) |
| IS_UPDATABLE | TEXT | Whether the view is updatable |
| INSERTABLE_INTO | TEXT | Whether rows can be inserted into the view |
| IS_SECURE | TEXT | Whether the view is a secure view |
| CREATED | TIMESTAMP_LTZ | Timestamp when the view was created |
| LAST_ALTERED | TIMESTAMP_LTZ | Timestamp when the view was last modified |
| LAST_DDL | TIMESTAMP_LTZ | Timestamp of the last DDL operation |
| LAST_DDL_BY | TEXT | User who last performed a DDL operation |
| COMMENT | TEXT | Comment on the view |

### DATABASES

The `DATABASES` view returns metadata about databases accessible in the account.

The following columns are returned:

| Column | Data Type | Description |
| --- | --- | --- |
| DATABASE_NAME | TEXT | Name of the database |
| DATABASE_OWNER | TEXT | Owner of the database |
| IS_TRANSIENT | TEXT | Whether the database is transient |
| COMMENT | TEXT | Comment on the database |
| CREATED | TIMESTAMP_LTZ | Timestamp when the database was created |
| LAST_ALTERED | TIMESTAMP_LTZ | Timestamp when the database was last modified |
| RETENTION_TIME | NUMBER | Data retention period in days |
| TYPE | TEXT | Database type (e.g., `STANDARD`) |
| REPLICABLE_WITH_FAILOVER_GROUPS | TEXT | Whether the database can be replicated with failover groups |
| OWNER_ROLE_TYPE | TEXT | Type of role that owns the database |

## INFORMATION_SCHEMA Table Functions

In addition to views, `INFORMATION_SCHEMA` provides table functions that return tabular results. These are invoked using the `TABLE()` syntax.

### QUERY_HISTORY

The `QUERY_HISTORY` table function returns the recent query execution history for the current account.

The function accepts the following parameters:

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| RESULT_LIMIT | NUMBER | 100 | Maximum number of rows to return (range: 1–10000) |
| END_TIME_RANGE_START | TIMESTAMP_LTZ | NULL | Return queries whose end time is at or after this value |
| END_TIME_RANGE_END | TIMESTAMP_LTZ | NULL | Return queries whose end time is before this value |
| INCLUDE_CLIENT_GENERATED_STATEMENT | BOOLEAN | NULL | Whether to include client-generated statements |

:::note
The `END_TIME_RANGE_START` and `END_TIME_RANGE_END` parameters are accepted but time-based filtering is not yet applied in the emulator.
:::

### QUERY_HISTORY_BY_USER

The `QUERY_HISTORY_BY_USER` table function returns the recent query execution history for a specific user. It returns the same columns as `QUERY_HISTORY`.

The function accepts the following parameters:

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| USER_NAME | VARCHAR | NULL | User whose history to return; defaults to the current session user |
| END_TIME_RANGE_START | TIMESTAMP_LTZ | NULL | Return queries whose end time is at or after this value |
| END_TIME_RANGE_END | TIMESTAMP_LTZ | NULL | Return queries whose end time is before this value |
| RESULT_LIMIT | NUMBER | 100 | Maximum number of rows to return (range: 1–10000) |
| INCLUDE_CLIENT_GENERATED_STATEMENT | BOOLEAN | NULL | Whether to include client-generated statements |

### TAG_REFERENCES

The `TAG_REFERENCES` table function returns all tag assignments for a specific object within the current database.

The function accepts the following positional parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| OBJECT_NAME | VARCHAR | Name of the object to look up tag assignments for |
| OBJECT_DOMAIN | VARCHAR | Domain of the object (e.g., `table`, `column`, `schema`, `database`) |

## ACCOUNT_USAGE

The `ACCOUNT_USAGE` schema is available in the special `SNOWFLAKE` database and provides views with account-wide visibility across all databases. Query it using `SNOWFLAKE.ACCOUNT_USAGE.<view_name>`.

### TAG_REFERENCES

The `ACCOUNT_USAGE.TAG_REFERENCES` view returns all tag-to-object associations across the entire account. Unlike the `INFORMATION_SCHEMA.TAG_REFERENCES()` table function, this view returns every tag assignment without requiring you to specify a particular object.

The following columns are returned:

| Column | Data Type | Description |
| --- | --- | --- |
| TAG_DATABASE | TEXT | Name of the database containing the tag |
| TAG_SCHEMA | TEXT | Name of the schema containing the tag |
| TAG_ID | NUMBER | Internal identifier of the tag |
| TAG_NAME | TEXT | Name of the tag |
| TAG_VALUE | TEXT | Value assigned to the tag |
| OBJECT_DATABASE | TEXT | Database of the tagged object (NULL for `DATABASE`, `ROLE`, and `WAREHOUSE` domains) |
| OBJECT_SCHEMA | TEXT | Schema of the tagged object (NULL for `DATABASE`, `SCHEMA`, `ROLE`, and `WAREHOUSE` domains) |
| OBJECT_ID | NUMBER | Internal identifier of the tagged object |
| OBJECT_NAME | TEXT | Name of the tagged object |
| OBJECT_DELETED | TIMESTAMP_LTZ | Timestamp when the tagged object was deleted, if applicable |
| DOMAIN | TEXT | Type of the tagged object (`TABLE`, `COLUMN`, `SCHEMA`, `DATABASE`, `ROLE`, `WAREHOUSE`, etc.) |
| COLUMN_ID | TEXT | Internal identifier of the tagged column |
| COLUMN_NAME | TEXT | Name of the tagged column when `DOMAIN` is `COLUMN`; otherwise NULL |
| APPLY_METHOD | TEXT | Method by which the tag was applied |

For more information on Snowflake metadata views, refer to the [Snowflake INFORMATION_SCHEMA documentation](https://docs.snowflake.com/en/sql-reference/info-schema) and the [Snowflake ACCOUNT_USAGE documentation](https://docs.snowflake.com/en/sql-reference/account-usage).
