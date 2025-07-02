---
title: Overview
description: State Management in LocalStack allows you to save and load the state of your LocalStack instance.
template: doc
sidebar:
    order: 1
---

LocalStack is designed to be ephemeral by default, meaning all state is lost when the container stops. State Management gives you tools to persist, reuse, and share the state of your LocalStack instance across sessions or teams. This is useful for preloading test data, debugging workflows, or collaborating with teammates.

LocalStack supports three ways to manage and reuse state:

* [**Cloud Pods**](/aws/capabilities/state-management/cloud-pods): Shareable, versioned snapshots of your LocalStack instance that can be stored, restored, and synced via the LocalStack platform.

* [**Export & Import State**](/aws/capabilities/state-management/export-import-state): Save your instance state to a local file and reload it manually as needed.

* [**Persistence**](/aws/capabilities/state-management/persistence): Automatically save and reload state locally by enabling a configuration flag.

Internally, all three approaches manage the same container state. They just differ in how the state is stored and reused (local vs remote, manual vs automated). 

The diagram below helps compare these options at a glance.

![The difference between persistence, local state and Cloud Pods.](/images/aws/persistence-pods-remote.png)

