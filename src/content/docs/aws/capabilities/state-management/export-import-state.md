---
title: Export & Import State
description: Export and import the state of the current infrastructure state into a file or a LocalStack instance respectively.
template: doc
tags: ["Base"]
sidebar:
    order: 4
---

## Introduction

The Export/Import State feature enables you to export the state of your LocalStack instance into a file and import it into another LocalStack instance.
This feature is useful when you want to save your LocalStack instance's state for later use.

## LocalStack CLI

The LocalStack CLI enables you to export your infrastructure state to a file and import it into another LocalStack instance.
You can access the state management commands by running `localstack state` in your terminal.

```bash
localstack state --help
```

```bash
Usage: localstack state [OPTIONS] COMMAND [ARGS]...

  (Preview) Manage and manipulate the localstack state.

  The state command group allows you to interact with LocalStack's state
  backend.

  Read more: https://docs.localstack.cloud/references/persistence-
  mechanism/#snapshot-based-persistence

Options:
  -h, --help  Show this message and exit.

Commands:
  export  Export the state of LocalStack services
  import  Import the state of LocalStack services
  reset   Reset the state of LocalStack services
```

### Export the State

To export the state, you can run the following command:

```bash
$ localstack state export <file-name>
```

You can specify a file path to export the state to.
If you do not specify a file path, the state will be exported to the current working directory into a file named `ls-state-export`.
You can specify the following flags to customize the export:

- `--services`: Specify the services to export.
  You can specify multiple services by separating them with a comma.
  If you do not specify any services, all services will be exported.
- `--format`: Specify the format of the exported state.
  For example, you can specify `json` to specify the save command output as JSON.

### Import the State

To import the state, you can run the following command:

```bash
$ localstack state import <file-name>
```

The `<file-name>` argument is required and specifies the file path to import the state from.
The file should be generated from a previous export.

## Web Application

The LocalStack Web Application enables you to export your infrastructure state to a file and import it into another LocalStack instance.
The Local mode allows you to perform local exports and imports of your LocalStack instance's state.

![LocalStack Export/Import State Local Mode](/images/aws/export-import-state-local.png)

### Export the State

To export the state, follow these steps:

1. Navigate to the **Local** tab within the [Export/Import State](https://app.localstack.cloud/inst/default/state) page.
2. Create AWS resources locally as needed.
3. Click on the **Export State** button.
  This action will initiate the download of a ZIP file.

The downloaded ZIP file contains your container state, which can be injected into another LocalStack instance for further use.

### Import the State

To import the state, follow these steps:

1. Navigate to the **Local** tab within the [Export/Import State](https://app.localstack.cloud/inst/default/state) page.
2. Upload the ZIP file that contains your container state.
  This action will restore your previously loaded AWS resources.

To confirm the successful injection of the container state, visit the respective [Resource Browser](https://app.localstack.cloud/inst/default/resources) for the services and verify the resources.