---
title: CodeBuild
description: Use LocalStack in CodeBuild.
template: doc
sidebar:
    order: 7
---

## Introduction

[AWS CodeBuild](https://docs.aws.amazon.com/codebuild/latest/userguide/welcome.html) is a managed AWS service for the build and testing phases of software development.
CodeBuild allows you to define your build project, set the source code location, and handles the building and testing, while supporting various programming languages, build tools, and runtime environments.
This guide shows how to run LocalStack in CodeBuild using the [`lstk` CLI](/aws/developer-tools/running-localstack/lstk/).

The CodeBuild standard images already provide Docker, Node.js, and the AWS CLI, so `lstk` is the only part that needs installing.

:::note
LocalStack depends on the Docker socket to emulate your infrastructure.
To enable it, update your project by ticking **Environment > Additional Configuration > Privileged > Enable this flag if you want to build Docker Images or want your builds to get elevated privileges**.
:::

## Snippets

### Start up LocalStack

LocalStack requires a CI Auth Token to run.
Go to the [CI Auth Token page](https://app.localstack.cloud/workspace/auth-tokens) and copy your CI Auth Token, then add it to the project's environment variables:

- Navigate to your project dashboard, click **Edit** to open the dropdown, and select **Environment**.
- Click on **Additional configuration** and navigate to the **Environment variables** section.
- Specify **Name** as `LOCALSTACK_AUTH_TOKEN` and **Value** as your CI Auth Token.
Specify **Type** as per your requirement.
- Click on **Update environment** to save your environment variables.

`lstk` automatically recognizes the token and activates the licensed features.
You can then install `lstk` and start the emulator in your buildspec file:

```yml showshowLineNumbers
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 22
    commands:
      - npm install -g @localstack/lstk
  pre_build:
    commands:
      # LOCALSTACK_AUTH_TOKEN comes from the project's environment variables
      - lstk setup aws
      - lstk start
  build:
    commands:
      - lstk aws s3 mb s3://test-bucket
      - lstk aws s3 ls
```

`lstk start` pulls the image, validates your license, and returns only once the emulator is ready, so no separate wait step is needed.
`lstk aws` proxies the runner's `aws` binary with LocalStack's endpoint and credentials applied.
`lstk setup aws` writes a `localstack` AWS profile for that binary to use.

### Configuration

To set LocalStack configuration options, pass them as `LOCALSTACK_`-prefixed environment variables.
`lstk start` forwards those into the container which strips the prefix, so `LOCALSTACK_DEBUG` sets the container's `DEBUG` option.

```yml showshowLineNumbers
version: 0.2

env:
  variables:
    LOCALSTACK_DEBUG: "1"
    LOCALSTACK_LS_LOG: "trace"
...
phases:
...
```

Settings that apply to every run belong in an [`[env.*]` profile](/aws/developer-tools/running-localstack/lstk/configuration/) in a `.lstk/config.toml` committed to your repository, which also lets you pin the image tag.
Read more about the [configuration options](/aws/customization/configuration-options) of LocalStack.

### Dump LocalStack logs

```yaml showshowLineNumbers
...
phases:
  pre_build:
    commands:
      # Starts up LocalStack
    ...
  build:
    commands:
      # Run some commands which might fail
      ...
  post_build:
    commands:
      # Dump logs on build fail
      - '[ ${CODEBUILD_BUILD_SUCCEEDING:-0} -eq 0 ] && (lstk logs --verbose | tee localstack.log) || true'
...
# Optionally store dumped logs as artifact
artifacts:
  files:
    - localstack.log
```

### Store LocalStack state

You can preserve your AWS infrastructure with LocalStack in various ways.

#### Cloud Pods

Find more information about Cloud Pods [here](/aws/developer-tools/snapshots/cloud-pods).

```yml showshowLineNumbers
...
phases:
  pre_build:
    commands:
      ...
      # LocalStack is up and running already
      # Allow the load to fail as the pod does not exist at first run
      - lstk load pod:<POD_NAME> || true
      ...
      - lstk save pod:<POD_NAME>
      ...
```

#### Artifact

Instead of the LocalStack platform, you can keep the state as a local snapshot file and move it between builds with CodeBuild's own artifact storage.

Find out more about [snapshots](/aws/developer-tools/snapshots/saving-snapshots-locally/).

```yml showshowLineNumbers
...
phases:
  pre_build:
    commands:
      # LocalStack is up and running already
      - |
        if [ -f ls-state.snapshot ]; then
          lstk load ./ls-state.snapshot --merge=overwrite
        fi
      ...
      - lstk save ./ls-state.snapshot
...
artifacts:
  files:
    - ls-state.snapshot
```

Alternatively save as a secondary artifact:

```yml showshowLineNumbers
...
artifacts:
  ...
  secondary-artifacts:
    ls-state:
      files:
        - ls-state.snapshot
    ...
```

To use previously stored artifacts as inputs, set them as a source in the project.

#### Cache

```yml showshowLineNumbers
...
phases:
  pre_build:
    commands:
      # LocalStack is up and running already
      - |
        if [ -f ls-state.snapshot ]; then
          lstk load ./ls-state.snapshot --merge=overwrite
        fi
      ...
      - lstk save ./ls-state.snapshot
...
cache:
  paths:
    - 'ls-state.snapshot'
```

## Current Limitations

- `lstk` pulls the emulator image from Docker Hub by default, where you may run into the following error:

  ```bash
  toomanyrequests: You have reached your pull rate limit. You may increase the limit by authenticating and upgrading: https://www.docker.com/increase-rate-limit
  ```

  To resolve this, either use your Docker Hub account credentials to pull the image, or point `lstk` at LocalStack's public ECR mirror with the [`image` field](/aws/developer-tools/running-localstack/lstk/configuration/#custom-container-image) in `.lstk/config.toml`:

  ```toml
  [[containers]]
  type  = "aws"
  port  = "4566"
  image = "public.ecr.aws/localstack/localstack-pro"
  tag   = "latest"
  ```

- LocalStack depends on the Docker socket to emulate your infrastructure.
  To enable it, update your project by ticking **Environment > Additional Configuration > Privileged > Enable this flag if you want to build Docker Images or want your builds to get elevated privileges**.

For further information see the official CodeBuild [documentation](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html).
