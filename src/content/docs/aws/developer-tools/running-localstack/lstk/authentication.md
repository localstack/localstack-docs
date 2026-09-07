---
title: lstk Authentication
description: How lstk resolves your auth token, and the login and logout commands.
template: doc
tags: ['Hobby']
---

`lstk` resolves your auth token in the following order:

1. **`LOCALSTACK_AUTH_TOKEN` environment variable**: takes precedence over a stored token.
2. **System keyring**: a token stored by a previous `lstk login`, used when the environment variable is not set.
3. **Browser login**: triggered automatically in interactive mode when neither of the above provides a token.

:::note
`LOCALSTACK_AUTH_TOKEN` takes precedence over a token in the keyring.
A per-invocation token (a CI secret, or `LOCALSTACK_AUTH_TOKEN=... lstk start` for a second account) therefore overrides a previous `lstk login` without needing `lstk logout` first.
To go back to the stored token, unset the environment variable.
:::

## Logging in

```bash
lstk login
```

Opens a browser window for authentication and stores the resulting token in your system keyring.
This command requires an interactive terminal.
See the [`login`](#login) command below for the full flow and the endpoints it uses.

## Logging out

```bash
lstk logout
```

Removes the stored credentials from the system keyring and the file-based fallback, and clears the cached license.
`logout` cannot clear a token supplied via `LOCALSTACK_AUTH_TOKEN`; if you authenticated that way, unset the variable instead.
See the [`logout`](#logout) command below for the full behavior.

## File-based token storage

On systems where the system keyring is unavailable, `lstk` automatically falls back to storing the token in a file (`<config-dir>/auth-token`, mode `0600`).
You can force file-based storage by setting:

```bash
export LSTK_KEYRING=file
```

## `login`

Authenticate with LocalStack via a browser-based device authorization flow and store the resulting credential in your system keyring.
This command requires an interactive terminal.

```bash
lstk login
```

`lstk` opens your default browser to the LocalStack Web Application, shows a one-time code, and waits for you to approve the request.
If the browser cannot open automatically, `lstk` prints the URL to visit manually.
On success it stores the **license token** returned by the platform (not the raw browser bearer token).

If you are already authenticated — either `LOCALSTACK_AUTH_TOKEN` is set or a token already exists in storage — `login` prints `You're already logged in` and exits without starting a new flow.

In non-interactive mode (piped output, CI, or `--non-interactive`), `login` fails with `login requires an interactive terminal`.
The `--config <path>` flag selects which `config.toml` is loaded, which affects `keyring`, `web_app_url`, and `api_endpoint` resolution.

:::note
If you approve the request in the browser only *after* pressing a key in the terminal, `lstk` reports `auth request not confirmed - please complete the authentication in your browser`.
Re-run `lstk login` and approve in the browser before continuing.
:::

The credential is written to the system keyring (service `lstk`, key `lstk.auth-token`).
When the keyring is unavailable — or `LSTK_KEYRING=file` is set — `lstk` stores it in a file at `<config-dir>/auth-token` (mode `0600`) instead.

Endpoints used by the flow can be overridden via config or environment:

| Config key     | Env var             | Default                        | Description                                                                  |
|:---------------|:--------------------|:-------------------------------|:-----------------------------------------------------------------------------|
| `keyring`      | `LSTK_KEYRING`      | (system keyring)               | Set to `file` to force file-based token storage instead of the OS keyring.   |
| `web_app_url`  | `LSTK_WEB_APP_URL`  | `https://app.localstack.cloud` | Base URL used to build the browser authorization link.                       |
| `api_endpoint` | `LSTK_API_ENDPOINT` | `https://api.localstack.cloud` | LocalStack platform API endpoint used for the device flow and license token. |

```bash
# Force file-based token storage during login
LSTK_KEYRING=file lstk login

# Use a specific config file
lstk --config ./.lstk/config.toml login
```

## `logout`

Remove stored authentication credentials.

```bash
lstk logout
lstk logout --non-interactive
```

`logout` deletes the auth token from your system keyring (falling back to the file-based token at `<config-dir>/auth-token` when the keyring is unavailable or `LSTK_KEYRING=file` is set) and removes the cached license file.
On success it prints `Logged out successfully`.

The outcome depends on how you are authenticated:

| Situation | Behavior |
|:----------|:---------|
| A token is stored (from `lstk login`) | The token is deleted from the keyring and file fallback, the cached license is removed, and `lstk` prints `Logged out successfully`. |
| No stored token, but `LOCALSTACK_AUTH_TOKEN` is set | Nothing is deleted. `lstk` prints a note that you are authenticated via the environment variable and to unset it to log out. |
| No stored token and no `LOCALSTACK_AUTH_TOKEN` | `lstk` prints `Not currently logged in` and exits successfully. |

:::note
`logout` never clears the `LOCALSTACK_AUTH_TOKEN` environment variable, and it does not stop running emulators.
If a LocalStack emulator is still running after logout, `lstk` prints a note reminding you it is running in the background; run `lstk stop` to stop it.
:::
