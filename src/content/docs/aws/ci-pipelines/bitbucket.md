---
title: BitBucket
description: Use LocalStack in BitBucket Pipelines.
template: doc
sidebar:
    order: 4
---

## Introduction

[BitBucket Pipeline](https://bitbucket.org/product/features/pipelines) is a CI/CD tool that allows you to build, test, and deploy your code directly from BitBucket.
This guide will show you how to use LocalStack in BitBucket Pipelines.

BitBucket runs your build and the Docker daemon in separate containers, and does not support mounting volumes.
This guide therefore starts the LocalStack container directly with `docker run`, so the pipeline controls the port mappings and the Docker connection itself, and then uses the [`lstk`](/aws/developer-tools/running-localstack/lstk/) tool proxies to interact with it.
On CI systems without those constraints, `lstk` can manage the container lifecycle as well; see [CI Best Practices](/aws/ci-pipelines/best-practices/).

## Setting up the BitBucket Pipeline

When you want to integrate LocalStack into your job configuration, you just have to execute the following steps:

- Specify the Docker Socket to allow the LocalStack container to access the Docker daemon.
- Pass your CI Auth Token to the container, which is required to start the emulator.
- Export the `LSTK_ENDPOINT_URL` environment variable to point `lstk` at the LocalStack endpoint.
- Install the AWS CLI and `lstk` to interact with LocalStack's emulated services.
- Start the LocalStack container in detached mode by specifying the Docker Socket and Docker Host.
- Wait for the emulator to become ready before using it.

The following example BitBucket Pipeline configuration (`bitbucket-pipelines.yaml`) executes these steps, creates a new S3 bucket, and queries the list of S3 buckets:

```yaml showshowLineNumbers
image: node:22

definitions:
  services:
    docker:
      memory: 2048

pipelines:
  default:
    - step:
        name: Test Localstack
        services:
          - docker
        script:
          - export DOCKER_SOCK=$DOCKER_HOST
          - export LSTK_ENDPOINT_URL="http://localhost.localstack.cloud:4566"
          - echo "${BITBUCKET_DOCKER_HOST_INTERNAL} localhost.localstack.cloud " >> /etc/hosts
          - apt-get update && apt-get install -y awscli
          - npm install -g @localstack/lstk
          - docker run -d --rm -p 4566:4566 -p 4510-4559:4510-4559 -e LOCALSTACK_AUTH_TOKEN=${LOCALSTACK_AUTH_TOKEN:?} -e DEBUG=1 -e DOCKER_SOCK=tcp://${BITBUCKET_DOCKER_HOST_INTERNAL}:2375 -e DOCKER_HOST=tcp://${BITBUCKET_DOCKER_HOST_INTERNAL}:2375 --name localstack-aws localstack/localstack-pro
          - |
            for _ in $(seq 1 60); do
              curl -sf "${LSTK_ENDPOINT_URL}/_localstack/health" > /dev/null && break
              sleep 2
            done
          - lstk aws s3 mb s3://test-bucket
          - lstk aws s3 ls
```

## Configuring a CI Auth Token

For the configuration above to work, add your CI Auth Token to the project's environment variables.
The LocalStack container will automatically pick it up and activate your LocalStack license.

Go to the [CI Auth Token page](https://app.localstack.cloud/workspace/auth-tokens) and copy your CI Auth Token.
To add a CI Auth Token to your BitBucket Pipeline:

- Select a workspace from the BitBucket dashboard.
- Select the **Settings** on the top navigation bar.
- Select **Workspace settings** from the **Settings dropdown** menu.
- On the left-hand menu, navigate to **Pipelines** and click on **Workspace variables**.
- Add a new variable with the name `LOCALSTACK_AUTH_TOKEN` and the value of your CI Auth Token, and mark it as **Secured**.

## Current Limitations

### Mounting Volumes

BitBucket Pipelines does not support mounting volumes, so you cannot mount a volume to the LocalStack container.
This limitation prevents you from mounting the Docker Socket to the LocalStack container, which is required to create compute resources, such as Lambda functions or ECS tasks.