---
title: lstk Setup & Maintenance
description: The setup, config, and update commands, and running lstk in offline or enterprise environments.
template: doc
tags: ['Hobby']
---

## `setup`

Set up CLI integration for an emulator type.
`lstk setup` is a grouping command with no action of its own; the work is done by its subcommands, `setup aws` and `setup azure`.

```bash
lstk setup aws
lstk setup azure
```

### `setup aws`

Create or update a `localstack` profile in `~/.aws/config` and `~/.aws/credentials` so the AWS CLI and SDKs can target LocalStack.

```bash
lstk setup aws
lstk setup aws --force
```

| Option    | Description                                                                              |
|:----------|:-----------------------------------------------------------------------------------------|
| `--force` | Overwrite an existing `localstack` profile whose values differ, and skip the confirmation prompt. |

On an interactive terminal it prompts (Y/n) before making changes.
In non-interactive mode (piped output, CI, or `--non-interactive`) it writes the profile with defaults without prompting and exits `0`; a failed write or check returns a non-zero exit code so automation notices.
Overwriting an existing `localstack` profile whose values differ requires `--force` (which also skips the interactive prompt); creating a fresh profile, completing a partial one, or leaving an already-correct profile in place never needs it.

It writes the following profile (existing unrelated profiles are preserved):

```ini
# ~/.aws/config
[profile localstack]
region = us-east-1
output = json
endpoint_url = http://localhost.localstack.cloud:4566

# ~/.aws/credentials
[localstack]
aws_access_key_id = test
aws_secret_access_key = test
```

Afterwards, target LocalStack by passing `--profile localstack` or exporting `AWS_PROFILE`:

```bash
export AWS_PROFILE=localstack
aws s3 ls
```

The endpoint host is resolved the same way as for [`lstk aws`](/aws/developer-tools/running-localstack/lstk/aws-and-iac-commands/#endpoint-resolution) (probing `localhost.localstack.cloud` and falling back to `127.0.0.1`), and [`LOCALSTACK_HOST`](/aws/developer-tools/running-localstack/lstk/automation/#environment-variables) overrides the host and port written into the profile.
The port comes from your AWS emulator's configured `port` (default `4566`); if no `aws` emulator is configured, the command fails with `no aws emulator configured`.

If the `localstack` profile is already configured correctly, `lstk` reports `LocalStack AWS profile is already configured.` and makes no changes.

:::note
The former `lstk config profile` command has been removed; use `lstk setup aws`.
:::

### `setup azure`

Prepare an isolated Azure CLI configuration directory (under the `lstk` config dir, via `AZURE_CONFIG_DIR`) that routes [`lstk az`](/aws/developer-tools/running-localstack/lstk/aws-and-iac-commands/#az) commands to the LocalStack Azure emulator.
Your global `~/.azure` configuration is left untouched.

```bash
lstk setup azure
# alias:
lstk setup az
```

`setup azure` registers a custom Azure cloud (`LocalStack`) whose endpoints point at the LocalStack Azure emulator, activates it, disables Azure CLI instance discovery and telemetry, and performs a one-time dummy service-principal login — all inside a dedicated config directory under the `lstk` config dir (via `AZURE_CONFIG_DIR`).
It requires the `az` CLI to be installed and a running LocalStack Azure emulator.

Run this once; afterwards use `lstk az <args>` to run Azure CLI commands against LocalStack.
To instead redirect your **global** `az` (so existing scripts run unmodified against LocalStack), see [`lstk az start-interception`](/aws/developer-tools/running-localstack/lstk/aws-and-iac-commands/#global-interception-optional).

## `config`

Manage CLI configuration.
`config` has no behavior of its own; run it with a subcommand.

### `config path`

Print the resolved path to the active `config.toml`.

```bash
lstk config path
```

This subcommand is read-only: it never creates or initializes a config file.
If `--config <path>` is set, it prints that path verbatim.
Otherwise it prints the already-loaded config path, the first existing config in the search order, or the path where a config would be created on first run.

## `update`

Check for and apply updates to the `lstk` CLI itself.
`lstk` auto-detects how it was installed (Homebrew, npm, or direct binary) and updates using that same method.
Development builds (version `dev`) are skipped, and updates are checked against the latest [GitHub release](https://github.com/localstack/lstk/releases/latest).

```bash
lstk update [options]
```

| Option              | Description                                                  |
|:--------------------|:------------------------------------------------------------|
| `--check`           | Check for updates without installing them                    |
| `--non-interactive` | Use plain output instead of the TUI (update logic unchanged) |
| `--json`            | Emit the result as a JSON envelope (see [Structured output](/aws/developer-tools/running-localstack/lstk/automation/#structured-output)). With `--check`, `data` reports `currentVersion`/`latestVersion`/`updateAvailable`; after an applied update, `updatedVersion`/`updated`/`method`. |

Examples:

```bash
# Check for updates without installing
lstk update --check

# Update to the latest version
lstk update

# Update with plain (non-TUI) output
lstk update --non-interactive
```

By install method:

- **Homebrew** (binary under a `Caskroom` path): runs `brew upgrade localstack/tap/lstk`.
- **npm** (binary under `node_modules`): runs `npm install -g @localstack/lstk@latest`.
- **Binary** (anything else): downloads the release asset for your OS/arch from GitHub, extracts it, and replaces the running executable in place.

With `--check`, `lstk` only reports whether a newer version is available and exits without downloading or installing anything.

:::note
Set `LSTK_GITHUB_TOKEN` to send an authenticated GitHub request and avoid API rate limits during update checks.
It is optional; updates also work unauthenticated.
:::

If more than one `lstk` installation is found on your `PATH` (for example a Homebrew binary and an npm one), `lstk update` and the start-time update notification print a warning listing each location, its install method, and which one is currently running, so you can tell which binary an update will actually replace.

### Update notification on start

Separately from `lstk update`, `lstk` checks for a newer version when you run `lstk start` (the default command), using a short timeout that fails silently if GitHub is unreachable.

In an interactive terminal, when an update is available `lstk` prints the new version and a release-notes link, then prompts:

```text
Update lstk to latest version?
> Update now [U]
  Remind me next time [R]
  Skip this version [S]
```

- **Update now [U]**: downloads and applies the update, then asks you to re-run your command.
- **Remind me next time [R]**: does nothing; you are reminded on the next run.
- **Skip this version [S]**: records the version in `config.toml` so you are not prompted about it again.

In non-interactive mode the notification is not a prompt — `lstk` emits a single note (`Update available: <current> → <latest> (run lstk update)`) and continues.

When you choose **Skip this version**, `lstk` writes the skipped version under a `[cli]` table:

```toml
[cli]
update_skipped_version = "0.5.0"
```

While this value matches the latest available version, the start-time update notification for that version is suppressed.
This key is managed automatically and is not intended to be edited by hand.

## Offline and enterprise environments

There is no `--offline` flag. Instead, `lstk` degrades gracefully when common enterprise blockers (Docker Hub unreachable, a proxy/TLS interceptor, or an unreachable license server) prevent an internet request:

- **Image pull**: if the image pull fails but the image is already present locally, `lstk` warns and uses the local image instead of failing. In interactive mode you can also press <kbd>Esc</kbd> to abort an in-progress pull and fall back to the local image.
- **License pre-flight**: when the pinned image is already present locally, `lstk` skips its pre-flight license check so a fully offline start is not blocked; the emulator validates the license itself once it starts. When a check does run, a transport-level failure (offline, proxy, or certificate error) is treated as non-fatal and the emulator validates the license instead. A definitive server rejection (HTTP 400/401/403) is handled differently: `lstk` drops the cached license and, in an interactive terminal, offers to log in again and retries the start once with the refreshed credentials (a rejected token often just predates a license purchase or plan change); in non-interactive mode it fails with an error pointing at `lstk logout && lstk login` or a valid `LOCALSTACK_AUTH_TOKEN`. The pre-flight is also skipped — with a warning — when the license server does not recognize the image *tag format* (for example a `dev` nightly or a custom internal-mirror tag): that is not a verdict on the license, so `lstk` defers to the emulator's own startup check rather than blocking the start.
- **Telemetry and update checks** are best-effort and fail silently when offline.

Pair this behavior with a custom [`image`](/aws/developer-tools/running-localstack/lstk/configuration/#custom-container-image) that points at an internal-registry mirror or a locally loaded image to run `lstk` in an air-gapped environment.
