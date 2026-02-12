---
title: Overview
description: Kubernetes with LocalStack
template: doc
sidebar:
    order: 1
tags: ["Enterprise"]
---


LocalStack is a local AWS cloud environment that emulates core AWS services for development and testing. 

When LocalStack is deployed on Kubernetes and configured to use the Kubernetes-native executor (by setting `CONTAINER_RUNTIME=kubernetes`), services that would normally spawn Docker containers (ie., Lambda, ECS, or RDS) instead create Kubernetes pods within the cluster. This enables dynamic scaling, isolation, and native Kubernetes orchestration.

Supported cases:

- Local Development Environments: Provide isolated, consistent environments for individual developers or small teams.
- Hosted Development Environments: Provide scalable and isolated development environments for teams. 
- CI/CD Pipeline Testing: Run end-to-end integration tests in a reproducible, cloud-like environment during CI/CD workflows.

## Requirements:

- K8s Cluster (such as k3d, minikube, EKS)
- [kubectl](https://kubernetes.io/docs/reference/kubectl/)
- (Optional) [Helm](https://helm.sh/)
- (Optional) LS helm chart
- (Optional) LS operator


## Deployment methods

LocalStack can be deployed into a Kubernetes cluster using multiple methods:
* using the LocalStack Operator
* using the LocalStack helm chart
* by manually creating Kubernetes manifests


The table below compares these methods.

| Deployment approach | Pros | Cons |
|---------------------|------|------|
| **Operator** | · Declarative, self-managed control plane<br> · Built-in validation, defaulting, and reconciliation logic | · Steeper learning curve compared to Helm |
| **Helm chart** | · Simplifies deployment using templates and `values.yaml`<br> · Supports versioning, upgrades, and rollbacks<br> · Supports both LocalStack Community and Pro images | · Customization is limited to chart values and overrides |
| **DIY (YAML manifests)** | · Full control over Kubernetes configuration and resources | · Time-consuming to set up and maintain<br> · Manual updates and lifecycle management |


## Licensing

While the LocalStack Community image can be deployed in Kubernetes, it does not support containerized service functionality required for full cloud-like behavior. Services such as Lambda, which require spawning and managing compute containers at runtime, only support pod creation with the LocalStack Pro image. The Community edition lacks the runtime capabilities needed to dynamically instantiate and orchestrate workloads in Kubernetes.

## Help & Support

LocalStack Pro (with a valid license) is the only version that provides:

- Official support and integration for Kubernetes environments.
- Dynamic pod creation by services like Lambda, ECS, RDS, etc.

Community image users:

- Can be deployed in Kubernetes cluster for basic service emulation (e.g., S3, SQS).
- Do not receive official Kubernetes support.
- Cannot use features like Lambda execution.