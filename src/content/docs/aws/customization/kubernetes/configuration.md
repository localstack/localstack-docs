---
title: Kubernetes Configuration
description: Kubernetes configuration reference for LocalStack running on Kubernetes
template: doc
sidebar:
    order: 7
tags: ["Enterprise"]
---

When LocalStack runs on Kubernetes with the Kubernetes executor enabled, a set of configuration variables controls how child pods are created and managed. These variables apply to pods spawned by services such as Lambda, ECS, and RDS.

### Namespace

By default, LocalStack creates child pods in the `default` namespace. Use `K8S_NAMESPACE` to deploy them into a different namespace.
```bash
K8S_NAMESPACE=localstack-workloads
```

The namespace must already exist in your cluster before starting LocalStack.

### Labels and annotations

You can attach custom Kubernetes labels and annotations to all child pods created by LocalStack. This is useful for integrating with cluster tooling such as monitoring agents, network policies, or admission controllers.

Both variables accept a comma-separated list of `key=value` pairs:
```bash
K8S_LABELS=env=dev,team=platform
K8S_ANNOTATIONS=prometheus.io/scrape=true,prometheus.io/port=8080
```

### Pod configuration

`K8S_POD_CONFIG` configures Kubernetes metadata, scheduling, and resource settings for child pods created by supported services such as Lambda and ECS.
Use it to define reusable pod profiles with fields such as `nodeSelector`, `tolerations`, `affinity`, `resources`, `labels`, and `annotations`.
The value must be valid JSON.

```bash
K8S_POD_CONFIG='{"profiles":{"default":{"nodeSelector":{"pool":"general"}}}}'
```

For the full JSON schema, profile resolution order, and examples, see [Pod Configuration](/aws/customization/kubernetes/pod-configuration/).

### Container security context

`K8S_CONTAINER_SECURITY_CONTEXT` sets the [container security context](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/) applied to child pods created by LocalStack. The value should be a JSON object matching the Kubernetes `SecurityContext` spec.

This is useful when your cluster enforces pod security policies or security admission controls that require specific security context fields to be set.
```bash
K8S_CONTAINER_SECURITY_CONTEXT='{"runAsNonRoot": true, "runAsUser": 1000, "allowPrivilegeEscalation": false}'
```

### Init images

LocalStack uses init containers in some child pods to perform setup tasks before the main container starts. The following variables let you override the default images used for these init containers:

- `K8S_CURL_INIT_IMAGE` — the image used for the curl-based init container, typically responsible for waiting on network dependencies. <!-- TODO: confirm default image -->
- `LAMBDA_K8S_INIT_IMAGE` — the image used for the init container in Lambda pods specifically. <!-- TODO: confirm default image -->

You may need to override these if your cluster cannot pull from the default registry, for example when working in an air-gapped environment or when images must be sourced from a private registry.
```bash
K8S_CURL_INIT_IMAGE=my-registry.example.com/curl-init:latest
LAMBDA_K8S_INIT_IMAGE=my-registry.example.com/lambda-init:latest
```

### Lambda image prefix

`LAMBDA_K8S_IMAGE_PREFIX` sets a prefix applied to all Lambda runtime image names when pulling them in the Kubernetes executor. Use this to redirect image pulls to a private registry or mirror.
```bash
LAMBDA_K8S_IMAGE_PREFIX=my-registry.example.com/lambda-images/
```

### Readiness timeouts

LocalStack waits for child pods, deployments, and services to become ready before considering them available. The following variables control how long LocalStack waits before timing out:

- `K8S_WAIT_FOR_POD_READY_TIMEOUT` — maximum time to wait for a pod to reach the `Ready` state <!-- TODO: confirm default and unit (seconds?) -->
- `K8S_WAIT_FOR_DEPLOYMENT_READY_TIMEOUT` — maximum time to wait for a deployment to become available <!-- TODO: confirm default and unit -->
- `K8S_WAIT_FOR_SERVICE_READY_TIMEOUT` — maximum time to wait for a service endpoint to be ready <!-- TODO: confirm default and unit -->
```bash
K8S_WAIT_FOR_POD_READY_TIMEOUT=120
K8S_WAIT_FOR_DEPLOYMENT_READY_TIMEOUT=180
K8S_WAIT_FOR_SERVICE_READY_TIMEOUT=60
```

Increase these values if your cluster is under heavy load or if image pulls are slow.

### Configuration reference

| Variable | Description |
|---|---|
| `K8S_NAMESPACE` | Kubernetes namespace for child pods |
| `K8S_LABELS` | Comma-separated `key=value` labels applied to child pods |
| `K8S_ANNOTATIONS` | Comma-separated `key=value` annotations applied to child pods |
| `K8S_POD_CONFIG` | JSON pod configuration for supported child pods. See [Pod Configuration](/aws/customization/kubernetes/pod-configuration/) |
| `K8S_CONTAINER_SECURITY_CONTEXT` | JSON security context applied to child pod containers |
| `K8S_CURL_INIT_IMAGE` | Init container image used for network readiness checks |
| `LAMBDA_K8S_INIT_IMAGE` | Init container image used in Lambda pods |
| `LAMBDA_K8S_IMAGE_PREFIX` | Image name prefix for Lambda runtime images |
| `K8S_WAIT_FOR_POD_READY_TIMEOUT` | Timeout waiting for pod readiness |
| `K8S_WAIT_FOR_DEPLOYMENT_READY_TIMEOUT` | Timeout waiting for deployment readiness |
| `K8S_WAIT_FOR_SERVICE_READY_TIMEOUT` | Timeout waiting for service readiness |