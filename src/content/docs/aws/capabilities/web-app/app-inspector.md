---
title: App Inspector
description: App Inspector is a LocalStack tool designed to enhance system observability by enabling users to view, collect, and inspect data exchanges, including event payloads and metadata, between AWS services.
template: doc
tags: ["Hobby"]
---

## Introduction

App Inspector allows users to view, collect, and inspect data exchanges, including payloads and metadata, between AWS services.
It enhances system observability by displaying the data exchanged at every stage, facilitating clear understanding of operation flows.
In addition, it serves as a single point of truth to understand potential errors, service configuration mismatches, and IAM permission issues.

With App Inspector, you can:

- Observe and understand the flow of operations through your system.
- Identify errors and obtain detailed information for corrections.
- Get immediate feedback on any misconfigurations in your services.
- Gain insights into IAM policies and detect missing permissions.

## Requirements

App Inspector requires **LocalStack 2026.04.0** or later.

## Use Cases

**Understanding service-to-service information flow**

When a service call doesn't reach its intended target, App Inspector shows exactly where it stopped and why — tracing the flow of information between services at every hop. You get a precise answer without deploying to AWS or adding instrumentation.

**Verifying service-to-service payloads**

Inspect the exact data passed between services at every hop of your workflow. For example, confirming that a Lambda function is passing the correct payload to SNS, or that an SQS message body matches what the downstream consumer expects — before it becomes a production issue.

**Catching IAM misconfigurations early**

App Inspector runs against the LocalStack emulator, which monitors use of IAM policies. Missing or overly restrictive permissions show up immediately — in your local environment, where they're fast and cheap to fix, rather than at deployment time in the cloud.


## LocalStack Toolkit for VS Code

App Inspector is built into the [LocalStack Toolkit for VS Code](/aws/tooling/vscode-extension), so you can trace operation flows and inspect payloads without leaving your editor. Once LocalStack is running, open the App Inspector panel directly in the LocalStack Toolkit extension to view operations and drill into service interactions.

If you haven't set up the toolkit yet, see [LocalStack Toolkit for VS Code](/aws/tooling/vscode-extension) to get started.

![App Inspector panel in the LocalStack Toolkit for VS Code showing a live event stream](/src/assets/images/aws/app-inspector/app-inspector-vscode.png)


## Web Application

You can access App Inspector directly in the [LocalStack Web Application](https://app.localstack.cloud/inst/default/appinspector/spans). Navigate to **App Inspector** in your browser to view operations captured from your running LocalStack instance, inspect payloads, and trace service connections.

:::note
Operations generated during resource creation will appear in App Inspector alongside your application operations. To keep your trace clean, click **Clear Operations** before sending requests so only the relevant activity is captured.
:::

### Features

### List Operations

You can view a detailed list of operations in your application, including the **Producer** (the service that initiated the call), **Consumer** (the target service), **Action** (the specific API call made), and **Timestamp**. Operations that encountered errors are flagged inline, so you can identify failures at a glance. Click **View Graph** on any operation to switch to the graph view and see how services connect.

The interface enables you to trace the flow of operations, identify relationships between services, and analyze patterns for debugging or optimization.

![App Inspector event list showing a fanout pipeline across EventBridge, Lambda, SQS, and SNS](/src/assets/images/aws/app-inspector/app-inspector-fanout-pipeline.png)

### Graph View and Operation Details

Click **View Graph** to visualize the relationships between AWS services in your application as an interactive graph. Each node represents a service, and each edge represents a call between them, making it easy to follow the path of a request across your architecture.

By clicking on an operation in the graph or list, you can drill down into the specifics of each interaction. App Inspector displays detailed payloads, metadata, and status for each operation, and highlights errors, warnings, and potential IAM permission issues, enabling precise debugging and troubleshooting.

![App Inspector operation details panel showing service, resource, payloads, and status for a Lambda invocation](/src/assets/images/aws/app-inspector/app-inspector-operation-details.png)

## Supported Services


:::note
Visit our [Licensing & Tiers](https://docs.localstack.cloud/aws/licensing/) doc to explore usage with App Inspector.

:::


All service operations appear in App Inspector. The following services have been optimized for improved visual layout in the graph view:

- [S3](/aws/services/s3)
- [SQS](/aws/services/sqs/)
- [SNS](/aws/services/sns/)
- [DynamoDB](/aws/services/dynamodb/)
- [Lambda](/aws/services/lambda/)
- [EventBridge](/aws/services/events/)
- [Step Functions](/aws/services/stepfunctions)
- [EventBridge Pipes](/aws/services/pipes/)
- [Kinesis Data Streams](/aws/services/kinesis/)
- [API Gateway V1](/aws/services/apigateway/)

