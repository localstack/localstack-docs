---
title: AWS CLI
description: Use AWS Command Line Interface (CLI)  to create local AWS resources with LocalStack.
template: doc
sidebar:
  order: 1
---

## Introduction

The [AWS Command Line Interface (CLI)](https://aws.amazon.com/cli/) is the standard tool from Amazon for creating and managing AWS services via a command line interface.
Due to LocalStack's compatibility with the AWS APIs, this tool can also access LocalStack's emulated services.

You can use the AWS CLI with LocalStack using one or more of the following approaches:

- [AWS CLI](#aws-cli) - Use the standard `aws` command with hand-crafted configuration options necessary to communicate with LocalStack.
- [LocalStack AWS CLI](#localstack-aws-cli-lstk-aws) - Use the `lstk aws` command to set the configuration options for you.
- [Using AWS CLI from a pre-built container](#using-aws-cli-from-a-pre-built-container) - Use Amazon's pre-built AWS CLI container image instead of installing `aws` locally.

:::note
`lstk aws` supersedes the older [`awslocal` wrapper script](/aws/connecting/infrastructure-as-code/deprecated-wrapper-scripts#awslocal), which is deprecated but still available if you need it.
:::

## AWS CLI

If you don't already have `aws` (version 2) installed, follow the [official AWS CLI installation instructions](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).

Once installed, you can configure the AWS CLI to redirect AWS API requests to LocalStack using two approaches:

- [Configuring an endpoint URL](#configuring-an-endpoint-url)
- [Configuring a custom profile](#configuring-a-custom-profile)

### Configuring an endpoint URL

You can use AWS CLI with an endpoint URL by configuring environment variables and including the `--endpoint-url=<localstack-url>` flag in your `aws` CLI commands.
For example:

```bash
export AWS_ACCESS_KEY_ID="test"
export AWS_SECRET_ACCESS_KEY="test"
export AWS_DEFAULT_REGION="us-east-1"

aws --endpoint-url=http://localhost.localstack.cloud:4566 kinesis list-streams
```

:::note

Pre-signed URLs for S3 are generated with the credentials configured on the client, such as the default `test`/`test` pair shown above.
For LocalStack to be able to validate a pre-signed URL, it must be generated with valid credentials. More details at [S3 signature validation](/aws/services/s3/#signature-validation).
:::

### Configuring a custom profile

You can configure a custom profile to use with LocalStack.
Add the following profile to your AWS configuration file (by default, this file is at `~/.aws/config`):

```bash
[profile localstack]
region=us-east-1
output=json
endpoint_url = http://localhost.localstack.cloud:4566
```

Add the following profile to your AWS credentials file (by default, this file is at `~/.aws/credentials`):

```bash
[localstack]
aws_access_key_id=test
aws_secret_access_key=test
```

You can now use the `localstack` profile with the `aws` CLI:

```bash
aws s3 mb s3://test --profile localstack
aws s3 ls --profile localstack
```

:::tip

Alternatively, you can also set the `AWS_PROFILE=localstack` environment variable, in which case the `--profile localstack` parameter can be omitted in the commands above.
:::

## LocalStack AWS CLI (`lstk aws`)

`lstk aws` serves as a thin wrapper and a substitute for the standard `aws` command, enabling you to run AWS CLI commands within the LocalStack environment without specifying the `--endpoint-url` parameter or a profile.

### Installation

To make use of `lstk aws`, you must install both the `lstk` CLI and the standard `aws` command from Amazon.

1. To install `lstk`, follow the [`lstk` installation instructions](/aws/developer-tools/running-localstack/lstk/#installation).
2. To install `aws`, follow the [official AWS CLI installation instructions](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).

### Usage

The `lstk aws` command shares identical usage with the standard `aws` command.
For comprehensive usage instructions, refer to the manual pages by running `lstk aws help`.

```bash
lstk aws kinesis list-streams
```


## Using AWS CLI from a pre-built container

As an alternative to installing the `aws` command directly on your local machine, Amazon provides a [pre-built container image with the AWS CLI pre-installed](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-docker.html). This approach is most suitable when working in multi-container environments, rather than single-machine installations. If you take this approach, an extra step is required for communication with LocalStack, also running inside a container.

By default, the AWS CLI container is isolated from `0.0.0.0:4566` on the host machine, which means the AWS CLI cannot reach LocalStack. To ensure the two docker containers can communicate create a network on the docker engine:

```bash
docker network create localstack
0c9cb3d37b0ea1bfeb6b77ade0ce5525e33c7929d69f49c3e5ed0af457bdf123
```

Then modify the `docker-compose.yml` specifying the network to use:

```yaml
networks:
  default:
    external:
      name: 'localstack'
```

Run the AWS CLI v2 docker container using this network (example):

```bash
docker run --network localstack --rm -it amazon/aws-cli --endpoint-url=http://localstack:4566 lambda list-functions
{
    "Functions": []
}
```

If you use AWS CLI v2 from a docker container often, create an alias:

```bash
alias laws='docker run --network localstack --rm -it amazon/aws-cli --endpoint-url=http://localstack:4566'
```

So you can type:

```bash
laws lambda list-functions
{
    "Functions": []
}
```
