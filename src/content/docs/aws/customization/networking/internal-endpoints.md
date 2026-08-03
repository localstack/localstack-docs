---
title: Internal Endpoints
description: Overview of LocalStack and AWS specific internal endpoints for local development and testing
template: doc
sidebar:
  order: 2
---

LocalStack provides several internal endpoints for various local AWS services and LocalStack-specific features.
These endpoints are not part of the official AWS API and are available in the `/_localstack` and `/_aws` paths.
You can use [curl](https://curl.se/) or your favourite HTTP REST client to access endpoints.

You can start your LocalStack instance and go to [http://localhost.localstack.cloud:4566/\_localstack/swagger](http://localhost.localstack.cloud:4566/_localstack/swagger)
to browse the Swagger UI, visualize and interact with all the API's resources implemented in LocalStack.

### LocalStack endpoints

The API path for the LocalStack internal resources is `/_localstack`.
Several endpoints are available under this path.
For instance, `/_localstack/health` checks the available and running AWS services in LocalStack while
`/_localstack/diagnose` (enable with the `DEBUG=1` configuration variable), reports extensive and sensitive data from
the LocalStack instance.

:::tip
You can use the `/_localstack/health` endpoint to restart or kill the services.
You can use [curl](https://curl.se/) or your HTTP REST client to access the endpoint:

```bash
curl -v --request POST --header "Content-Type: application/json"  --data '{"action":"restart"}' http://localhost.localstack.cloud:4566/_localstack/health
curl -v --request POST --header "Content-Type: application/json"  --data '{"action":"kill"}' http://localhost.localstack.cloud:4566/_localstack/health
```

:::

### AWS endpoints

The API path for the AWS internal resources is `/_aws`.
These endpoints offer LocalStack-specific features in addition to the ones offered by the AWS services.
For instance, `/aws/services/sqs/messages` conveniently access all messages within a SQS queue, without deleting them.

### `x-localstack` response header

LocalStack adds an `x-localstack` HTTP header to every response served by its AWS gateway.
The header value is the LocalStack version string (for example, `2026.3.1.dev65`), so client tools can detect both that they are talking to LocalStack and which version is running in a single round-trip.

```bash
curl -s -i http://localhost.localstack.cloud:4566/_localstack/health | grep -i x-localstack
# x-localstack: 2026.3.1.dev65
```

:::note
Before LocalStack `v2026.04`, the header value was the static string `true`.
Starting with `v2026.04`, it returns the LocalStack version instead.
Clients that only check for the *presence* of the header remain compatible.
:::

The header is enabled by default and can be disabled by setting [`LOCALSTACK_RESPONSE_HEADER_ENABLED`](/aws/customization/configuration-options#core) to `0`.
