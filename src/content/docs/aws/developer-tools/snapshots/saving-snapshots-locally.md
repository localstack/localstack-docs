---
title: Saving snapshots locally
description: Saving and loading snapshots from local files.
template: doc
tags: ["Base"]
sidebar:
    order: 2
---

With Snapshots, you can save the state of your LocalStack instance to a local file on disk, then load it back at a later time. This concept is similar to desktop-based word processors, spreadsheets, or practically any software that allows saving and loading the program state.

In addition, LocalStack's snapshot mechanism allows for loading multiple snapshot files into the same emulator instance, useful when multiple teams collaborate to build a running emulator image.

## Using the `lstk` CLI

The [`lstk` CLI](/aws/developer-tools/running-localstack/lstk/#snapshot) lets you save your instance's state to a local file and load it back into another instance at a later time.

To save the state to a local file, run:

```bash
lstk snapshot save my-snapshot
✔︎ Snapshot saved to ./my-snapshot.snapshot
```

The destination argument is optional.
If you omit it, `lstk` auto-generates a timestamped snapshot file in the current directory:

```bash
lstk snapshot save                     
✔︎ Snapshot saved to ./snapshot-2026-07-19T22-20-46-31f.snapshot
```

Since saving is a common operation, the `lstk save` abbreviation is allowed:

```bash
lstk save
✔︎ Snapshot saved to ./snapshot-2026-07-19T22-27-20-16e.snapshot
```

To load a previously saved snapshot, run:

```bash
lstk snapshot load my-snapshot
✔︎ Snapshot loaded from ./my-snapshot.snapshot
```

Or alternatively, the `lstk load` command is allowed:

```bash
lstk load my-snapshot
✔︎ Snapshot loaded from ./my-snapshot.snapshot
```


## Snapshot Merging

A common use case is when snapshots created by multiple teams must be loaded together into the same LocalStack instance. For example, a Platform team may create a snapshot containing VPCs, Subnets, S3 buckets, and SSM parameters. An Application team then produces their own snapshot (building on the first) that contains Lambda functions, S3 buckets, ECS images, and other application-level resources. It's therefore important to load multiple snapshots, one on top of the other.

LocalStack supports several _merge strategies_ to support loading a snapshot into an existing emulator instance. You can think of this as loading two or more snapshots into the same emulator instance, one after the other.

The chosen strategy can be passed to `lstk snapshot load` using the `--merge` option, or by setting the `LSTK_MERGE_STRATEGY` environment variable.

```bash
lstk snapshot load --merge=<strategy> <snapshot-file>
LSTK_MERGE_STRATEGY=<strategy> lstk snapshot load <snapshot-file>
```

#### `overwrite` strategy

This strategy completely resets the state of the instance before loading each new snapshot. This results in the instance containing the new snapshot's content, with resources from the older snapshot being completely discarded.

![Merging snapshots using `--merge=overwrite`](/images/aws/snapshot-merge-overwrite.png)

For this merge strategy, use the following:

```bash
lstk snapshot load snapshot1
lstk snapshot load --merge=overwrite snapshot2

lstk status                          
  [...]
  SNS      topic3                                                                     us-east-1  000000000000
  SQS      http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/queue-3  us-east-1  000000000000
```

#### `account-region-merge` strategy (**default**)

Merge snapshots at the service level, for any given account and region. For example, if the first snapshot contains an SQS queue (`queue-1`) in the `000000000000/us-east-1` region, and the second snapshot contains a different SQS queue (`queue-3`), also in the `000000000000/us-east-1`region, the first snapshot's SQS resources are discarded. This strategy does not consider whether that the SQS queues have different names, since _all_ SQS resources in that region are discarded.

![Merging snapshots using `--merge=account-region-merge`](/images/aws/snapshot-merge-account-region.png)

For this merge strategy, use the following:

```bash
lstk snapshot load snapshot1
lstk snapshot load --merge=account-region-merge snapshot2
```

```bash
lstk status
  [...]
  S3       bucket1                                                                         global          000000000000
  SNS      topic2                                                                          ap-southeast-2  000000000000
  SNS      topic3                                                                          us-east-1       000000000000
  SQS      http://sqs.ap-southeast-2.localhost.localstack.cloud:4566/000000000000/queue-2  ap-southeast-2  000000000000
  SQS      http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/queue-3       us-east-1       000000000000
```

#### `service-merge` strategy

This strategy performs fine-grained merging, similar to the `account-region-merge` strategy, but also considers the names of resources. For example, if each snapshot contains an SQS queue, but the queues have different names (`queue-1` vs `queue-3`), the merge contains both queues. If the names are the same, the resource from the newer snapshot is kept.

This is the same behaviour you'd expect if you applied two infrastructure-as-code stacks, one on top of the other.

![Merging snapshots using `--merge=service-merge`](/images/aws/snapshot-merge-service.png)

For this merge strategy, use the following:

```bash
lstk snapshot load snapshot1
lstk snapshot load --merge=service-merge snapshot2

lstk status
  [...]
  S3       bucket1                                                                         global          000000000000
  SNS      topic1                                                                          us-east-1       000000000000
  SNS      topic2                                                                          ap-southeast-2  000000000000
  SNS      topic3                                                                          us-east-1       000000000000
  SQS      http://sqs.ap-southeast-2.localhost.localstack.cloud:4566/000000000000/queue-2  ap-southeast-2  000000000000
  SQS      http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/queue-1       us-east-1       000000000000
  SQS      http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/queue-3       us-east-1       000000000000
```

## Using the LocalStack Console

The LocalStack Console allows saving a snapshot to a file, then loading it into another LocalStack instance.

![LocalStack Export/Import State Local Mode](/images/aws/export-import-state-local.png)

To save the snapshot, follow these steps:

1. Create AWS resources locally as needed.
2. Navigate to the **Local** tab within the [Export/Import State](https://app.localstack.cloud/inst/default/state) page.
3. Click on the **Export State** button.
  This action will initiate the download of a ZIP file.

The downloaded ZIP file contains your container state, which can be injected into another LocalStack instance for further use.

To load an existing snapshot, follow these steps:

1. Navigate to the **Local** tab within the [Export/Import State](https://app.localstack.cloud/inst/default/state) page.
2. Upload the ZIP file that contains your container state.
  This action will restore your previously loaded AWS resources.

To confirm the successful injection of the container state, visit the respective [Resource Browser](https://app.localstack.cloud/inst/default/resources) for the services and verify the resources.

:::note
Merge Strategies are not currently supported for file-based snapshots, using the LocalStack Console.
:::
