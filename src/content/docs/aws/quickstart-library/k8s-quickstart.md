---
title: "Deploy LocalStack on Kubernetes"
description: Deploy LocalStack into a Kubernetes cluster and run a sample Lambda + RDS application in under 5 minutes.
template: doc
sidebar:
  order: 3
---

## Introduction

This quickstart spins up LocalStack in a local Kubernetes cluster and deploys a sample application in 5 minutes. You'll run an AWS Lambda function that queries an RDS MySQL database, with both services executing as pods managed by LocalStack.

LocalStack's Kubernetes integration is available as part of the [Enterprise plan](https://localstack.cloud/pricing).

## Prerequisites

Before starting, make sure you have the following:

- A [LocalStack Auth Token](https://docs.localstack.cloud/getting-started/auth-token/) exported as `LOCALSTACK_AUTH_TOKEN`
- [Docker](https://docs.docker.com/get-docker/)
- [`kind`](https://kind.sigs.k8s.io/)
- [Terraform](https://www.terraform.io/downloads) (v1.11.1 or later) with the [`tflocal`](https://docs.localstack.cloud/user-guide/integrations/terraform/) wrapper
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) with the [`awslocal`](https://docs.localstack.cloud/user-guide/integrations/aws-cli/#localstack-aws-cli-awslocal) wrapper
- [`kubectl`](https://kubernetes.io/docs/reference/kubectl/)
- [`jq`](https://jqlang.github.io/jq/download/)
- [`k9s`](https://k9scli.io/) (optional, for visual cluster monitoring)

## Step by Step

### Step 1: Clone the sample repository

```bash
git clone https://github.com/localstack-samples/localstack-k8s-demo.git
cd localstack-k8s-demo
```

The repository contains:

- `main.tf`: Terraform configuration that provisions an RDS MySQL database and a Lambda function on LocalStack
- `lambda-src/`: Python Lambda function source code with `pymysql` as a dependency
- `localstack-instance.yml`: Custom resource definition for the LocalStack deployment
- `scripts/`: Helper scripts for managing the auth token secret and port forwarding
- `Makefile`: Convenience targets for the full workflow

### Step 2: Create the Kubernetes cluster

If you want to monitor the cluster visually, open a separate terminal and run `k9s`. The interface starts empty but populates as pods come up.

Create a local Kubernetes cluster using `kind`:

```bash
kind create cluster --name ls-k8s-demo
```

Verify the cluster is running:

```bash
kubectl cluster-info
```

### Step 3: Deploy the LocalStack Operator

The [LocalStack Operator](https://github.com/localstack/localstack-operator) manages the LocalStack deployment and configures cluster DNS so that AWS-style hostnames resolve correctly inside the cluster.

:::note
The LocalStack Operator and Kubernetes executor are part of the [Enterprise plan](https://localstack.cloud/pricing) and are not enabled by default on a trial license.
If your Auth Token doesn't have access, contact your LocalStack account team or [support](/aws/help-support/get-help/) to get the Kubernetes pack enabled on your trial.
:::

```bash
kubectl apply -f https://github.com/localstack/localstack-operator/releases/latest/download/controller.yaml
```

Wait for the operator pod to reach a `Running` state:

```bash
kubectl get pods -n localstack-operator-system
```

```
NAME                                                      READY   STATUS    RESTARTS   AGE
localstack-operator-controller-manager-78dcf78855-xxxxx   1/1     Running   0          30s
```

### Step 4: Deploy LocalStack into the cluster

Create a namespace and a secret containing your Auth Token:

```bash
kubectl create namespace workspace

kubectl create secret -n workspace generic localstack-auth-token \
    --from-literal=LOCALSTACK_AUTH_TOKEN=$LOCALSTACK_AUTH_TOKEN
```

Deploy the LocalStack instance:

```bash
kubectl apply --server-side -f ./localstack-instance.yml
```

Wait for the LocalStack pod to be ready (this may take a minute or two while the image is pulled):

```bash
kubectl get pods -n workspace -w
```

Proceed once the pod shows `1/1 Running`.

### Step 5: Set up port forwarding

Forward `port 4566` so you can run AWS commands against LocalStack from your local machine:

```bash
kubectl port-forward -n workspace svc/localstack-env-1 4566
```

This runs in the foreground. Open a new terminal for the remaining steps. Verify LocalStack is accessible:

```bash
awslocal sts get-caller-identity
```

You can also confirm connectivity using the [LocalStack Web Application](https://app.localstack.cloud/inst/default/overview).
With the port forward active, open the [Stack Overview](https://app.localstack.cloud/inst/default/overview) in your browser.
It should load and show your LocalStack instance as connected, which is a quick way to confirm your cluster setup before deploying the sample application.

### Step 6: Deploy the sample application with Terraform

The Terraform configuration provisions the following resources on LocalStack:

- A VPC
- An RDS MySQL database (`k8sdb`)
- A Lambda function (`myfunction`) that connects to and queries the database

Both the database and Lambda function run as separate pods in the cluster, managed by LocalStack's Kubernetes executor.

```bash
tflocal init -upgrade
tflocal apply -auto-approve
```

The deployment takes a few minutes as the MySQL pod needs to start up. Monitor progress with `k9s` or:

```bash
kubectl get pods -A -w
```

:::note
The Lambda module is configured for ARM64 by default. If you are on an Intel/AMD machine, update `main.tf` to remove the `docker_additional_options` block and change `architectures` to `["x86_64"]`.
:::

### Step 7: Invoke the Lambda function

```bash
awslocal lambda invoke \
    --function-name myfunction \
    --payload '{}' /dev/stdout | jq .
```

The first invocation takes about 30 seconds as the Lambda pod starts up. You should see output like:

```json
{
  "results": [
    [1, "test"],
    [2, "another"]
  ]
}
```

## Validation

Confirm that all three pods are running in the `workspace` namespace:

```bash
kubectl get pods -n workspace
```

```
NAME                          READY   STATUS    AGE
lambda-myfunction-xxxxx       1/1     Running   36s
localstack-env-1-xxxxx        1/1     Running   11m
ls-mysql-xxxxx                1/1     Running   4m
```

You should see the LocalStack pod (`localstack-*`), the MySQL database pod (`ls-mysql-*`), and the Lambda function pod (`lambda-myfunction-*`) all running.

## Cleanup

To tear down all resources:

```bash
tflocal apply -destroy -auto-approve
kubectl delete -f ./localstack-instance.yml
kubectl delete secret -n workspace localstack-auth-token
```

## Troubleshooting

### LocalStack pod is stuck in `Pending` or `ImagePullBackOff`
Verify that your Auth Token secret was created correctly and that your cluster nodes can pull from the LocalStack registry. Check pod events with `kubectl describe pod -n workspace <pod-name>`.

### `awslocal sts get-caller-identity` times out
Confirm that port forwarding is still running in a separate terminal. If it dropped, restart it with `kubectl port-forward -n workspace svc/localstack-env-1 4566`.

### Lambda invocation returns an error after the first call
The first invocation takes up to 30 seconds for the Lambda pod to start. Wait and retry.

### Terraform apply fails with a connection error
Ensure port forwarding is active before running `tflocal apply`. LocalStack must be accessible on `localhost:4566`.

### MySQL pod does not start
Check cluster resource availability. The MySQL pod requires sufficient CPU and memory. Run `kubectl describe pod -n workspace <ls-mysql-pod-name>` to inspect scheduling events.

## Next Steps

This quickstart covers a minimal deployment. For production-ready configuration options (including persistent storage, advanced networking, scaling, and monitoring), see the full [Kubernetes Enterprise guide](https://docs.localstack.cloud/aws/enterprise/kubernetes/).