---
title: App Inspector
description: App Inspector is a LocalStack tool designed to enhance system observability by enabling users to view, collect, and inspect data exchanges, including event payloads and metadata, between AWS services.
template: doc
tags: ["Hobby"]
---

## Introduction

App Inspector allows users to view, collect, and inspect data exchanges, including event payloads and metadata, between AWS services.
It enhances system observability by displaying the data exchanged at every stage, facilitating clear understanding of event flows.
It further centralizes debugging by enabling event replay at any system stage for detailed analysis and troubleshooting.
In addition, it serves as a single point of truth to understand potential errors, service configuration mismatches and IAM permission issues.

With App Inspector, you can:

- Observe and understand the flow of events through your system.
- Identify errors and obtain detailed information for corrections.
- Get immediate feedback on any misconfigurations in your services.
- Gain insights into IAM policies and detect missing permissions.
- Enhance event contexts for advanced flow tracing.

## Use Cases

**Debugging event routing failures**

When an event doesn't reach its intended target, App Inspector shows exactly where it stopped — a mismatched EventBridge rule pattern, an incorrect ARN, or a missing SQS event source mapping. You get a precise answer without deploying to AWS or adding instrumentation.

**Verifying service-to-service payloads**

Inspect the exact data passed between services at every hop of your workflow. This is especially useful for confirming that a Lambda is passing the right payload to SNS, or that an SQS message body matches what the downstream consumer expects — before it becomes a production issue.

**Catching IAM misconfigurations early**

Mocks return whatever you tell them to return, so they can't surface permission errors. App Inspector runs against the real LocalStack emulator, which enforces IAM policies. Missing or overly restrictive permissions show up immediately, at the point of failure in the event chain.


## LocalStack Toolkit for VS Code

App Inspector is built into the [LocalStack Toolkit for VS Code](/aws/tooling/vscode-extension), so you can trace event flows and inspect payloads without leaving your editor. Once LocalStack is running, open the App Inspector panel directly in LocalStack Toolkit extension to view events, and drill into service interactions.

If you haven't set up the toolkit yet, see [LocalStack Toolkit for VS Code](/aws/tooling/vscode-extension) to get started.

![App Inspector panel in the LocalStack Toolkit for VS Code showing a live event stream](/images/aws/app-inspector-vscode.png)


## Web Application

You can access App Inspector directly in the [LocalStack Web Application](https://app.localstack.cloud/inst/default/appinspector/spans). Navigate to **App Inspector** in your browser to view events captured from your running LocalStack instance, inspect payloads, and trace service connections.

### Features

### List the local events

With Event Studio, you can view a detailed list of events in your application, including event producers, types, and timestamps.
The interface enables you to trace the flow of events, identify relationships between services, and analyze patterns for debugging or optimization.

![App Inspector event list showing a fanout pipeline across EventBridge, Lambda, SQS, and SNS](/images/aws/app-inspector-fanout-pipeline.png)

### View Event Details

By clicking on an events details, you can visualize the relationships between AWS services in your event-driven architecture and drill down into the specifics of each interaction.
App Inspector displays an interactive graph showing how services connect, alongside detailed payloads, metadata, and status for each operation.
It also highlights errors, warnings, and potential IAM permission issues, enabling precise debugging and troubleshooting.

![App Inspector operation details panel showing service, resource, payloads, and status for a Lambda invocation](/images/aws/app-inspector-operation-details.png)

## Plans & Tiers

| Feature | Hobby | Base / Ultimate / Enterprise |
|---|---|---|
| Maximum events stored | 10 | 1,000 |
| Error analysis | — | ✓ |
| Request payload | ✓ | ✓ |
| Response payload | — | ✓ |

## Supported Services

The following services are supported on App Inspector:

- [S3](/aws/services/s3)
- [SQS](/aws/services/sqs/)
- [SNS](/aws/services/sns/)
- [DynamoDB](/aws/services/dynamodb/)
- [Lambda](/aws/services/lambda/)
- [EventBridge](/aws/services/events/)
- [Step Functions](/aws/services/stepfunctions)
- [EventBridge Pipes](/aws/services/pipes/)
- [Kinesis Data Streams](/aws/services/kinesis/)
