---
title: Welcome to LocalStack for Snowflake Docs
description: Get started with LocalStack Docs.
template: doc
nav: 1
label: Welcome
---

# Welcome to LocalStack Docs!

## What would you like to do today?


[LocalStack](https://localstack.cloud/) is a cloud service emulator that runs in a single container on your laptop or in your CI environment.
LocalStack for Snowflake emulates the functionality of a real Snowflake instance, allowing you to perform operations without an internet connection or a Snowflake account.
This is valuable for locally developing and testing Snowflake data pipelines without incurring costs.

The Snowflake emulator supports the following features:

* [**Basic operations** on warehouses, databases, schemas, and tables](https://docs.snowflake.com/en/developer-guide/python-connector/python-connector-example)
* [**Storing files** in user/data/named **stages**](https://docs.snowflake.com/en/user-guide/data-load-local-file-system-create-stage)
* [**Snowpark** libraries](https://docs.snowflake.com/en/developer-guide/snowpark/python/index)
* [**Snowpipe** streaming with **Kafka connector**](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-streaming-kafka)
* [**JavaScript and Python UDFs**](https://docs.snowflake.com/en/developer-guide/udf/javascript/udf-javascript-introduction)
* ... and more!

Integrating the Snowflake emulator into your existing CI/CD pipeline allows you to run integration tests and identify issues early, reducing surprises during production deployment.
Check our [SQL Functions Coverage]({{< ref "coverage-functions" >}}) and [Feature Coverage]({{< ref "coverage-features" >}}) pages for a comprehensive list of supported features.
