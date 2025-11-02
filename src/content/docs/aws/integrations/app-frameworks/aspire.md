---
title: Aspire
description: Use the Aspire framework with LocalStack
template: doc
sidebar:
    order: 5
---

## Introduction

[Aspire](https://aspire.dev/) is an opinionated, cloud-ready stack for building observable, production-ready distributed applications. It provides a consistent approach to service discovery, configuration, telemetry, and health checks across cloud-native applications.

With Aspire, developers can orchestrate cloud-native applications locally using the same AWS resources they deploy in production. By combining Aspire with LocalStack, teams can emulate their full cloud environment—including Lambda, SQS, S3, and DynamoDB—with minimal configuration and no AWS costs.

LocalStack integrates with Aspire through the [`LocalStack.Aspire.Hosting`](https://github.com/localstack-dotnet/dotnet-aspire-for-localstack) package, enabling seamless local development and testing of AWS-powered applications within the Aspire orchestration framework. This package extends the official [AWS integrations for .NET Aspire](https://github.com/aws/integrations-on-dotnet-aspire-for-aws) to provide LocalStack-specific functionality.

## Getting started

This guide demonstrates how to integrate LocalStack into Aspire projects for local AWS service emulation.

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) or later
- [Docker Desktop](https://docs.docker.com/get-docker/) or compatible container runtime
- [Node.js](https://nodejs.org/) (for AWS CDK infrastructure provisioning)
- Basic familiarity with [Aspire concepts](https://aspire.dev/get-started/welcome/)

### Installation

Add the LocalStack Aspire integration to your App Host project:

```bash
dotnet add package LocalStack.Aspire.Hosting
```

For projects that need to interact with AWS services, add the LocalStack.NET client:

```bash
dotnet add package LocalStack.Client
```

## Usage

Configure LocalStack integration in your Aspire AppHost project using auto-configuration:

```csharp
var builder = DistributedApplication.CreateBuilder(args);

// 1. Set up AWS SDK configuration (optional)
var awsConfig = builder.AddAWSSDKConfig()
    .WithProfile("default")
    .WithRegion(RegionEndpoint.USWest2);

// 2. Add LocalStack container
var localstack = builder
    .AddLocalStack(awsConfig: awsConfig, configureContainer: container =>
    {
        container.Lifetime = ContainerLifetime.Session;
        container.DebugLevel = 1;
        container.LogLevel = LocalStackLogLevel.Debug;
    });

// 3. Add your AWS resources as usual
var awsResources = builder.AddAWSCloudFormationTemplate("resources", "template.yaml")
    .WithReference(awsConfig);

var project = builder.AddProject<Projects.MyService>("api")
    .WithReference(awsResources);

// 4. Auto-configure LocalStack for all AWS resources
builder.UseLocalStack(localstack);

builder.Build().Run();
```

The `UseLocalStack()` method automatically:

- Detects all AWS resources (CloudFormation, CDK stacks)
- Configures LocalStack endpoints for all AWS services and project resources
- Sets up proper dependency ordering and CDK bootstrap if needed
- Transfers LocalStack configuration to service projects via environment variables

## AWS SDK Configuration

When using the AWS SDK for .NET with LocalStack in an Aspire context, the SDK clients need to be configured to point to the LocalStack endpoint.

### Using LocalStack.NET

The [`LocalStack.Client`](https://github.com/localstack-dotnet/localstack-dotnet-client) library simplifies AWS SDK configuration:

```csharp
services.AddLocalStack(configuration);
services.AddDefaultAWSOptions(configuration.GetAWSOptions());
services.AddAwsService<IAmazonS3>();
services.AddAwsService<IAmazonDynamoDB>();
```

This automatically configures AWS service clients to use the LocalStack endpoint when running locally. See the [.NET](/aws/integrations/aws-sdks/net/) guide for more information.

## Infrastructure Provisioning

LocalStack integrates well with Infrastructure as Code tools within the Aspire orchestration model.

### AWS CDK Integration

You can provision AWS resources using AWS CDK during application startup:

```csharp
var awsConfig = builder.AddAWSSDKConfig()
    .WithProfile("default")
    .WithRegion(RegionEndpoint.USWest2);

var localstack = builder.AddLocalStack("localstack");

var customStack = builder
    .AddAWSCDKStack("custom", scope => new CustomStack(scope, "Aspire-custom"))
    .WithReference(awsConfig);
```

You can use AWS CDK Stack classes to define and deploy resources:

```csharp
// An excerpt of a CDK Stack class
internal sealed class CustomStack : Stack
{
    public CustomStack(Construct scope, string id) : base(scope, id)
    {
        // Example resources
        var bucket = new Bucket(this, "Bucket");
        var topic = new Topic(this, "ChatTopic");

        var queue = new Queue(this, "ChatMessagesQueue", new QueueProps
        {
            VisibilityTimeout = Duration.Seconds(30),
        });

        topic.AddSubscription(new SqsSubscription(queue));

        // ... (rest of the stack)
    }
}
```

:::note
For detailed AWS CDK integration patterns with LocalStack and Aspire, refer to the [provisioning playground example](https://github.com/localstack-dotnet/dotnet-aspire-for-localstack/tree/master/playground/provisioning).
:::

## Configuration Reference

For comprehensive configuration options, including environment variables, container settings, and advanced scenarios, refer to the [Configuration Guide](https://github.com/localstack-dotnet/dotnet-aspire-for-localstack/blob/master/docs/CONFIGURATION.md).

## Sample Projects

### Playground Examples

The [playground examples](https://github.com/localstack-dotnet/dotnet-aspire-for-localstack/tree/master/playground) include Lambda development patterns and infrastructure provisioning with AWS CDK.

### LocalStack Serverless .NET Demo

A reference implementation demonstrating serverless applications with Lambda functions, S3, DynamoDB, SQS, and CDK provisioning: [localstack-serverless-dotnet-demo](https://github.com/localstack-dotnet/localstack-serverless-dotnet-demo)

### OpenTelemetry with Aspire and LocalStack

An event registration system showcasing distributed tracing and observability patterns with Lambda and SQS: [dotnet-otel-aspire-localstack-demo](https://github.com/Blind-Striker/dotnet-otel-aspire-localstack-demo)

## Resources

- [Aspire Documentation](https://aspire.dev/)
- [LocalStack.Aspire.Hosting on GitHub](https://github.com/localstack-dotnet/dotnet-aspire-for-localstack)
- [LocalStack.Client on GitHub](https://github.com/localstack-dotnet/localstack-dotnet-client)
- [AWS Aspire Integration](https://github.com/aws/integrations-on-dotnet-aspire-for-aws)
- [AWS SDK for .NET Documentation](https://docs.aws.amazon.com/sdk-for-net/)
- [LocalStack Serverless .NET Demo](https://github.com/localstack-dotnet/localstack-serverless-dotnet-demo)
- [OpenTelemetry with Aspire and LocalStack Demo](https://github.com/Blind-Striker/dotnet-otel-aspire-localstack-demo)
