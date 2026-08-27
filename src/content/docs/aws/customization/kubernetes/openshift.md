---
title: OpenShift
description: Use the OpenShift managed Kubernetes cluster to deploy LocalStack.
template: doc
sidebar:
    order: 8
---

## Introduction

OpenShift is a container orchestration platform as a service designed to simplify the deployment, scaling, and management of containerized applications.
Built on Kubernetes, OpenShift provides a comprehensive set of tools and features that facilitate the orchestration, automation, and monitoring of containerized workloads.

With OpenShift, you can deploy LocalStack on a managed Kubernetes cluster, as a cloud sandbox that emulates various AWS services & APIs.
This guide demonstrates how you can deploy LocalStack on OpenShift using Devfile.
You can use the deployed LocalStack container to create AWS resources that you can use for local development and testing purposes.

:::danger
Creating shared/hosted LocalStack instances may have some licensing implications.
For example, a valid license might be necessary for each user who interacts with the instance.
If you have any questions or uncertainties regarding the licensing implications, we encourage you to [contact us](https://localstack.cloud/contact) for further details.
:::

## Getting started

This guide is designed for users new to LocalStack and assumes basic knowledge of the AWS CLI and our [`lstk aws` AWS CLI proxy](/aws/developer-tools/running-localstack/lstk/aws-and-iac-commands/#aws).
As a general prerequisite, you should have access to the [OpenShift Web Console](https://docs.openshift.com/container-platform/4.14/web_console/web-console-overview.html).

We will demonstrate how you can create local AWS resources using LocalStack using the AWS CLI.
Instead of running LocalStack locally, you will deploy it on OpenShift and use the exposed endpoint to interact with the LocalStack container.

### Setting up LocalStack on OpenShift

You can deploy LocalStack via the **Developer** perspective in the OpenShift Web Console.
Navigate to the **+Add** view to deploy LocalStack using a Devfile.

![OpenShift Developer perspective](/images/aws/openshift-developer-view.png)

To deploy LocalStack on OpenShift, click on **Import from Git** in the **Git Repository** tile.
In the Git section, enter the following Git repository URL to import the Devfile and Helm charts which contains the configuration for LocalStack: [**https://github.com/localstack/localstack-dev-spaces**](https://github.com/localstack/localstack-dev-spaces).

OpenShift Web Console will automatically detect the Devfile and display the import strategy.
A unique application name will be generated to the application grouping to label your resources.
A unique name will also be provided to the component that will be used to name associated resources.
You can edit these values if you want.

Click on **Create** to deploy LocalStack on OpenShift.

### Viewing the LocalStack deployment

You can see the build status of the LocalStack deployment in the **Topology** view.

![OpenShift Topology view](/images/aws/openshift-topology-view.png)

After successful deployment, you can see the **localstack-dev-spaces** pod in the **Topology** view.
Click on the pod to view the details.
You will be able to see the following details:

- Running pods along with the status and logs.
- Builds for your existing pods and an option to create new builds.
- Exposed services along with the service port and the pod port.
- Exposed routes for your deployed pods on the cluster.

![LocalStack Dev Spaces Deployment](/images/aws/localstack-dev-spaces.png)

### Creating AWS resources on OpenShift

Click on the **localstack-dev-spaces** pod to view the details.
You will be able to see the exposed route for the LocalStack container.
Copy the route URL and use it to interact with the LocalStack container.

Since LocalStack is running on the cluster rather than on your machine, point `lstk` at the exposed route instead of its default local endpoint.
Set `LSTK_ENDPOINT_URL` once for the whole session:

```bash
export LSTK_ENDPOINT_URL='<localstack-route-url>'
lstk aws s3 mb s3://my-bucket
lstk aws sqs create-queue --queue-name my-queue
```

Alternatively, pass the global `--endpoint-url` flag per command:

```bash
lstk --endpoint-url '<localstack-route-url>' aws s3 mb s3://my-bucket
lstk --endpoint-url '<localstack-route-url>' aws sqs create-queue --queue-name my-queue
```

In the above commands, replace `<localstack-route-url>` with the route URL of the LocalStack container.

:::note
By default, `lstk aws` targets the emulator on your local machine.
Since we are running LocalStack on OpenShift, we need to specify the route URL of the LocalStack container, using either `LSTK_ENDPOINT_URL` or `--endpoint-url`.
The flag takes precedence over the environment variable.
:::

You can further use the other `lstk` tool proxies, such as [`lstk cdk`](/aws/developer-tools/running-localstack/lstk/aws-and-iac-commands/#cdk), [`lstk sam`](/aws/developer-tools/running-localstack/lstk/aws-and-iac-commands/#sam), and [`lstk terraform`](/aws/developer-tools/running-localstack/lstk/aws-and-iac-commands/#terraform), to interact with the deployment.
As with `lstk aws`, set `LSTK_ENDPOINT_URL` or pass `--endpoint-url` to point these at the route URL instead of a local emulator.

### Deleting the LocalStack deployment

To delete the LocalStack deployment, click on the **localstack-dev-spaces** pod in the **Topology** view.
Click on the **Actions** menu and select **Delete Deployment**.