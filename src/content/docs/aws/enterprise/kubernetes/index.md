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
| **Operator** | · Declarative, self-managed control plane<br> · Built-in validation, defaulting, and reconciliation logic | · Requires in-cluster component (controller) |
| **Helm chart** | · Simplifies deployment using templates and `values.yaml`<br> · Supports versioning, upgrades, and rollbacks<br> | · Customization is limited to chart values and overrides |
| **DIY (YAML manifests)** | · Full control over Kubernetes configuration and resources | · Time-consuming to set up and maintain<br> · Manual updates and lifecycle management |

## Limitations
| Service | Supported | Explanation |
| ------- | --------- | ----------- |
| `Sagemaker` | No | Requires spawning Docker containers at runtime, which is unavailable when LocalStack runs inside a Kubernetes pod. |
| `Bedrock` | No | Requires spawning Docker containers at runtime, which is unavailable when LocalStack runs inside a Kubernetes pod. |
| `EKS` | No | Uses k3d, which requires Docker to create clusters. A Docker-free local mode is available but unsupported. |
| `CodeBuild` | No | Requires spawning Docker containers at runtime, which is unavailable when LocalStack runs inside a Kubernetes pod. |
| `SSM` | Partial | Most SSM functionality is supported. Session Manager (`ssm:StartSession`) for exec-ing into EC2 instances is not supported. |
| `ECS` | Partial | Core task execution is supported. FireLens log routing, volume mounts, port exposure from tasks, and private registry credentials via `RepositoryCredentials` are not supported. |
| `EC2` | Partial | Core EC2 functionality is supported. User data scripts may not behave identically to AWS — full parity is not guaranteed. |
| `RDS` | Partial | Most database engines are supported. MySQL 5.7 is not supported. Persistence across pod restarts is not supported, except for PostgreSQL and MariaDB. |

## Help & Support

LocalStack Enterprise (or additional purchase of the Kubernetes pack add-on) is the only version that provides: 

- Official support and integration for Kubernetes environments.
- Dynamic pod creation by services like Lambda, ECS, RDS, etc.
