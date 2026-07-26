---
title: Saving snapshots to S3
description: Save snapshots directly to an Amazon S3 bucket, as an alternative to Cloud Pods or local storage.
template: doc
tags: ["Base"]
sidebar:
    order: 4
---

By default, Cloud Pod artifacts are stored in the LocalStack platform.
However, if your organization's data regulations or sovereignty requirements prohibit storing Cloud Pod assets in LocalStack's managed storage, saving snapshots directly to your own Amazon S3 bucket is the recommended solution for keeping full control over where that data lives.

When saving to, loading from, or listing a snapshot in your own S3 bucket, `lstk` uses pre-signed S3 URLs to transfer the data directly between the emulator and your bucket, without proxying it through LocalStack's platform.

## Using the `lstk` CLI

The [`lstk snapshot`](/aws/developer-tools/running-localstack/lstk/#snapshot) command lets you save, load, and list snapshots stored in your own S3 bucket by passing an `s3://bucket/prefix` location alongside a pod name.

The initial step is to export the necessary AWS credentials within the terminal session.

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

A possible option is to obtain credentials via [AWS SSO CLI](https://github.com/synfinatic/aws-sso-cli).
Alternatively, pass `--profile <name>` to have `lstk` read credentials from a named AWS profile instead of the environment.

To save a snapshot to your bucket, provide a pod name followed by the `s3://` location:

```bash
lstk snapshot save my-pod s3://ls-pods-bucket-test
```

Once the command has been executed, you can confirm the presence of the snapshot artifacts in the S3 bucket by simply running:

```bash
aws s3 ls s3://ls-pods-bucket-test
2023-09-27 13:50:10      83650 localstack-pod-my-pod-state-1.zip
2023-09-27 13:50:11      85103 localstack-pod-my-pod-version-1.zip
```

You can use `lstk snapshot load` to load the same snapshot that was previously saved to this bucket:

```bash
lstk snapshot load my-pod s3://ls-pods-bucket-test
```

Similarly, you can list the snapshots stored in this bucket with `lstk snapshot list`:

```bash
lstk snapshot list s3://ls-pods-bucket-test
```

:::note
Because the transfer is performed by the emulator rather than the CLI, saving, loading, and listing snapshots from your own S3 bucket requires a **running emulator**.
:::

Comprehensive instructions on using the `lstk snapshot` CLI command, including credential resolution order, are found in the [`lstk` CLI Guide](/aws/developer-tools/running-localstack/lstk/#s3-remotes).
