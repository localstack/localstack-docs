---
title: lstk Cloud & IaC Commands
description: The aws, az, terraform, cdk, and sam commands that proxy cloud and infrastructure-as-code tools against LocalStack.
template: doc
tags: ['Hobby']
---

`lstk` proxies developer tools so they run directly against LocalStack.

:::note
Like `lstk aws`, the `az`, `terraform`, `cdk`, and `sam` proxies do not start the emulator — start it first with [`lstk start`](/aws/developer-tools/running-localstack/lstk/lifecycle-commands/#start).
Each requires the corresponding third-party CLI to be installed and on your `PATH`.
To run any of them against an emulator `lstk` did not start, pass [`--endpoint-url`](/aws/developer-tools/running-localstack/lstk/automation/#targeting-an-external-emulator) (or set `LSTK_ENDPOINT_URL`).
:::

:::note
When you interrupt a proxied tool (for example Ctrl+C or `kill` during `lstk terraform apply`), `lstk` forwards the termination signal to the wrapped tool and waits for it to shut down cleanly rather than killing it outright, so operations like releasing a Terraform state lock can complete. The wrapped tool's real exit code is passed through unchanged.
:::

## `aws`

Run AWS CLI commands against the running LocalStack emulator.
`lstk aws` proxies your host `aws` CLI with the endpoint, credentials, and region pre-configured, so you don't have to pass `--endpoint-url` or set test credentials yourself.

```bash
lstk aws s3 ls
lstk aws sqs list-queues
lstk aws s3 mb s3://my-bucket
```

It is equivalent to running:

```bash
aws --endpoint-url http://localhost:4566 <args>
```

with `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_DEFAULT_REGION` set automatically.

Everything after `lstk aws` is forwarded verbatim to the host `aws` binary, including AWS CLI flags such as `--region` or `--output`.
The exit code and `stdout`/`stderr` of the underlying `aws` process are passed through unchanged, so piping and interactive subcommands work as expected.

| Option              | Description                                                                                       |
|:--------------------|:--------------------------------------------------------------------------------------------------|
| `--account <id>`    | Target a specific 12-digit LocalStack account (default `000000000000`). Must appear **before** the `aws` subcommand. Falls back to a 12-digit `AWS_ACCESS_KEY_ID`. See [Selecting the account](#selecting-the-account). |
| `--non-interactive` | Suppress the loading spinner. Unlike other commands, this flag is stripped before invoking `aws` (not forwarded). |

:::note
`lstk aws` does not start the emulator.
The AWS emulator must already be running (`lstk start`), Docker must be healthy, and the host `aws` CLI must be installed and on your `PATH`.
:::

### Credentials and region

`lstk aws` injects credentials in one of two ways:

- **Profile mode**: if a complete `localstack` profile exists in both `~/.aws/config` and `~/.aws/credentials`, `lstk` appends `--profile localstack` and lets `aws` read the region, credentials, and endpoint from that profile.
- **Profile-less mode**: if the profile is not present, `lstk` runs `aws` with `AWS_ACCESS_KEY_ID=test`, `AWS_SECRET_ACCESS_KEY=test`, and `AWS_DEFAULT_REGION=us-east-1` injected only when those variables are not already set in your environment. In this mode it also prints an informational note: `No AWS profile found, run 'lstk setup aws'`.

Run [`lstk setup aws`](/aws/developer-tools/running-localstack/lstk/setup-and-maintenance/#setup-aws) to create the `localstack` profile for use with the AWS CLI and SDKs.

### Endpoint resolution

By default, `lstk` probes whether `localhost.localstack.cloud` resolves to `127.0.0.1` and uses `localhost.localstack.cloud:<port>` if so, otherwise it falls back to `127.0.0.1:<port>`.
Set [`LOCALSTACK_HOST`](/aws/developer-tools/running-localstack/lstk/automation/#environment-variables) to override the host:port used to reach LocalStack and skip the DNS probe.
The port comes from the AWS container's `port` in `config.toml` (default `4566`).

### Selecting the account

LocalStack derives the AWS account from the access key id it receives, so `lstk aws --account <id>` targets a specific 12-digit LocalStack account by controlling the credentials `aws` runs with (a neutral, real-looking `AKIA…`/`ASIA…` key never reaches the emulator):

```bash
lstk aws --account 111111111111 s3 mb s3://my-bucket
```

The flag must appear **before** the `aws` subcommand (placing it after is a placement error, not silently forwarded). When it is omitted, `lstk` falls back to a 12-digit `AWS_ACCESS_KEY_ID` if one is set, then to the default account `000000000000`. The same leading-flag account selection is available on [`lstk terraform`](#terraform) and [`lstk sam`](#sam); `lstk cdk` does not support it.

### Tab completion

`lstk aws <TAB>` completes AWS services, operations, and parameters using the AWS CLI's own completer. It is enabled together with the rest of `lstk`'s completion — see [Shell completions](/aws/developer-tools/running-localstack/lstk/#shell-completions).

## `az`

Run Azure CLI commands against the running LocalStack Azure emulator.
`lstk az` runs `az` with an isolated `AZURE_CONFIG_DIR` in which a custom Azure cloud is registered against LocalStack's endpoints, so your global `~/.azure` configuration is left untouched and plain `az` keeps talking to real Azure.

Run [`lstk setup azure`](/aws/developer-tools/running-localstack/lstk/setup-and-maintenance/#setup-azure) once before using this mode.
Everything after `lstk az` is forwarded verbatim to the host `az` binary, and its exit code and output are passed through unchanged.

```bash
lstk az group list
lstk az storage account list
```

The Azure CLI has no `--endpoint-url`/`--profile` equivalent, so the isolation relies entirely on the dedicated config directory prepared by `setup azure`.

### Global interception (optional)

If a script must invoke plain `az` (not `lstk az`), you can redirect your **global** `~/.azure` to LocalStack instead:

```bash
# Point global 'az' at the LocalStack Azure emulator
lstk az start-interception

# Switch back to real Azure
lstk az stop-interception
```

`start-interception` registers and activates the `LocalStack` cloud in your global Azure configuration so every `az` invocation targets LocalStack until you stop it.
`stop-interception` switches the active cloud back to `AzureCloud` (override with `--cloud <name>`) and re-enables instance discovery, but only when `LocalStack` is still the active cloud, to avoid clobbering an unrelated selection.

:::caution
Interception changes global state that affects every `az` command in any terminal.
Use the isolated `lstk az <args>` mode unless you specifically need plain `az` to target LocalStack.
:::

## `terraform`

Run Terraform against LocalStack, using LocalStack endpoints as AWS provider overrides.
`lstk terraform` (alias `lstk tf`) generates a provider-override file and forwards your arguments to the real `terraform` binary.

:::note
`lstk terraform` targets the AWS emulator.
To use Terraform with the other emulators, see the relevant emulator docs.
:::

```bash
lstk terraform init
lstk terraform --region us-west-2 plan
lstk tf apply
```

lstk-specific flags must appear **before** the Terraform action:

| Option            | Default              | Description                            |
|:------------------|:---------------------|:---------------------------------------|
| `--region <region>` | `us-east-1`        | Deployment region.                     |
| `--account <id>`    | `test`             | Target AWS account id (12 digits).     |

Relevant environment variables: `AWS_ENDPOINT_URL` (override the auto-resolved endpoint), `LSTK_TF_CMD` (binary to invoke, e.g. `tofu`; default `terraform`), `LSTK_TF_OVERRIDE_FILE_NAME` (override file name; default `localstack_providers_override.tf`), `LSTK_TF_DRY_RUN` (generate the override file but do not run Terraform), `AWS_REGION` (fallback for `--region`), and `AWS_ACCESS_KEY_ID` (fallback for `--account`).

## `cdk`

Run the AWS CDK against LocalStack.
Requires the AWS CDK CLI version `2.177.0` or newer on your `PATH`.

```bash
lstk cdk bootstrap
lstk cdk --region us-west-2 deploy
lstk cdk synth
```

The only lstk-specific flag (before the CDK action) is `--region <region>` (default `us-east-1`); CDK always targets the default LocalStack account `000000000000`, so there is no `--account` flag.
Relevant environment variables: `AWS_ENDPOINT_URL`, `AWS_ENDPOINT_URL_S3`, `LSTK_CDK_CMD` (default `cdk`), and `AWS_REGION`.

## `sam`

Run the AWS SAM CLI against LocalStack.
Requires the AWS SAM CLI version `1.95.0` or newer on your `PATH` (older versions ignore `AWS_ENDPOINT_URL` and would target real AWS).

```bash
lstk sam build
lstk sam --region us-west-2 deploy
lstk sam validate
```

lstk-specific flags (before the SAM action): `--region <region>` (default `us-east-1`) and `--account <id>` (12 digits, default `000000000000`).
Relevant environment variables: `AWS_ENDPOINT_URL`, `AWS_ENDPOINT_URL_S3`, `LSTK_SAM_CMD` (default `sam`), `AWS_REGION` (fallback for `--region`), and `AWS_ACCESS_KEY_ID` (fallback for `--account`).

:::note
Compared with `samlocal`, image/container-based Lambda (ECR) deploys and nested CloudFormation stacks are not supported; use `samlocal` for those workflows.
:::
