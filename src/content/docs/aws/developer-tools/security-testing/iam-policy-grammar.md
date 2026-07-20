---
title: IAM Policy Grammar
description: Condition operators and condition keys supported by the LocalStack IAM policy engine.
template: doc
tags: ["Base"]  # TODO: confirm tier
sidebar:
    order: 5
---

<!--
DRAFT — not final. Outstanding before publish:
  1. Full operator support matrix: rows marked "Verify" need checking against the
     policy engine. The 2026.06.0 release only documents what was added, not the
     complete set the engine supports.
  2. Frontmatter tier + sidebar order.
Notes:
  - S3 ABAC tag keys and the EC2 IMDSv2 metadata key are documented elsewhere and
    intentionally NOT covered here.
  - Some sources list numeric operators in shorthand (NumericGreater, NumericLess, ...);
    the tables below use the AWS-canonical names (NumericGreaterThan, NumericLessThan, ...).
  - Source for the inventory: the "LocalStack for AWS 2026.06.0" release blog.
-->

## Introduction

This page lists the IAM policy grammar that the LocalStack policy engine can evaluate: the [condition operators](#condition-operators) and [condition keys](#condition-keys) it understands when checking a request.
The same engine backs both [IAM Policy Enforcement](/aws/developer-tools/security-testing/iam-policy-enforcement/) and the [IAM Policy Simulator](/aws/developer-tools/security-testing/iam-policy-simulator/), so the support described here applies to both.

Grammar support is expanding over time; operators and keys not listed here may not yet be evaluated.
For which service actions are covered, see the [IAM coverage documentation](/aws/developer-tools/security-testing/iam-coverage/), which tracks action coverage rather than grammar.

## Condition operators

The [`Condition`](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html) element of a policy statement uses condition operators to compare a condition key against a value.
The tables below list the operators the engine supports, grouped by category.

<!-- VERIFY: rows marked "Verify" are unconfirmed — check against the policy engine. -->

### String

| Operator | Supported |
| --- | --- |
| `StringEquals` | Verify |
| `StringNotEquals` | Yes |
| `StringEqualsIgnoreCase` | Verify |
| `StringNotEqualsIgnoreCase` | Yes |
| `StringLike` | Verify |
| `StringNotLike` | Yes |

### Numeric

| Operator | Supported |
| --- | --- |
| `NumericEquals` | Yes |
| `NumericNotEquals` | Yes |
| `NumericLessThan` | Yes |
| `NumericLessThanEquals` | Yes |
| `NumericGreaterThan` | Yes |
| `NumericGreaterThanEquals` | Yes |

### ARN

| Operator | Supported |
| --- | --- |
| `ArnEquals` | Verify |
| `ArnLike` | Verify |
| `ArnNotEquals` | Yes |
| `ArnNotLike` | Yes |

### Other categories

<!--
VERIFY and fill in / drop: the remaining AWS operator categories —
Date (DateEquals, DateNotEquals, DateLessThan, ...), Bool, BinaryEquals,
IpAddress / NotIpAddress, Null — plus the `...IfExists` variants and the
ForAllValues / ForAnyValue set operators. Support unknown; confirm against source.
-->

## Condition keys

In addition to the global (`aws:*`) condition keys, the engine evaluates the following service-specific keys.

| Condition key | Purpose |
| --- | --- |
| `iam:PolicyArn` | Restrict policy attach/detach operations to specific policies. |
| `s3:max-keys` | Numeric key for the maximum number of keys returned by a listing. |

<!-- VERIFY: whether global aws:* keys warrant their own row/subsection or a support note. -->

## Examples

The expanded grammar makes it possible to express organization- and account-level guardrails locally.
The following statement is illustrative; confirm the exact condition-key names against your LocalStack version.

Limit the page size of an S3 listing by denying requests that ask for more than 100 keys, using a numeric operator with the `s3:max-keys` key:

```json showLineNumbers
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Action": "s3:ListBucket",
      "Resource": "*",
      "Condition": {
        "NumericGreaterThan": { "s3:max-keys": "100" }
      }
    }
  ]
}
```

<!-- VERIFY the example end-to-end against a real ENFORCE_IAM=1 run. -->

## Known limitations

Grammar support is rolled out incrementally, so operators and keys not listed above may not yet be evaluated.

<!--
When the IAM Policy Simulator page lands, pull its SCP-condition caveats in here
(or cross-reference) so the two pages stay consistent — AWS's own simulator ignores
SCP conditions, whereas LocalStack evaluates them.
-->

## Related

- [IAM Policy Enforcement](/aws/developer-tools/security-testing/iam-policy-enforcement/)
- [IAM Policy Simulator](/aws/developer-tools/security-testing/iam-policy-simulator/)
- [IAM Coverage](/aws/developer-tools/security-testing/iam-coverage/)
- [Explainable IAM](/aws/developer-tools/security-testing/explainable-iam/)