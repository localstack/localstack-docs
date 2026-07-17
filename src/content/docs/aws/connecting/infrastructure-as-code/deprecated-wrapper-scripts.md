---
title: Deprecated Wrapper Scripts
description: Reference for the legacy awslocal, tflocal, samlocal, and cdklocal wrapper scripts, superseded by lstk.
template: doc
sidebar:
  order: 12
---

## Introduction

The following (now deprecated) wrapper scripts were used in conjunction with LocalStack, to direct the `aws`, `terraform`, `sam`, and `cdk` commands to LocalStack endpoints.

- [`awslocal`](#awslocal) - Runs AWS CLI commands against LocalStack.
- [`tflocal`](#tflocal) - Runs Terraform against LocalStack.
- [`samlocal`](#samlocal) - Runs AWS SAM CLI commands against LocalStack.
- [`cdklocal`](#cdklocal) - Runs AWS CDK commands against LocalStack.

:::caution
`awslocal`, `tflocal`, `samlocal`, and `cdklocal` are **deprecated** in favor of [`lstk`](/aws/developer-tools/running-localstack/lstk/), which provides equivalent functionality via `lstk aws`, `lstk terraform` (alias `lstk tf`), `lstk sam`, and `lstk cdk`.
These wrapper scripts remain available and continue to work. This page documents them for anyone still relying on them.
:::

See the [AWS CLI](/aws/connecting/aws-cli), [Terraform](/aws/connecting/infrastructure-as-code/terraform), [AWS SAM](/aws/connecting/infrastructure-as-code/aws-sam), and [AWS CDK](/aws/connecting/infrastructure-as-code/aws-cdk) pages for the current `lstk`-based workflow.


## awslocal

`awslocal` serves as a thin wrapper and a substitute for the standard `aws` command, enabling you to run AWS CLI commands within the LocalStack environment without specifying the `--endpoint-url` parameter or a profile.

### Installation

Install the `awslocal` command using the following command:

```bash
pip install awscli-local[ver1]
```

:::tip
The above command installs the most recent version of the underlying AWS CLI version 1 (`awscli`) package.
If you would rather manage your own `awscli` version (e.g., `v1` or `v2`) and only install the wrapper script, you can use the following command:

```bash
pip install awscli-local
```

:::

:::note
Automatic installation of AWS CLI version 2 is not supported (at the time of writing there is no official pypi package for `v2` available), but the `awslocal` technically also works with AWS CLI v2 (see [Current Limitations](#current-limitations) for more details).
:::

### Usage

The `awslocal` command shares identical usage with the standard `aws` command.
For comprehensive usage instructions, refer to the manual pages by running `awslocal help`.

```bash
awslocal kinesis list-streams
```

### Configuration

| Variable Name    | Description                                                                         |
| ---------------- | ----------------------------------------------------------------------------------- |
| AWS_ENDPOINT_URL | The endpoint URL to connect to (takes precedence over USE_SSL/LOCALSTACK_HOST)      |
| LOCALSTACK_HOST  | A variable defining where to find LocalStack (default: `localhost:4566`) |
| USE_SSL          | Whether to use SSL when connecting to LocalStack (default: False)      |

### Current Limitations

Please note that there is a known limitation for using the `cloudformation package ...` command with the AWS CLI v2.
The problem is that the AWS CLI v2 is [not available as a package on pypi.org](https://github.com/aws/aws-cli/issues/4947), but is instead shipped as a binary package that cannot be easily patched from `awslocal`.
To work around this issue, you have 2 options:

- Downgrade to the v1 AWS CLI (this is the recommended approach)
- There is an unofficial way to install AWS CLI v2 from sources.
  We do not recommend this, but it is technically possible.
  Also, you should install these libraries in a Python virtualenv, to avoid version clashes with other libraries on your system:

```bash
virtualenv .venv
. .venv/bin/activate
pip install https://github.com/boto/botocore/archive/v2.zip https://github.com/aws/aws-cli/archive/v2.zip
```

Please also note there is a known limitation for issuing requests using
`--no-sign-request` with the AWS CLI.
LocalStack's routing mechanism depends on
the signature of each request to identify the correct service for the request.
Thus, adding the flag `--no-sign-requests` provokes your request to reach the
wrong service.
One possible way to address this is to use the `awslocal` CLI
instead of AWS CLI.

## tflocal

`tflocal` is a small wrapper script to run Terraform against LocalStack. It uses the [Terraform Override mechanism](https://www.terraform.io/language/files/override) and creates a temporary file `localstack_providers_override.tf` to configure the endpoints for the AWS `provider` section.
The endpoints for all services are configured to point to the LocalStack API (`http://localhost:4566` by default).

### Installation

To install the `tflocal` command, you can use `pip` (assuming you have a local Python installation):

```bash
pip install terraform-local
```

After installation, you can use the `tflocal` command, which has the same interface as the `terraform` command line.

```bash
tflocal --help
```

### Usage

```bash
tflocal init
tflocal apply
```

### Configuration

| Environment Variable     | Default value                    | Description |
| ------------------------ | -------------------------------- | ----------- |
| `TF_CMD`                 | `terraform`                        | Terraform command to call |
| `AWS_ENDPOINT_URL`       | -                                | Hostname and port of the target LocalStack instance |
| `LOCALSTACK_HOSTNAME`    | `localhost`                        | Host name of the target LocalStack instance |
| `EDGE_PORT`              | `4566`                             | Port number of the target LocalStack instance |
| `S3_HOSTNAME`            | `s3.localhost.localstack.cloud`    | Special hostname to be used to connect to LocalStack S3 |
| `USE_EXEC`               | -                                | Whether to use `os.exec` instead of `subprocess.Popen` (try using this in case of I/O issues) |
| `<SERVICE>_ENDPOINT`     | -                                | Setting a custom service endpoint, e.g., `COGNITO_IDP_ENDPOINT=http://example.com` |
| `AWS_DEFAULT_REGION`     | `us-east-1`                        | The AWS region to use (determined from local credentials if `boto3` is installed) |
| `CUSTOMIZE_ACCESS_KEY`   | -                                | Enables you to override the static AWS Access Key ID |
| `AWS_ACCESS_KEY_ID`      | `test` (`accountId`: 000000000000)   | AWS Access Key ID to use for multi-account setups |

:::note
While using `CUSTOMIZE_ACCESS_KEY`, following cases are taking precedence over each other from top to bottom:
1. If the `AWS_ACCESS_KEY_ID` environment variable is set.
2. If `access_key` is configured in the Terraform AWS provider.
3. If the `AWS_PROFILE` environment variable is set and properly configured.
4. If the `AWS_DEFAULT_PROFILE` environment variable is set and configured.
5. If credentials for the `default` profile are configured.
6. If none of the above settings are present, it falls back to using the default `AWS_ACCESS_KEY_ID` mock value.
:::

### OpenTofu

You can use the `TF_CMD` environment variable with `tflocal` to specify the `tofu` binary to call:

```bash
TF_CMD=tofu tflocal --help
```

## samlocal

`samlocal` is a wrapper for the `sam` command line interface, facilitating the use of the SAM framework with LocalStack.
When executing deployment commands like `samlocal [ build | deploy | validate | package ]`, the script configures the SAM settings for LocalStack and runs the specified SAM command.

:::note
`samlocal` supports image/container-based Lambda (ECR) deploys and nested CloudFormation stacks, which `lstk sam` does not (yet) support - this is the main reason to keep using `samlocal` today.
:::

### Installation

You can install the `samlocal` wrapper script by running the following command:

```bash
pip install aws-sam-cli-local
```

### Usage

```bash
samlocal init
samlocal deploy --guided
```

### Configuration

| Environment Variable   | Default value                                    | Description                                                             |
|------------------------|--------------------------------------------------|-------------------------------------------------------------------------|
| AWS_ENDPOINT_URL       | `http://localhost.localstack.cloud:4566`        | URL at which the `boto3` client can reach LocalStack                   |
| EDGE_PORT              | `4566`                              | Port number under which the LocalStack edge service is available        |
| LOCALSTACK_HOSTNAME    | `localhost`                         | Host under which the LocalStack edge service is available

## cdklocal

`cdklocal` is a thin wrapper script for using the [AWS CDK](https://github.com/aws/aws-cdk) library against local APIs provided by LocalStack.

### Installation

The `cdklocal` command line is published as an [npm library](https://www.npmjs.com/package/aws-cdk-local):

```bash
# Install globally
npm install -g aws-cdk-local aws-cdk

# Verify it installed correctly
cdklocal --version
# e.g. 1.65.5
```

:::note
Using `cdklocal` locally (e.g. within the `node_modules` of your repo instead of globally installed) does not work at the moment for some setups, so make sure you install both `aws-cdk` and `aws-cdk-local` with the `-G` flag.
:::

### Usage

`cdklocal` can be used as a drop-in replacement of where you would otherwise use `cdk` when targeting the AWS Cloud.

```bash
cdklocal --help

# create sample app
mkdir /tmp/test; cd /tmp/test
cdklocal init sample-app --language=javascript

# bootstrap localstack environment
cdklocal bootstrap

# deploy the sample app
cdklocal deploy
```

### Configuration

The following environment variables can be configured:

- `AWS_ENDPOINT_URL`: The endpoint URL (i.e., protocol, host, and port) to connect to LocalStack (default: `http://localhost.localstack.cloud:4566`)
- `LAMBDA_MOUNT_CODE`: Whether to use local Lambda code mounting (via setting `hot-reload` S3 bucket name)

### CDK Version Compatibility

`cdklocal` works with all installed versions of the Node.js `aws-cdk` package.
However, issues exist for `aws-cdk >= 2.177.0`.

For these versions:

- We unset AWS-related environment variables like `AWS_PROFILE` before calling `cdk`.
- We explicitly set `AWS_ENDPOINT_URL` and `AWS_ENDPOINT_URL_S3` to point to LocalStack.

Some environment variables may cause conflicting config, such as wrong region or accidental deploys to real AWS.
To allow specific variables (e.g., `AWS_REGION`), use `AWS_ENVAR_ALLOWLIST`:

```bash
AWS_ENVAR_ALLOWLIST=AWS_REGION,AWS_DEFAULT_REGION AWS_DEFAULT_REGION=eu-central-1 AWS_REGION=eu-central-1 cdklocal ...
```

If you manually set `AWS_ENDPOINT_URL`, it will be used.
You must also set `AWS_ENDPOINT_URL_S3`, and it must include `.s3.` to correctly identify S3 API calls.
See full configuration details [on our configuration docs](https://github.com/localstack/aws-cdk-local?tab=readme-ov-file#configurations).
