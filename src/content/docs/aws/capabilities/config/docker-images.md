---
title: Docker Images
description: Overview of LocalStack Docker images and their purpose
template: doc
---

LocalStack functions as a local “mini-cloud” operating system that runs inside a Docker container.
LocalStack has multiple components, which include process management, file system abstraction, event processing, schedulers, and more.
Running inside a Docker container, LocalStack exposes external network ports for integrations, SDKs, or CLI interfaces to connect to LocalStack APIs.
The LocalStack & LocalStack Pro Docker images have been downloaded over 130+ million times and provide a multi-arch build compatible with AMD/x86 and ARM-based CPU architectures.
This section will cover the different Docker images available for LocalStack and how to use them.

## LocalStack Community image

The LocalStack Community image (`localstack/localstack`) contains the community and open-source version of our [core cloud emulator](https://github.com/localstack/localstack).
To use the LocalStack Community image, you can pull the image from Docker Hub:

```bash
docker pull localstack/localstack:latest
```

To use the LocalStack Community image, you don't need to sign-up for an account on [LocalStack Web Application](https://app.localstack.cloud).
The Community image is free to use and does not require a license to run.
The Community image can be used to run [local AWS services](/aws/services/) with [integrations](/aws/integrations/) on your local machine or in your [continuous integration pipelines](/aws/integrations/continuous-integration/).

The Community image also covers a limited set of [LocalStack Tools](/aws/tooling/) to make your life as a cloud developer easier.
You can use [LocalStack Desktop](/aws/capabilities/web-app/localstack-desktop/) or [LocalStack Docker Extension](/aws/tooling/localstack-docker-extension) to use LocalStack with a graphical user interface.

You can use the Community image to start your LocalStack container using various [installation methods](/aws/getting-started/installation/).
While configuring to run LocalStack with Docker or Docker Compose, run the `localstack/localstack` image with the appropriate tag you have pulled (if not `latest`).

## LocalStack Pro image

LocalStack Pro contains various advanced extensions to the LocalStack base platform.
With LocalStack Pro image, you can access all the emulated AWS cloud services running entirely on your local machine.
To use the LocalStack Pro image, you can pull the image from Docker Hub:

```bash
docker pull localstack/localstack-pro:latest
```

To use the LocalStack Pro image, you must configure an environment variable named `LOCALSTACK_AUTH_TOKEN` to contain your Auth Token.
The LocalStack Pro image will display a warning if you do not set an Auth Token (or if the license is invalid/expired) and will not activate the Pro features.
LocalStack Pro gives you access to the complete set of LocalStack features, including the [LocalStack Web Application](https://app.localstack.cloud) and [dedicated customer support](/aws/getting-started/help-support/#enterprise-support).

You can use the Pro image to start your LocalStack container using various [installation methods](/aws/getting-started/installation/).
While configuring to run LocalStack with Docker or Docker Compose, run the `localstack/localstack-pro` image with the appropriate tag you have pulled (if not `latest`).

:::note
Earlier, we maintained `localstack/localstack-light` and `localstack/localstack-full` images.
They have been deprecated and are removed with the LocalStack 2.0 release.
The [BigData image](https://hub.docker.com/r/localstack/bigdata/tags), which started as a `bigdata_container` container, has also been deprecated in favor of a BigData Mono container which installs dependencies directly into the LocalStack (`localstack-main`) container.
:::

## Image tags

We use tags for versions with significant features, enhancements, or bug fixes - following [semantic versioning](https://semver.org).
To ensure that we move quickly and steadily, we run nightly builds, where all our updates are available on the `latest` tag of LocalStack's Docker image.
We intend to announce more significant features and enhancements during major & minor releases.
We occasionally create patch releases for minor bug fixes and enhancements, to ensure that we can deliver changes quickly while not breaking your existing workflows (in case you prefer not to use `latest`).

To check out the various tags available for LocalStack, you can visit the [LocalStack Community](https://hub.docker.com/r/localstack/localstack/tags?page=1&ordering=last_updated) & [LocalStack Pro](https://hub.docker.com/r/localstack/localstack-pro/tags?page=1&ordering=last_updated) Docker Hub pages.
