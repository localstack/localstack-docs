---
title: Credentials
description: Credentials for accessing LocalStack AWS API
template: doc
---

Like AWS, LocalStack requires AWS credentials to be supplied in all API operations.

## Access Key ID

For root accounts, the choice of access key ID affects [multi-account namespacing](/aws/customization/advanced/multi-account-setups).

Access key IDs can be one of following patterns:

### Accounts IDs

You can specify a 12-digit number which will be taken by LocalStack as the account ID.
For example, `112233445566`.

### Structured access key ID

You can specify a structured key like `LSIAQAAAAAAVNCBMPNSG` (which translates to account ID `000000000042`).
This must be at least 20 characters in length and must be decodable to an account ID.

By default, LocalStack will only accept access keys that start with the `LSIA...` or `LKIA...` prefix.
If keys with `ASIA...`/`AKIA...` prefix are provided, these are rejected and the fallback account ID `000000000000` is used.
This is a safeguard to prevent misuse of production AWS access key IDs.
To disable this safeguard, set the `PARITY_AWS_ACCESS_KEY_ID` configuration variable.

:::danger
Disabling the access key safeguard and using production access key IDs may cause accidental connections to AWS.
We strongly recommend leaving it on.
:::

Please refer to the [IAM docs](/aws/services/iam) to learn how to create access keys in LocalStack.

### Alphanumeric string

You can also specify an arbitrary alphanumeric access key ID like `test` or `foobar123`.
In all such cases, the account ID is evaluated to `000000000000`.

## Secret Access Key

The value of the secret access key is generally ignored by LocalStack.
We recommend using the same value as access key ID or `test`.

S3 can optionally validate request signatures, in which case the secret access key matters: it must be the secret the access key ID was issued with, or `test` for access key IDs not issued by LocalStack.
See [S3 signature validation](/aws/services/s3/#signature-validation) for details.
