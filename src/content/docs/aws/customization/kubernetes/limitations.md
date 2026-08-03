---
title: Limitations
description: Known limitations when running LocalStack on Kubernetes
template: doc
sidebar:
    order: 10
tags: ["Enterprise"]
---

Some LocalStack services have limited or no support when running on Kubernetes.

:::note
We are continually working on improving parity between Docker and Kubernetes so there will be fewer limitations in the future.
:::

## Unsupported services

The following services require the use of Docker, and are not supported when running LocalStack on Kubernetes:

- Sagemaker
- Bedrock
- EKS
- CodeBuild

## Limitations of partially supported services

### SSM

- Exec into EC2 instances is not supported.

### ECS

- Firelens is not supported.
- Volumes are not supported.
- Exposing ports from tasks is not supported.
- [`RepositoryCredentials`](https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_RepositoryCredentials.html) is not supported.

### EC2

- Userdata does not have full parity with AWS.

### ElastiCache/MemoryDB

- Requires using `REDIS_CONTAINER_MODE=1`.

### RDS

- MySQL 5.7 is not supported on Kubernetes.
- Persistence is not supported.

### Neptune

- Persistence is not supported.
