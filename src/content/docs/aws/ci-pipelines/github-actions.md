---
title: GitHub Actions
description: Use LocalStack in GitHub Actions.
template: doc
sidebar:
    order: 5
---

This page contains easily customizable snippets to show you how to manage LocalStack in a GitHub Actions pipeline.

The GitHub-hosted `ubuntu-latest` runner already provides Docker, Node.js, and the AWS CLI, so `lstk` is the only part that needs installing.
On a self-hosted runner, add install steps for whichever of those are missing.

:::caution
The [`LocalStack/setup-localstack`](https://github.com/localstack/setup-localstack) action is no longer supported with `lstk`.
Install and drive [`lstk`](/aws/developer-tools/running-localstack/lstk/) directly in a `run` step, as shown in the snippets below.
:::

## Snippets

### Start up Localstack

To enable LocalStack for AWS, you need to add your LocalStack CI Auth Token to the project's environment variables.
`lstk` will automatically pick it up and activate the licensed features.

Go to the [CI Auth Token page](https://app.localstack.cloud/workspace/auth-tokens) and copy your CI Auth Token.
To add the CI Auth Token to your GitHub project, follow these steps:

- Navigate to your repository **Settings > Secrets** and press **New repository secret**.
- Enter `LOCALSTACK_AUTH_TOKEN` as the name of the secret and paste your CI Auth Token as the value.
Click **Add secret** to save your secret.

You can then install `lstk` and start the emulator, passing the secret to the step:

```yaml showshowLineNumbers
- name: Install lstk
  run: npm install -g @localstack/lstk

- name: Configure the AWS profile
  run: lstk setup aws

- name: Start LocalStack
  run: lstk start
  env:
    LOCALSTACK_AUTH_TOKEN: ${{ secrets.LOCALSTACK_AUTH_TOKEN }}
```

`lstk start` pulls the image, validates your license, and returns only once the emulator is ready, so no separate wait step is needed.
To pin the image tag, commit a [`.lstk/config.toml`](/aws/developer-tools/running-localstack/lstk/#configuration) to your repository rather than passing it on the command line.
Where several steps run `lstk`, set `LOCALSTACK_AUTH_TOKEN` once at the job level instead of repeating it on every step.
`lstk setup aws` writes a `localstack` AWS profile for the runner's `aws` binary to use. It is optional, but without it `lstk` notes on every call that no profile was found.

### Configuration

To set LocalStack configuration options, pass them as `LOCALSTACK_`-prefixed environment variables.
`lstk start` forwards those into the container, which strips the prefix, so `LOCALSTACK_DEBUG` sets the container's `DEBUG` option.
For example:

```yml showshowLineNumbers
- name: Start LocalStack
  run: lstk start
  env:
    LOCALSTACK_AUTH_TOKEN: ${{ secrets.LOCALSTACK_AUTH_TOKEN }}
    LOCALSTACK_DEBUG: "1"
```

You can add extra configuration options as further `LOCALSTACK_`-prefixed variables.
Settings that apply to every run belong in an [`[env.*]` profile](/aws/developer-tools/running-localstack/lstk/#configuration) in `.lstk/config.toml` instead.

### Dump Localstack logs

```yaml showshowLineNumbers
- name: Show localstack logs
  if: always()
  run: |
    lstk logs --verbose | tee localstack.log
```

`if: always()` makes the step run even after a failing test, which is when the logs matter most.

### Store Localstack state

You can preserve your AWS infrastructure with Localstack in various ways.

#### Cloud Pods

```yaml showshowLineNumbers
...
# Localstack is up and running already
- name: Load the Cloud Pod
  continue-on-error: true  # Allow it to fail as pod does not exist at first run
  run: lstk load pod:<cloud-pod-name>
  env:
    LOCALSTACK_AUTH_TOKEN: ${{ secrets.LOCALSTACK_AUTH_TOKEN }}
...

- name: Save the Cloud Pod
  run: lstk save pod:<cloud-pod-name>
  env:
    LOCALSTACK_AUTH_TOKEN: ${{ secrets.LOCALSTACK_AUTH_TOKEN }}
...
```

Find more information about cloud pods [here](/aws/developer-tools/snapshots/cloud-pods).

#### Artifact

Instead of the LocalStack platform, you can keep the state as a local snapshot file and move it between runs with GitHub's own artifact storage.

```yaml showshowLineNumbers
...
- name: Download the previous state
  continue-on-error: true  # Allow it to fail as the artifact does not exist at first run
  uses: actions/download-artifact@v4
  with:
    name: my-ls-state

- name: Start LocalStack and load the state
  run: |
    lstk start
    if [ -f ls-state.snapshot ]; then
      lstk load ./ls-state.snapshot --merge=overwrite
    fi
  env:
    LOCALSTACK_AUTH_TOKEN: ${{ secrets.LOCALSTACK_AUTH_TOKEN }}

...

- name: Save the state
  run: lstk save ./ls-state.snapshot

- name: Upload the state
  uses: actions/upload-artifact@v4
  with:
    name: my-ls-state
    path: ls-state.snapshot
...
```

More information about [snapshots](/aws/developer-tools/snapshots/saving-snapshots-locally/).

## Current Limitations

### Running Lambdas targeting the `arm64` architecture

Deploying Lambdas targeting the `arm64` architecture on GitHub Actions can pose challenges.
While the [`LAMBDA_IGNORE_ARCHITECTURE` configuration](https://docs.localstack.cloud/references/configuration/#lambda) is an option for cross-architecture compatible Lambdas, it may not be suitable for statically compiled Lambdas.
To address this, users are recommended to leverage Docker's [`setup-qemu-action`](https://github.com/docker/setup-qemu-action) to enable emulation for the `arm64` architecture.
It's important to note that using this approach may result in significantly slower build times.

### Running LocalStack on Windows runners

LocalStack requires Docker to run, which is not natively supported on Windows runners.
Windows runners don't support Docker natively due to licensing restrictions.
It is currently not possible to run LocalStack on Windows runners.
