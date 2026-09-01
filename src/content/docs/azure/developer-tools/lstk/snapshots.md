---
title: lstk Snapshots
description: Save, load, list, remove, and show emulator snapshots with lstk, including S3 remotes.
template: doc
tags: ['Hobby']
---

## `snapshot`

Manage emulator snapshots.
A snapshot captures the running emulator's state, either as a local file on disk, as a Cloud Pod on the LocalStack platform, or in your own S3 bucket.
The `snapshot` command groups five subcommands — `save`, `load`, `list`, `remove`, and `show`. The first two are also exposed as the top-level aliases `lstk save` and `lstk load`.

:::note
Snapshots are best supported on the **AWS emulator**.
`snapshot save`/`load` (and the `save`/`load` aliases) also work for the Snowflake emulator, but its snapshot support is experimental and not fully tested — `lstk` prints a warning such as `Snapshot support for the snowflake emulator is experimental and not fully tested.`
Azure emulator persistence is still a work in progress and is not yet supported.
:::

## `snapshot save`

Save a snapshot of the running emulator's state.
The emulator must already be running; this command does **not** auto-start it.

```bash
# Auto-named snapshot file in the current directory
lstk snapshot save

# Save to a specific local path
lstk snapshot save ./my-snapshot

# Save to a Cloud Pod on the LocalStack platform (requires auth)
lstk snapshot save pod:my-baseline

# Save to your own S3 bucket (pod name is auto-generated if omitted)
lstk snapshot save my-pod s3://my-bucket/prefix

# Limit the snapshot to a subset of services
lstk snapshot save --services s3,lambda
```

The optional `[destination]` argument takes one of these forms:

| Destination                     | Description                                                                                     |
|:---------------------------------|:--------------------------------------------------------------------------------------------------|
| (omitted)                       | Auto-generates a timestamped snapshot file in the current directory (`./snapshot-<timestamp>-<hex>.snapshot`). |
| local path                      | Writes a snapshot archive to that path. The `.snapshot` extension is forced.                     |
| `pod:<name>`                    | Saves a Cloud Pod to the LocalStack platform. Requires authentication.                           |
| `<pod-name> s3://bucket/prefix` | Saves to your own S3 bucket. The pod name is a separate positional (auto-generated when omitted). See [S3 remotes](#s3-remotes). |

Pod operations require an auth token (`LOCALSTACK_AUTH_TOKEN` or a prior `lstk login`); local-file snapshots do not.

By default a snapshot captures every service's state. Pass `-s`/`--services` with a comma-separated list to limit it to a subset; this applies uniformly to local files, `pod:` Cloud Pods, and `s3://` remotes.

| Option              | Description                                                                                   |
|:--------------------|:------------------------------------------------------------------------------------------------|
| `--services <list>`, `-s <list>` | Comma-separated list of services to include in the snapshot (all services by default). Applies to local, `pod:`, and `s3://` destinations. |
| `--profile <name>`  | AWS profile to read S3 credentials from (used only for `s3://` destinations). Defaults to `AWS_*` env vars, then `AWS_PROFILE`. |

## `snapshot load`

Load a snapshot into the emulator, **auto-starting it first** if it is not already running.

```bash
# Load a local snapshot by path or name
lstk snapshot load my-baseline
lstk snapshot load ./checkpoint

# Load from a Cloud Pod (requires auth)
lstk snapshot load pod:my-baseline

# Load from your own S3 bucket (pod name is required)
lstk snapshot load my-pod s3://my-bucket/prefix

# Control how the snapshot merges with running state
lstk snapshot load pod:my-baseline --merge=overwrite

# Preview what a Cloud Pod load would change, without applying it
lstk snapshot load pod:my-baseline --dry-run
```

The `REF` argument is required and identifies a local path/name or a `pod:<name>` Cloud Pod.
To load from S3, pass the pod name followed by an `s3://bucket/prefix` location (see [S3 remotes](#s3-remotes)).

| Option               | Description                                                                                              |
|:---------------------|:------------------------------------------------------------------------------------------------------------|
| `--merge <strategy>` | How the loaded state combines with running state. One of `account-region-merge` (default), `overwrite`, `service-merge`. |
| `--dry-run`          | Preview the resource additions and modifications the load would produce, per service, without changing any state. Supported for `pod:` refs only; requires a running emulator (it does not auto-start one). |
| `--profile <name>`   | AWS profile to read S3 credentials from (used only for `s3://` sources). Defaults to `AWS_*` env vars, then `AWS_PROFILE`. |

- `account-region-merge` (default): the snapshot wins on any `(service, account, region)` overlap.
- `overwrite`: running state is reset first, then the snapshot is imported onto a clean state.
- `service-merge`: the snapshot wins per resource; non-overlapping resources are combined.

Set [`LSTK_MERGE_STRATEGY`](/azure/developer-tools/lstk/automation/#environment-variables) to change the default strategy used when `--merge` is not passed; an explicit `--merge` always wins.

Pass `--dry-run` with a `pod:` ref to preview a load before committing to it: `lstk` queries the platform and prints, per service, how many resources the snapshot would add or modify under the chosen merge strategy, without touching running state. It is supported for `pod:` refs only (other refs are rejected) and requires the emulator to already be running, since it does not auto-start one.

### `save`/`load` aliases

`snapshot save` and `snapshot load` are also exposed as the top-level aliases `lstk save` and `lstk load`. The aliases behave identically:

```bash
lstk save pod:my-baseline
lstk load ./checkpoint
```

## `snapshot list`

List the Cloud Pod snapshots available on the LocalStack platform.
By default, only snapshots you created are listed; pass `--all` to include every snapshot in your organization.
This subcommand operates on Cloud Pods, so it requires authentication.

```bash
# Snapshots you created
lstk snapshot list

# Every snapshot in your organization
lstk snapshot list --all

# List snapshots in your own S3 bucket (requires a running emulator)
lstk snapshot list s3://my-bucket/prefix
```

Passing an `s3://bucket/prefix` location lists snapshots stored in your own S3 bucket instead of the platform (see [S3 remotes](#s3-remotes)). Unlike the platform listing, this queries the emulator, so it requires a running emulator.

| Option             | Description                                                  |
|:--------------------|:--------------------------------------------------------------|
| `--all`            | List all snapshots in your organization, not just your own.  |
| `--profile <name>` | AWS profile to read S3 credentials from (used only with an `s3://` location). Defaults to `AWS_*` env vars, then `AWS_PROFILE`. |

## `snapshot remove`

Delete a Cloud Pod snapshot from the LocalStack platform.
Only cloud snapshots (the `pod:` prefix) can be removed; local snapshots are plain files you delete yourself.
This operation cannot be undone.

```bash
lstk snapshot remove pod:my-baseline

# Skip the confirmation prompt (required in non-interactive mode)
lstk snapshot remove pod:my-baseline --force
```

The required `REF` argument must be a `pod:<name>` Cloud Pod reference.

| Option    | Description                                                            |
|:----------|:-------------------------------------------------------------------------|
| `--force` | Skip the confirmation prompt. Required when running non-interactively. |

## `snapshot show`

Show metadata for a single Cloud Pod snapshot on the LocalStack platform: its name, created date, size, LocalStack version, message, the services it contains, and per-service resource counts (resource counts render only when the platform has them for that snapshot).
This subcommand is cloud-only and requires authentication.

```bash
lstk snapshot show pod:my-baseline
```

The required `REF` argument must be a `pod:<name>` Cloud Pod reference.

## S3 remotes

`snapshot save`, `load`, and `list` can target a snapshot stored in your **own S3 bucket** by passing an `s3://bucket/prefix` location.
The pod name (the snapshot's identity within the bucket) is a positional separate from the `s3://` location — required for `load`, auto-generated for `save` when omitted, and unused for `list`.

```bash
lstk snapshot save my-pod s3://my-bucket/prefix
lstk snapshot load my-pod s3://my-bucket/prefix
lstk snapshot list s3://my-bucket/prefix
```

Credentials follow AWS CLI precedence: `--profile <name>` wins, otherwise the static `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` (plus optional `AWS_SESSION_TOKEN`) environment variables, otherwise the profile named by `AWS_PROFILE`.
Only static credentials are supported (no SSO, assume-role, or `credential_process`), and credentials must never be embedded in the URL.

`lstk` runs a pre-flight check that the target bucket exists and errors out rather than letting the emulator auto-create a bucket on a typo.
Because the transfer is performed by the emulator (not the CLI), S3 remotes require a **running emulator**, and `list s3://…` in particular queries the emulator rather than the platform API.

:::note
`remove` and `show` do not support S3; they operate on Cloud Pods only.
:::
