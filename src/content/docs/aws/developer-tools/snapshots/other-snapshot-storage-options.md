---
title: Saving to other storage
description: Save Snapshots directly to Amazon S3, or to a OCI-compatible repository.
template: doc
tags: ["Base"]
sidebar:
    order: 4
---

LocalStack supports saving Snapshots directly to Amazon S3, or to an OCI-compatible repository, as an alternative to Cloud Pods or local storage.

## Remotes

A remote is the location where Cloud Pods are stored.
By default, Cloud Pod artifacts are stored in the LocalStack platform.
However, if your organization's data regulations or sovereignty requirements prohibit storing Cloud Pod assets in a remote storage infrastructure, you have the option to persist Cloud Pods in an on-premises storage location under your complete control.

LocalStack provides two types of alternative remotes:

- S3 bucket remote storage.
- [ORAS](https://oras.land/) (OCI Registry as Storage) remote storage.

Cloud Pods command-line interface (CLI) allows you to create, delete, and list remotes.

```bash
localstack pod remote --help
```

```bash
Usage: localstack pod remote [OPTIONS] COMMAND [ARGS]...

  Manage cloud pod remotes

Options:
  -h, --help  Show this message and exit.

Commands:
  add     Add a remote
  delete  Delete a remote
  list    List the available remotes
```

### S3 bucket remote storage

The S3 remote enables you to store Cloud Pod assets in an existing S3 bucket within an actual AWS account.
The initial step is to export the necessary AWS credentials within the terminal session.

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

A possible option is to obtain credentials via [AWS SSO CLI](https://github.com/synfinatic/aws-sso-cli).

Next, we establish a new remote specifically designed for an S3 bucket.
By running the following command, we create a remote named `s3-storage-aws` responsible for storing Cloud Pod artifacts in an S3 bucket called `ls-pods-bucket-test`.

The `access_key_id` and `secret_access_key` placeholders ensure the correct transmission of AWS credentials to the container.

```bash
localstack pod remote add s3-storage-aws 's3://ls-pods-bucket-test/?access_key_id={access_key_id}&secret_access_key={secret_access_key}'
```

Lastly, you can utilize the standard `pod` CLI command to generate a new Cloud Pod that points to the previously established remote.

```bash
localstack pod save my-pod s3-storage-aws
```

Once the command has been executed, you can confirm the presence of Cloud Pod artifacts in the S3 bucket by simply running:

```bash
aws s3 ls s3://ls-pods-bucket-test
2023-09-27 13:50:10      83650 localstack-pod-my-pod-state-1.zip
2023-09-27 13:50:11      85103 localstack-pod-my-pod-version-1.zip
```

You can use the `pod load` command to load the same pod that was previously saved in this remote:

```bash
localstack pod load my-pod s3-storage-aws
```

Similarly, you can list the Cloud Pods on this specific remote with the `pod list` command:

```bash
localstack pod list s3-storage-aws
```

:::note
Full S3 remotes support is available in the CLI from version 3.2.0.
If you experience any difficulties, update your [LocalStack CLI](/aws/getting-started/installation/#update-localstack-cli).
:::

### ORAS remote storage

The ORAS remote enables users to store Cloud Pods in OCI-compatible registries like Docker Hub, Nexus, or ECS registries.
ORAS stands for "OCI Registry as Service," and you can find additional information about this standard [on the official website](https://oras.land/).

For example, let's illustrate how you can utilize Docker Hub to store and retrieve Cloud Pods.

To begin, you must configure the new remote using the LocalStack CLI.
You'll need to export two essential environment variables, `ORAS_USERNAME` and `ORAS_PASSWORD`, which are necessary for authenticating with Docker Hub.

```bash
export ORAS_USERNAME=docker_hub_id
export ORAS_PASSWORD=ILoveLocalStack1!
```

You can now use the CLI to create a new remote called `oras-remote`.

```bash
localstack pod remote add oras-remote 'oras://{oras_username}:{oras_password}@registry.hub.docker.com/<docker_hub_id>'
```

Lastly, you can store a pod using the newly configured remote, where `my-pod` represents the Cloud Pod's name, and `oras-remote` is the remote's name.

```bash
localstack pod save my-pod oras-remote
```

Likewise, you can execute the reverse operation to load a Cloud Pod from `oras-remote` using the following command:

```bash
localstack pod load my-pod oras-remote
```

### Auto Load with remotes

LocalStack also supports the auto load of a Cloud Pod from registered remotes.
The configuration is similar to what we just described.
In particular you could simply add the remote name to the text files inside the `init-pods.d`, as follows:

```text
foo-pod,bar-remote
```

With such a configuration, the `foo-pod` Cloud Pod will be loaded from the `bar-remote` remote.
To properly configure the remote, you need to provide the needed environment variables when starting the LocalStack container.
For instance, a S3 remote needs a `AWS_ACCESS_KEY` and a `AWS_SECRET_ACCESS_KEY`, as follows:

```yaml showLineNumbers
services:
  localstack:
    container_name: "localstack-main"
    image: localstack/localstack-pro
    ports:
      - "127.0.0.1:4566:4566"
      - "127.0.0.1:4510-4559:4510-4559"
    environment:
      - LOCALSTACK_AUTH_TOKEN=${LOCALSTACK_AUTH_TOKEN:?}
      - DEBUG=1
      - AWS_ACCESS_KEY_ID:...
      - AWS_SECRET_ACCESS_KEY:...
    volumes:
      - "./volume:/var/lib/localstack"
      - "./init-pods.d:/etc/localstack/init-pods.d"
```

:::note
The Auto Load from remote feature does not automatically configure the remote.
This needs to be done with the `localstack pod remote add ...` command.
This commands creates a configuration file for the remote in the [LocalStack volume directory](/aws/customization/advanced/filesystem/#localstack-volume-directory).
:::
