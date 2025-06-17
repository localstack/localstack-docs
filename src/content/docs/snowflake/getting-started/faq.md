---
title: FAQ
description: Frequently asked questions about LocalStack for Snowflake
template: doc
sidebar:
    order: 3
---

## Core FAQs

### Are Snowflake v2 APIs supported?

Yes, the Snowflake emulator supports the Snowflake v2 SQL API (`/api/v2/*` endpoints), as well as the legacy v1 SQL API (which is still being used by a large portion of Snowflake client libraries and SDKs) 

### Why are my Snowflake tests failing?

The Snowflake emulator is in **preview** and may not support all Snowflake features. If your tests are failing, it could be due to the lack of support for certain Snowflake features in the emulator. We recommend checking the [function coverage](https://snowflake.localstack.cloud/references/coverage-functions/) to see the list of supported SQL functions and [feature coverage](https://snowflake.localstack.cloud/references/coverage-features/) to see the list of supported features. If you encounter any issues, you can connect with us for [support](#support-faqs).

### Why does the Snowflake emulator run on `snowflake.localhost.localstack.cloud`?

The Snowflake emulator operates on `snowflake.localhost.localstack.cloud`. This is a DNS name that resolves to a local IP address (`127.0.0.1`) to make sure the connector interacts with the local APIs. In addition, we also publish an SSL certificate that is automatically used inside LocalStack, in order to enable HTTPS endpoints with valid certificates.

Note: In case you are deploying the Snowflake emulator in a Kubernetes cluster or some other non-local environment, you may need to add an entry to the `/etc/hosts` file of any client machine or Kubernetes pod that attempts to connect to the Snowflake emulator pod via the `snowflake.localhost.localstack.cloud` domain name.

## Integration FAQs

### Why are my CI pipelines failing with `license.not_enough_credits` error?

If you are using the Snowflake emulator in your CI pipelines consistently, you may encounter the `license.not_enough_credits` error. This error occurs when the Snowflake emulator is unable to process the requests due to the lack of LocalStack CI credits.

A CI key allows you to use LocalStack in your CI environment. Every activation of a CI key consumes one CI credit. This means that with every build triggered through the LocalStack container you will consume one credit. To use more credits, you can [contact us](https://localstack.cloud/contact) to discuss your requirements.

## Support FAQs

### How can I get help with the Snowflake emulator?

The Snowflake emulator is currently in **preview**. To get help, you can join the [Slack community](https://localstack.cloud/slack) and share your feedback, questions, and suggestions with the LocalStack team on the `#help` channel. If your team is using LocalStack for Snowflake, you can also request support by [contacting us](https://localstack.cloud/contact). We would be happy to setup a private Slack channel for your team to provide dedicated support.
