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

LocalStack Docker images can be used in your CI environment by adding a [CI Auth Token](https://app.localstack.cloud/workspace/auth-tokens).
The images are available on [Docker Hub](https://hub.docker.com/r/localstack/localstack/tags), and comprehensive documentation is available on our [Docker images](https://docs.localstack.cloud/references/docker-images/) documentation.
Community users can use the `localstack/localstack` image, while licensed users can use the `localstack/localstack-pro` image.
For Big Data jobs that require services such as EMR, Athena, and Glue, we provide a mono-container that uses the `localstack/localstack-pro:2.0.2-bigdata` image, which bakes in the required dependencies, such as Hadoop, Hive, Presto, into the LocalStack image.

## CI integrations

The steps required for the integration differ slightly depending on your preferred CI provider.
Please refer to the relevant documentation below to configure LocalStack for your CI pipelines.