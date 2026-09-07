---
title: Explainable IAM
description: Discover IAM Policy Engine logs related to failed policy evaluation.
template: doc
tags: ["Base"]
sidebar:
    order: 2
---

## Introduction

When IAM enforcement denies a request, the IAM Policy Engine returns a descriptive denial message in the API response and records the same information in the LocalStack logs.
These messages identify the action that was denied, the policy type responsible (identity-based policy, resource-based policy, permissions boundary, or service control policy), the specific policy document involved, and whether the denial was explicit or implicit.
This helps you pinpoint the additional policies required for your request to succeed.
Enable `DEBUG=1` to surface the full log output.

## Getting started

This guide is designed for users new to Explainable IAM and assumes basic knowledge of the AWS CLI and our [`lstk aws` AWS CLI proxy](/aws/developer-tools/running-localstack/lstk/cloud-and-iac-commands/#aws).

Start your LocalStack container with the `DEBUG=1` and `ENFORCE_IAM=1` environment variables set:

```toml
# .lstk/config.toml
[[containers]]
type = "aws"
env  = ["iam-enforcement"]

[env.iam-enforcement]
DEBUG = "1"
ENFORCE_IAM = "1"
```

```bash
lstk start
```

In this guide, we will create a policy for creating Lambda functions by only allowing the `lambda:CreateFunction` permission.
However we have not included the `iam:PassRole` permission, and we will use the Policy Engine's log to point out adding the necessary permission.

### Create a new user

Create a policy document named `policy_1.json` and add the following content:

```json showshowLineNumbers
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "FirstStatement",
      "Effect": "Allow",
      "Action": "lambda:CreateFunction",
      "Resource": "*"
    }
  ]
}
```

You can now create a new user named `test-user`, and put the policy in place by executing the following commands:

```bash
lstk aws iam create-user --user-name test-user
```

```bash
{
    "User": {
        "Path": "/",
        "UserName": "test-user",
        "UserId": "x8a2eu4mc91yqtjazvhp",
        "Arn": "arn:aws:iam::000000000000:user/test-user",
        "CreateDate": "2022-07-05T16:08:25.741000+00:00"
    }
}
```

```bash
lstk aws iam put-user-policy --user-name test-user --policy-name policy1 --policy-document file://policy_1.json
```

You can further create an access key for the user by executing the following command:

```bash
lstk aws iam create-access-key --user-name test-user
```

Export the access key and secret key as environment variables:

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

### Attempt to create a Lambda function

You can now attempt to create a Lambda function using the newly created user's credentials:

```bash
lstk aws lambda create-function \
    --function-name test-function \
    --role arn:aws:iam::000000000000:role/lambda-role \
    --runtime python3.8 \
    --handler handler.handler \
    --zip-file fileb://function.zip
```

The request is denied, and the error response names the exact action that was missing:

```bash
An error occurred (AccessDeniedException) when calling the CreateFunction operation: User: arn:aws:iam::000000000000:user/test-user is not authorized to perform: iam:PassRole on resource: arn:aws:iam::000000000000:role/lambda-role because no identity-based policy allows the iam:PassRole action
```

The same information is written to the LocalStack logs.
Inspect the logs to see the corresponding Policy Engine entry:

```bash
2026-06-23T15:48:09.650  INFO --- [PoolThread-twisted.internet.reactor-2] localstack.pro.core.services.iam.policy_engine.handler : User: arn:aws:iam::000000000000:user/test-user is not authorized to perform: iam:PassRole on resource: arn:aws:iam::000000000000:role/lambda-role because no identity-based policy allows the iam:PassRole action
```

The message tells you that `iam:PassRole` is *implicitly* denied for your user on the resource `arn:aws:iam::000000000000:role/lambda-role`.
This means there is no explicit deny statement in the relevant policies, but there is also no allow statement, so the action is denied by default.
You can incorporate this action into the policy.

### Incorporate the action into the policy

For illustrative purposes, we will keep the example straightforward, using the same wildcard resource.
Edit the `policy_1.json` file to include the `iam:PassRole` action:

```json showshowLineNumbers
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "FirstStatement",
      "Effect": "Allow",
      "Action": ["lambda:CreateFunction", "iam:PassRole"],
      "Resource": "*"
    }
  ]
}
```

Re-run the Lambda [`CreateFunction`](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html) API.
You will notice that the request is now successful, and the function is created.

## Reading denial messages

Every denial message follows the same structure: the **principal** that made the request, the **action** it attempted, the **resource** it targeted, and the **cause** of the denial.
The cause tells you both the policy type and whether the denial was explicit or implicit:

- An **explicit deny** names the policy type and the specific policy document, for example `with an explicit deny in a service control policy: arn:aws:organizations::000000000000:policy/p-abc123`.
- An **implicit deny** indicates that no policy allowed the action, for example `because no identity-based policy allows the s3:ListBucket action`.

The Policy Engine evaluates identity-based policies, resource-based policies, permissions boundaries, and service control policies, and the denial message identifies whichever one is responsible.

### Inline policies

The logs go one step further for inline policies.
On AWS, inline policies are reported anonymously, which makes denials caused by them difficult to trace.
LocalStack instead names the specific inline policy responsible for the denial:

```bash
2026-06-23T15:57:15.197  INFO --- [PoolThread-twisted.internet.reactor-2] localstack.pro.core.services.iam.policy_engine.handler : User: arn:aws:sts::000000000000:assumed-role/role-881f9fff/TestSession is not authorized to perform: kms:DescribeKey on resource: arn:aws:kms:us-east-1:000000000000:key/ad764663-5e3d-4325-81de-c7e0964f7b7f with an explicit deny in a role inline policy: policy-fc33c780
```

Here, the request was blocked by an explicit deny in the inline policy `policy-fc33c780` attached to the assumed role, letting you go straight to the policy that needs changing.

## Soft Mode

Enabling `IAM_SOFT_MODE=1` allows you to review the logs and assess whether your requests would have been denied or granted while executing your entire stack without disruptions.

Using this, you can avoid the need for redeployment to address each missing permission individually, streamlining the debugging process and enhancing the efficiency of your IAM configurations.