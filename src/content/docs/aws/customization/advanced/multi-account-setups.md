---
title: Multi-Account Setups
description: Using LocalStack in multi-tenant setups
template: doc
sidebar:
  order: 4
---

:::note
Please note that multi-accounts may not work for use-cases that have cross-account and cross-service access.
Please contact [LocalStack Support](/aws/help-support/get-help) to request support for specific use-cases.
:::

LocalStack ships with multi-account support which allows namespacing based on AWS account ID.

LocalStack uses the value in the AWS Access Key ID field for the purpose of namespacing over account ID.
For more information, see [Credentials](/aws/connecting/credentials).

The Access Key ID field can be configured in the AWS CLI in multiple ways: please refer to [AWS CLI documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-precedence).

## Examples

In the following examples, we select the account ID with the `--account` flag of `lstk aws`.

```bash
lstk aws --account 000000000001 ec2 create-key-pair --key-name green-hospital
lstk aws --account 000000000002 ec2 create-key-pair --key-name red-medicine

lstk aws --account 000000000001 ec2 describe-key-pairs
{
    "KeyPairs": [
        {
            "KeyFingerprint": "6b:e3:a3:41:4b:60:f3:6d:7b:84:3e:17:e3:ad:d0:15",
            "KeyName": "green-hospital"
        }
    ]
}

lstk aws --account 000000000002 ec2 describe-key-pairs
{
    "KeyPairs": [
        {
            "KeyFingerprint": "16:4c:64:13:36:41:7c:75:d0:51:f0:db:ed:d7:c8:95",
            "KeyName": "red-medicine"
        }
    ]
}
```

Alternatively, you can set the account ID through the `AWS_ACCESS_KEY_ID` environment variable:

```bash
AWS_ACCESS_KEY_ID=000000000001 lstk aws ec2 describe-key-pairs
```

If no explicit Account ID is set, LocalStack falls back to default.
In this example, no resources are returned.

```bash
lstk aws ec2 describe-key-pairs
{
    "KeyPairs": []
}
```
