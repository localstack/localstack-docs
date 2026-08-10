---
title: LocalStack Desktop
description: Getting started with the LocalStack Desktop application.
template: doc
sidebar:
    order: 4
---

LocalStack Desktop is a desktop client for controlling and interacting with a LocalStack instance, including the Azure emulator.
Using LocalStack Desktop, users can start and stop their LocalStack instance with a single click, create a new container, view logs, interact with LocalStack container via cli and use our resource browser.

:::note
LocalStack Desktop replaces the previous LocalStack Cockpit application.
Cockpit isn't available or maintained anymore and we recommend you to use LocalStack Desktop instead.
:::

## Installation

You can download LocalStack Desktop from our [web application](https://app.localstack.cloud/download).
To install LocalStack Desktop, **Docker** is the only prerequisite.

## Features

LocalStack Desktop helps users to interact with their LocalStack instance with a simple and intuitive UI.
Some of the features of LocalStack Desktop includes the ability to: Control LocalStack, Interact with LocalStack, get LocalStack insights and use the Resource browser.

### Control LocalStack

Using our Desktop application you will be able to start, stop, delete and create new containers with just a click.
It also allows to set up a custom URL if you are using LocalStack outside of Docker or in Kubernetes.


![LocalStack Desktop container creation](/images/azure/desktop/localstack-desktop-containers.png)

### Interact with LocalStack

You can run commands within the LocalStack container by using our CLI


![LocalStack Desktop cli interaction](/images/azure/desktop/localstack-desktop-terminal.png)

### LocalStack Insights

LocalStack Desktop provides quick access to your LocalStack logs for instant insights.
See what's happening in details from the Logs tab.

![LocalStack Desktop Logs tab](/images/azure/desktop/localstack-desktop-logs.png)

### Resource browser

You can also create, modify, delete and read all of your resources from the Resource Browser tab, the same experience as in the [web application](https://app.localstack.cloud/inst/default/resources)

:::note
Desktop is product-independent — it manages whichever emulator image the container is running. Resource Browser coverage for Azure is limited; see [LocalStack Console](/azure/connecting/console/).
:::

![LocalStack Desktop Resource Browser](/images/azure/desktop/localstack-desktop-resource-browser.png)
