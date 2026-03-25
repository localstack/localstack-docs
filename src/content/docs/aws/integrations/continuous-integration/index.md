---
title: Overview
description: Use LocalStack in your CI environment to run tests against your AWS infrastructure in a high-fidelity cloud emulator.
template: doc
sidebar:
    order: 1
---

LocalStack makes it easy to integrate cloud-native testing into your CI pipelines, without the complexity of managing real AWS environments. Running fully local AWS emulation inside your CI jobs lets you automate application testing, catch issues earlier, and ship with confidence.

LocalStack supports:

- Native integration with platforms like CircleCI
- A generic CI driver for other CI/CD systems
- Advanced features like Cloud Pods and CI analytics to track performance and test coverage

With LocalStack in your CI pipeline, you can eliminate slow and costly staging environments while ensuring realistic, high-fidelity cloud testing before deploying to production.

## Hypothetical CI workflow

Let's assume that your team has an automated CI workflow into which you want to integrate end-to-end cloud testing with LocalStack.
As an example, consider the following pipeline, which represents part of a simple CI workflow:

![An example CI/CD workflow using LocalStack](/images/aws/localstack-in-ci.svg)

The CI build is triggered by pushing code to a version control repository, like GitHub.
The CI runner starts LocalStack and executes the test suite.
You can also use the same Infrastructure-as-Code (IaC) configuration that you use to set up AWS in your production environment to set up LocalStack in the CI environment.
You can also pre-seed state into the local AWS services (e.g., DynamoDB entries or S3 files) provided by LocalStack in your CI environment via [Cloud Pods](/aws/capabilities/state-management/cloud-pods).

After a successful test run, you can execute the more expensive AWS CodeBuild pipeline for deploying your application.
You can enrich the test reports created by your testing framework with traces and analytics generated inside LocalStack.

## CI images

LocalStack CI images require a [CI Auth Token](https://app.localstack.cloud/workspace/auth-tokens) for deployment within your CI environment. 

We exclusively support the [`localstack/localstack` image in Docker Hub](https://hub.docker.com/r/localstack/localstack) for all CI implementations. Detailed configuration and image specifications are available on our [Docker images](https://docs.localstack.cloud/references/docker-images/) documentation.

:::note 
**Auth Token Requirement**: Using LocalStack in a CI environment requires a valid Auth Token. Ensure your environment variables are configured to include your token to avoid authentication failures during image pull or container initialization.
:::

 can be used in your CI environment by adding a .
The LocalStack Docker image is available on [Docker Hub](https://hub.docker.com/r/localstack/localstack/tags), and comprehensive documentation is available on our .


## CI integrations

The steps required for the integration differ slightly depending on your preferred CI provider.
Please refer to the relevant documentation below to configure LocalStack for your CI pipelines.
