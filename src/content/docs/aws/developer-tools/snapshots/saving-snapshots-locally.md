---
title: Saving snapshots locally
description: Saving and loading snapshots from local files.
template: doc
tags: ["Base"]
sidebar:
    order: 2
---

With Snapshots, you can save the state of your LocalStack instance to a file on disk, then load it back at a later time. This concept is similar to desktop-based word processors, spreadsheets, or practically any software that allows saving and loading the program state.

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
