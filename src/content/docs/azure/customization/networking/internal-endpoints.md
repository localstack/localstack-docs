---
title: Internal Endpoints
description: LocalStack's own HTTP endpoints for inspecting the running Azure emulator.
template: doc
sidebar:
    order: 3
---

## Introduction

Alongside the Azure APIs, the emulator exposes a small set of endpoints under `/_localstack/` for
inspecting and controlling the instance itself. They are not part of Azure and have no equivalent in
a real subscription.

## Health

```bash
curl -s http://localhost:4566/_localstack/health
```

```bash title="Output"
{"edition": "azure-alpha", "license": true}
```

`edition` is the quickest way to confirm you are talking to the Azure emulator rather than another
LocalStack image, and `license` confirms the Auth Token was accepted. This is the endpoint to poll
in a CI job before running tests.

## Resource Manager metadata discovery

The emulator serves the Azure Resource Manager metadata document that client libraries use to
discover endpoints:

```bash
curl -s "http://localhost:4566/metadata/endpoints?api-version=2022-09-01"
```

```json title="Output"
{
  "portal": "https://app.localstack.cloud",
  "authentication": {
    "loginEndpoint": "https://azure.localhost.localstack.cloud:4566",
    "audiences": ["https://azure.localhost.localstack.cloud:4566"],
    "tenant": "common",
    "identityProvider": "AAD"
  },
  "name": "AzureCloud"
}
```

This is what `metadata_host` points at for Terraform and Pulumi. See
[Credentials](/azure/connecting/credentials/) for the per-tool settings.

## State reset

Clears all emulator state without restarting the container:

```bash
curl -X POST http://localhost:4566/_localstack/state/reset
```

Useful between test suites, given that
[state does not persist across restarts](/azure/customization/configuration-options/#state-persistence)
anyway.

## Related

- [Networking](/azure/customization/networking/)
- [Credentials](/azure/connecting/credentials/)
- [Logging](/azure/customization/logging/)
