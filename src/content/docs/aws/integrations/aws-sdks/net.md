---
title: AWS .NET
description: How to use the .NET AWS SDK with LocalStack.
template: doc
sidebar:
    order: 1
---

## Overview

The [AWS SDK for .NET](https://aws.amazon.com/sdk-for-net/), like other AWS SDKs, lets you set the endpoint when creating resource clients,
which is the preferred way of integrating the .NET SDK with LocalStack.

## Example

Here is an example of how to create an `LambdaClient` with the endpoint set to LocalStack.

```csharp
var lambdaClient = new AmazonLambdaClient(new AmazonLambdaConfig(
    {
        ServiceURL = "http://localhost:4566"
    }
);
```

If you want to specify a region and credentials when creating the client, please set them as `AuthenticationRegion` and `BasicAWSCredentials`, like in this example:

```csharp
var lambdaClient = new AmazonLambdaClient(new BasicAWSCredentials("test", "test"), new AmazonLambdaConfig(
    {
        ServiceURL = "http://localhost:4566",
        AuthenticationRegion = "eu-west-1"
    }
);
```

:::note

Make sure you are setting the `AuthenticationRegion` and not the `RegionEndpoint`.
Setting the `RegionEndpoint` to a constant like `RegionEndpoint.EUWest1` will override the ServiceURL, and your request will end up against AWS.
:::

### S3 specific endpoint

Here is another example, this time with an `S3Client` and its specific endpoint.

```csharp
var config = new AmazonS3Config({ ServiceURL = "http://s3.localhost.localstack.cloud:4566" });
var s3client = new AmazonS3Client(config);
```

:::note

In case of issues resolving this DNS record, we can fallback to [http://localhost:4566](http://localhost:4566) in combination with the provider setting `ForcePathStyle = true`.
The S3 service endpoint is slightly different from the other service endpoints, because AWS is deprecating path-style based access for hosting buckets.
:::

```csharp
var config = new AmazonS3Config(
    {
        ServiceURL = "http://localhost:4566",
        ForcePathStyle = true
    }
);
var s3client = new AmazonS3Client(config);
```

## Alternative: Using LocalStack.NET

As an alternative to manual endpoint configuration, you can use LocalStack.NET, an easy-to-use .NET client for LocalStack.

### Overview

`LocalStack.NET` provides a thin wrapper around the official [aws-sdk-net](https://github.com/aws/aws-sdk-net) (AWS SDK for .NET). It automatically configures the target endpoints to use LocalStack for your local cloud application development.

When LocalStack is disabled in configuration, LocalStack.NET automatically uses the official AWS SDK clients, allowing your application to target your real AWS account with no code changes.

**LocalStack.NET Documentation:** Comprehensive guide and examples [here](https://github.com/localstack-dotnet/localstack-dotnet-client).

### How it Works

Instead of manually setting the endpoint configurations when initializing a client, `LocalStack.NET` offers methods that handle these details.
The library aims to reduce the boilerplate required to set up LocalStack clients in .NET.

### Example Usage

#### Dependency Injection Approach

```csharp showshowLineNumbers
public void ConfigureServices(IServiceCollection services)
{
    // Add framework services.
    services.AddMvc();

    services.AddLocalStack(Configuration)
    services.AddDefaultAWSOptions(Configuration.GetAWSOptions());
    services.AddAwsService<IAmazonS3>();
}

...

var amazonS3Client = serviceProvider.GetRequiredService<IAmazonS3>();
```

#### Standalone Approach

```csharp showshowLineNumbers
var sessionOptions = new SessionOptions();
var configOptions = new ConfigOptions();

ISession session = SessionStandalone.Init()
    .WithSessionOptions(sessionOptions)
    .WithConfigurationOptions(configOptions).Create();

var amazonS3Client = session.CreateClientByImplementation<AmazonS3Client>();
```

### Benefits

- **Consistent Client Configuration:** `LocalStack.NET` provides a standardized approach to initialize clients, eliminating the need for manual endpoint configurations.
- **Tailored for .NET Developers:** The library offers functionalities specifically developed to streamline integration of LocalStack with .NET applications.
- **Adaptable Environment Transition:** Switching between LocalStack and actual AWS services can be achieved with minimal configuration changes when leveraging `LocalStack.NET`.
- **Versatile .NET Compatibility:** Supports a broad spectrum of .NET versions, from .NET Framework 4.6.1 and .NET Standard 2.0, up to recent .NET iterations such as .NET 10.

### Considerations

- Both the standard AWS SDK method and `LocalStack.NET` provide ways to integrate with LocalStack using .NET.
  The choice depends on developer preferences and specific project needs.
- `LocalStack.NET` works alongside the AWS SDK, using it as a base and providing a more focused API for LocalStack interactions.

## Aspire Integration

If you are building cloud-native applications with [Aspire](https://aspire.dev/), LocalStack provides first-class integration through the Aspire orchestration framework.
The [`LocalStack.Aspire.Hosting`](https://github.com/localstack-dotnet/dotnet-aspire-for-localstack) package enables seamless local development with automatic container lifecycle management, service discovery, and observability integration.

For detailed guidance on using LocalStack with Aspire, including configuration options and example projects, see the [Aspire integration guide](/aws/integrations/app-frameworks/aspire).

## Resources

- [AWS SDK for .NET](https://aws.amazon.com/sdk-for-net/)
- [Official repository of the AWS SDK for .NET](https://github.com/aws/aws-sdk-net)
- [LocalStack.NET Documentation](https://github.com/localstack-dotnet/localstack-dotnet-client)
- [LocalStack.Aspire.Hosting Documentation](https://github.com/localstack-dotnet/dotnet-aspire-for-localstack)
