---
title: AWS SAM
description: Use the AWS SAM (Serverless Application Model) with LocalStack.
template: doc
sidebar:
    order: 3
---

## Introduction

The AWS Serverless Application Model (SAM) is an open-source framework for developing serverless applications.
It uses a simplified syntax to define functions, APIs, databases, and event source mappings.
When you deploy, SAM converts its syntax into AWS CloudFormation syntax, helping you create serverless applications more quickly.

LocalStack can work with SAM using [`lstk sam`](/aws/developer-tools/running-localstack/lstk/#sam), which lets you deploy SAM applications on LocalStack.
This guide explains how to set up local AWS resources using `lstk sam`.

## `lstk sam`

`lstk sam` proxies the `sam` command line interface, facilitating the use of the SAM framework with LocalStack.
When executing deployment commands like `lstk sam [ build | deploy | validate | package ]`, it configures the SAM settings for LocalStack and runs the specified SAM command.

:::note
`lstk sam` supersedes the older [`samlocal` wrapper script](/aws/connecting/infrastructure-as-code/deprecated-wrapper-scripts#samlocal), which is deprecated but still available if you need it.
:::

### Install lstk

To use `lstk sam`, install `lstk` by following the [`lstk` installation instructions](/aws/developer-tools/running-localstack/lstk/#installation).
You'll also need the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) (version `1.95.0` or newer) installed and on your `PATH`.

### Create a new SAM project

You can initialize a new SAM project using the following command:

```bash
lstk sam init
```

Select `1` to create a new SAM application using an AWS Quick Start template.
The SAM CLI will ask you for the project name and the runtime for the Lambda function.

For this example, select `1` for the Hello World example.
Choose the Python runtime and `zip` for the packaging type.
Optionally, you can enable X-Ray tracing, monitoring, and structured JSON logging.
Then, enter the project name and press `Enter`.

### Deploy the SAM application

After initializing the SAM project, enter the project directory and deploy the application using the following command:

```bash
lstk sam deploy --guided
```

Enter the default values for the deployment, such as the stack name, region, and confirm the changes.
`lstk sam` will package and deploy the application to LocalStack.

### Configuration

The `lstk sam` command supports several options and environment variables beyond what is available with the standard `sam` command. 
| Option              | Default         | Description |
|----------------------|-----------------|--------------|
| `--region <region>`  | `us-east-1`     | Deployment region |
| `--account <id>`     | `000000000000`  | Target AWS account id (12 digits) |

`lstk sam`-specific flags must appear **before** the SAM action (for example, `lstk sam --region us-west-2 build`)

| Environment Variable   | Default value | Description |
|-------------------------|----------------|--------------|
| `AWS_ENDPOINT_URL`      | -              | Override the auto-resolved LocalStack endpoint |
| `AWS_ENDPOINT_URL_S3`   | -              | Override the auto-resolved LocalStack S3 endpoint |
| `LSTK_SAM_CMD`          | `sam`          | Binary to invoke |
| `AWS_REGION`            | -              | Fallback for `--region` |
| `AWS_ACCESS_KEY_ID`     | -              | Fallback for `--account` |

## Debugging on VS Code

To debug your Lambda functions in VS Code while using the SAM CLI's `sam local` command alongside other services provided by LocalStack, set up a launch configuration in the `.vscode/launch.json` file.
Insert the following settings into the file:

```json showshowLineNumbers
{
            "type": "aws-sam",
            "request": "direct-invoke",
            "name": "Job dispatcher lambda",
            "invokeTarget": {
                "target": "code",
                "projectRoot": "${workspaceFolder}",
                "lambdaHandler": "lambda/lambda.handler"
            },
            "lambda": {
                "runtime": "python3.8",
                "payload": {},
                "environmentVariables": {
                    "ENDPOINT_URL": "http://localstack:4566/",
                    "S3_ENDPOINT_URL": "http://s3.localhost.localstack.cloud:4566/",
                    "AWS_ACCESS_KEY_ID": "test",
                    "AWS_SECRET_ACCESS_KEY": "test",
                    "AWS_SESSION_TOKEN": "test",
                    "AWS_REGION": "us-east-1",
                    "MAIN_DOCKER_NETWORK": "localstack-network"
                }
            },
            "sam": {
                "dockerNetwork": "localstack-network"
            }
        }
```

The `dockerNetwork` property is essential as it allows the LocalStack container to use the `sam invoke` commands within the same network as the LocalStack container itself.
Adjust the Lambda function handler and environment variables as needed.