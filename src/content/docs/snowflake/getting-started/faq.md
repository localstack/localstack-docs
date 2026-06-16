---
title: FAQ
description: Frequently asked questions about LocalStack for Snowflake
template: doc
sidebar:
  order: 3
---

## Core FAQs

### Are Snowflake v2 APIs supported?

Yes, the LocalStack for Snowflake supports the Snowflake v2 SQL API (`/api/v2/*` endpoints), as well as the legacy v1 SQL API (which is still being used by a large portion of Snowflake client libraries and SDKs)

### Why are my Snowflake tests failing?

LocalStack for Snowflake is now GA. If your tests are failing, it could be due to a lack of support for certain Snowflake features. We recommend checking the [function coverage](/snowflake/sql-functions/) to see the list of supported SQL functions and [feature coverage](/snowflake/feature-coverage/) to see the list of supported features. If you encounter any issues, you can connect with us for [support](#support-faqs).

### Why does the LocalStack for Snowflake run on `snowflake.localhost.localstack.cloud`?

The LocalStack for Snowflake operates on `snowflake.localhost.localstack.cloud`. This is a DNS name that resolves to a local IP address (`127.0.0.1`) to make sure the connector interacts with the local APIs. In addition, we also publish an SSL certificate that is automatically used inside LocalStack, in order to enable HTTPS endpoints with valid certificates.

Note: In case you are deploying the LocalStack for Snowflake in a Kubernetes cluster or some other non-local environment, you may need to add an entry to the `/etc/hosts` file of any client machine or Kubernetes pod that attempts to connect to the LocalStack for Snowflake pod via the `snowflake.localhost.localstack.cloud` domain name.

## Integration FAQs

### How do I enable detailed debug logs?

You can set the `SF_LOG=trace` environment variable in the Snowflake container to enable detailed trace logs that show all the request/response message.

When using `docker-compose` then simply add this variable to the `environment` section of the YAML configuration file.
If you're starting up via the `localstack start` CLI, then make sure to start up via the following configuration:

```bash
DOCKER_FLAGS='-e SF_LOG=trace' DEBUG=1 localstack start --stack snowflake
```

### The `snowflake.localhost.localstack.cloud` hostname doesn't resolve on my machine, what can I do?

On some systems, including some newer versions of MacOS, the domain name `snowflake.localhost.localstack.cloud` may not resolve properly.
If you are encountering network issues and your Snowflake client drivers are unable to connect to the emulator, you may need to manually add the following entry to your `/etc/hosts` file:

```bash
127.0.0.1	snowflake.localhost.localstack.cloud
```

### Which Docker image tag should I use for LocalStack for Snowflake?

As of the LocalStack for Snowflake 2026.05.0 release, the published Docker image tags follow the same policy used across the wider LocalStack image set:

| Tag | Updated when | Recommended for |
|---|---|---|
| `latest` / `stable` | Tagged releases only (e.g. `2026.05.0`) | Most users, stable, release-quality builds |
| `dev` | Every merged commit on `main` (the main development branch) | Users who need the latest unreleased changes |
| `YYYY.MM.patch` (e.g. `2026.05.0`) | Never (pinned) | Fully reproducible environments where no changes are acceptable |

Previously, `latest` tracked untagged changes from `main`. It now mirrors `stable` and is only updated on official tagged releases. If you were relying on `localstack/snowflake:latest` to pick up the most recent unreleased changes (for example, in CI or Docker Compose), switch to the `dev` tag instead.

The `nightly` tag is no longer published for LocalStack for Snowflake. Use the `dev` tag to track untagged changes from `main`.

## Support FAQs

### How can I get help or support with LocalStack for Snowflake?

If you're experiencing an issue with LocalStack for Snowflake, read our [Help & Support Guide](https://docs.localstack.cloud/snowflake/help-support/) for developers and enterprise teams.
