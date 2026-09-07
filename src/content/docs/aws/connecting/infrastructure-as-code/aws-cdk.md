---
title: AWS CDK
description: Use the AWS CDK (Cloud Development Kit) with LocalStack.
template: doc
sidebar:
  order: 4
---

![AWS CDK](public/images/aws/aws-cdk-logo.svg)

## Overview

The AWS Cloud Development Kit (CDK) is an Infrastructure-as-Code (IaC) tool using general-purpose programming languages such as TypeScript/JavaScript, Python, Java, and .NET to programmatically define your cloud architecture on AWS.

## AWS CDK CLI for LocalStack

[`lstk cdk`](/aws/developer-tools/running-localstack/lstk/cloud-and-iac-commands/#cdk) proxies the [AWS CDK](https://github.com/aws/aws-cdk) library against local APIs provided by LocalStack. It requires the AWS CDK CLI version `2.177.0` or newer on your `PATH`.

:::note
`lstk cdk` supersedes the older [`cdklocal` wrapper script](/aws/connecting/infrastructure-as-code/deprecated-wrapper-scripts#cdklocal), which is deprecated but still available if you need it.
:::

### Installation

Install `lstk` by following the [`lstk` installation instructions](/aws/developer-tools/running-localstack/lstk/#installation).
You'll also need the AWS CDK CLI installed separately:

```bash
# Install globally
npm install -g aws-cdk

# Verify it installed correctly
cdk --version
```

### Usage

`lstk cdk` can be used as a drop-in replacement of where you would otherwise use `cdk` when targeting the AWS Cloud.

```bash
lstk cdk --help
```

### Configuration

`lstk cdk`'s only lstk-specific flag (before the CDK action) is `--region <region>` (default `us-east-1`); CDK always targets the default LocalStack account `000000000000`, so there is no `--account` flag.

The following environment variables can be configured:

- `AWS_ENDPOINT_URL`: The endpoint URL (i.e., protocol, host, and port) to connect to LocalStack (default: `http://localhost.localstack.cloud:4566`)
- `AWS_ENDPOINT_URL_S3`: The S3-specific endpoint URL, required alongside `AWS_ENDPOINT_URL` and must include `.s3.` to correctly identify S3 API calls
- `LSTK_CDK_CMD`: Binary to invoke (default `cdk`)
- `AWS_REGION`: Fallback for `--region`

### Example

Make sure that LocalStack is installed and successfully started with the required services before running the example

```bash
curl http://localhost.localstack.cloud:4566/_localstack/health
```

The CDK command line ships with a sample app generator to run a quick test for getting started.

```bash
# create sample app
mkdir /tmp/test; cd /tmp/test
lstk cdk init sample-app --language=javascript

# bootstrap localstack environment
lstk cdk bootstrap

# deploy the sample app
lstk cdk deploy
> Do you wish to deploy these changes (y/n)? y
```

Once the deployment is done, you can inspect the created resources via the [`lstk aws`](/aws/developer-tools/running-localstack/lstk/cloud-and-iac-commands/#aws) command line

```bash
lstk aws sns list-topics
 {
     "Topics": [
         {
             "TopicArn": "arn:aws:sns:us-east-1:000000000000:TestStack-TestTopic339EC197-79F43WWCCS4Z"
         }
     ]
}
```

## Current Limitations

### Updating CDK stacks

Updating CDK stacks may result in deployment failures and inconsistent state within LocalStack.
It is advisable to prioritize re-creating (deleting and re-deploying) over updating stacks.

:::note

CDK Asset deployment (e.g., Lambda code, S3 content) requires a LocalStack paid plan.

This process relies on the `AWS::CloudFormation::CustomResource` API. If deployments hang or fail silently, check the LocalStack logs for `CustomResource` errors.
:::

### Stacks with validated certificates

By default, stacks with validated certificates may not be deployed using the `local` lambda executor.
This originates from the way how CDK ensures the certificate is ready - it creates a single-file lambda function with a single dependency on `aws-sdk` which is usually preinstalled and available globally in lambda runtime.
When this lambda is executed locally from the `/tmp` folder, the package can not be discovered by Node due to the way how Node package resolution works.

## CDK Version Compatibility

`lstk cdk` requires AWS CDK CLI `2.177.0` or newer, as noted in [Installation](#installation).
If you're using an older `aws-cdk` version, or the legacy `cdklocal` wrapper script, see [CDK Version Compatibility](/aws/connecting/infrastructure-as-code/deprecated-wrapper-scripts#cdklocal) on the deprecated wrapper scripts page for the relevant environment-variable workarounds.
