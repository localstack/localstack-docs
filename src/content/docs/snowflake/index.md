---
title: Welcome to LocalStack for Snowflake Docs
description: LocalStack for Snowflake allows you to develop and test your Snowflake data pipelines entirely on your local machine!
template: doc
nav: 1
---

[LocalStack](https://localstack.cloud/) is a cloud service emulator that runs in a single container on your laptop or in your CI environment.
LocalStack for Snowflake emulates the functionality of a real Snowflake instance, allowing you to perform operations without an internet connection or a Snowflake account.
This is valuable for locally developing and testing Snowflake data pipelines without incurring costs.

The Snowflake emulator supports the following features:

-   [**DDL/DML/DQL operations**](https://docs.snowflake.com/en/sql-reference/sql-dml) on warehouses, databases, schemas, and tables
-   [**Basic operations**](https://docs.snowflake.com/en/developer-guide/python-connector/python-connector-example) for warehouse, database, schema, and table management
-   [**Transaction management**](https://docs.snowflake.com/en/sql-reference/transactions) with full ACID compliance support
-   [**Cross-database resource sharing**](https://docs.snowflake.com/en/user-guide/data-sharing-intro) for collaborative data access
-   [**Storing files in Snowflake stages**](https://docs.snowflake.com/en/user-guide/data-load-local-file-system-create-stage) (user, data, and named stages)
-   [**Storage integrations**](https://docs.snowflake.com/en/user-guide/data-load-s3-config-storage-integration) for external cloud storage connectivity
-   [**Zero-copy cloning**](https://docs.snowflake.com/en/user-guide/object-clone) for efficient data duplication
- [**Materialized views**](https://docs.snowflake.com/en/user-guide/views-materialized) for pre-computed query results
-   [**Iceberg tables**](https://docs.snowflake.com/en/user-guide/tables-iceberg) for open table format support
-   [**Hybrid tables**](https://docs.snowflake.com/en/user-guide/tables-hybrid) combining row and column storage
-   [**Dynamic tables**](https://docs.snowflake.com/en/user-guide/dynamic-tables-about) for automatically refreshed derived data
- [**Snowpark libraries**](https://docs.snowflake.com/en/developer-guide/snowpark/python/index) for DataFrame-based data processing
-   [**User-defined functions (UDFs)**](https://docs.snowflake.com/en/developer-guide/udf/javascript/udf-javascript-introduction) in JavaScript, Python, and Java
- [**Snowpipe**](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-intro) for continuous data ingestion
-   [**Table streams**](https://docs.snowflake.com/en/user-guide/streams-intro) for change data capture (CDC) and audit logs
-   [**Tasks**](https://docs.snowflake.com/en/user-guide/tasks-intro) for scheduled execution and workflow automation
-   [**Row Access Policies**](https://docs.snowflake.com/en/user-guide/security-row-intro) for fine-grained data access control
- [**Running Streamlit apps locally**](https://docs.snowflake.com/en/developer-guide/streamlit/about-streamlit) for interactive data apps with [**Native Apps**](https://docs.snowflake.com/en/developer-guide/native-apps/native-apps-about) support
-   [**Infrastructure-as-code with Terraform & Pulumi**](https://docs.snowflake.com/en/user-guide/ecosystem-terraform) for automated resource provisioning
-   [**Polaris Catalog**](https://docs.snowflake.com/en/user-guide/polaris-getting-started) integration for open catalog management

Integrating the Snowflake emulator into your existing CI/CD pipeline allows you to run integration tests and identify issues early, reducing surprises during production deployment.

Check our [SQL Functions Coverage](/snowflake/sql-functions) and [Feature Coverage](/snowflake/features) pages for a comprehensive list of supported features.
