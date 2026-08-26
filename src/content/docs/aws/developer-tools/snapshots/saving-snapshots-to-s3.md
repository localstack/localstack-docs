---
title: Saving snapshots to S3
description: Save snapshots directly to an Amazon S3 bucket, as an alternative to Cloud Pods or local storage.
template: doc
tags: ["Base"]
sidebar:
    order: 4
---

By default, Cloud Pod artifacts are stored on the LocalStack platform.
However, if your organization's data regulations or sovereignty requirements prohibit storing snapshots in LocalStack's managed storage, saving directly to your own Amazon S3 bucket is the recommended solution for keeping full control over where that data lives.

When saving, loading, or listing snapshots in your own S3 bucket, `lstk` uses pre-signed S3 URLs to transfer the data directly between the emulator and your bucket, without proxying it through LocalStack's platform.

## Using the `lstk` CLI

The [`lstk snapshot`](/aws/developer-tools/running-localstack/lstk/#snapshot) command lets you save, load, and list snapshots stored in your own S3 bucket by passing an `s3://bucket/prefix` location alongside a snapshot name.

The initial step is to export the necessary AWS credentials in your terminal session.

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

To obtain credentials automatically, use [AWS SSO CLI](https://github.com/synfinatic/aws-sso-cli). Alternatively, set `AWS_PROFILE` or pass `--profile <name>` to have `lstk` read credentials from a named AWS profile instead of the environment.

To save a snapshot to your S3 bucket, provide a snapshot name followed by the `s3://` location:

```bash
lstk snapshot save my-snapshot s3://ls-s3-bucket-example
```

```bash title="Output"
✔︎ Snapshot saved to s3://ls-s3-bucket-example as "my-snapshot"
• Version: 1
• Size: 74.6 KB
```

:::note
On LocalStack `v2026.08` or later, snapshots transfer to a real Amazon S3 bucket with [transparent endpoint injection](/aws/customization/networking/transparent-endpoint-injection) left enabled, as it is by default. No extra configuration is needed.

On versions before `v2026.08`, transparent endpoint injection must be disabled.
Otherwise LocalStack's [DNS server](/aws/customization/networking/dns-server) resolves the AWS domains back to the emulator, and the transfer never reaches your bucket — typically surfacing as a TLS certificate validation error.

Disable this feature by setting [`DNS_ADDRESS=0`](/aws/customization/configuration-options/) when starting the emulator, which turns off transparent endpoint injection application-wide.
On the command line, use `LOCALSTACK_DNS_ADDRESS=0 lstk start` — host variables prefixed with `LOCALSTACK_` are forwarded to the emulator.
In a `config.toml` [environment profile](/aws/developer-tools/running-localstack/lstk/#passing-environment-variables-to-the-container), use the unprefixed form `DNS_ADDRESS = "0"`.
:::

Once the snapshot has been saved, you can confirm the presence of the snapshot artifacts in the S3 bucket by running:

```bash
aws s3 ls s3://ls-s3-bucket-example
```

```bash title="Output"
2026-08-05 10:08:55      76390 localstack-pod-my-snapshot-state-1.zip
```

You can then use `lstk snapshot load` to load the previously saved snapshot:

```bash
lstk snapshot load my-snapshot s3://ls-s3-bucket-example
```

```bash title="Output"
✔︎ Snapshot loaded from s3://ls-s3-bucket-example (my-snapshot)
```

Similarly, you can list the snapshots stored in this bucket with `lstk snapshot list`:

```bash
lstk snapshot list s3://ls-s3-bucket-example
```

```bash title="Output"
~ 1 snapshot

  NAME         VERSION
  my-snapshot  1
```

:::note
Because data transfer is performed by the emulator rather than the CLI, saving, loading, and listing snapshots in your own S3 bucket require a **running emulator**.
:::

Comprehensive instructions on using the `lstk snapshot` CLI command, including credential resolution order, are found in the [`lstk` CLI Guide](/aws/developer-tools/running-localstack/lstk/#s3-remotes).
