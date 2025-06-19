---
title: Transparent endpoint injection
description: Transparently resolve your AWS calls to LocalStack
template: doc
sidebar:
    order: 4
---

## Introduction

LocalStack provides Transparent Endpoint Injection,
which enables seamless connectivity to LocalStack without modifying your application code targeting AWS.
The [DNS Server](/aws/tooling/dns-server) resolves AWS domains such as `*.amazonaws.com` including subdomains to the LocalStack container.
Therefore, your application seamlessly accesses the LocalStack APIs instead of the real AWS APIs.
For local testing, you might need to disable SSL validation as explained under [Self-signed certificates](#self-signed-certificates).

:::note
This feature is enabled when the LocalStack DNS server is used.
If you wish to use Transparent Endpoint Injection, do not set `DNS_ADDRESS=0` when configuring LocalStack.
:::

:::danger
Transparent endpoint injection is required when using some tooling, for example AWS CDK custom resources.
These resources invoke lambda functions, which execute code written by the CDK authors.
They cannot be configured to make requests against LocalStack, so Transparent Endpoint Injection is used to redirect requests made against AWS to target LocalStack.
:::

## Motivation

Previously, your application code targeting AWS needs to be modified to target LocalStack.
For example, the AWS SDK client for Python called boto3 needs to be configured using the environment variable `AWS_ENDPOINT_URL`, which is available within Lambda functions in LocalStack:

```python
client = boto3.client("lambda", endpoint_url=os.environ['AWS_ENDPOINT_URL'])
```

For [supported AWS SDKs](https://docs.aws.amazon.com/sdkref/latest/guide/feature-ss-endpoints.html#ss-endpoints-sdk-compat)
(including boto3 since [1.28.0](https://github.com/boto/boto3/blob/develop/CHANGELOG.rst#L892)),
this configuration happens automatically without any custom code changes.

Currently, no application code changes are required to let your application connect to local cloud APIs because
Transparent Endpoint Injection uses the integrated [DNS Server](/aws/tooling/dns-server) to resolve AWS API calls to target LocalStack.

## Configuration

This section explains the most important configuration options summarized under [Configuration](/aws/capabilities/config/configuration#dns).

### Disable transparent endpoint injection

If you do not wish to use Transparent Endpoint Injection in LocalStack Pro, opt out using:

```bash
DISABLE_TRANSPARENT_ENDPOINT_INJECTION=1
```

This option disables DNS resolution of AWS domains to the LocalStack container and prevents Lambda from disabling SSL validation.
If Transparent Endpoint Injection is _not_ used, the AWS SDK within Lambda functions might connect to the real AWS API.
Transparent Endpoint Injection is only available in LocalStack Pro.

Alternatively, specific AWS endpoints can be resolved to AWS while continuing to use Transparent Endpoint Injection.
Refer to the [DNS server configuration](/aws/tooling/dns-server#configuration) for skipping selected domain name patterns.

:::danger
Use this configuration with caution because we generally do not recommend connecting to real AWS from within LocalStack.
:::

## Self-signed certificates

In LocalStack Pro and Lambda, Transparent Endpoint Injection automatically disables SSL certificate validation of the AWS SDK for the
most common Lambda runtimes including Python, Node.js, and Java (SDK v1).
For other services and unsupported Lambda runtimes, you may have to configure your AWS clients to accept self-signed certificates because
we are repointing AWS domain names (e.g., `*.amazonaws.com`) to `localhost.localstack.cloud`.
For example, the following command fails with an SSL error:

```bash
$ aws kinesis list-streams
SSL validation failed for https://kinesis.us-east-1.amazonaws.com/ [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: self signed certificate (_ssl.c:1076)
```

whereas the following command works:

```bash
$ PYTHONWARNINGS=ignore aws --no-verify-ssl kinesis list-streams
{
"StreamNames": []
}
```

Disabling SSL validation depends on the programming language and version of the AWS SDK used.
For example, the [`boto3` AWS SDK for Python](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/core/session.html#boto3.session.Session.client) provides a parameter `verify=False` to disable SSL verification.
Similar parameters are available for most other [AWS SDKs](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html).

For Node.js, you can set this environment variable in your application, to allow the AWS SDK to talk to the local APIs via SSL:

```javascript
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
```

If you are using the Java AWS SDK v2 in Lambda, LocalStack will per default use bytecode instrumentation to disable certificate validation, so the endpoint injection can work.
You can opt out of this behavior by setting `LAMBDA_DISABLE_JAVA_SDK_V2_CERTIFICATE_VALIDATION=0`.
Opting out will lead to certificate errors when using the AWS SDK without manually overriding the endpoint url to point to LocalStack.

:::danger
Disabling SSL validation may have undesired side effects and security implications.
Make sure to use this only for local testing, and never in production.
:::

## Current Limitations

- The mechanism to disable certificate validation for these requests is not currently functional with Go Lambdas.
  To work around this issue, you'll need to manually set your endpoint when creating your AWS SDK client, as detailed in our documentation on the [Go AWS SDK](/aws/integrations/aws-sdks/go).

## Troubleshooting

Suppose you're attempting to access LocalStack, but you're relying on transparent endpoint injection to redirect AWS (`*.amazonaws.com`) requests.
In such cases, there are different approaches you can take depending on your setup.

### From your host

![AWS SDK connecting to a Docker host](/images/aws/2.svg)

If you're using LocalStack with an [Auth Token](/aws/getting-started/auth-token), then you can utilize the [DNS server](/aws/tooling/dns-server) to perform requests to LocalStack as if it were AWS.
You need to make two changes:

* Publish port 53 from the LocalStack docker container to your host.
* Configure your host to use the LocalStack DNS server by default.

For more details, see your [DNS server documentation](/aws/tooling/dns-server).

For the community image of LocalStack, you can employ your own DNS server to achieve a similar outcome, but it won't be managed by LocalStack.
Note that in both cases, SSL verification must be disabled.

### From a lambda function

![A Lambda function communicating with LocalStack within a Docker container](/images/aws/5.svg)
