---
title: Docker Images
description: Overview of LocalStack Docker images and their purpose, their tags, and when to use each.
template: doc
---

LocalStack functions as a local “mini-cloud” operating system that runs inside a Docker container.
LocalStack has multiple components, which include process management, file system abstraction, event processing, schedulers, and more.
Running inside a Docker container, LocalStack exposes external network ports for integrations, SDKs, or CLI interfaces to connect to LocalStack APIs.
The LocalStack & LocalStack for Azure Docker images have been downloaded over 130+ million times and provide a multi-arch build compatible with AMD/x86 and ARM-based CPU architectures.
This section will cover the different Docker images available for LocalStack and how to use them.

## LocalStack for Azure image

LocalStack for Azure contains various advanced extensions to the LocalStack base platform.
With the LocalStack for Azure image, you can access all the emulated Azure services running entirely on your local machine.
To use the LocalStack for Azure image, you can pull the image from Docker Hub:

```bash
docker pull localstack/localstack-azure:latest
```

To use the LocalStack for Azure image, you must configure an environment variable named `LOCALSTACK_AUTH_TOKEN` to contain your Auth Token.
The LocalStack for Azure image will display a warning if you do not set an Auth Token (or if the license is invalid/expired) and will not activate the Pro features.
LocalStack for Azure gives you access to the complete set of LocalStack features, including the [LocalStack Web Application](https://app.localstack.cloud) and [dedicated customer support](/azure/help-support/get-help/).

You can use the LocalStack for Azure image to start your LocalStack container using various [installation methods](/azure/getting-started/installation/).
While configuring to run LocalStack with Docker or Docker Compose, run the `localstack/localstack-azure` image with the appropriate tag you have pulled (if not `latest`).

## Image tags

Starting with the end-of-March 2026 release, LocalStack version tags follow [calendar versioning](https://calver.org/) in the `YYYY.MM.patch` format (for example, `2026.03.0`). Releases up to and including `v4.14.0` use [semantic versioning](https://semver.org).

The following tags are available for the LocalStack Docker image:

| Tag | Updated when | Recommended for |
|---|---|---|
| `latest` / `stable` | Tagged releases only (e.g. `2026.05.0`) | Most users — stable, release-quality builds |
| `dev` | Every merged commit on `main` | Users who need the latest unreleased changes |
| `YYYY.MM` (e.g. `2026.05`) | Each patch release within that month | Users who want bugfixes but want to avoid feature changes |
| `YYYY.MM.patch` (e.g. `2026.05.0`) | Never (pinned) | Fully reproducible environments where no changes are acceptable |

:::note
As of May 2026, `latest` was changed to mirror `stable` and is only updated on official tagged releases. If you previously relied on `latest` for the most recent unreleased changes, switch to the `dev` tag.

The `nightly` tag is no longer published for LocalStack for Azure. Use the `dev` tag to track untagged changes from `main`.

:::

Visit the [LocalStack for Azure tag](https://hub.docker.com/r/localstack/localstack-azure/tags?page=1&ordering=last_updated) page on Docker Hub.