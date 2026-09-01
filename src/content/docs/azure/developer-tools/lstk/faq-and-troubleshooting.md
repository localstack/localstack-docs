---
title: lstk FAQ & Troubleshooting
description: Frequently asked questions and common issues when using lstk.
template: doc
tags: ['Hobby']
---

## FAQ

### Can I use `lstk` with Docker Compose?

No. `lstk` manages its own Docker container directly.
If you use a `docker-compose.yml` to run LocalStack, you do not need `lstk`, and vice versa.
Do not mix `lstk start` with a Docker Compose setup; they are separate, independent methods.

For Docker Compose configuration, see the [Docker Compose installation guide](/azure/getting-started/#docker-compose).

### Which Docker image does `lstk` use?

It depends on the emulator type configured in your `config.toml`.
The AWS emulator uses `localstack/localstack-pro`, the Snowflake emulator uses `localstack/snowflake`, and the Azure emulator uses `localstack/localstack-azure`.
All require a valid auth token (including the free Hobby tier).
See [Emulator types](/azure/developer-tools/lstk/configuration/#emulator-types).

### How do I pass configuration options like `DEBUG` or `PERSISTENCE` to the container?

Use environment profiles in your `config.toml`.
Define the variables under an `[env.<name>]` section and reference that name in the `env` list of your container config.
See [Passing environment variables to the container](/azure/developer-tools/lstk/configuration/#passing-environment-variables-to-the-container) for details.

### How do I save and restore emulator state?

Use [`lstk snapshot save`](/azure/developer-tools/lstk/snapshots/#snapshot-save) to capture the running AWS emulator's state to a local file or a Cloud Pod, and [`lstk snapshot load`](/azure/developer-tools/lstk/snapshots/#snapshot-load) (or the `lstk save` / `lstk load` aliases) to restore it.
To drop in-memory state without writing a snapshot, use [`lstk reset`](/azure/developer-tools/lstk/lifecycle-commands/#reset) (AWS emulator only).

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

By default, LocalStack binds to both port `4566` and port `443` inside the container (controlled by the `GATEWAY_LISTEN` variable).
On some systems, particularly Windows with Hyper-V, IIS, or VPN software, port 443 may already be in use.

**Symptoms:**

```text
failed to start LocalStack: Error response from daemon: ports are not available:
exposing port TCP 127.0.0.1:443 -> 127.0.0.1:0: listen tcp4 127.0.0.1:443: bind:
address already in use
```

**Fix:** Override `GATEWAY_LISTEN` to bind only to port 4566:

```toml
[[containers]]
type = "aws"
tag  = "latest"
port = "4566"
env  = ["nossl"]

[env.nossl]
GATEWAY_LISTEN = "0.0.0.0:4566"
```

This tells the container to skip the port 443 binding entirely.

### Docker is not running

`lstk` requires a running Docker daemon.
If Docker is not reachable, you will see an error like:

```text
Error: runtime not healthy
```

**Fix:** Start Docker Desktop (macOS/Windows) or the Docker daemon (`sudo systemctl start docker` on Linux).
If you use Colima or OrbStack, make sure the VM is running.
You can also point `lstk` at a custom socket with `DOCKER_HOST`.

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
