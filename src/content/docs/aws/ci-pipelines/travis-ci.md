---
title: Travis CI
description: Use LocalStack in Travis CI.
template: doc
sidebar:
    order: 8
---

This guide shows how to start and use LocalStack in your Travis CI jobs, managed with the [`lstk` CLI](/aws/developer-tools/running-localstack/lstk/).

## Configuring a CI Auth Token

`lstk` validates your LocalStack license before it starts the emulator, so a [CI Auth Token](https://app.localstack.cloud/workspace/auth-tokens) is required rather than a personal Developer Auth Token.

To configure this in Travis CI, go to the project settings (`More options` → `Settings`), scroll down to the `Environment Variables` section, and add your CI Auth Token as `LOCALSTACK_AUTH_TOKEN`.
Travis CI exposes the variable to the build, and `lstk` picks it up from the environment and passes it to the emulator container.
Keep `Display value in build log` switched off so the token is not printed.

## Setting up the Travis CI job

When you want to integrate LocalStack into your job configuration, you just have to execute the following steps:
- Install `lstk`, along with the AWS CLI that `lstk aws` proxies.
- Generate the `localstack` AWS profile with `lstk setup aws`.
- Use `lstk` to start LocalStack.

There is no need to pull the image or wait for the container: `lstk start` pulls the image if needed and returns only once the emulator is ready.

The following example Travis CI job config (`.travis.yaml`) executes these steps, creates a new S3 bucket, and prints a nice message in the end:

```yaml showshowLineNumbers
language: node_js

node_js:
  - "22"

services:
    - docker

before_install:
  # Install lstk
  - npm install -g @localstack/lstk
  # Install the AWS CLI, which `lstk aws` runs under the hood
  - curl -sSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip
  - unzip -q awscliv2.zip && sudo ./aws/install
  # Write the localstack AWS profile, so lstk does not warn that it's missing
  - lstk setup aws
  # Start LocalStack; LOCALSTACK_AUTH_TOKEN comes from the project's environment variables
  - lstk start

script:
  # Test LocalStack by creating a new S3 bucket (and verify that it has been created by listing all buckets)
  - lstk aws s3 mb s3://test
  - lstk aws s3 ls
  - echo "Execute your tests here :)"
```

Travis CI images vary by language and distribution, so drop either install step if your image already provides the tool.
