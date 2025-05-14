---
title: Architect
description: Use the Architect Infrastructure as Code framework with LocalStack.
template: doc
sidebar:
    order: 2
---

## Overview

Architect enables you to quickly build large serverless apps without worrying about the underlying infrastructure.
On this page we discuss how Architect and LocalStack can be used together.
If you are adapting an existing configuration, you might be able to skip certain steps at your own discretion.

## Example

### Setup

To use Architect in conjunction with LocalStack, simply install the `arclocal` command (sources can be found [here](https://github.com/localstack/architect-local)).
```bash
npm install -g architect-local @architect/architect aws-sdk
```

The `arclocal` command has the same usage as the `arc` command, so you can start right away.

Create a test directory

```bash
mkdir architect_quickstart && cd architect_quickstart
```

then create an architect project

```bash
arclocal init
```

### Deployment

Now you need to start LocalStack.
After LocalStack has started you can deploy your Architect setup via:
```bash
arclocal deploy
```

## Further reading

For more architect examples, you can take a look at the [official architect docs](https://arc.codes).