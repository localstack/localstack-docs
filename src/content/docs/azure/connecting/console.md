---
title: LocalStack Console
description: Manage the LocalStack Azure emulator from the LocalStack Web Application.
template: doc
sidebar:
    order: 4
---

## Introduction

The [LocalStack Web Application](https://app.localstack.cloud) manages your account and your running
instances. It is product-independent, so an Azure instance appears there as soon as it is running and
reachable.

## Connect an instance

1. Start the emulator — see [Running LocalStack](/azure/developer-tools/running-localstack/).
2. Open [app.localstack.cloud](https://app.localstack.cloud) and sign in with the account whose
   [Auth Token](/azure/getting-started/auth-token/) the emulator is using.
3. The default instance points at `localhost:4566`. If you run on another host or port — or inside
   Kubernetes — add an instance with that endpoint.

The instance overview reports the running edition. For an Azure emulator this is `azure-alpha`, the
same value returned by:

```bash
curl -s http://localhost:4566/_localstack/health
```

```bash title="Output"
{"edition": "azure-alpha", "license": true}
```

## What the console gives you

| Feature | Notes |
|---|---|
| Instance status and health | Product-independent. |
| Logs | The same stream as `lstk logs`. See [Logging](/azure/customization/logging/). |
| Workspace, users and licences | Account-level, shared across products. |
| Auth Token management | See [Auth Token](/azure/getting-started/auth-token/). |

:::caution
The **Resource Browser** — the visual explorer for created resources — is built out per service and
its Azure coverage is not documented. Treat the Azure CLI as the reliable way to inspect emulator
state:

```bash
lstk az start-interception
az group list -o table
az resource list -o table
```

:::

## Alternatives for inspecting state

- **Azure CLI** — `az resource list` is the most complete view, since it queries the same Resource
  Manager surface the emulator implements.
- **[LocalStack Desktop](/azure/developer-tools/running-localstack/localstack-desktop/)** — a
  desktop client for the same instance controls.
- **Service-specific tools** — Storage Explorer, MongoDB Compass, SSMS and the Cosmos DB Data
  Explorer all work against emulator endpoints; several
  [sample applications](/azure/sample-apps/) show them in use.

## Related

- [Credentials](/azure/connecting/credentials/)
- [Auth Token](/azure/getting-started/auth-token/)
- [Running LocalStack](/azure/developer-tools/running-localstack/)
