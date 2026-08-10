---
title: CI Pipelines
description: Run integration tests against the LocalStack Azure emulator in your CI pipeline.
template: doc
sidebar:
    order: 1
---

## Introduction

Running the Azure emulator in CI lets every pull request exercise the same Azure resources your
application uses in production — resource groups, storage accounts, Key Vault, Service Bus,
databases — without provisioning anything in a real subscription, and without the cost, quota and
cleanup problems that come with shared cloud test environments.

A pipeline that uses the emulator generally does five things:

1. Authenticate to Docker Hub, so pulling the emulator image is not subject to anonymous rate limits.
2. Pull and start `localstack/localstack-azure`, with a LocalStack Auth Token supplied as a secret.
3. Wait for the emulator to report healthy.
4. Point the Azure tooling at it — `lstk az start-interception` for the CLI, `metadata_host` for
   Terraform, the same endpoint for the SDKs.
5. Run your deployment and tests, then collect emulator logs as an artifact regardless of outcome.

## Requirements

- A [LocalStack Auth Token](/azure/getting-started/auth-token/), stored as a CI secret. The emulator
  will not start without one.
- Docker available to the runner.
- Docker Hub credentials. The Azure emulator image is large, and anonymous pulls hit
  `429 Too Many Requests` quickly on shared CI infrastructure.
- Enough disk. On hosted runners it is usually worth pruning Docker before pulling.

## Supported platforms

The [localstack-azure-samples](https://github.com/localstack/localstack-azure-samples) repository
runs a complete, working pipeline on **GitHub Actions**, covering 31 deployments across the Azure
CLI, Bicep and Terraform. That workflow is documented in detail in
[GitHub Actions](/azure/ci-pipelines/github-actions/).

Other CI platforms — GitLab CI, CircleCI, Bitbucket Pipelines, Travis CI — have no Azure-specific
pipeline in the sample repositories yet. The emulator is a Docker image and the setup is not
platform-specific, so the same five steps apply, but these platforms are not documented here until
there is a working configuration to document. The five steps above are the whole of it; only the syntax differs per platform.
