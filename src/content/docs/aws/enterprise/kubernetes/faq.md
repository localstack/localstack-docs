---
title: FAQ
description: FAQ
template: doc
sidebar:
    order: 6
tags: ["Enterprise"]
---

This section covers common issues when running LocalStack on Kubernetes and how to diagnose them.


## The LocalStack Pod won’t start

### Potential issues

* The auth token is invalid. If license activation fails, the Pod will terminate immediately.
* The container image cannot be pulled or takes a long time to pull.
* The Pod cannot be scheduled because no nodes have sufficient capacity or nodes are tainted.
* **When using the Operator:** the Operator cannot validate the LocalStack license and refuses to create the Pod.

### Potential fixes

1. Check the Pod status

   List all Pods in the cluster and locate the LocalStack Pod:

   ```bash
   kubectl get pods -A
   ```

2. Describe the Pod

   If the Pod exists, inspect it for scheduling or startup errors:

   ```bash
   kubectl describe pod -n <namespace> <pod-name>
   ```

   Errors are typically visible in the `Events:` section.

   Example:

   ```text
   Back-off restarting failed container localstack in pod <pod-name>
   ```

   This indicates that the LocalStack container crashed after startup.

3. Check Pod logs

   If the Pod started but then crashed:

   ```bash
   kubectl logs -n <namespace> <pod-name>
   ```

   Startup errors are usually found near the end of the log output. Debugging is similar to running LocalStack in Docker—there is nothing Kubernetes-specific about most startup failures.

4. If the Pod was never created

   * **Helm:** check the output of `helm install`
   * **Operator:** check the Operator logs:

     ```bash
     kubectl logs -n localstack-operator-system deployments/localstack-operator-system
     ```


## Services are unavailable

If an AWS service fails to start or respond:

* Verify that your LocalStack license includes the service you are trying to use.
* Check the LocalStack Pod logs for license-related or service-specific errors.

There are typically no additional Kubernetes-level actions required for this issue.


## DNS resolution failures

### DNS timeouts

If you see errors such as:

```text
Unable to get DNS result from upstream server <IP> for domain <domain>. The DNS operation timed out.
```

* Check whether the upstream DNS server was detected correctly.

* Look for a log line like:

  ```text
  Determined fallback dns: <IP>
  ```

* If the detected DNS server is not valid for your cluster, set it explicitly using the `DNS_SERVER` configuration option.


### `localhost.localstack.cloud` does not resolve

* **Inside LocalStack-spawned compute Pods**

  * Ensure `DNS_ADDRESS` is **not** set to `0`.

* **Inside other Pods in the cluster**

  * Configure the Pod DNS settings to use the LocalStack Service IP.
  * Set `dnsPolicy: None` and define a custom DNS config and search domains.
  * See: [https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#pod-dns-config](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#pod-dns-config)

* **Alternative**

  * Configure your cluster DNS (for example CoreDNS) to forward requests ending in `localhost.localstack.cloud` to the LocalStack DNS server.
  * This is done automatically when using the LocalStack Operator.


## Permission / RBAC issues

### Docker permission errors

```text
Creating Docker SDK client failed
```

This is expected in Kubernetes. LocalStack attempts to connect to a Docker socket, which is typically unavailable in Pods. Docker is **not required** for running LocalStack on Kubernetes.


### Filesystem permission errors

```text
PermissionError: [Errno 13] Permission denied: '/etc/resolv.conf'
```

This is expected when running LocalStack as a non-root user. Transparent endpoint injection may not work for init scripts or extensions in this case.


### Kubernetes API permission errors

```text
kubernetes.client.exceptions.ApiException: (403) Reason: Forbidden
```

This indicates missing or incorrect RBAC permissions for the LocalStack Pod’s ServiceAccount.

* If using the official Helm chart or Operator, update to the latest version:

  * Helm: `helm repo update localstack`
  * Operator: re-apply the latest controller manifest
* If deploying LocalStack manually (not recommended), ensure the ServiceAccount role includes the required permissions:
  [https://github.com/localstack/helm-charts/blob/main/charts/localstack/templates/role.yaml](https://github.com/localstack/helm-charts/blob/main/charts/localstack/templates/role.yaml)


## Networking problems

### LocalStack or spawned Pods cannot connect to other cluster resources

* Ensure the LocalStack Pod uses:

  ```yaml
  dnsPolicy: ClusterFirst
  ```


### LocalStack cannot connect to real AWS

Common causes:

* **Transparent Endpoint Injection**

  * Review: [https://docs.localstack.cloud/aws/capabilities/networking/transparent-endpoint-injection/](https://docs.localstack.cloud/aws/capabilities/networking/transparent-endpoint-injection/)
* **Egress restrictions**

  * Ensure cluster network policies allow outbound internet access.


### Spawned Pods cannot connect to LocalStack

* Spawned compute workloads should connect to LocalStack using:

  ```text
  localhost.localstack.cloud
  ```

* Using the Kubernetes Service name is possible, but host-based access (for example S3 virtual-host addressing) will not work.

* Verify that the LocalStack DNS server is running (see DNS resolution failures).


### Other Pods cannot connect to LocalStack

* Use the Kubernetes Service name created by Helm or the Operator.
* Confirm the LocalStack Pod is running.

:::note
API responses returned by LocalStack include the `localhost.localstack.cloud` domain.
You can override this by setting:

```text
LOCALSTACK_HOST=<kubernetes-service-name>
```
:::


### Cannot connect from the host machine

* For local clusters (k3d, kind):

  * Ensure ports are forwarded correctly.
  * Port `4566` (and service ports `4510–4559`) must be exposed.
  * See:

    * [https://k3d.io/v5.3.0/usage/exposing_services/](https://k3d.io/v5.3.0/usage/exposing_services/)
    * [https://kind.sigs.k8s.io/docs/user/configuration/#extra-port-mappings](https://kind.sigs.k8s.io/docs/user/configuration/#extra-port-mappings)

* Alternatively, use port-forwarding:

  ```bash
  kubectl port-forward -n <namespace> <pod-name> 4566
  ```


## Child containers are not spawning

### Docker runtime errors

```text
DockerNotAvailable: Docker not available
```

* Ensure `CONTAINER_RUNTIME=kubernetes` is set.
* Verify your license includes Kubernetes support.
* When using Helm, ensure `lambda.executor: kubernetes` is not overriding the runtime unintentionally.


### Image pull failures

```text
ErrImagePull
```

This usually means the cluster restricts which images can be pulled.

* Allow the LocalStack images in your cluster
* If you must use a custom image name or pull-through cache, see:
  [https://docs.localstack.cloud/aws/capabilities/config/configuration/](https://docs.localstack.cloud/aws/capabilities/config/configuration/)


### Admission or security policy failures

Errors such as:

```text
kubernetes.utils.create_from_yaml.FailToCreateError
```

* Ensure you are running the latest LocalStack and Helm chart / Operator version.
* Check for:

  * Validating admission webhooks
    [https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#validatingadmissionwebhook](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#validatingadmissionwebhook)
  * Pod Security Admission restrictions
    [https://kubernetes.io/docs/concepts/security/pod-security-admission/](https://kubernetes.io/docs/concepts/security/pod-security-admission/)


### Child Pod timeouts

If a child Pod is created but times out:

* This is commonly caused by slow or blocked image pulls.
* Inspect the child Pod status and events, similar to diagnosing a LocalStack Pod startup failure.


## Logs to check

* Check LocalStack Pod logs as described in **The LocalStack Pod won’t start**
* If using the Operator, also check the Operator logs:

  ```bash
  kubectl logs -n localstack-operator-system deployments/localstack-operator-system
  ```

