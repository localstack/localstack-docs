---
title: lstk Lifecycle Commands
description: The start, stop, restart, status, logs, reset, and volume commands for managing the LocalStack emulator with lstk.
template: doc
tags: ['Hobby']
---

`lstk` uses a flat command structure.
Running `lstk` with no command is equivalent to `lstk start`.

## `start`

Start the LocalStack emulator.
Launches the TUI in interactive terminals and prints plain output otherwise.
`lstk start` launches the emulator defined in the first `[[containers]]` entry of the resolved `config.toml` (not necessarily AWS).

```bash
lstk start
lstk start --persist
lstk start --non-interactive
```

| Option              | Description                                                                  |
|:--------------------|:-----------------------------------------------------------------------------|
| `--persist`         | Persist emulator state across restarts (sets `LOCALSTACK_PERSISTENCE=1` in the container) |
| `--type <type>`, `-t <type>` | Select the emulator to start (`aws`, `snowflake`, or `azure`) non-interactively, recording the choice in `config.toml`. See [Selecting the emulator with `--type`](#selecting-the-emulator-with---type). |
| `--snapshot <REF>`  | Auto-load this snapshot after the emulator starts, overriding the configured `snapshot` for one run (AWS only) |
| `--no-snapshot`     | Skip auto-loading the configured `snapshot` for this run                      |
| `--timeout <duration>` | Maximum time to wait for the emulator to become ready, as a Go duration (e.g. `90s`, `2m`). Overrides `LSTK_STARTUP_TIMEOUT` for this run; `0` uses the per-mode default. |
| `--non-interactive` | Disable the interactive TUI and use plain output                             |

`lstk start` forwards host environment variables prefixed with `LOCALSTACK_` to the emulator (the host `LOCALSTACK_AUTH_TOKEN` is dropped so it cannot override the token `lstk` resolved). See [Container-injected variables](/aws/developer-tools/running-localstack/lstk/automation/#container-injected-variables).

`lstk` applies a readiness deadline while waiting for the emulator to come up (a crash during startup is detected instantly, with its exit code, and does not wait for the deadline). In an interactive terminal the deadline defaults to 20 seconds and is only a recoverable prompt — you can keep waiting or stop; in non-interactive mode it defaults to 60 seconds and is fatal, leaving the container running for inspection. Override the deadline for a single run with `--timeout` (a Go duration such as `90s` or `2m`), or for every run with [`LSTK_STARTUP_TIMEOUT`](/aws/developer-tools/running-localstack/lstk/automation/#environment-variables); an explicit `--timeout` wins over the environment variable, and `--timeout 0` falls back to the per-mode default. The flag is available on `start` and the bare `lstk` command only — `restart` and the snapshot auto-start path do not expose it.

By default the emulator starts with a fresh state on every run.
Pass `--persist` to keep data across restarts: `lstk` injects `LOCALSTACK_PERSISTENCE=1` into the container so state is written to the mounted [`volume`](/aws/developer-tools/running-localstack/lstk/configuration/#config-field-reference) and reloaded on the next start.
When persistence is active, the AWS emulator's startup summary includes a `• Persistence: Enabled` line.

```bash
# Start with persistent state
lstk start --persist
```

:::note
`--persist` is a flag on `start` (and the bare `lstk` command) and on [`restart`](#restart).
For finer-grained control, you can also set `PERSISTENCE = "1"` in an environment profile (see [Passing environment variables to the container](/aws/developer-tools/running-localstack/lstk/configuration/#passing-environment-variables-to-the-container)).
:::

### Selecting the emulator with `--type`

`--type` (shorthand `-t`, also available on the bare `lstk` command) is the non-interactive answer to the first-run emulator picker.
It selects which emulator to start (`aws`, `snowflake`, or `azure`) and **records the choice in `config.toml`**, so lifecycle commands (`stop`, `status`, `logs`, `volume`, snapshot auto-load) stay in sync with what you started.

```bash
# Start the Snowflake emulator, recording the choice in config
lstk start --type snowflake

# Shorthand
lstk start -t azure
```

- On first run, the config is created with the selected type.
- If the configured type already matches, `--type` is a no-op.
- If it differs, `lstk` rewrites the `type` line in place (comments and formatting preserved) and prints a note naming the config file.

When switching an existing config to a different type:

- A custom `image` is a **hard error** — it pins a specific product that cannot be reinterpreted under a new emulator type. Use a separate config (`--config`) for that profile instead.
- A non-`latest` `tag` and any `volume`/`volumes` mounts are kept, but `lstk` warns that they may be product-specific.
- `port`, `env`, and `snapshot` are kept silently.

`--type` is a flag only; passing the emulator as a positional (`lstk start azure`) is rejected with a hint pointing at `--type`.

### Auto-loading a snapshot on start

For the **AWS emulator**, you can have `lstk` load a snapshot automatically every time it starts the emulator.
Set the `snapshot` field on the container block to any load REF (a `pod:<name>` Cloud Pod or a local path):

```toml
[[containers]]
type     = "aws"
port     = "4566"
snapshot = "pod:my-baseline"
```

The snapshot is loaded only when the emulator is **freshly started** this run; if it is already running, the auto-load is skipped.
Override it for a single run with `--snapshot REF`, or skip it entirely with `--no-snapshot`:

```bash
# Start and load a different snapshot for this run only
lstk start --snapshot pod:other-baseline

# Start without loading the configured snapshot
lstk start --no-snapshot
```

The `snapshot` field is only read on start; [`snapshot save`](/aws/developer-tools/running-localstack/lstk/snapshots/#snapshot-save) never writes it back into your config.

## `stop`

Stop the running LocalStack emulator.
Stops every emulator container defined in the resolved `config.toml` (the `[[containers]]` entries), with a 30-second stop timeout per container.

```bash
lstk stop
lstk stop --non-interactive
```

`stop` fails fast if the Docker runtime is not healthy (for example, Docker is not running), or if a configured emulator is not currently running (`LocalStack is not running`).
In an interactive terminal it shows an animated "Stopping LocalStack..." spinner and a styled confirmation; in non-interactive mode it prints the same progress and result as plain text.

`stop` supports [`--json`](/aws/developer-tools/running-localstack/lstk/automation/#structured-output): the `data` payload lists each configured emulator and whether it `wasRunning`.

## `restart`

Stop and restart the LocalStack emulator.
Performs a stop of the running emulator followed by a fresh start, using the same auth, config, and Docker settings as [`start`](#start).
Launches the TUI in interactive terminals and prints plain output otherwise.

```bash
lstk restart
lstk restart --persist
```

| Option       | Description                                |
|:-------------|:-------------------------------------------|
| `--persist`  | Persist emulator state across the restart  |

By default, emulator state is **not** retained across the restart and the container starts clean.
Pass `--persist` to keep the emulator's state so it survives the restart.

## `status`

Show the status of a running emulator and its deployed resources.
Before contacting the emulator, `lstk` checks that the Docker runtime is healthy; if it is not, the command reports `runtime not healthy` and exits with a non-zero status.

```bash
lstk status
lstk --non-interactive status
```

For each emulator configured in your `config.toml` (the `[[containers]]` entries), `status` reports whether it is running and, if so, prints an instance summary:

```text
LocalStack AWS Emulator is running
• Endpoint: localhost:4566
• Persistence: Enabled
• Container: localstack-aws
• Version: 4.0.0
• Uptime: 1h 12m 4s
```

- **Endpoint** is the live `host:port`, queried from Docker, so it stays correct even if the configured `port` was changed while the container kept running.
- **Persistence** appears only for the AWS emulator and only when persistence is enabled.
- **Uptime** is computed from the container's start time and is omitted if it cannot be determined.

If an emulator is not running, `status` prints an error and exits non-zero without checking the remaining emulators:

```text
LocalStack AWS Emulator is not running

  Start LocalStack: lstk
  See help: lstk -h
```

For the **AWS emulator**, `status` additionally lists deployed resources.
When resources exist it prints a summary line followed by a table; when none exist it prints `No resources deployed`.

```text
~ 3 resources · 2 services

Service  Resource     Region     Account
S3       my-bucket    us-east-1  000000000000
SQS      my-queue     us-east-1  000000000000
```

In an interactive terminal the output is rendered through the TUI; in non-interactive mode (or with `--non-interactive`) the same content is printed as plain text, with the resource table shown at full width when stdout is not a TTY.
The Snowflake and Azure emulators show the instance summary only and never report resources.

## `logs`

Show or stream emulator logs.

```bash
lstk logs [options]
```

| Option      | Description                              |
|:------------|:-----------------------------------------|
| `--follow`, `-f`  | Stream logs in real-time. Without this flag, `lstk` prints the currently available logs and exits. |
| `--verbose`, `-v` | Show all logs without filtering. By default, `lstk` drops noisy lines (internal request logs, provider chatter); `--verbose` shows every line verbatim. |
| `--tail <N>`, `-n <N>` | Show only the last `N` lines from the end of the logs. Accepts a non-negative integer or `all` (the default, showing all available lines). |

By default, `lstk logs` reads from the first configured emulator container and applies a noise filter.
In an interactive terminal, lines are color-coded by log level (`DEBUG`, `INFO`, `WARN`, `ERROR`); in non-interactive mode, raw log lines are written to stdout.

Example:

```bash
# Print current filtered logs and exit
lstk logs

# Stream filtered logs in real-time
lstk logs --follow

# Show only the last 100 lines
lstk logs --tail 100

# Stream all logs without filtering
lstk logs --follow --verbose
```

## `reset`

Discard the running AWS emulator's in-memory state (all created resources such as S3 buckets and Lambda functions are dropped).
The emulator **keeps running**; only its state is cleared.

```bash
lstk reset
lstk reset --force
```

| Option    | Description                                                     |
|:----------|:------------------------------------------------------------------|
| `--force` | Skip the confirmation prompt. Required in non-interactive mode. |

In interactive mode, `reset` prompts for confirmation before clearing state.
In non-interactive mode it fails unless `--force` is passed:

```text
reset requires confirmation; use --force to skip in non-interactive mode
```

`reset` supports [`--json`](/aws/developer-tools/running-localstack/lstk/automation/#structured-output): on success the `data` payload reports the reset emulator and `"reset": true`.

:::note
`reset` clears in-memory state only.
It does **not** wipe the on-disk volume (certificates, persistence data, cached tools).
To clear that, stop the emulator and run [`lstk volume clear`](#volume-clear).
:::

## `volume`

Manage the emulator volume: the host directory that holds persistent state such as certificates, downloaded tools, and persistence data.

```bash
lstk volume path
lstk volume clear [options]
```

### `volume path`

Prints the resolved volume directory for every emulator in your config, one per line.
With the default config (a single `aws` emulator) it prints one path.
Each path is the container's configured `volume` value, or the default OS cache location if `volume` is unset (`~/Library/Caches/lstk/volume/localstack-aws` on macOS, `~/.cache/lstk/volume/localstack-aws` on Linux).

```bash
# Print the volume directory for each configured emulator
lstk volume path
```

### `volume clear`

Removes all data from the emulator volume directory, resetting cached state.
It operates on all configured emulators by default, or a single one with `--type`.
Before clearing, it lists each target as `<emulator>: <path> (<size>)`.

| Option          | Description                              |
|:----------------|:-----------------------------------------|
| `--force`       | Skip the confirmation prompt             |
| `--type <type>` | Clear only the emulator of this type     |

```bash
# Clear all configured emulator volumes (prompts for confirmation)
lstk volume clear

# Clear only the AWS emulator volume
lstk volume clear --type aws

# Skip the confirmation prompt
lstk volume clear --force

# Clear without prompting in a non-interactive environment
lstk volume clear --type snowflake --force
```

In an interactive terminal, `lstk volume clear` prompts `Clear volume data? This cannot be undone` before deleting anything; choosing **NO** or pressing Ctrl+C cancels with no changes.
In non-interactive mode, `--force` is required, otherwise the command fails with `volume clear requires confirmation; use --force to skip in non-interactive mode`.

:::caution
If the volume contains files owned by `root` (created by Docker), clearing fails with a permission error.
Re-run with elevated privileges:

```bash
sudo lstk volume clear
```
:::
