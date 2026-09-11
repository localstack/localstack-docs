---
title: lstk Doctor
description: Diagnose whether your machine and network can run LocalStack with the lstk doctor command, and get concrete fixes for what blocks it.
template: doc
tags: ['Hobby']
---

`lstk doctor` checks your machine and its network for the problems that most often stop LocalStack from starting or activating: DNS or HTTPS to the LocalStack API being blocked, a TLS-intercepting proxy whose certificate LocalStack does not trust, no running container engine, or too little memory or disk.
Each check either passes or produces a diagnosis with concrete fix suggestions, so you can resolve issues before they surface as confusing failures mid-run.

Run it once on a new machine, before opening a support ticket, or whenever LocalStack fails to start behind a corporate network.

```bash
lstk doctor
```

Doctor does not need a running emulator and does not change anything on your system.
It only reads the environment, opens test connections, and reports what it finds.

## `doctor`

```bash
lstk doctor [category...] [options]
```

| Argument / Option       | Description                                                                                                                            |
|:------------------------|:---------------------------------------------------------------------------------------------------------------------------------------|
| `network`, `container`, `system` | Optional positional categories. Run only the listed lanes; the default is all three. See [What it checks](#what-it-checks).      |
| `--target <host:port>`  | Host the network checks probe instead of the default `api.localstack.cloud:443`. Repeatable.                                           |
| `-v`, `--verbose`       | Show passing and skipped checks and their evidence, not only failures.                                                                 |
| `--json`                | Emit one machine-readable JSON object instead of human-oriented text. See [JSON output](#json-output).                                 |
| `-h`, `--help`          | Show the built-in help.                                                                                                                |

Examples:

```bash
# Run every check
lstk doctor

# Only the network lane, with full detail
lstk doctor network --verbose

# Only the container and system lanes
lstk doctor container system

# Machine-readable output for scripts, CI, and agents
lstk --json doctor
```

The global `--json` flag works in either position: `lstk --json doctor` and `lstk doctor --json` behave identically.

:::note
If `lstk doctor` reports an unknown command, your `lstk` predates the command.
Run [`lstk update`](/aws/developer-tools/running-localstack/lstk/setup-and-maintenance/#update) or reinstall from the [latest release](https://github.com/localstack/lstk/releases/latest).
:::

## What it checks

Doctor runs eleven checks across three lanes: **network**, **container**, and **system**.
Within a lane, dependencies define the run order: a dependent check only runs once its prerequisite has passed.
The lanes are independent and run concurrently, so a single pass surfaces every root cause rather than stopping at the first one.

```text
network:   network.proxy, network.dns ──▶ network.https ──▶ network.certificate
           network.localstack
           network.local-dns, network.local-dns-s3, network.local-dns-sync
container: container.engine
system:    system.memory, system.disk
```

| Check                    | Asks                                                                                                                                       | On failure                                                                    |
|:-------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------|
| `network.proxy`          | Is an egress proxy configured (`OUTBOUND_HTTPS_PROXY` / `HTTPS_PROXY`)?                                                                    | Informational. Records the proxy so the following checks go through it. A proxy URL that cannot be parsed is fixable. |
| `network.dns`            | Does `api.localstack.cloud` resolve?                                                                                                       | Blocking                                                                      |
| `network.https`          | Can an HTTPS connection be opened to it, through the proxy if one is set?                                                                  | Blocking                                                                      |
| `network.certificate`    | Is the presented certificate trusted, validated the same way LocalStack does (the default CA bundle plus `REQUESTS_CA_BUNDLE`), and free of defects that LocalStack's strict TLS verification rejects? | Fixable for an untrusted or strict-risky CA. Blocking when the CA certificate itself violates strict verification. |
| `network.localstack`     | If an emulator is running, does its `/_localstack/health` endpoint respond?                                                                | Informational. Skipped when nothing is running.                               |
| `network.local-dns`      | Does `localhost.localstack.cloud` resolve to `127.0.0.1`?                                                                                  | Informational. LocalStack stays reachable via `localhost` / `127.0.0.1`.     |
| `network.local-dns-s3`   | Does the S3 virtual-host shape `bucket.s3.localhost.localstack.cloud` resolve to `127.0.0.1`?                                              | Informational. Path-style S3 URLs work regardless.                           |
| `network.local-dns-sync` | Does `sync-localhost.localstack.cloud` resolve to `127.0.0.1`? AWS SDKs dial this name for Step Functions' `StartSyncExecution`.           | Informational. Only that API is affected.                                    |
| `container.engine`       | Is a container engine (Docker, Podman, Colima, Rancher Desktop, …) reachable?                                                             | Fixable                                                                       |
| `system.memory`          | Is enough memory available to the container engine? Doctor reads the engine's VM allocation where there is one (Docker Desktop, Colima, …), otherwise host RAM. | Blocking below 2 GB. Fixable below the recommended 4 GB.                    |
| `system.disk`            | Is there enough free space on the volume backing LocalStack's data directory?                                                             | Blocking below 2 GB. Fixable below the recommended 10 GB.                   |

A blocking failure stops its own lane: the checks that depend on it are skipped and collapsed into a single note.
The other lanes still run.

### Severity levels

Every failed check carries one of three severities, and the severity is what the final verdict and the [exit code](#exit-codes) are built from:

- **Blocking**: LocalStack cannot start or activate on this machine until the issue is resolved. Examples: `api.localstack.cloud` does not resolve, outbound HTTPS is dropped, less than 2 GB of memory.
- **Fixable**: LocalStack can run once a configuration change is made. Doctor prints the change, typically an environment variable and value. Examples: an untrusted corporate CA, no container engine running, memory between 2 GB and 4 GB.
- **Informational**: a heads-up about one specific feature. LocalStack runs, but that feature will not work until the finding is addressed. All `network.local-dns*` findings are informational.

Doctor is deliberately cautious: when it cannot be sure a setup is clean, it reports a finding rather than a pass.

### Checking the network for an external emulator

When `lstk` is pointed at an externally managed emulator with `--endpoint-url` or `LSTK_ENDPOINT_URL` (see [Targeting an external emulator](/aws/developer-tools/running-localstack/lstk/automation/#targeting-an-external-emulator)), the three `network.local-dns*` checks also probe the names AWS SDKs derive from that host: `<host>`, `bucket.s3.<host>`, and `sync-<host>`.

```bash
lstk --endpoint-url http://localhost:4566 doctor network
```

This is how a plain `localhost` endpoint is diagnosed as breaking Step Functions' `StartSyncExecution`: `sync-localhost` resolves nowhere.
Derived names only need to resolve at all, since the endpoint may be remote.
An IP-literal endpoint derives nothing, because SDKs address it path-style.

### Probing a different host

By default the network lane probes `api.localstack.cloud:443`, the endpoint LocalStack contacts for licensing.
Pass `--target` to probe another `host:port` instead, for example an internal mirror or a different LocalStack API host:

```bash
lstk doctor network --target internal-mirror.corp.example:443
```

`--target` is repeatable.
The DNS, HTTPS, and certificate checks probe the first target given.

## Output

By default doctor prints only failures and informational notes, each with its evidence and fix suggestions, and closes with a one-line verdict.
On a healthy machine the whole report is that verdict:

```bash
lstk doctor
```

```bash title="Output"
✔︎ All checks passed
```

When something is wrong, the verdict counts the issues and states the worst severity, for example `1 issue found - fixable with config changes` or `2 blocking issues found - LocalStack cannot start here`.

With `--verbose`, every check is shown, including passes and skips.
In an interactive terminal this renders as one overview table.
When piped or run with `--non-interactive`, it renders as one line per check, so the output stays stable for logs and CI.

In an interactive terminal doctor renders progress live in the TUI while the checks run.
Use `--non-interactive` (or pipe the output) to force plain text.

Each finding is identified by a stable dotted code such as `network.certificate.untrusted` or `system.memory.low`.
Codes are the machine-checkable identity of a finding and do not change between releases.

## Exit codes

The exit code reflects the worst finding in the run:

| Exit code | Meaning                                                                                  |
|:----------|:-----------------------------------------------------------------------------------------|
| `0`       | All checks passed.                                                                       |
| `1`       | Only fixable issues were found. LocalStack can run once they are addressed.              |
| `2`       | A blocking issue was found. LocalStack cannot start here.                                |
| `3`       | Doctor itself could not complete a check.                                                |

Informational findings do not affect the exit code.

:::note
These codes differ from the [exit codes of other `lstk` commands](/aws/developer-tools/running-localstack/lstk/automation/#exit-codes), where the code reflects the kind of error.
For a diagnostic command the severity *is* the result, so `lstk doctor` keeps the same 0/1/2/3 meaning with and without `--json`.
A rejected invocation (unknown flag or category) also exits `2`; to tell it apart from a blocking finding in scripts, read the JSON envelope's `status` field rather than the exit code.
:::

The whole run has a 90 second deadline.
Every probe bounds itself well within that, so the deadline only fires when a check hangs; when it does, the run is reported as incomplete (see `RUN_INCOMPLETE` below).

## JSON output

With `--json`, doctor writes exactly one JSON object to stdout and nothing else, so scripts, CI jobs, and coding agents can act on a diagnosis without parsing prose.
It uses the same [result envelope](/aws/developer-tools/running-localstack/lstk/automation/#structured-output) as every other `lstk` command:

```json
{
  "schemaVersion": 1,
  "command": "doctor",
  "status": "ok",
  "data": {
    "verdict": {
      "result": "fixable",
      "headline": "1 issue found - fixable with config changes",
      "exitCode": 1,
      "counts": {"total": 6, "pass": 2, "fail": 1, "skip": 3, "error": 0, "blocking": 0, "fixable": 1}
    },
    "categories": ["network"],
    "findings": [
      {
        "code": "network.certificate.untrusted",
        "category": "network",
        "status": "fail",
        "severity": "fixable",
        "summary": "the certificate presented for api.localstack.cloud:443 is not trusted",
        "evidence": {"host": "api.localstack.cloud:443", "issuer": "CN=corp-proxy"},
        "fixes": [
          {
            "envVar": "REQUESTS_CA_BUNDLE",
            "value": "/path/to/corp-ca.pem",
            "note": "concatenate your corporate CA with the default CA bundle",
            "docUrl": "https://docs.localstack.cloud/aws/customization/networking/"
          }
        ]
      }
    ]
  },
  "warnings": [],
  "error": null
}
```

### What to branch on

| Question                    | Field                                                                                     |
|:----------------------------|:------------------------------------------------------------------------------------------|
| Did doctor work?            | `status`: `"ok"` or `"error"`.                                                            |
| Can LocalStack run here?    | `data.verdict.result`: `healthy`, `fixable`, `blocking`, or `incomplete`.                 |
| What exactly is wrong?      | `data.findings[].code`: the stable dotted identifier.                                     |
| How do I fix it?            | `data.findings[].fixes[]`: an environment variable and value where applicable, a note, and a documentation URL. |
| Which lanes were checked?   | `data.categories`: a scoped run only covers the lanes it ran.                             |

Three properties make the envelope safe to automate against:

- **A diagnosed problem is a successful diagnosis.** Finding a blocking issue is `status: "ok"` with the problem described in `data`. `status: "error"` means doctor could not produce a report at all, and `data` is then `null`. `status` answers "did doctor work?" and `data.verdict.result` answers "can LocalStack run?".
- **Findings are always complete.** Every check is listed, whether it passed, was skipped, failed, or errored, regardless of `--verbose`. Verbosity only affects the text rendering. Filter on `status` yourself.
- **Exit codes keep their severity meaning.** The [0/1/2/3 table](#exit-codes) applies unchanged under `--json`.

`data.verdict.result` values, in worsening order:

| Result       | Meaning                                                                    |
|:-------------|:---------------------------------------------------------------------------|
| `healthy`    | Everything that was checked passed.                                        |
| `fixable`    | LocalStack fails today, but a configuration change resolves it.            |
| `blocking`   | LocalStack cannot start here.                                              |
| `incomplete` | A check itself errored, so the diagnosis has a hole. Still `status: "ok"`. |

`warnings` is always an array.
The only entry today is `RUN_INCOMPLETE`, set when the run hit its overall deadline before finishing.
It signals that the findings may be incomplete or misattributed, which plain-text output does not surface.

When `status` is `"error"`, `error.code` is `USAGE_ERROR` for a rejected invocation (with an action pointing at `lstk doctor --help`) or `INTERNAL_ERROR` when the engine failed.
Even `lstk doctor --json --help` honours the one-object contract: the usage text is returned in `data.usage` rather than printed as prose.

Example: fail a CI job only on blocking issues, and print the failing codes:

```bash
lstk --json doctor > doctor.json
jq -r '.data.findings[] | select(.status=="fail") | "\(.severity)\t\(.code)"' doctor.json
[ "$(jq -r '.data.verdict.result' doctor.json)" != "blocking" ]
```

## Telemetry

Each completed run reports its outcome to LocalStack's analytics endpoint so that the diagnoses that fire most often in the field get fixed first.

**Opt out** by setting `LOCALSTACK_DISABLE_EVENTS=1`, the same variable that disables telemetry for `lstk` and for LocalStack itself.
Nothing is collected or sent.

**What is sent**, per run:

- The code, category, status, and severity of every check, for example `network.certificate.untrusted`, `network`, `fail`, `fixable`.
- The overall verdict, exit code, and how long the checks took.
- Which categories were selected, whether `--verbose` or `--json` were used, and how many `--target` values were given.
- Your machine id (the same hashed id `lstk` and LocalStack report), OS and architecture, and your auth token.
- A session id, so the run can be matched to the `lstk` invocation that started it.

**What is never sent:** the evidence behind a finding.
Hostnames, certificate subjects and issuers, proxy URLs, file paths, and every `--target` value stay on your machine.
A finding travels as its code alone.

Delivery happens in the background after doctor exits, so a slow or unreachable analytics endpoint never delays the command or changes its exit code.
Runs that produce no diagnosis, such as `--help` or a rejected invocation, send nothing.

## Acting on common findings

Doctor prints a fix with every failure.
The guides below cover the same problems in more depth:

| Finding                                                        | Where to go next                                                                                                                                                                                                        |
|:---------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `network.dns.*`, `network.https.*`                             | [What hostnames must LocalStack be able to reach during startup?](/aws/getting-started/faq/#what-hostnames-must-localstack-be-able-to-reach-during-startup) and [How do I configure LocalStack to use my corporate HTTP and HTTPS proxy?](/aws/getting-started/faq/#how-do-i-configure-localstack-to-use-my-corporate-http-and-https-proxy) |
| `network.certificate.*`                                        | [How do I trust my corporate TLS interceptor certificate inside LocalStack?](/aws/getting-started/faq/#how-do-i-trust-my-corporate-tls-interceptor-certificate-zscaler-netskope-and-similar-inside-localstack) and [How do I provide a corporate or updated CA bundle to LocalStack?](/aws/getting-started/faq/#how-do-i-provide-a-corporate-or-updated-ca-bundle-to-localstack) |
| `network.local-dns*`                                           | [Is using `localhost.localstack.cloud:4566` as the endpoint recommended?](/aws/getting-started/faq/#is-using-localhostlocalstackcloud4566-to-set-as-the-endpoint-for-aws-services-recommended) and the [DNS Server guide](/aws/customization/networking/dns-server/) |
| `network.localstack.*`                                         | [Accessing LocalStack via the endpoint URL](/aws/customization/networking/accessing-endpoint-url/)                                                                                                                      |
| `container.engine.*`                                           | [Docker is not running](/aws/developer-tools/running-localstack/lstk/faq-and-troubleshooting/#docker-is-not-running) and [Container runtime discovery](/aws/developer-tools/running-localstack/lstk/automation/#container-runtime-discovery) |
| `system.memory.*`, `system.disk.*`                             | Raise the memory allocation of your container engine's VM, or free disk space with `docker system prune`.                                                                                                              |

If the fixes do not resolve your issue, include the output of `lstk --json doctor` when you [contact support](/aws/help-support/get-help/).
It contains no credentials, and the evidence fields give the support team the same view of your environment that doctor had.
