---
title: Concepts & Architecture 
description: Concepts & Architecture
template: doc
sidebar:
    order: 2
tags: ["Enterprise"]
---

This conceptual guide explains how LocalStack runs inside a Kubernetes cluster, how workloads are executed, and how networking and DNS behave in a Kubernetes-based deployment.


## How the LocalStack pod works

The LocalStack pod runs the LocalStack runtime and acts as the central coordinator for all emulated AWS services within the cluster.

Its primary responsibilities include:

* Exposing the LocalStack edge endpoint and AWS service API ports
* Receiving and routing incoming AWS API requests
* Orchestrating services that require additional compute (for example Lambda, Glue, ECS, and EC2)
* Managing the lifecycle of compute workloads spawned on behalf of AWS services

From a Kubernetes perspective, the LocalStack pod is a standard pod that fully participates in cluster networking. It is typically exposed through a Kubernetes `Service`, and all AWS API interactions —whether from inside or outside the cluster— are routed through this pod.

![How the Localstack Pod works](/images/aws/k8s-concepts.png)


## Execution modes

LocalStack supports two execution modes for running compute workloads:

* Docker executor
* Kubernetes-native executor

### Docker executor

The Docker executor runs workloads as containers started via a Docker runtime that is accessible from the LocalStack pod. This provides a simple, self-contained execution model without Kubernetes-level scheduling.

However, Kubernetes does not provide a Docker daemon inside pods by default. To use the Docker executor in Kubernetes, the LocalStack pod must be given access to a Docker-compatible runtime (commonly via a Docker-in-Docker sidecar), which adds complexity and security concerns.

### Kubernetes-native executor

The Kubernetes-native executor runs workloads as Kubernetes pods. In this mode, LocalStack communicates directly with the Kubernetes API to create, manage, and clean up pods on demand.

This execution mode provides stronger isolation, better security, and full integration with Kubernetes scheduling, resource limits, and lifecycle management.

The execution mode is configured using the `CONTAINER_RUNTIME` environment variable.


## Child pods

For compute-oriented AWS services, LocalStack can execute workloads either within the LocalStack pod itself or as separate Kubernetes pods.

When the Kubernetes-native executor is enabled, LocalStack launches compute workloads as dedicated Kubernetes pods (referred to here as *child pods*). These include:

* Lambda function invocations
* Glue jobs
* ECS tasks and Batch jobs
* EC2 instances
* RDS databases
* Apache Airflow workflows
* Amazon Managed Service for Apache Flink
* Amazon DocumentDB databases
* Redis instances
* CodeBuild containers

For example, each Glue job run or ECS task invocation results in a new pod created from the workload’s configured runtime image and resource requirements.

These child pods execute independently of the LocalStack pod. Kubernetes is responsible for scheduling them, enforcing resource limits, and managing their lifecycle. Most child pods are short-lived and terminate once the workload completes, though some services (such as Lambda) may keep pods running for longer periods.


## Networking model

LocalStack runs as a standard Kubernetes pod and is accessed through a Kubernetes `Service` that exposes the edge API endpoint and any additional service ports.

Other pods within the cluster communicate with LocalStack through this Service using normal Kubernetes DNS resolution and cluster networking.

When the Kubernetes-native executor is enabled, child pods communicate with LocalStack in the same way, by sending API requests over the cluster network to the LocalStack Service.


## DNS behavior

LocalStack includes a DNS server capable of resolving AWS-style service endpoints.

In a Kubernetes deployment:

* The DNS server can be exposed through the same Kubernetes Service as the LocalStack API ports.
* This allows transparent resolution of AWS service hostnames and `localhost.localstack.cloud` to LocalStack endpoints from within the cluster.
* If a custom domain is used to refer to the LocalStack Kubernetes service (via `LOCALSTACK_HOST`) then this name and subdomains of this name are also resolved by the LocalStack DNS server

This enables applications running in Kubernetes to interact with LocalStack using standard AWS SDK endpoint resolution without additional configuration.


## When to choose the Kubernetes-native executor

The Kubernetes-native executor should be used when LocalStack is deployed inside a Kubernetes cluster and workloads must run reliably and securely.

It is the recommended execution mode for nearly all Kubernetes deployments, because Kubernetes does not include a Docker daemon inside pods and does not provide native Docker access. The Kubernetes-native executor aligns with Kubernetes’ workload model, enabling pod-level isolation, scheduling, and resource governance.

The Docker executor is not supported for use inside Kubernetes clusters. While it may function in environments that have been explicitly configured to expose a Docker-compatible runtime to the LocalStack pod, such setups are uncommon and may introduce security or operational complexity. For Kubernetes-based deployments, the Kubernetes-native executor is the supported and recommended execution mode.
