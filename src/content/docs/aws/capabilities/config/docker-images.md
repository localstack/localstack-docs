---
title: Docker Images
description: Overview of LocalStack Docker images and their purpose
template: doc
---

LocalStack functions as a local “mini-cloud” operating system that runs inside a Docker container.
LocalStack has multiple components, which include process management, file system abstraction, event processing, schedulers, and more.
Running inside a Docker container, LocalStack exposes external network ports for integrations, SDKs, or CLI interfaces to connect to LocalStack APIs.
The LocalStack & LocalStack for AWS Docker images have been downloaded over 130+ million times and provide a multi-arch build compatible with AMD/x86 and ARM-based CPU architectures.
This section will cover the different Docker images available for LocalStack and how to use them.

## LocalStack for AWS image

LocalStack for AWS contains various advanced extensions to the LocalStack base platform.
With LocalStack for AWS image, you can access all the emulated AWS cloud services running entirely on your local machine.
To use the LocalStack for AWS image, you can pull the image from Docker Hub:

```bash
docker pull localstack/localstack:latest
```

To use the LocalStack for AWS image, you must configure an environment variable named `LOCALSTACK_AUTH_TOKEN` to contain your Auth Token.
The LocalStack for AWS image will display a warning if you do not set an Auth Token (or if the license is invalid/expired) and will not activate the Pro features.
LocalStack for AWS gives you access to the complete set of LocalStack features, including the [LocalStack Web Application](https://app.localstack.cloud) and [dedicated customer support](/aws/help-support/get-help/).

You can use the LocalStack for AWS image to start your LocalStack container using various [installation methods](/aws/getting-started/installation/).
While configuring to run LocalStack with Docker or Docker Compose, run the `localstack/localstack-pro` image with the appropriate tag you have pulled (if not `latest`).

## Image tags

Starting with the end-of-March 2026 release, LocalStack version tags follow
[calendar versioning](https://calver.org/) in the `YYYY.MM.patch` format (for example, `2026.03.0`).

Releases up to and including `v4.14.0` use [semantic versioning](https://semver.org).
To ensure that we move quickly and steadily, we run nightly builds, where all our updates are available on the `latest` tag of LocalStack's Docker image.
We intend to announce more significant features and enhancements during major & minor releases.
We occasionally create patch releases for minor bug fixes and enhancements, to ensure that we can deliver changes quickly while not breaking your existing workflows (in case you prefer not to use `latest`).

Visit the [LocalStack for AWS tag](https://hub.docker.com/r/localstack/localstack-pro/tags?page=1&ordering=last_updated) in Docker Hub pages.
