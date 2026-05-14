---
title: Service Endpoints
description: Reference for the LocalStack service endpoint, its variants, and how to handle DNS rebind protection.
template: doc
sidebar:
  order: 7
---

This page describes the DNS endpoint used by AWS client tools when connecting to LocalStack. It also includes some lesser-known variants of that endpoint used by specific AWS services.

## The `localhost.localstack.cloud:4566` endpoint

`http://localhost.localstack.cloud:4566` is the recommended endpoint when running LocalStack on your local machine, with tools configured to use it by default. Point your AWS CLI, AWS SDKs, and other AWS tooling at this URL and LocalStack handles the routing to the correct service.

In the AWS cloud, each service has its own regional endpoint (for example, `s3.us-east-1.amazonaws.com` or `sqs.eu-west-1.amazonaws.com`). The full list is published in the [AWS Service Endpoints reference](https://docs.aws.amazon.com/general/latest/gr/rande.html). LocalStack collapses all of these into a single DNS endpoint, regardless of service or region.

However, a small number of services use a variant of the main endpoint. The table below lists the variants that LocalStack supports.

| Endpoint                                           | Purpose                                                           |
|----------------------------------------------------|-------------------------------------------------------------------|
| `<bucket-name>.s3.localhost.localstack.cloud:4566` | Virtual-host style access to S3 buckets.                          |
| `sync-localhost.localstack.cloud:4566`             | Step Functions synchronous express workflows.                     |
| `data-localhost.localstack.cloud:4566`             | Cloud Map data plane and Lake Formation data plane.               |
| `query-localhost.localstack.cloud:4566`            | Lake Formation query plane.                                       |
| `streaming-localhost.localstack.cloud:4566`        | CloudWatch Logs streaming endpoints                               |
| `{env,api,ops}.localhost.localstack.cloud:4566`    | MWAA environment, control plane, and metric publishing endpoints. |

These variants exist because the corresponding AWS services use a host prefix on their real endpoints. LocalStack honors these variants when receiving requests.

For LocalStack to function correctly, the main endpoint and every variant above must resolve to `127.0.0.1`. You can verify this with `ping`:

```console
$ ping localhost.localstack.cloud
PING localhost.localstack.cloud (127.0.0.1): 56 data bytes
64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.044 ms
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.073 ms

$ ping my-bucket.s3.localhost.localstack.cloud
PING my-bucket.s3.localhost.localstack.cloud (127.0.0.1): 56 data bytes
64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.041 ms
```

:::caution
If a DNS endpoint fails to resolve for some reason, LocalStack will not work as expected. You'll need to read and understand the rest of this page to understand why.
:::

## Why not use `localhost:4566`?

Using `localhost` (or `127.0.0.1` directly) works for the main endpoint, but it does not work for most of the derived endpoints, because those hostnames are not always legal:

| Variant with `localhost.localstack.cloud`      | Equivalent with `localhost`   | Equivalent with `127.0.0.1`   |
|------------------------------------------------|-------------------------------|-------------------------------|
| `my-bucket.s3.localhost.localstack.cloud:4566` | `my-bucket.s3.localhost:4566` | `my-bucket.s3.127.0.0.1:4566` |
| `sync-localhost.localstack.cloud:4566`         | `sync-localhost:4566`         | `sync-127.0.0.1:4566`         |
| `data-localhost.localstack.cloud:4566`         | `data-localhost:4566`         | `data-127.0.0.1:4566`         |
| `streaming-localhost.localstack.cloud:4566`    | `streaming-localhost:4566`    | `streaming-127.0.0.1:4566`    |
| `env.localhost.localstack.cloud:4566`          | `env.localhost:4566`          | `env.127.0.0.1:4566`          |

None of the entries in the `localhost` or `127.0.0.1` columns are guaranteed to resolve to `127.0.0.1`. On macOS, subdomains of `localhost` happen to resolve correctly, but this is not portable. For example, most Linux distributions and Windows do not resolve them by default. Numeric forms such as `my-bucket.s3.127.0.0.1` are not valid hostnames at all. Finally, on some machines  `localhost` resolves to the IPv6 loopback address `::1`. LocalStack only listens on IPv4, so requests sent over IPv6 fail to connect.

You may see errors in your tooling when an endpoint does not resolve to `127.0.0.1`. This is not a problem you encounter against AWS, and it is not a problem when targeting `localhost.localstack.cloud`, so most tools do not handle it gracefully.

## Working with DNS rebind protection

DNS rebind protection is a security feature implemented by many DNS resolvers, routers, and corporate firewalls. It prevents public DNS records from resolving to private IP ranges (such as `127.0.0.0/8`, `10.0.0.0/8`, or `192.168.0.0/16`), which blocks a class of attacks where a malicious site uses DNS to pivot a browser session into the user's local network.

Because `localhost.localstack.cloud` and its subdomains are public DNS records that resolve to `127.0.0.1`, some DNS resolvers refuse to return them. When this happens, the main endpoint and its variants stop resolving and your AWS tooling cannot reach LocalStack.

If you suspect DNS rebind protection is in play, try the solutions below in order of preference.

### 1. Update your network or firewall configuration

If you control the DNS resolver or firewall, add `localhost.localstack.cloud` and its subdomains to the rebind protection exception list. This is the cleanest fix because it leaves DNS resolution working normally for every tool on the machine. Consult your resolver's documentation for the exact setting.

### 2. Add entries to `/etc/hosts`

If you cannot change the resolver, you can bypass DNS entirely by adding the hostnames to your local hosts file. On macOS and Linux this is `/etc/hosts`; on Windows it is `C:\Windows\System32\drivers\etc\hosts`.

```text
127.0.0.1 localhost.localstack.cloud
127.0.0.1 s3.localhost.localstack.cloud
127.0.0.1 sync-localhost.localstack.cloud
127.0.0.1 data-localhost.localstack.cloud
127.0.0.1 query-localhost.localstack.cloud
127.0.0.1 streaming-localhost.localstack.cloud
127.0.0.1 env.localhost.localstack.cloud
127.0.0.1 api.localhost.localstack.cloud
127.0.0.1 ops.localhost.localstack.cloud
```

The hosts file does not support wildcards, so virtual-host style S3 buckets need one entry per bucket name:

```text
127.0.0.1 my-bucket.s3.localhost.localstack.cloud
```

If you create buckets frequently, this approach becomes tedious. You should instead incorporate the following solution.

### 3. Rely on tool-level workarounds

Some AWS client tools can be configured to avoid the problematic subdomain altogether. For S3, this means path-style addressing, which puts the bucket name in the URL path rather than the hostname (`http://localhost.localstack.cloud:4566/my-bucket/key` instead of `http://my-bucket.s3.localhost.localstack.cloud:4566/key`).

LocalStack tooling such as `lstk` and `awslocal` already prefers path-style access where the SDK supports it, so you typically do not need to set it manually.  If you do need to set it manually for a third-party tool, the AWS CLI and most AWS SDKs accept an S3 addressing-style option in your [AWS configuration files](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).

```ini
[profile localstack]
region = us-east-1
endpoint_url = http://localhost.localstack.cloud:4566
s3 =
  addressing_style = path
```

Equivalent options exist in most AWS SDKs (for example, `forcePathStyle: true` in the JavaScript SDK and `force_path_style=True` in boto3).

### 4. Continue to use `localhost:4566` directly

If none of the above are practical, you can keep pointing your tools at `http://localhost:4566` and rely on LocalStack-supported tools to paper over the difference. `lstk`, `awslocal`, and the LocalStack SDK wrappers implement workarounds (path-style S3 addressing, host-prefix rewriting, and similar) so that most requests still reach LocalStack even when the derived hostnames cannot resolve.

This is the least preferred option because the workarounds only cover scenarios we have explicitly handled. You may still encounter calls (typically against host-prefixed services or third-party tooling we do not control) where the request fails to route correctly. If you hit one of these cases, fall back to options 1, 2, or 3 above.