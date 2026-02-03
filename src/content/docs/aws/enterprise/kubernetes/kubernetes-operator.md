---
title: Deploy LocalStack Operator
description: Deploy and manage LocalStack in a Kubernetes cluster using the LocalStack Operator.
template: doc
sidebar:
    order: 4
tags: ["Enterprise"]
---

## Introduction

The LocalStack Operator provides a Kubernetes-native way to deploy and manage LocalStack instances. It abstracts Kubernetes-specific configuration and automates operational tasks, making LocalStack deployments more consistent and easier to maintain.

The Operator manages the full lifecycle of LocalStack resources and enables advanced Kubernetes integrations that are difficult to configure manually.

## Getting started

This guide explains how to deploy and manage LocalStack in a Kubernetes cluster using the LocalStack Operator.


### Advanced features

The Operator supports the following advanced capabilities:

* Cluster DNS configuration to correctly resolve AWS-style subdomains
* Automatic loading of Cloud Pods on startup
* Support for initialization hooks
* Simplified logging configuration
* Automatic mounting of a PersistentVolumeClaim (PVC) for the LocalStack data directory, enabling artifact caching and persistence

### Prerequisites

Before installing the LocalStack Operator, ensure you have:

* A running Kubernetes cluster
* A LocalStack license that includes Kubernetes features
* An authentication token for that license

:::note
A separate auth token must be used for each LocalStack instance.
:::

### Deploy Operator

The easiest way to install the Operator controller is to apply the published manifests directly from GitHub.

```bash
# Install the latest version
kubectl apply -f https://github.com/localstack/localstack-operator/releases/latest/download/controller.yaml
```

To install a specific version:

```bash
# Example: install v0.4.0
kubectl apply -f https://github.com/localstack/localstack-operator/releases/v0.4.0/download/controller.yaml
```

See the Operator releases page for all available versions.


### Deploy LocalStack instance

Once the Operator is running, you can deploy a LocalStack instance by creating a `LocalStack` custom resource.

A minimal example looks like this:

```yaml
apiVersion: api.localstack.cloud/v1alpha1
kind: LocalStack
metadata:
  name: localstack
  namespace: my-namespace
spec:
  image: localstack/localstack-pro:latest
  dnsProvider: coredns
  dnsConfigName: coredns
  dnsConfigNamespace: kube-system
  envFrom:
    - secretRef:
        name: localstack-auth-token
```

In this example, the LocalStack auth token is read from a Kubernetes Secret named `localstack-auth-token`.

You can create this Secret with:

```bash
kubectl create secret generic localstack-auth-token \
  --from-literal=LOCALSTACK_AUTH_TOKEN="$LOCALSTACK_AUTH_TOKEN"
```

The auth token must be available in the `LOCALSTACK_AUTH_TOKEN` environment variable when creating the Secret.

notes:::
More advanced examples are available in the LocalStack Operator GitHub repository.
:::

## Accessing LocalStack

By default, the Operator creates a `ClusterIP` Service named:

```text
localstack-<crd-name>
```

For the example above (`name: localstack`), the Service name is:

```text
localstack-localstack
```

This Service exposes:

* The LocalStack gateway port (`4566`)
* AWS service ports
* Port `53` for DNS

Using standard Kubernetes DNS resolution, the Service can be reached at:

* `localstack-localstack` (same namespace)
* `localstack-localstack.my-namespace`
* `localstack-localstack.my-namespace.svc.cluster.local`

When `dnsProvider: coredns` is configured, LocalStack can also be reached through **any subdomain** of these service names.


## CRDs

The LocalStack Operator introduces a `LocalStack` Custom Resource Definition (CRD) that controls how LocalStack instances are deployed and configured.

:::Note
CRD documentation is currently maintained manually. For a full reference of available fields, see: [https://github.com/localstack/localstack-operator/blob/v0.4.0/api-docs.md](https://github.com/localstack/localstack-operator/blob/v0.4.0/api-docs.md)
:::


## Permissions

The Operator manifest creates all required `Roles`, `ClusterRoles`, and `bindings`.


| **Kind** | **Name** | **API Groups** | **Resources** | **Verbs** |
| --- | --- | --- | --- | --- |
| **Role** | `localstack-operator-leader-election-role` |  | `configmaps` | get, list, watch, create, update, patch, delete |
|  |  | `coordination.k8s.io` | `leases` | get, list, watch, create, update, patch, delete |
|  |  |  | `events` | create, patch |
| **ClusterRole** | `localstack-operator-manager-role` |  | `configmaps` | delete, get, list, patch, update, watch |
|  |  |  | `events` | create, patch |
|  |  |  | `pods`, `pods/exec`, `pods/log` | create, delete, deletecollection, get, list, patch, update, watch |
|  |  |  | `secrets` | get, list, watch |
|  |  |  | `serviceaccounts` | create, delete, get, list, update, watch |
|  |  |  | `services` | create, delete, get, list, patch, update, watch |
|  |  | `api.localstack.cloud` | `localstacks` | create, delete, get, list, patch, update, watch |
|  |  | `api.localstack.cloud` | `localstacks/finalizers` | update |
|  |  | `api.localstack.cloud` | `localstacks/status` | get, patch, update |
|  |  | `apps` | `deployments` | create, delete, get, list, patch, update, watch |
|  |  | `apps` | `deployments/scale` | create, delete, get, list, patch, update, watch |
|  |  | `rbac.authorization.k8s.io` | `rolebindings`, `roles` | create, delete, list, update, watch |
| **ClusterRole** | `localstack-operator-metrics-reader` |  | (nonResourceURLs: `/metrics`) | get |
| **ClusterRole** | `localstack-operator-proxy-role` | `authentication.k8s.io` | `tokenreviews` | create |
|  |  | `authorization.k8s.io` | `subjectaccessreviews` | create |


### Manager ClusterRole

This ClusterRole allows the Operator to manage LocalStack resources and related Kubernetes objects.

Resources include:

* Pods (including exec and logs)
* Services
* Secrets
* Deployments
* ServiceAccounts
* LocalStack CRDs (`localstacks`, `status`, `finalizers`)
* RBAC roles and role bindings

Verbs include:

```text
create, delete, get, list, watch, patch, update
```


### Metrics and proxy ClusterRoles

Additional ClusterRoles are created for:

* Reading metrics (`/metrics`)
* Authentication and authorization reviews (`tokenreviews`, `subjectaccessreviews`)


## DNS handling

The LocalStack Operator configures cluster DNS to forward AWS-style subdomain requests to the LocalStack DNS server.

This enables features such as:

* S3 virtual-host–style addressing
* API Gateway domain name resolution

Example from another pod in the cluster:

```bash
aws apigatewayv2 create-api \
  --name testGatewayProxy \
  --protocol-type HTTP \
  --target "https://httpbin.org"
```

Example response:

```json
{
  "ApiEndpoint": "http://1d4b6907.execute-api.localstack-localstack.my-namespace:4566",
  "ApiId": "1d4b6907"
}
```

Calling the API:

```bash
curl http://1d4b6907.execute-api.localstack-localstack.my-namespace:4566/json
```

This works without additional DNS configuration in client applications.


## Update

The Operator can be upgraded by applying a newer controller manifest.

Example:

```bash
# Install an older version
kubectl apply -f https://github.com/localstack/localstack-operator/releases/download/v0.3.3/controller.yaml

# Upgrade to a newer version
kubectl apply -f https://github.com/localstack/localstack-operator/releases/download/v0.4.1/controller.yaml
```

Kubernetes will handle rolling updates of the Operator deployment.


## Verify

To verify that the Operator and LocalStack instance are running:

```bash
kubectl get pods -n my-namespace
kubectl get localstacks -n my-namespace
```

Ensure that:

* The Operator controller pod is running
* The LocalStack resource reports a healthy status
* The LocalStack Service is created

:::note
* The LocalStack Operator is available **only with licenses that include Kubernetes features**
* Each LocalStack instance requires its **own auth token**
* The Operator supports **LocalStack Pro images only**
* DNS integration and Cloud Pod automation are Operator-exclusive features
:::