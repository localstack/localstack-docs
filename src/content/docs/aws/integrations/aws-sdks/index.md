---
title: Overview
description: Use LocalStack with AWS SDKs to manage your AWS resources locally.
template: doc
sidebar:
    order: 1
---

## Introduction

LocalStack integrates with official AWS Software Development Kits (SDKs) so you can connect to LocalStack services using the same SDKs you use for AWS services.
This lets you develop and test your applications locally without connecting to the cloud.

## How to connect with AWS SDKs?

To connect to LocalStack services using AWS SDKs, you can use one of the following methods:

- **Manual configuration:** Manually configure the SDK to connect to LocalStack services by setting the endpoint URL to `http://localhost:4566` or `localhost.localstack.cloud:4566`.
This can also be specified using a [profile or an environment variable](https://docs.aws.amazon.com/sdkref/latest/guide/feature-ss-endpoints.html).
- **Transparent endpoint injection (recommended):** Connect to LocalStack services without modifying your application code.
Transparent endpoint injection uses the integrated DNS server to resolve AWS API calls to target LocalStack.
  Refer to the [Transparent Endpoint Injection](/aws/capabilities/networking/transparent-endpoint-injection/) guide for more information.
