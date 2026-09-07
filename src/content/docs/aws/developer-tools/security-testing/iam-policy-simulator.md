---
title: IAM Policy Simulator
description: Test IAM policies and Service Control Policies before applying them using the IAM Policy Simulator.
template: doc
tags: ["Base"]
sidebar:
    order: 3.5
---

## Introduction

The [IAM Policy Simulator](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html) lets you test the effect of IAM policies attached to a user, group, or role, without making a real request against your resources.
It evaluates the policies attached to a principal (and any policies you pass in) and reports whether each requested action would be `allowed`, `explicitDeny`, or `implicitDeny`.

LocalStack implements the [`SimulatePrincipalPolicy`](https://docs.aws.amazon.com/IAM/latest/APIReference/API_SimulatePrincipalPolicy.html) operation, which simulates the policies already attached to an existing IAM user, group, or role.
[`SimulateCustomPolicy`](https://docs.aws.amazon.com/IAM/latest/APIReference/API_SimulateCustomPolicy.html), which simulates policy documents that aren't attached to any principal, is not yet supported.
See the [IAM coverage documentation](/aws/developer-tools/security-testing/iam-coverage/) for the full list of supported operations.

:::tip
Unlike [IAM Policy Enforcement](/aws/developer-tools/security-testing/iam-policy-enforcement/), the Policy Simulator doesn't require `ENFORCE_IAM=1`.
`SimulatePrincipalPolicy` only evaluates your policies; it never performs the underlying AWS operation, so it works the same whether or not enforcement is turned on.
:::

## Getting started

This guide is designed for users new to the IAM Policy Simulator and assumes basic knowledge of the AWS CLI and our [`awslocal`](https://github.com/localstack/awscli-local) wrapper script.

Start your LocalStack container using your preferred method.

### Create a user with a limited policy

Create a user and attach a policy that only allows `s3:CreateBucket`:

```bash
awslocal iam create-user --user-name test-user
```

```bash
awslocal iam create-policy \
    --policy-name allow-create-bucket \
    --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"s3:CreateBucket","Resource":"*"}]}'
```

```bash
awslocal iam attach-user-policy \
    --user-name test-user \
    --policy-arn arn:aws:iam::000000000000:policy/allow-create-bucket
```

### Simulate the policy

Use `simulate-principal-policy` to check whether `test-user` can create and delete an S3 bucket, without actually calling S3:

```bash
awslocal iam simulate-principal-policy \
    --policy-source-arn arn:aws:iam::000000000000:user/test-user \
    --action-names s3:CreateBucket s3:DeleteBucket \
    --resource-arns "*"
```

```bash title="Output"
{
    "EvaluationResults": [
        {
            "EvalActionName": "s3:CreateBucket",
            "EvalResourceName": "*",
            "EvalDecision": "allowed",
            "OrganizationsDecisionDetail": {
                "AllowedByOrganizations": true
            }
        },
        {
            "EvalActionName": "s3:DeleteBucket",
            "EvalResourceName": "*",
            "EvalDecision": "implicitDeny",
            "OrganizationsDecisionDetail": {
                "AllowedByOrganizations": true
            }
        }
    ],
    "IsTruncated": false
}
```

`s3:CreateBucket` is `allowed` because of the attached policy, and `s3:DeleteBucket` is `implicitDeny` because no statement grants it.

## SCP evaluation

If the principal's account is part of an organization, the Policy Simulator also evaluates [Service Control Policies (SCPs)](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html) covering that account, in addition to the principal's identity-based policies.
This lets you validate SCP behavior with `simulate-principal-policy` before making live requests.
Testing SCPs with the Policy Simulator requires [AWS Organizations](/aws/services/organizations/), available on the Ultimate plan and above.

The `OrganizationsDecisionDetail.AllowedByOrganizations` field indicates whether the final decision was caused by an SCP:

```bash title="Output"
{
    "EvaluationResults": [
        {
            "EvalActionName": "s3:ListAllMyBuckets",
            "EvalResourceName": "*",
            "EvalDecision": "implicitDeny",
            "OrganizationsDecisionDetail": {
                "AllowedByOrganizations": false
            }
        }
    ],
    "IsTruncated": false
}
```

For a full walkthrough of SCP enforcement, including cross-account access, see the [Service Control Policy enforcement](/aws/services/organizations/#service-control-policy-enforcement) section of the Organizations documentation.

:::note
LocalStack's Policy Simulator shares the same evaluation engine as its IAM enforcement, so it reflects real AWS IAM behavior rather than the AWS Policy Simulator, which differs in a few ways:

- AWS ignores SCPs that contain conditions during simulation. LocalStack evaluates SCPs with conditions.
- AWS applies SCPs to the organization's management account during simulation. LocalStack does not apply SCPs to the management account, matching the real behavior of AWS Organizations.
- AWS reports an explicit `Deny` from an SCP as an implicit deny. LocalStack reports it as an explicit deny, which is the expected outcome.
:::

## Limitations

- Only `SimulatePrincipalPolicy` is implemented. `SimulateCustomPolicy`, `GetContextKeysForPrincipalPolicy`, and `GetContextKeysForCustomPolicy` are not yet supported, so you need to know which context keys your policies reference and supply them yourself via `--context-entries`.
- The response only includes `EvalActionName`, `EvalResourceName`, `EvalDecision`, and `OrganizationsDecisionDetail`. Fields such as `MatchedStatements`, `ResourceSpecificResults`, `EvalDecisionDetails`, and `PermissionsBoundaryDecisionDetail` are not populated, so the response doesn't identify which specific statement caused a decision.

## Feature coverage

The feature coverage is documented in the [IAM coverage documentation](/aws/developer-tools/security-testing/iam-coverage/).
