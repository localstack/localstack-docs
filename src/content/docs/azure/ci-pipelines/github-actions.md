---
title: GitHub Actions
description: Run the LocalStack Azure emulator in GitHub Actions.
template: doc
sidebar:
    order: 2
---

## Introduction

This guide describes the workflow that
[localstack-azure-samples](https://github.com/localstack/localstack-azure-samples) runs on every
pull request. It is a real, working pipeline: a dynamic matrix fans out to one job per sample and
deploys 31 configurations across the Azure CLI, Bicep and Terraform against the emulator.

The full source is at
[`.github/workflows/run-samples.yml`](https://github.com/localstack/localstack-azure-samples/blob/main/.github/workflows/run-samples.yml).

## Minimal workflow

If you only need to start the emulator and run tests against it:

```yaml title=".github/workflows/test.yml"
name: Test against LocalStack for Azure

on:
  pull_request:
    branches: [main]

permissions: {}

jobs:
  test:
    runs-on: ubuntu-22.04
    permissions:
      contents: read
    env:
      IMAGE_NAME: localstack/localstack-azure:latest

    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false

      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install the LocalStack CLI
        run: pip install localstack

      - name: Log in to Docker Hub
        # The Azure emulator image is large; anonymous pulls hit rate limits.
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Start the emulator
        env:
          LOCALSTACK_AUTH_TOKEN: ${{ secrets.LOCALSTACK_AUTH_TOKEN }}
          ACTIVATE_PRO: '1'
        run: |
          docker pull "$IMAGE_NAME"
          IMAGE_NAME="$IMAGE_NAME" localstack start -d
          localstack wait -t 120

      - name: Run tests
        run: make test

      - name: Collect emulator logs
        if: always()
        run: localstack logs > localstack.log

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: localstack-logs
          path: localstack.log
```

## Notes on the production workflow

The samples repository's workflow adds several things worth copying.

### One job per sample, built dynamically

A lightweight `setup` job runs `.github/scripts/build-matrix.sh`, which calls `./run-samples.sh --list`
to emit the test list as JSON and outputs it as a matrix. The test job then consumes
`matrix: ${{ fromJSON(needs.setup.outputs.matrix) }}` with `fail-fast: false`, so one failing sample
does not cancel the rest.

In `changed` mode the matrix script diffs against the pull request's base commit and selects only
the samples whose `watch_folders` were touched. `workflow_dispatch` exposes an `all` / `changed`
dropdown.

### Isolate the Azure CLI configuration

Interception writes to the Azure CLI's global configuration. In CI, point it at a per-job directory
so concurrent jobs cannot interfere with each other:

```yaml
- name: Set up environment
  env:
    RUNNER_TEMP_DIR: ${{ runner.temp }}
  run: echo "AZURE_CONFIG_DIR=${RUNNER_TEMP_DIR}/azure-cli" >> "$GITHUB_ENV"
```

### Free disk before pulling

Hosted runners routinely run out of space pulling the emulator image alongside sidecar containers:

```yaml
- name: Free up disk space
  run: |
    docker system prune -af --volumes
    docker builder prune -af
```

### Emulator start options

The samples repository starts the emulator with these settings:

| Variable | Value | Why |
|---|---|---|
| `LOCALSTACK_AUTH_TOKEN` | secret | Required; the emulator will not start without it |
| `ACTIVATE_PRO` | `1` | The Azure emulator is a Pro image |
| `MSSQL_ACCEPT_EULA` | `Y` | Needed by the Azure SQL Database samples |
| `DISABLE_EVENTS` | `1` | Suppresses usage events in CI |
| `LS_LOG` | `DEBUG` | Makes the uploaded log artifact useful when something fails |

### Toolchain the samples need

Beyond Python, the matrix jobs install .NET 10, Java 25 (Temurin), Terraform 1.5.0, and the system
packages the samples depend on:

```bash
sudo apt-get install -y jq zip unixodbc-dev libsnappy-dev \
    default-mysql-client postgresql-client
```

`unixodbc-dev` and `libsnappy-dev` are needed by `pyodbc` and `pymongo`; the `mysql` and `psql`
clients are used by the flexible-server samples to create application users and seed schemas.

### Pin actions by digest

The samples workflow pins every action to a commit SHA rather than a tag, and sets
`permissions: {}` at the workflow level with each job opting in to only what it needs. The
repository lints its own workflows with [`actionlint`](https://github.com/rhysd/actionlint) and
[`zizmor`](https://github.com/woodruffw/zizmor), and runs
[`gitleaks`](https://github.com/gitleaks/gitleaks) as a pre-commit hook.

## Always upload logs

```yaml
- name: Upload emulator logs
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: localstack-logs-${{ matrix.name }}
    path: localstack.log
```

Without `if: always()`, logs are lost on exactly the runs where you need them.
