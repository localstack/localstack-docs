---
title: Installation
description: Basic installation guide to get started with LocalStack for Snowflake.
template: doc
sidebar:
    order: 0
---

## Introduction

You can use the Snowflake Docker image to run the Snowflake emulator.
The Snowflake Docker image is available on the [LocalStack Docker Hub](https://hub.docker.com/r/localstack/snowflake).
To pull the Snowflake Docker image, execute the following command:

```bash
docker pull localstack/snowflake
```

You can start the Snowflake Docker container using the following methods:

1. [`localstack` CLI](/snowflake/getting-started/#localstack-cli)
2. [`docker` CLI](https://docs.docker.com/get-docker/)
2. [Docker Compose](https://docs.docker.com/compose/install/)

:::note
Before starting, ensure you have a valid `LOCALSTACK_AUTH_TOKEN` to access the Snowflake emulator. Refer to the [Auth Token guide](https://docs.localstack.cloud/getting-started/auth-token/) to obtain your Auth Token and specify it in the `LOCALSTACK_AUTH_TOKEN` environment variable.
:::

### `localstack` CLI

To start the Snowflake Docker container using the `localstack` CLI, execute the following command:

```bash
export LOCALSTACK_AUTH_TOKEN=<your_auth_token>
IMAGE_NAME=localstack/snowflake localstack start
```

### `docker` CLI

To start the Snowflake Docker container using the `docker` CLI, execute the following command:

```bash showLineNumbers
docker run \
    --rm -it \
    -p 127.0.0.1:4566:4566 \
    -p 127.0.0.1:4510-4559:4510-4559 \
    -p 127.0.0.1:443:443 \
    -e LOCALSTACK_AUTH_TOKEN=${LOCALSTACK_AUTH_TOKEN:?} \
    localstack/snowflake
```

### Docker Compose

Create a `docker-compose.yml` file with the specified content:

```yaml showLineNumbers
version: "3.8"

services:
  localstack:
    container_name: "localstack-snowflake"
    image: localstack/snowflake
    ports:
      - "127.0.0.1:4566:4566"
      - "127.0.0.1:4510-4559:4510-4559"
      - "127.0.0.1:443:443"
    environment:
      - LOCALSTACK_AUTH_TOKEN=${LOCALSTACK_AUTH_TOKEN:?}
    volumes:
      - "./volume:/var/lib/localstack"
```

Start the Snowflake Docker container with the following command:

```bash
docker-compose up
```

## Updating

To update the Snowflake Docker container, pull the latest image and restart the container. The `latest` tag is the nightly build of the Snowflake Docker image.

## Troubleshooting

### How to check if the Snowflake emulator is running?

You can check if the Snowflake emulator is running by executing the following command:

```bash
curl -d '{}' snowflake.localhost.localstack.cloud:4566/session
```

The response should be:

```bash
{"success": true}
```

### How to enable detailed debug logs?

You can set the `SF_LOG=trace` environment variable in the Snowflake container to enable detailed trace logs that show all the request/response message.

When using `docker-compose` then simply add this variable to the `environment` section of the YAML configuration file.
If you're starting up via the `localstack start` CLI, then make sure to start up via the following configuration: 

```bash
DOCKER_FLAGS='-e SF_LOG=trace' DEBUG=1 IMAGE_NAME=localstack/snowflake localstack start
```

### The `snowflake.localhost.localstack.cloud` hostname doesn't resolve on my machine, what can I do?

On some systems, including some newer versions of MacOS, the domain name `snowflake.localhost.localstack.cloud` may not resolve properly.
If you are encountering network issues and your Snowflake client drivers are unable to connect to the emulator, you may need to manually add the following entry to your `/etc/hosts` file:

```bash
127.0.0.1	snowflake.localhost.localstack.cloud
```

## Next steps

Now that the Snowflake emulator is installed, you can use it for developing and testing your Snowflake data pipelines. Refer to our [Quickstart](/snowflake/getting-started/quickstart/) guide to get started.
