---
title: Overview
description: Use LocalStack Extensions to customize and extend your local development experience.
template: doc
sidebar:
    order: 1
tags: ["Base"]
---

![LocalStack Extensions](/images/aws/localstack-extensions-header.png)

LocalStack Extensions let you customize and extend LocalStack’s core functionality by running additional logic and services inside the same container. This feature is available in our paid offering, and is ideal for teams that want deeper control over how LocalStack behaves during development or testing.

You can use LocalStack Extensions to:

- Start custom services alongside LocalStack in the same container (see our [Cloudflare Workers Extension](https://localstack.cloud/blog/2023-06-26-develop-your-cloudflare-workers-aws-apps-locally-with-localstack-miniflare/))

- Intercept AWS requests with additional information before they reach your Lambda functions

- Log API calls to custom external backends or monitoring systems

The Extensions API makes it easy to integrate your own logic or extend existing services, all within LocalStack’s runtime.

Officially supported extensions are available in our [Official Extensions Library](https://app.localstack.cloud/extensions/library). To install and use extensions, you'll need an active LocalStack license.

:::note
The feature and the API are currently in preview stage and may be subject to change.
Please report any issues or feature requests on [LocalStack Extension's GitHub repository](https://github.com/localstack/localstack-extensions).
:::