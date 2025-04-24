---
title: Configuration
description: Overview of configuration options in LocalStack for Snowflake.
template: doc
nav: 
label: 
---


{{< preview-notice >}}

LocalStack exposes various configuration options to control its behaviour.

These options can be passed to LocalStack as environment variables like so:

{{< command >}}
$ DEBUG=1 localstack start
{{< / command >}}

## Core

Options that affect the core Snowflake emulator functionality.

| Variable | Example Values       | Description                                                                                                 |
|----------|----------------------|-------------------------------------------------------------------------------------------------------------|
| `DEBUG`  | `0` (default) \| `1` | Flag to increase log level and print more verbose logs (useful for troubleshooting issues)                  |
| `SF_LOG` | `trace`              | Specify the log level. Currently overrides the `DEBUG` configuration. `trace` for detailed request/response |
| `SF_S3_ENDPOINT` | `s3.localhost.localstack.cloud:4566` (default) | Specify the S3 endpoint to use for the Snowflake emulator. |
| `DNS_NAME_PATTERNS_TO_RESOLVE_UPSTREAM` | `*.s3.amazonaws.com` (example) | List of domain names that should NOT be resolved to the LocalStack container, but instead always forwarded to the upstream resolver (S3 for example). this would be required when importing data into a stage from an external S3 bucket on the real AWS cloud. Comma-separated list of Python-flavored regex patterns. |
| `SF_HOSTNAME_REGEX` | `snowflake\..+` (default) | Allows you to customize the hostname used for matching the Snowflake API routes in the HTTP router. If not set, then it matches on any hostnames that contain a `snowflake.*` subdomain (e.g., `snowflake.localhost.localstack.cloud`). |
| `SF_CSV_IMPORT_MAX_ROWS` | `50000` (default) | Maximum number of rows to import from CSV files into tables |
| `SF_DEFAULT_USER` | `test` (default) | Specify the default user to be used by the Snowflake emulator. |
| `SF_DEFAULT_PASSWORD` | `test` (default) | Specify the default password to be used by the Snowflake emulator. |

## CLI

These options are applicable when using the CLI to start LocalStack.

| Variable | Example Values | Description |
| - | - | - |
| `LOCALSTACK_VOLUME_DIR` | `~/.cache/localstack/volume` (on Linux) | The location on the host of the LocalStack volume directory mount. |
| `CONFIG_PROFILE` | | The configuration profile to load. See [Profiles]({{< ref "#profiles" >}}) |
| `CONFIG_DIR` | `~/.localstack` | The path where LocalStack can find configuration profiles and other CLI-specific configuration |

## Docker

Options to configure how LocalStack interacts with Docker.

| Variable | Example Values | Description |
| - | - | - |
| `DOCKER_FLAGS` | | Allows to pass custom flags (e.g., volume mounts) to "docker run" when running LocalStack in Docker. |
| `DOCKER_SOCK` | `/var/run/docker.sock` | Path to local Docker UNIX domain socket |
| `DOCKER_BRIDGE_IP` | `172.17.0.1` | IP of the Docker bridge used to enable access between containers |
| `LEGACY_DOCKER_CLIENT` | `0`\|`1` | Whether LocalStack should use the command-line Docker client and subprocess execution to run Docker commands, rather than the Docker SDK. |
| `DOCKER_CMD` | `docker` (default), `sudo docker`| Shell command used to run Docker containers (only used in combination with `LEGACY_DOCKER_CLIENT`) |
| `FORCE_NONINTERACTIVE` | | When running with Docker, disables the `--interactive` and `--tty` flags. Useful when running headless. |

## Proxy Configuration

Options to configure Snowflake proxy settings for LocalStack.

| Variable | Example Values | Description |
| - | - | - |
| `SF_PROXY_HOST` | `proxy.example.com` | Hostname or IP address of the proxy server to be used for connecting to Snowflake. |
| `SF_PROXY_USER` | `proxy_user` | Username for authentication with the proxy server. |
| `SF_PROXY_PASSWORD` | `password123` | Password associated with the proxy user account. |

## Profiles

LocalStack supports configuration profiles which are stored in the `~/.localstack` config directory.
A configuration profile is a set of environment variables stored in a `*.env` file in the LocalStack config directory.

Here is an example of what configuration profiles might look like:

{{< command >}}
$ tree ~/.localstack
/home/username/.localstack
├── default.env
├── dev.env
└── pro.env
{{< / command >}}

Here is an example of what a specific environment profile looks like

{{< command >}}
$ cat ~/.localstack/pro-debug.env
LOCALSTACK_AUTH_TOKEN=XXXXX
SF_LOG=trace
SF_S3_ENDPOINT=s3.localhost.localstack.cloud:4566
{{< / command >}}

You can load a profile by either setting the environment variable `CONFIG_PROFILE=<profile>` or the `--profile=<profile>` CLI flag when using the CLI.
Let's take an example to load the `dev.env` profile file if it exists:

{{< command >}}
$ IMAGE_NAME=localstack/snowflake localstack --profile=dev start
{{< / command >}}

If no profile is specified, the `default.env` profile will be loaded.
If explicitly specified, any environment variables will overwrite the configurations defined in the profile.

To display the config environment variables, you can use the following command:

{{< command >}}
$ localstack --profile=dev config show
{{< / command >}}

{{< alert title="Note" >}}
The `CONFIG_PROFILE` is a CLI feature and cannot be used directly with a docker-compose setup.
You can look at [alternative means of setting environment variables](https://docs.docker.com/compose/environment-variables/set-environment-variables/) for your Docker Compose setups.
For Docker setups, we recommend passing the environment variables directly to the `docker run` command.
{{< /alert >}}

