---
title: Crossplane
description: Use the Crossplane cloud-native control plane framework with LocalStack.
template: doc
sidebar:
    order: 3
---

## Overview

[Crossplane](https://www.crossplane.io) is a cloud-native control plane framework, which offers an extensible backend that enables orchestrating applications and infrastructure via declarative APIs and resource definitions.

Crossplane offers a native [AWS provider](https://github.com/upbound/provider-aws) which can be used to create and manage AWS cloud resources via the Crossplane platform.
For example, it can be used to create S3 buckets, SQS queues, Lambda functions, among many other resources.
Crossplane AWS provider supports a comprehensive set of some [900+ resource types](https://marketplace.upbound.io/providers/upbound/provider-aws).

## Getting started

In the following, we provide a step-by-step guide for installing Crossplane in a local test environment, and creating AWS resources (S3 bucket, SQS queue) in LocalStack via Crossplane.

### Prerequisites

* LocalStack running in local Docker
* A local Kubernetes cluster:
  * We can use the [embedded Kubernetes cluster](https://docs.docker.com/desktop/kubernetes) that ships with modern versions of Docker Desktop (can be easily enabled in the Docker settings)
  * Alternatively, you can [create a local EKS cluster](/aws/services/eks/#create-an-embedded-kubernetes-cluster) in LocalStack directly, which will spin up a light-weight embedded `k3d` Kubernetes cluster in your Docker environment
* The [`helm`](https://helm.sh) and [`kubectl`](https://kubernetes.io/docs/tasks/tools/#kubectl) command-line clients installed

## Installing Crossplane in local Kubernetes

Once your `kubectl` is configured to point to the local Kubernetes cluster, we first install Crossplane via `helm`:
```bash
helm repo add crossplane-stable https://charts.crossplane.io/stable
helm repo update
helm install crossplane crossplane-stable/crossplane --namespace crossplane-system --create-namespace
```

The installation may take a few minutes.
In parallel, we can install the `crossplane` command-line tool.
```bash
curl -sL https://raw.githubusercontent.com/crossplane/crossplane/master/install.sh | bash
sudo mv crossplane /usr/local/bin
```
To confirm that the installation was successful, we can run these commands, which should yield output similar to the following:
```bash
crossplane version
```
```bash title="Output"
Client Version: v1.17.0
Server Version: v1.17.0
```

```bash
kubectl get crds | grep crossplane
```
```bash title="Output"
compositions.apiextensions.crossplane.io                     2023-09-03T11:30:36Z
configurations.pkg.crossplane.io                             2023-09-03T11:30:36Z
```

### Installing the Crossplane AWS Provider

Once the basic Crossplane installation is running properly, we can proceed with installing the AWS provider.
Newer versions of Crossplane promote the use of [provider families](https://docs.upbound.io/providers/provider-families), which are collections of providers for different groups of resources.
For example, there is a separate provider for each individual AWS service (like S3, SQS, Lambda, etc), and in addition provider family provides shared resources for common configuration of all services (e.g., credentials, etc).

In the following, we first install the AWS provider for S3.
Note that you can copy/paste the entire multi-line command below into your terminal:
```bash
cat <<EOF | kubectl apply -f -
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-s3
spec:
  package: xpkg.upbound.io/upbound/provider-aws-s3:v0.40.0
EOF
```

We also install the AWS provider for SQS:
```bash
cat <<EOF | kubectl apply -f -
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-sqs
spec:
  package: xpkg.upbound.io/upbound/provider-aws-sqs:v0.40.0
EOF
```

After some time, the providers should get into healthy state, which can be confirmed via `kubectl get providers`:
```bash
kubectl get providers
```
```bash title="Output"
NAME                          INSTALLED   HEALTHY   PACKAGE                                               AGE
upbound-provider-family-aws   True        True      xpkg.upbound.io/upbound/provider-family-aws:v0.40.0   2m
provider-aws-s3               True        True      xpkg.upbound.io/upbound/provider-aws-s3:v0.40.0       2m
provider-aws-sqs              True        True      xpkg.upbound.io/upbound/provider-aws-sqs:v0.40.0      2m
```

Next, we install a secret to define the test credentials for the AWS provider:
```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: localstack-aws-secret
stringData:
  creds: |
    [default]
    aws_access_key_id = test
    aws_secret_access_key = test
EOF
```

Finally, we create an AWS  `ProviderConfig` that references the secret created above, and defines a static `endpoint` pointing to the LocalStack URL `http://host.docker.internal:4566`:
```bash showshowLineNumbers
cat <<EOF | kubectl apply -f -
apiVersion: aws.upbound.io/v1beta1
kind: ProviderConfig
metadata:
  name: default
spec:
  credentials:
    source: Secret
    secretRef:
      name: localstack-aws-secret
      namespace: default
      key: creds
  endpoint:
    hostnameImmutable: true
TODO: add more services to this list, as needed
    services: [iam, s3, sqs, sts]
    url:
      type: Static
      static: http://host.docker.internal:4566
  skip_credentials_validation: true
  skip_metadata_api_check: true
  skip_requesting_account_id: true
  s3_use_path_style: true
EOF
```

:::note
The endpoint `http://host.docker.internal:4566` in the listing above assumes that you are running Kubernetes in the local Docker engine, and that LocalStack is up and running and available on default port `4566`.
:::

:::note
The Crossplane AWS provider currently requires us to specify the list of `services` for which the local `endpoint` is used as the target URL.
Please make sure to extend this list accordingly if you're working with additional LocalStack services.
:::

### Deploying sample resources in LocalStack

After the Crossplane AWS provider is properly installed and configured, we can proceed with creating some local resources.

First, we create an S3 bucket named `crossplane-test-bucket`:
```bash
cat <<EOF | kubectl apply -f -
apiVersion: s3.aws.upbound.io/v1beta1
kind: Bucket
metadata:
  name: crossplane-test-bucket
spec:
  forProvider:
    region: us-east-1
EOF
```

If everything is wired up correctly, you should now see some activity in the LocalStack log outputs, where Crossplane starts deploying the S3 bucket against LocalStack.
After some time, the bucket should be transitioning into `ready` state within Crossplane:
```bash
kubectl get buckets
```
```bash
NAME                     READY   SYNCED   EXTERNAL-NAME            AGE
crossplane-test-bucket   True    True     crossplane-test-bucket   30s
```

...
and the bucket it should also be visible when querying the local S3 buckets in LocalStack via [`awslocal`](https://github.com/localstack/awscli-local):
```bash
awslocal s3 ls
```
```bash title="Output"
2023-09-03 15:18:47 crossplane-test-bucket
```

We can repeat the same exercise for creating a local SQS queue named `crossplane-test-queue`:
```bash
cat <<EOF | kubectl apply -f -
apiVersion: sqs.aws.upbound.io/v1beta1
kind: Queue
metadata:
  name: crossplane-test-queue
spec:
  forProvider:
    name: crossplane-test-queue
    region: us-east-1
EOF
```

After some time, the queue should transition into `ready` state in Crossplane:
```bash
kubectl get queues
```
```bash title="Output"
NAME                    READY   SYNCED   EXTERNAL-NAME                                                         AGE
crossplane-test-queue   True    True     http://host.docker.internal:4566/000000000000/crossplane-test-queue   40s
```

...and the queue should be visible when listing the SQS queues in LocalStack:
```bash
awslocal sqs list-queues
```

```bash title="Output"
{
    "QueueUrls": [
        "http://localhost:4566/000000000000/crossplane-test-queue"
    ]
}
```

### Summary

The Crossplane AWS provider is a great way to manage AWS resources, and by leveraging the `endpoint` configuration of the provider, we can seamlessly run resource deployments against LocalStack.

In this tutorial, we have provided an end-to-end walkthrough of how to provision two simple resources - an S3 bucket, and an SQS queue.
Crossplane supports a vast range of additional AWS resource types, as well as advanced operations like updating, deleting, or composing resources.
You can refer to the additional reading material to learn and explore more advanced features.

## Further Reading

* Kubernetes on Docker Desktop: https://docs.docker.com/desktop/kubernetes
* Kubernetes getting started guide: https://kubernetes.io/docs/setup
* EKS Kubernetes clusters on LocalStack: https://docs.localstack.cloud/aws/services/eks/
* Crossplane user docs: https://docs.crossplane.io
* Crossplane AWS provider family: https://marketplace.upbound.io/providers/upbound/provider-family-aws
* Crossplane AWS provider source code: https://github.com/upbound/provider-aws