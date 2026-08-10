---
title: Logging
description: Control and read LocalStack Azure emulator logs.
template: doc
sidebar:
    order: 3
---

## Introduction

The emulator writes logs to the container's stdout. They are the first place to look when a request
behaves differently from real Azure.

## Reading logs

```bash
lstk logs --follow          # via lstk
localstack logs             # via the LocalStack CLI
docker logs -f localstack-main
```

## Log level

`LS_LOG` controls verbosity:

| Value | Use |
|---|---|
| `warning` | default |
| `info` | request-level summary |
| `debug` | every request with its resolved provider method |
| `trace` | adds request and response bodies |
| `trace-internal` | adds internal calls; very noisy |

```bash
IMAGE_NAME=localstack/localstack-azure:latest ACTIVATE_PRO=1 LS_LOG=debug localstack start -d
```

At `debug`, each Azure request appears with the provider method that handled it:

```text title="Output"
DEBUG --- l.p.a.s.g.h.service_reques : invoking function <bound method ResourcesImpl.resource_groups__create_or_update ...>
DEBUG --- l.p.a.s.g.h.service_reques : PUT localhost.localstack.cloud:4566/subscriptions/00000000-.../resourcegroups/MyResourceGroup ==> 201
```

That line is the quickest way to tell whether an operation is implemented: an unimplemented one
never reaches a provider method.

## In CI

Set `LS_LOG=debug` and always upload the logs as an artifact, including on failure — those are the
runs where you need them. See [CI Pipelines](/azure/ci-pipelines/github-actions/).

## Related

- [Configuration Options](/azure/customization/configuration-options/)
- [Help & Support](/azure/help-support/)
