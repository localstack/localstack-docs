---
title: Overview
description: Use LocalStack Extensions to customize and extend your local development experience.
template: doc
sidebar:
    order: 1
tags: ["Base"]
---


![LocalStack Extensions](/images/aws/localstack-extensions-header.png)

LocalStack Extensions allow developers to extend and customize LocalStack.
Extensions are a feature of our paid offering.
LocalStack Extensions enable you to start custom services with LocalStack in the same container, while leveraging the existing features in the ecosystem.

Developers can add new services, extend existing services, and even add custom functionality.
The Extensions API allows developers to easily plug in their own custom logic and services into the LocalStack container.

You can use LocalStack Extensions to:

- Starting custom services together with LocalStack in the same container (see our [Cloudflare Workers Extension](https://localstack.cloud/blog/2023-06-26-develop-your-cloudflare-workers-aws-apps-locally-with-localstack-miniflare/)).
- Instrumenting AWS requests with additional information before they reach your Lambdas.
- Logging AWS API calls to custom data backends.

The officially supported LocalStack Extensions can be discovered on our [Official Extensions Library](https://app.localstack.cloud/extensions/library).
To install and use extensions, you need an active LocalStack license.

:::note
The feature and the API are currently in a preview stage and may be subject to change.
Please report any issues or feature requests on [LocalStack Extension's GitHub repository](https://github.com/localstack/localstack-extensions).
:::