---
title: LocalStack CLI
description: Run the LocalStack Azure emulator with the LocalStack CLI.
template: doc
sidebar:
    order: 2
---

## Introduction

The `localstack` CLI is the original Python command-line interface for managing the emulator
container. It works with the Azure emulator, provided you point it at the Azure image.

:::tip
For new work prefer [`lstk`](/azure/developer-tools/running-localstack/lstk/), which handles
authentication, the image and the Azure CLI proxy without extra environment variables.
:::

## Install

```bash
pip install localstack
localstack --version
```

## Start the Azure emulator

The CLI defaults to a different emulator image, so `IMAGE_NAME` must be set:

```bash
export LOCALSTACK_AUTH_TOKEN="<your-auth-token>"
IMAGE_NAME=localstack/localstack-azure:latest ACTIVATE_PRO=1 localstack start -d
localstack wait -t 120
```

Confirm it is up and licensed:

```bash
curl -s http://localhost:4566/_localstack/health
```

```bash title="Output"
{"edition": "azure-alpha", "license": true}
```

`edition: azure-alpha` confirms you are talking to the Azure emulator.

## Environment variables that matter for Azure

| Variable | Value | Why |
|---|---|---|
| `IMAGE_NAME` | `localstack/localstack-azure:latest` | Selects the Azure image. Required — the CLI defaults to a different emulator. |
| `LOCALSTACK_AUTH_TOKEN` | your token | Required; the emulator will not start without one. |
| `ACTIVATE_PRO` | `1` | The Azure emulator is a licensed image. |
| `MSSQL_ACCEPT_EULA` | `Y` | Required by the Azure SQL Database samples. |
| `PERSISTENCE` | `1` | Persist state across restarts. |
| `DEBUG` / `LS_LOG` | `1` / `debug` | Verbose logs, worth enabling in CI. |

## Lifecycle

```bash
localstack status          # container and service status
localstack logs            # stream emulator logs
localstack stop            # stop the container
localstack restart         # restart it
```

## Related

- [lstk CLI](/azure/developer-tools/running-localstack/lstk/) — the recommended interface
- [CI Pipelines](/azure/ci-pipelines/) — running the emulator in automation
- `localstack --help` lists every flag; the lifecycle commands are product-independent.
