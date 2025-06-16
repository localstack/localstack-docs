---
title: Flyway
description: Use Flyway to interact with the Snowflake emulator
---



## Introduction

[Flyway](https://flywaydb.org/) is an open-source database migration tool that simplifies the process of managing and applying database migrations. Flyway supports various databases, including Snowflake, allowing you to manage database schema changes, version control, and data migration in a structured and automated way.

The Snowflake emulator can connect with Flyway, to apply database migrations, and manage database schema changes locally.

## Configuring Flyway

In this guide, you will learn how to configure Flyway to interact with the Snowflake emulator.

### Install Flyway

You can install Flyway on the [official Flyway website](https://flywaydb.org/download/). Download the Flyway Desktop & command-line tool and install it on your local machine.

### Create a new Flyway project

To create a new Flyway project, follow these steps:

* Open the Desktop application.
* Click **New Project**.
* Enter the project name and select the database type as **Snowflake**.
* Click **Create project**.

### Connect Flyway to Snowflake

To connect Flyway to the Snowflake emulator, follow these steps:

* Click **Add target database +**.
* Enter username as `test` and password as `test`.
* Enter JDBC URL as `jdbc:snowflake://http://snowflake.localhost.localstack.cloud:4566/?db=test&schema=PUBLIC&JDBC_QUERY_RESULT_FORMAT=JSON`.
* Click on **Test connection**.

If the connection test succeeds, you can start applying database migrations using Flyway.