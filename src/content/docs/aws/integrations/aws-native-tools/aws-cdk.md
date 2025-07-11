---
title: AWS CDK
description: Use the AWS CDK (Cloud Development Kit) with LocalStack.
template: doc
sidebar:
    order: 2
---

![AWS CDK](public/images/aws/aws-cdk-logo.svg)

## Overview

The AWS Cloud Development Kit (CDK) is an Infrastructure-as-Code (IaC) tool using general-purpose programming languages such as TypeScript/JavaScript, Python, Java, and .NET to programmatically define your cloud architecture on AWS.

## AWS CDK CLI for LocalStack

`cdklocal` is a thin wrapper script for using the [AWS CDK](https://github.com/aws/aws-cdk) library against local APIs provided by [LocalStack](https://github.com/localstack/localstack).

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
```

### Configuration

The following environment variables can be configured:

* `AWS_ENDPOINT_URL`: The endpoint URL (i.e., protocol, host, and port) to connect to LocalStack (default: `http://localhost:4566`)
* `LAMBDA_MOUNT_CODE`: Whether to use local Lambda code mounting (via setting `hot-reload` S3 bucket name)

### Example

Make sure that LocalStack is installed and successfully started with the required services before running the example

```bash
curl http://localhost:4566/_localstack/health
```

The CDK command line ships with a sample app generator to run a quick test for getting started.

```bash
# create sample app
mkdir /tmp/test; cd /tmp/test
cdklocal init sample-app --language=javascript

# bootstrap localstack environment
cdklocal bootstrap

# deploy the sample app
cdklocal deploy
> Do you wish to deploy these changes (y/n)? y
```

Once the deployment is done, you can inspect the created resources via the [`awslocal`](https://github.com/localstack/awscli-local) command line

```bash
awslocal sns list-topics
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
Our focus for this year will be on resolving issues related to the `UPDATE` support, and continuous improvements can be anticipated in this area throughout 2024.

### Stacks with validated certificates

By default, stacks with validated certificates may not be deployed using the `local` lambda executor.
This originates from the way how CDK ensures the certificate is ready - it creates a single-file lambda function with a single dependency on `aws-sdk` which is usually preinstalled and available globally in lambda runtime.
When this lambda is executed locally from the `/tmp` folder, the package can not be discovered by Node due to the way how Node package resolution works.

## CDK Version Compatibility

`cdklocal` works with all installed versions of the Node.js `aws-cdk` package.
However, issues exist for `aws-cdk >= 2.177.0`.

For these versions:

* We unset AWS-related environment variables like `AWS_PROFILE` before calling `cdk`.
* We explicitly set `AWS_ENDPOINT_URL` and `AWS_ENDPOINT_URL_S3` to point to LocalStack.

Some environment variables may cause conflicting config, such as wrong region or accidental deploys to real AWS.
To allow specific variables (e.g., `AWS_REGION`), use `AWS_ENVAR_ALLOWLIST`:

```bash
AWS_ENVAR_ALLOWLIST=AWS_REGION,AWS_DEFAULT_REGION AWS_DEFAULT_REGION=eu-central-1 AWS_REGION=eu-central-1 cdklocal ...
```

If you manually set `AWS_ENDPOINT_URL`, it will be used.
You must also set `AWS_ENDPOINT_URL_S3`, and it must include `.s3.` to correctly identify S3 API calls.
See full configuration details [on our configuration docs](https://github.com/localstack/aws-cdk-local?tab=readme-ov-file#configurations).
