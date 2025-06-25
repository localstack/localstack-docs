---
title: "Feature Coverage"
description: Overview of the implemented Snowflake features in LocalStack
template: doc
editUrl: false
---

## Resource Types and Operations

This page provides a list of Snowflake query features (resource types and operations) that are supported in the LocalStack emulator.
The content will be updated as additional query features and functions are implemented.

### Applications
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|
|----|----|----|----|----|----|
|**APPLICATION**|✅|✅|✅|✅|✅|

### Application Packages
| |ALTER|CREATE|DROP|SHOW|
|----|----|----|----|----|
|**APPLICATION PACKAGE**|✅|✅|✅|✅|

### Catalog Integration
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|
|----|----|----|----|----|----|
|**CATALOG INTEGRATION**|❓|✅|❓|✅|✅|

### Databases
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|UNDROP|USE|
|----|----|----|----|----|----|----|----|
|**DATABASE**|✅|✅|✅|✅|✅|❓|✅|

### Dynamic Tables
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|UNDROP|
|----|----|----|----|----|----|----|
|**DYNAMIC TABLE**|❓|✅|✅|✅|✅|❓|

### External Tables
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|
|----|----|----|----|----|----|
|**EXTERNAL TABLE**|❓|❓|❓|❓|❓|

### External Volumes
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|UNDROP|
|----|----|----|----|----|----|----|
|**EXTERNAL VOLUME**|✅|✅|✅|✅|✅|❓|

### File Formats
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|
|----|----|----|----|----|----|
|**FILE FORMAT**|✅|✅|✅|✅|✅|

### Functions
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|
|----|----|----|----|----|----|
|**FUNCTION**|✅|✅|✅|✅|✅|

### Hybrid Tables
| |CREATE|SHOW|
|----|----|----|
|**HYBRID TABLE**|✅|✅|

### Iceberg Tables
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|UNDROP|
|----|----|----|----|----|----|----|
|**ICEBERG TABLE**|❓|✅|❓|✅|❓|❓|

### Indexes
| |CREATE|DROP|SHOW|
|----|----|----|----|
|**INDEX**|✅|✅|✅|

### Materialized Views
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|TRUNCATE|
|----|----|----|----|----|----|----|
|**MATERIALIZED VIEW**|✅|✅|✅|✅|✅|✅|

### Pipes
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|
|----|----|----|----|----|----|
|**PIPE**|✅|✅|✅|✅|✅|

### Procedures
| |ALTER|CALL|CALL WITH|CREATE|DESCRIBE|DROP|SHOW|
|----|----|----|----|----|----|----|----|
|**PROCEDURE**|❓|✅|❓|✅|✅|✅|✅|

### Roles
| |ALTER|CREATE|DROP|GRANT|REVOKE|SHOW|USE|
|----|----|----|----|----|----|----|----|
|**ROLE**|❓|✅|✅|❓|❓|✅|✅|

### Row Access Policies
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|
|----|----|----|----|----|----|
|**ROW ACCESS POLICY**|✅|✅|✅|✅|✅|

### Schemas
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|UNDROP|USE|
|----|----|----|----|----|----|----|----|
|**SCHEMA**|✅|✅|✅|✅|✅|❓|✅|

### Sequences
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|
|----|----|----|----|----|----|
|**SEQUENCE**|✅|✅|✅|✅|✅|

### Shares
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|
|----|----|----|----|----|----|
|**SHARE**|❓|✅|❓|✅|❓|

### Stages
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|
|----|----|----|----|----|----|
|**STAGE**|✅|✅|✅|✅|✅|

### Storage Integrations
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|
|----|----|----|----|----|----|
|**STORAGE INTEGRATION**|❓|✅|✅|✅|✅|

### Streams
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|
|----|----|----|----|----|----|
|**STREAM**|✅|✅|✅|✅|✅|

### Streamlits
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|
|----|----|----|----|----|----|
|**STREAMLIT**|✅|✅|✅|✅|✅|

### Tables
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|TRUNCATE|UNDROP|
|----|----|----|----|----|----|----|----|
|**TABLE**|✅|✅|✅|✅|✅|❓|❓|

### Tags
| |ALTER|CREATE|DROP|SHOW|UNDROP|
|----|----|----|----|----|----|
|**TAG**|✅|✅|✅|✅|❓|

### Tasks
| |ALTER|CREATE|DESCRIBE|DROP|EXECUTE|SHOW|
|----|----|----|----|----|----|----|
|**TASK**|✅|✅|✅|✅|✅|✅|

### Users
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|
|----|----|----|----|----|----|
|**USER**|✅|✅|❓|✅|✅|

### Views
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|
|----|----|----|----|----|----|
|**VIEW**|✅|✅|✅|✅|✅|

### Warehouses
| |ALTER|CREATE|DESCRIBE|DROP|SHOW|USE|
|----|----|----|----|----|----|----|
|**WAREHOUSE**|✅|✅|✅|✅|✅|✅|
