---
title: Official Extensions
description: Browse the official and community LocalStack Extensions available on the marketplace.
template: doc
sidebar:
  order: 5
tags: ['Hobby']
---

## Introduction

The tables below list the extensions currently available on the [LocalStack marketplace](https://app.localstack.cloud/extensions/library), and are kept up to date automatically.

You can install any of the extensions below with the LocalStack CLI:

```bash
localstack extensions install <extension-name>
```

See [Managing extensions](/aws/tooling/extensions/managing-extensions) for more details on installing, listing, and removing extensions.

:::note
This page is auto-generated from the LocalStack marketplace API. Extensions marked with <sup>UI</sup> ship with a web UI.
:::

## Official Extensions

Extensions built and maintained by the LocalStack team.

| Extension | Description | Author | Install |
|-----------|-------------|--------|---------|
| AWS Proxy <sup>UI</sup> | Proxy requests from your LocalStack instance to real AWS resources | LocalStack | `localstack extensions install localstack-extension-aws-proxy` |
| Diagnosis Viewer | View the diagnostics endpoint directly in localstack | LocalStack | `localstack extensions install localstack-extension-diagnosis-viewer` |
| Hello World | A minimal LocalStack extension | LocalStack | `localstack extensions install localstack-extension-hello-world` |
| httpbin <sup>UI</sup> | A simple HTTP Request & Response Service directly in LocalStack | LocalStack | `localstack extensions install localstack-extension-httpbin` |
| MailHog <sup>UI</sup> | Web and API based SMTP testing directly in LocalStack using MailHog | LocalStack | `localstack extensions install localstack-extension-mailhog` |
| Miniflare | This extension makes Miniflare (dev environment for Cloudflare workers) available directly in LocalStack | LocalStack | `localstack extensions install localstack-extension-miniflare` |
| Resource Graph <sup>UI</sup> | Altimeter based LocalStack extension that allows you to create and import into neptune a graph of the resources in your LocalStack instance | LocalStack | `localstack extensions install localstack-extension-resource-graph` |
| Stripe | A LocalStack extension that provides a mocked version of Stripe as a service | LocalStack | `localstack extensions install localstack-extension-stripe` |
| Terraform Init Hooks | Use Terraform files as initialization hooks to pre-seed your LocalStack instance automatically | Thomas Rausch | `localstack extensions install localstack-extension-terraform-init` |

## Community Extensions

Extensions contributed and maintained by the LocalStack community and partners.

| Extension | Description | Author | Install |
|-----------|-------------|--------|---------|
| Authress | Add authentication, permissions, and access control to LocalStack | Authress | `localstack extensions install localstack-extension-authress` |
| Claude (Anthropic API) | LocalStack Extension for testing Anthropic Claude API integrations locally | LocalStack Team | `localstack extensions install localstack-claude` |
| Keycloak | LocalStack Extension for developing Keycloak-secured apps locally | LocalStack Team | `localstack extensions install localstack-keycloak` |
| ParadeDB | LocalStack Extension for running ParadeDB search databases locally | LocalStack & ParadeDB | `localstack extensions install localstack-paradedb` |
| TypeDB | LocalStack Extension that facilitates developing TypeDB-based applications locally. | LocalStack & TypeDB | `localstack extensions install localstack-extension-typedb` |
| WireMock | LocalStack Extension that facilitates running WireMock mock APIs locally. | LocalStack & WireMock | `localstack extensions install localstack-wiremock` |
| Xero | LocalStack Extension for developing against the Xero Finance API locally | LocalStack Team | `localstack extensions install localstack-xero` |
