---
title: Configuration Options
description: Environment variables that change how the LocalStack Azure emulator behaves.
template: doc
sidebar:
    order: 2
---

## Introduction

The emulator is configured with environment variables passed to the container. This page covers the variables that matter for Azure.

## Starting the Azure emulator

| Variable | Value | Why |
|---|---|---|
| `IMAGE_NAME` | `localstack/localstack-azure:latest` | Selects the Azure image. Required — the CLI defaults to a different emulator. |
| `LOCALSTACK_AUTH_TOKEN` | your token | Required — the emulator will not start without one. |
| `ACTIVATE_PRO` | `1` | The Azure emulator is a licensed image. |

```bash
export LOCALSTACK_AUTH_TOKEN="<your-auth-token>"
IMAGE_NAME=localstack/localstack-azure:latest ACTIVATE_PRO=1 localstack start -d
```

Check which edition is running:

```bash
curl -s http://localhost:4566/_localstack/health
```

```bash title="Output"
{"edition": "azure-alpha", "license": true}
```

## Azure-specific options

These are read only by the Azure emulator.

| Variable | Default | Description |
|---|---|---|
| `LS_AZURE_ENFORCE_RBAC` | off | Evaluate Azure RBAC role assignments and reject requests whose principal lacks permission, on both the control and data plane. Off by default because enabling it changes behaviour for setups that work today without correct role assignments. |
| `LS_AZURE_FUNCTION_HOST_STARTUP_TIMEOUT` | `360` | Seconds to wait for a Function App runtime to report Running after deployment. A first start downloads the Functions extension bundle inside the container — hundreds of megabytes, more for non-HTTP triggers — so the default covers a cold cache. Later starts are quick. |
| `LS_AZURE_CONTAINER_CREATION_RETRIES` | `5` | Retries when creating a container fails. |
| `LS_AZURE_PORT_RESERVATION_DURATION` | `120` | Seconds a reserved port is held. |
| `LS_AZURE_MAP_HOST_PORTS` | auto | Map container ports to `localhost`. Enabled automatically under WSL when not running inside Docker; otherwise the container is reachable directly. Set it explicitly if your network setup needs host port mapping. |

### RBAC enforcement

By default the emulator does not enforce RBAC, so a request succeeds whether or not the principal
has a matching role assignment. Turn enforcement on to test that your role assignments are actually
correct:

```bash
IMAGE_NAME=localstack/localstack-azure:latest ACTIVATE_PRO=1 \
  LS_AZURE_ENFORCE_RBAC=1 localstack start -d
```

The operator principals — the SDK/Terraform default service principal and the `az` CLI principal
(`any-app`) — always bypass enforcement, so the identity you administer with is never locked out.
Managed identities and workload service principals *are* subject to it, which is what makes the
setting useful for testing
[role assignments](/azure/services/role-assignment/) and
[managed identity](/azure/services/managed-identity/) wiring.

### Function App startup

If Function App deployments time out on a cold machine, raise the timeout rather than retrying:

```bash
LS_AZURE_FUNCTION_HOST_STARTUP_TIMEOUT=600
```

## Other useful variables

| Variable | Value | Why |
|---|---|---|
| `MSSQL_ACCEPT_EULA` | `Y` | Required by the Azure SQL Database samples. |
| `LS_LOG` | `debug` | Per-request logging. See [Logging](/azure/customization/logging/). |
| `DEBUG` | `1` | Verbose startup output. |
| `DISABLE_EVENTS` | `1` | Suppress usage events, typically in CI. |

## Outbound network access

The emulator proxies most traffic, but some hosts are passed through because Azure tooling needs to
reach them — the Bicep parser download (`downloads.bicep.azure.com`, `aka.ms`), the Azure Functions
extension bundle (`cdn.functions.azure.com`, `functionscdn.azureedge.net`), NuGet
(`api.nuget.org`), `az` CLI extensions (`azcliprod.blob.core.windows.net`, `pypi.org`,
`files.pythonhosted.org`), GitHub for example templates, and DigiCert OCSP/CRL endpoints.

In an air-gapped or egress-filtered environment, Bicep transpilation and Function App deployment
will fail unless those hosts are reachable.

## State persistence

:::caution
Emulator state does **not** currently survive a restart. Verified against
`localstack/localstack-azure:latest` (edition `azure-alpha`) with both `PERSISTENCE=1` and
`lstk --persist`: resource groups and storage accounts created while persistence was active were
gone after the container restarted.

Treat each emulator run as ephemeral, and recreate resources from
[Infrastructure as Code](/azure/connecting/infrastructure-as-code/) rather than relying on state
carrying over. This is why Azure service pages carry no persistence badge.
:::

## Related

- [Running LocalStack](/azure/developer-tools/running-localstack/)
- [CI Pipelines](/azure/ci-pipelines/)
