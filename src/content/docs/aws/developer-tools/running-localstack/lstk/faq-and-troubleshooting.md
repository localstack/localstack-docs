---
title: lstk FAQ & Troubleshooting
description: Frequently asked questions and common issues when using lstk.
template: doc
tags: ['Hobby']
---

## FAQ

### Can I use `lstk` with Docker Compose?

Yes, for the commands that talk to an already-running emulator.
`lstk start` and the other lifecycle commands manage their own Docker container and are not meant to drive a Compose-managed instance, so don't point `lstk start` at one.
But if you run LocalStack from a `docker-compose.yml`, you can still use `lstk`'s emulator-facing commands against it — `aws`, `az`, `terraform`/`cdk`/`sam`, `status`, `reset`, and `snapshot` — by passing `--endpoint-url <url>` (or setting `LSTK_ENDPOINT_URL`) to target the Compose deployment.

See [Targeting an external emulator](/aws/developer-tools/running-localstack/lstk/automation/#targeting-an-external-emulator) for the commands that accept an endpoint, and the [Docker Compose installation guide](/aws/getting-started/installation/#docker-compose) for the Compose setup itself.

### Which Docker image does `lstk` use?

It depends on the emulator type configured in your `config.toml`.
The AWS emulator uses `localstack/localstack-pro`, the Snowflake emulator uses `localstack/snowflake`, and the Azure emulator uses `localstack/localstack-azure`.
All require a valid auth token (including the free Hobby tier).
See [Emulator types](/aws/developer-tools/running-localstack/lstk/configuration/#emulator-types).

### How do I pass configuration options like `DEBUG` or `PERSISTENCE` to the container?

Use environment profiles in your `config.toml`.
Define the variables under an `[env.<name>]` section and reference that name in the `env` list of your container config.
See [Passing environment variables to the container](/aws/developer-tools/running-localstack/lstk/configuration/#passing-environment-variables-to-the-container) for details.

### How do I save and restore emulator state?

Use [`lstk snapshot save`](/aws/developer-tools/running-localstack/lstk/snapshots/#snapshot-save) to capture the running AWS emulator's state to a local file or a Cloud Pod, and [`lstk snapshot load`](/aws/developer-tools/running-localstack/lstk/snapshots/#snapshot-load) (or the `lstk save` / `lstk load` aliases) to restore it.
To drop in-memory state without writing a snapshot, use [`lstk reset`](/aws/developer-tools/running-localstack/lstk/lifecycle-commands/#reset) (AWS emulator only).

### How do I pin a specific LocalStack version?

Set the `tag` field in your `config.toml` to a specific version tag:

```toml
[[containers]]
type = "aws"
tag  = "2026.4"
port = "4566"
```

## Troubleshooting

### Port 443 already in use

By default, LocalStack publishes both port `4566` and port `443` (controlled by the `GATEWAY_LISTEN` variable).
On some systems port 443 is already taken — Windows with Hyper-V, IIS, or VPN software, or an ingress proxy such as Rancher Desktop's Traefik.

Because port 443 comes from the **default** `GATEWAY_LISTEN`, a busy 443 is **not fatal**: `lstk` drops that publication with a warning and starts anyway, and HTTPS is still served on the edge port `4566`. You only need to act if you want to silence the warning or bind 443 elsewhere.

To skip port 443 entirely, override `GATEWAY_LISTEN` to bind only to `4566`:

```toml
[[containers]]
type = "aws"
tag  = "latest"
port = "4566"
env  = ["nossl"]

[env.nossl]
GATEWAY_LISTEN = "0.0.0.0:4566"
```

:::note
A port you list **explicitly** in a custom `GATEWAY_LISTEN` is treated as a hard requirement, so a busy one there fails the start rather than being dropped. Only the `443` from the default value is best-effort.
:::

### Docker is not running

`lstk` requires a running Docker daemon.
If Docker is not reachable, you will see an error like:

```text
Error: runtime not healthy
```

**Fix:** Start your container runtime. `lstk` works with Docker Desktop, Rancher Desktop, Colima, OrbStack, Lima, and Podman — start the Docker daemon (`sudo systemctl start docker` on Linux) or the relevant VM (`rdctl start`, `colima start`, `podman machine start`, …). When the runtime is unavailable, `lstk`'s error tailors its suggested start command to whichever runtime it detects.
You can also point `lstk` at a specific socket with `DOCKER_HOST`. See [Container runtime discovery](/aws/developer-tools/running-localstack/lstk/automation/#container-runtime-discovery) for how the daemon is located.

### Authentication required in non-interactive mode

When running without a TTY (e.g. in CI), `lstk` cannot open a browser for login.
If no token is found in the keyring or environment, it fails:

```text
authentication required: set LOCALSTACK_AUTH_TOKEN or run in interactive mode
```

**Fix:** Set the `LOCALSTACK_AUTH_TOKEN` environment variable before running `lstk`:

```bash
export LOCALSTACK_AUTH_TOKEN=<your-token>
lstk --non-interactive start
```

You can find your auth token on the [Auth Tokens page](https://app.localstack.cloud/workspace/auth-tokens).

### License validation failed

If your auth token is invalid, expired, or not linked to an active license, the LocalStack container exits with a license error:

```text
The license activation failed for the following reason:
No credentials were found in the environment.
```

**Fix:**

- Verify your token is valid at the [Auth Tokens page](https://app.localstack.cloud/workspace/auth-tokens).
- Make sure the token is set correctly, either via `lstk login` or the `LOCALSTACK_AUTH_TOKEN` environment variable.
- A stale token or cached license no longer requires a manual `lstk logout`: when the platform definitively rejects it, `lstk` drops the cached license and, in an interactive terminal, prompts you to log in again and retries automatically. In non-interactive mode, run `lstk logout && lstk login` (or set a valid `LOCALSTACK_AUTH_TOKEN`) and re-run.

### Image pull failed

If `lstk` cannot pull the Docker image, check your network connection and Docker configuration.
On corporate networks, you may need to configure Docker's proxy settings, see [How do I configure LocalStack to use my corporate HTTP and HTTPS proxy?](/aws/getting-started/faq/#how-do-i-configure-localstack-to-use-my-corporate-http-and-https-proxy).

### Unknown environment profile

If your container config references an `env` profile that doesn't exist, `lstk` returns:

```text
environment "myprofile" referenced in container config not found
```

**Fix:** Make sure the profile name in the `env` list matches an `[env.<name>]` section in your `config.toml`:

```toml
[[containers]]
type = "aws"
env  = ["myprofile"]   # must match the section name below

[env.myprofile]
DEBUG = "1"
```

### Getting help

If the steps above don't resolve your issue, see [Get Help](/aws/help-support/get-help/) for the available support channels, including the support email and in-app chat.
