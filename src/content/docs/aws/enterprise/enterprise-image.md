---
title: Enterprise Image
description: Custom LocalStack Enterprise image for offline or air-gapped environments with preferred configurations and packages.
template: doc
sidebar:
    order: 2
tags: ["Enterprise"]
---

## Introduction

LocalStack offers an Enterprise image that allows offline usage and includes a customer-specific configuration.
This offline functionality is enabled by:

- Pre-installed packages required for running specific services that are usually downloaded on demand (such as `opensearch` or `dynamodb-local`).
- A certificate keypair for `localhost.localstack.cloud` to resolve to the LocalStack container via our DNS server.
- An embedded decryption key in the image, eliminating the need to contact the license server to operate LocalStack.

## Why use Enterprise Image?

- **Airgapped environments**: The Enterprise image is ideal for customers who operate in airgapped environments where internet access is restricted.
- **Security Fixes**: The Enterprise image is updated with the latest security fixes and patches including container image scans on a priority basis.
- **Custom Configuration**: The Enterprise image can be customized to include specific packages and configurations required by the customer.
- **CI Usage**: The Enterprise image can be used in CI/CD pipelines to ensure that the same image is used across all environments.

## How to use the image?

- After the image is pushed to the customer-specific ECR repository, the customer can pull and push it to their internal Docker registry.
- Developers within the customer’s network can then pull the image from this registry.
- To use the image from the command line interface (CLI), set the `IMAGE_NAME` configuration to the name of the Enterprise image, typically using the command:
    ```bash
    IMAGE_NAME=localstack-enterprise localstack start
    ```

## "Online" vs "Offline" image

This section compares the standard [LocalStack for AWS Docker image](/aws/capabilities/config/docker-images) ("online") with the customer-specific Enterprise image ("offline").

### Key differences

| Area | Standard image | Enterprise image |
|---|---|---|
| Internet requirement for core startup | Requires network access for normal [license activation](/aws/getting-started/auth-token). | Designed to run without internet access in air-gapped environments. |
| License behavior | Activates via LocalStack licensing endpoints. If unreachable, LocalStack attempts offline activation and requires re-activation every 24 hours. | Includes an embedded keypair/decryption key so LocalStack can run without contacting the license server. |
| Service dependencies | Some services may download dependencies on demand during runtime. | Service dependencies are pre-baked into the image for offline usage. |
| Cloud Pods | Platform remote integration can sync state with your LocalStack account. | LocalStack Platform remotes are typically unavailable in fully air-gapped setups. Use self-managed remotes (for example S3 or ORAS) when available in your environment. |
| Ephemeral instances | Available via Web App/CLI as cloud-hosted LocalStack runtimes. | Not available in air-gapped/offline deployments because they run on LocalStack Cloud infrastructure. |
| Telemetry | Can send usage events for features such as [Stack Insights](/aws/capabilities/web-app/stack-insights). | Keep event reporting disabled (`DISABLE_EVENTS=1`) for strict offline setups. |

### What communicates with LocalStack Cloud?

The main integrations are:

- **License activation**: The standard image performs online activation using your `LOCALSTACK_AUTH_TOKEN`. See [Auth Token](/aws/getting-started/auth-token) for activation behavior and fallbacks.
- **Event reporting (telemetry)**: Used for Stack Insights and related usage analytics. You can disable this via `DISABLE_EVENTS=1`.
- **Cloud Pods (platform remote)**: Saving/loading pods against the default platform remote uses LocalStack-managed infrastructure. For stricter data residency, configure your own Cloud Pods [remote storage](/aws/developer-tools/snapshots/cloud-pods#remotes).
- **Ephemeral instances**: These are managed cloud instances and therefore require connectivity to LocalStack Cloud services.

### Recommended setup for offline environments

- Use the **offline Enterprise image** when no outbound connectivity is permitted.
- Keep `DISABLE_EVENTS=1` to prevent event reporting.
- Prefer local persistence or self-managed Cloud Pod remotes instead of platform remotes.
- Do not rely on Ephemeral Instances in fully isolated networks; run LocalStack directly in your controlled environment instead.