---
title: State Management
description: Get started with State Management in LocalStack for Snowflake
---

{{< preview-notice >}}

## Introduction

State Management in LocalStack allows you to save and load the state of your LocalStack instance. LocalStack is ephemeral in nature, so when you stop and restart your LocalStack instance, all the data is lost. With State Management, you can save the state of your LocalStack instance and load it back when you restart your LocalStack instance.

State Management in LocalStack encompasses the following features:

- **Cloud Pods**: Cloud Pods are persistent state snapshots of your LocalStack instance that can easily be shared, stored, versioned, and restored.
- **Export & Import State**: Export and import the state of your LocalStack instance on your local machine as a local file.
- **Persistence**: Persist the state of your LocalStack instance on your local machine using a configuration variable.

State Management is an essential feature that supports various use-cases, such as pre-seeding your fresh LocalStack instance with data, sharing your LocalStack instance’s state with your team, fostering collaboration, and more.

## Persistence

LocalStack’s Persistence mechanism enables the saving and restoration of the entire LocalStack state. It functions as a **pause and resume** feature, allowing you to take a snapshot of your LocalStack instance and save this data to disk. This mechanism ensures a quick and efficient way to preserve and continue your work with Snowflake resources locally.

To start snapshot-based persistence, launch LocalStack with the configuration option `PERSISTENCE=1`. This setting instructs LocalStack to save all local Snowflake resources and their respective application states into the LocalStack Volume Directory. Upon restarting LocalStack, you'll be able to resume your activities exactly where you left off.

{{< tabpane >}}
{{< tab header="LocalStack CLI" lang="bash" >}}
LOCALSTACK_AUTH_TOKEN=... PERSISTENCE=1 IMAGE_NAME=localstack/snowflake localstack start
{{< /tab >}}
{{< tab header="Docker Compose" lang="yaml" >}}
    ...
    image: localstack/snowflake
    environment:
      - LOCALSTACK_AUTH_TOKEN=${LOCALSTACK_AUTH_TOKEN:?}
      - PERSISTENCE=1
    volumes:
      - "${LOCALSTACK_VOLUME_DIR:-./volume}:/var/lib/localstack"
{{< /tab >}}
{{< tab header="Docker" lang="bash" >}}
docker run \
  -e LOCALSTACK_AUTH_TOKEN=${LOCALSTACK_AUTH_TOKEN:?} \
  -e PERSISTENCE=1 \
  -v ./volume:/var/lib/localstack \
  -p 4566:4566 \
  localstack/snowflake
{{< /tab >}}
{{< /tabpane >}}

{{< alert title="Note">}}
Snapshots may not be compatible across different versions of LocalStack.
It is possible that snapshots from older versions can be restored, but there are no guarantees as to whether LocalStack will start into a consistent state.
We are actively working on a solution for this problem.
{{< /alert >}}

## Export/Import State

The Export/Import State feature enables you to export the state of your LocalStack instance into a file, and then later import it into another LocalStack instance. This feature is useful when you want to save your LocalStack instance’s state for later use.

### Export the State

To export the state, you can run the following command:

{{< command >}}
$ localstack state export '<file-name>'
{{< /command >}}

You can use the `<file-name>` argument to specify a file path to export the state to. If you do not specify a file path, the state will be exported to the current working directory into a file named `ls-state-export`.

### Import the State

To import the state, you can run the following command:

{{< command >}}
$ localstack state import '<file-name>'
{{< /command >}}

The `<file-name>` argument is required and specifies the file path to import the state from. The file should be generated from a previous export.

## Cloud Pods

Cloud pods are persistent state snapshots of your LocalStack instance that can easily be stored, versioned, shared, and restored. Cloud Pods can be used for various purposes, such as:

-  Save and manage snapshots of active LocalStack instances.
-  Share state snapshots with your team to debug collectively.
-  Automate your testing pipelines by pre-seeding CI environments.
-  Create reproducible development and testing environments locally.

You can save and load the persistent state of Cloud Pods, using the Cloud Pods CLI. LocalStack provides a remote storage backend that can be used to store the state of your running application and share it with your team members. Cloud Pods CLI is included in the [LocalStack CLI installation](https://docs.localstack.cloud/getting-started/installation/#localstack-cli), so there's no need for additional installations to begin using it.

### Create a new Cloud Pod

To create the Cloud Pod, you can run the following command:

{{< command >}}
$ localstack pod save '<pod-name>'
{{< /command >}}

### Load an existing Cloud Pod

To load the Cloud Pod, you can run the following command:

{{< command >}}
$ localstack pod load '<pod-name>'
{{< /command >}}