---
title: Deploy with Helm
description: Install and run LocalStack on Kubernetes using the official Helm chart.
template: doc
sidebar:
    order: 4
tags: ["Enterprise"]
---

A Helm chart is a package that bundles Kubernetes manifests into a reusable, configurable deployment unit. It makes applications easier to install, upgrade, and manage. 

Using the LocalStack Helm chart lets you deploy LocalStack to Kubernetes with set defaults while still customizing resources, persistence, networking, and environment variables through a single `values.yaml`. This approach is especially useful for teams running LocalStack in shared clusters or CI environments where repeatable, versioned deployments matter.

## Getting Started

This guide shows you how to install and run LocalStack on Kubernetes using the official Helm chart. It walks you through adding the Helm repository, installing and configuring LocalStack, and verifying that your deployment is running and accessible in your cluster.

## Prerequisites

* **Kubernetes** 1.19 or newer
* **Helm** 3.2.0 or newer
* A working Kubernetes cluster (self-hosted, managed, or local)
* `kubectl` installed and configured for your cluster
* Helm CLI installed and available in your shell `PATH`

:::note
**Namespace note:** All commands in this guide assume installation into the **`default`** namespace.
If you’re using a different namespace:
* Add `--namespace <name>` (and `--create-namespace` on first install) to Helm commands
* Add `-n <name>` to `kubectl` commands
:::

## Install

### 1) Add Helm repo

```bash
helm repo add localstack https://localstack.github.io/helm-charts
helm repo update
```

### 2) Install with default configuration

```bash
helm install localstack localstack/localstack
```

This creates the LocalStack resources in your cluster using the chart defaults.

### Install LocalStack Pro

If you want to use the `localstack-pro` image, create a `values.yaml` file:

```yaml
image:
  repository: localstack/localstack-pro

extraEnvVars:
  - name: LOCALSTACK_AUTH_TOKEN
    value: "<your auth token>"
```

Then install using your custom values:

```bash
helm install localstack localstack/localstack -f values.yaml
```


#### Auth token from a Kubernetes Secret

If your auth token is stored in a Kubernetes Secret, you can reference it using `valueFrom`:

```yaml
extraEnvVars:
  - name: LOCALSTACK_AUTH_TOKEN
    valueFrom:
      secretKeyRef:
        name: <name of the secret>
        key: <name of the key in the secret containing the API key>
```

## Configure chart

The chart ships with sensible defaults, but most production setups will want a small `values.yaml` to customize behavior.

### View all default values

```bash
helm show values localstack/localstack
```

### Override values with a custom `values.yaml`

Create a `values.yaml` and apply it during install/upgrade:

```bash
helm upgrade --install localstack localstack/localstack -f values.yaml
```


## Verify

### 1) Check the Pod status

```bash
kubectl get pods
```

After a short time, you should see the LocalStack Pod in `Running` status:

```text
NAME                          READY   STATUS    RESTARTS   AGE
localstack-7f78c7d9cd-w4ncw   1/1     Running   0          1m9s
```

### 2) Optional: Port-forward to access LocalStack from localhost

If you’re running a **local cluster** (for example, k3d) and LocalStack is not exposed externally, port-forward the service:

```bash
kubectl port-forward svc/localstack 4566:4566
```

Now verify connectivity with the AWS CLI:

```bash
aws sts get-caller-identity --endpoint-url "http://0.0.0.0:4566"
```

Example response:

```json
{
  "UserId": "AKIAIOSFODNN7EXAMPLE",
  "Account": "000000000000",
  "Arn": "arn:aws:iam::000000000000:root"
}
```

## Common customizations

### Enable persistence

If you want state to survive Pod restarts, enable PVC-backed persistence:

* Set: `persistence.enabled = true`

Example `values.yaml`:

```yaml
persistence:
  enabled: true
```

:::note
This is especially useful for workflows where you seed resources or rely on state across restarts.
:::

This performs these two changes:
* sets `PERSISTENCE=1`, and
* creates a psrsistent volume claim for the (customizable) storage class.


### Set Pod resource requests and limits

Some environments (notably **EKS on Fargate**) may terminate the LocalStack pod if not configured with reasonable requests/limits:

```yaml
resources:
  requests:
    cpu: 1
    memory: 1Gi
  limits:
    cpu: 2
    memory: 2Gi
```

### Add environment variables and startup scripts

You can inject environment variables or run a startup script to:

* pre-configure LocalStack
* seed AWS resources
* tweak LocalStack behavior

Use:

* `extraEnvVars` for environment variables
* `startupScriptContent` for startup scripts

Example pattern:

```yaml
extraEnvVars:
  - name: DEBUG
    value: "1"

startupScriptContent: |
  echo "Starting up..."
  # add your initialization logic here
```

### Install into a different namespace

Use `--namespace` and create it on first install:

```bash
helm install localstack localstack/localstack --namespace localstack --create-namespace
```

Then include the namespace on kubectl commands:

```bash
kubectl get pods -n localstack
```

### Update installation

```bash
helm repo update
helm upgrade localstack localstack/localstack
```

If you use a `values.yaml`:

```bash
helm upgrade localstack localstack/localstack -f values.yaml
```


### Helm chart options

Run:

```bash
helm show values localstack/localstack
```

Keep the parameter tables on this page for quick reference (especially for common settings like persistence, resources, env vars, and service exposure).
