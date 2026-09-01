---
title: Configuration
description: Overview of configuration options in LocalStack for Snowflake.
template: doc
nav: 
label: 
---

LocalStack exposes various configuration options to control its behaviour.

With `lstk`, these options can be passed as `LOCALSTACK_`-prefixed environment variables when starting the container:

```bash
LOCALSTACK_DEBUG=1 lstk start
```

Alternatively, set them as named environment profiles in your config file and reference them from the container block:

```toml
# .lstk/config.toml
[[containers]]
type = "snowflake"
env  = ["debug"]

[env.debug]
DEBUG = "1"
```

```bash
lstk start
```

See [Passing environment variables to the container](/aws/developer-tools/running-localstack/lstk#passing-environment-variables-to-the-container) for details.

## Core

Options that affect the core Snowflake emulator functionality.

| Variable | Example Values       | Description                                                                                                 |
|----------|----------------------|-------------------------------------------------------------------------------------------------------------|
| `DEBUG`  | `0` (default) \| `1` | Flag to increase log level and print more verbose logs (useful for troubleshooting issues)                  |
| `SF_LOG` | `trace`              | Specify the log level. Currently overrides the `DEBUG` configuration. `trace` for detailed request/response |
| `SF_S3_ENDPOINT` | `s3.localhost.localstack.cloud:4566` (default) | Specify the S3 endpoint to use for the Snowflake emulator. |
| `SF_S3_ENDPOINT_EXTERNAL` | `s3.localhost.localstack.cloud:4566` | S3 endpoint for file uploads to return to external clients. Defaults to `SF_S3_ENDPOINT` if not set. |
| `SF_AWS_ENDPOINT_URL` | `localhost:4566` (default) | AWS services endpoint for connecting to other AWS services (SQS, SNS, etc.) from the Snowflake emulator. |
| `DNS_NAME_PATTERNS_TO_RESOLVE_UPSTREAM` | `*.s3.amazonaws.com` (example) | List of domain names that should NOT be resolved to the LocalStack container, but instead always forwarded to the upstream resolver (S3 for example). this would be required when importing data into a stage from an external S3 bucket on the real AWS cloud. Comma-separated list of Python-flavored regex patterns. |
| `SF_HOSTNAMES` | `snowflake.localhost.localstack.cloud,snowflake.internal` | Comma-separated list of hostnames that should route to the Snowflake emulator. If set, only these hostnames are matched. If unset, LocalStack also matches any hostname with a `snowflake.` subdomain (i.e., `*snowflake.*` or `*.snowflake.*`) for backward compatibility.
| `SF_CSV_IMPORT_MAX_ROWS` | `50000` (default) | Maximum number of rows to import from CSV files into tables |
| `SF_DEFAULT_USER` | `test` (default) | Specify the default user to be used by the Snowflake emulator. |
| `SF_DEFAULT_PASSWORD` | `test` (default) | Specify the default password to be used by the Snowflake emulator. |

### Custom Snowflake hostnames

By default, the Snowflake emulator accepts requests for hostnames such as `snowflake.localhost.localstack.cloud` and other `*.snowflake.*` hostnames.
If you expose the emulator through a custom DNS name, for example in Kubernetes or behind an ingress, set `SF_HOSTNAMES` to the exact hostnames clients use to reach the emulator.
When you use `lstk`, add the `LOCALSTACK_` prefix so the CLI passes the variable to the container:

```bash
LOCALSTACK_SF_HOSTNAMES=snowflake.internal.example.com,snowflake.internal,snowflake.localhost.localstack.cloud \
lstk start
```

The first hostname in `SF_HOSTNAMES` is used as the primary hostname for local connection defaults and generated URLs.
When `SF_HOSTNAMES` is set, the default wildcard fallback is disabled, and only the configured hostnames are routed to the Snowflake emulator.
Include `snowflake.localhost.localstack.cloud` in the list, as shown above, if you want the default hostname to continue working.

`SF_HOSTNAMES` controls Host-header routing only.
It does not configure DNS or TLS for custom hostnames.
Configure each hostname to resolve to the LocalStack host from every client that connects to the emulator.
For example, add the following entries to the client's `/etc/hosts` file when LocalStack runs on the same machine:

```text title="/etc/hosts"
127.0.0.1 snowflake.internal.example.com
127.0.0.1 snowflake.internal
```

The default LocalStack certificate does not match custom domains.
Configure a matching custom TLS certificate before connecting through a custom hostname.

::::caution
Do not use `insecure_mode=True` in the Snowflake Connector for Python to work around a certificate hostname mismatch.
This deprecated option disables certificate revocation checks, but the connector still verifies the certificate and hostname.
::::

::::note
`SF_HOSTNAME_REGEX` is no longer supported.
If you previously used `SF_HOSTNAME_REGEX`, migrate to `SF_HOSTNAMES` and list each hostname explicitly.
::::

If your custom hostname also needs a matching TLS certificate, use LocalStack's standard certificate configuration options:

```bash
LOCALSTACK_SF_HOSTNAMES=snowflake.internal.example.com \
CUSTOM_SSL_CERT_PATH=/var/lib/localstack/custom/cert.pem \
SKIP_SSL_CERT_DOWNLOAD=1 \
lstk start
```

The file referenced by `CUSTOM_SSL_CERT_PATH` must contain a certificate and private key that match the hostname used by your Snowflake clients.
For more general guidance on adding trusted certificates to LocalStack, see [Custom TLS certificates](/aws/developer-tools/security-testing/custom-tls-certificates/).

## CLI

`lstk` is configured through its config file rather than through environment variables.
See [Configuration](/aws/developer-tools/running-localstack/lstk#configuration) on the `lstk` page for the config file search order, the field reference, and how to define named environment profiles.

## Docker

Options to configure how LocalStack interacts with Docker.

| Variable | Example Values | Description |
| - | - | - |
| `LOCALSTACK_VOLUME_DIR` | `~/.cache/localstack/volume` (on Linux) | The location on the host of the LocalStack volume directory mount. |
| `DOCKER_FLAGS` | | Allows to pass custom flags (e.g., volume mounts) to "docker run" when running LocalStack in Docker. |
| `DOCKER_SOCK` | `/var/run/docker.sock` | Path to local Docker UNIX domain socket |
| `DOCKER_BRIDGE_IP` | `172.17.0.1` | IP of the Docker bridge used to enable access between containers |
| `LEGACY_DOCKER_CLIENT` | `0`\|`1` | Whether LocalStack should use the command-line Docker client and subprocess execution to run Docker commands, rather than the Docker SDK. |
| `DOCKER_CMD` | `docker` (default), `sudo docker`| Shell command used to run Docker containers (only used in combination with `LEGACY_DOCKER_CLIENT`) |
| `FORCE_NONINTERACTIVE` | | When running with Docker, disables the `--interactive` and `--tty` flags. Useful when running headless. |
