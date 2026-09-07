---
title: GitLab CI
description: Use LocalStack in GitLab CI.
template: doc
sidebar:
    order: 6
---

This page contains easily customizable snippets to show you how to manage LocalStack in a GitLab CI pipeline with the [`lstk` CLI](/aws/developer-tools/running-localstack/lstk/).

GitLab runs your job in one container and the Docker daemon in another, so every snippet below pairs the job with a Docker-in-Docker (`dind`) service.

:::tip
While working with a Docker-in-Docker (`dind`) setup, the Docker runner requires `privileged` mode.
You must always use `privileged = true` in your GitLab CI's `config.toml` file while setting up LocalStack in GitLab CI runners.
For more information, see [GitLab CI Docker-in-Docker](https://docs.gitlab.com/ee/ci/docker/using_docker_build.html#use-docker-in-docker-executor) documentation.
:::

## Snippets

### Start up LocalStack

LocalStack requires a [CI Auth Token](https://app.localstack.cloud/workspace/auth-tokens), which you must add to the repository's environment variables as `LOCALSTACK_AUTH_TOKEN`.
Go to your project's **Settings > CI/CD** and expand the **Variables** section.
Select the **Add Variable** button and fill in the necessary details with `LOCALSTACK_AUTH_TOKEN` as the key and your CI Auth Token as the value.
After you create the variable, you can use it in the `.gitlab-ci.yml` file.

However, variables set in the GitLab UI are not automatically passed down to service containers.
You need to assign them as variables in the UI, and then re-assign them in your `.gitlab-ci.yml`.

#### Container

In this setup, `lstk` owns the emulator's lifecycle: `DOCKER_HOST` points it at the `dind` daemon, and `lstk start` runs the emulator container there.

```yaml showshowLineNumbers
image: node:22

stages:
  - job

job:
  stage: job
  variables:
    DOCKER_HOST: tcp://docker:2375
    DOCKER_TLS_CERTDIR: ""
    LOCALSTACK_AUTH_TOKEN: $LOCALSTACK_AUTH_TOKEN
    LOCALSTACK_HOST: localhost.localstack.cloud:4566

  services:
    - name: docker:dind
      alias: docker
      command: ["--tls=false"]

  before_script:
    - npm install -g @localstack/lstk
    - apt-get update && apt-get install -y awscli
    - dind_ip="$(getent hosts docker | cut -d' ' -f1)"
    - echo "${dind_ip} localhost.localstack.cloud" >> /etc/hosts
    - lstk setup aws
  script:
    - lstk start
    - lstk aws s3 mb s3://test-bucket
    - lstk aws s3 ls
```

`lstk start` pulls the image, validates your license, and returns only once the emulator is ready, so no separate wait step is needed.
Because the emulator runs on the `dind` daemon, its ports are published on the `docker` service rather than on the job container.
The `/etc/hosts` entry and `LOCALSTACK_HOST` are what let `lstk` and your tests reach it at `localhost.localstack.cloud:4566`; without them `lstk` falls back to `127.0.0.1`, where nothing is listening.

:::note
`lstk` bind-mounts the Docker socket into the emulator, and sets the emulator's own `DOCKER_HOST`, only when it reaches the daemon over a Unix socket.
A TCP `dind` daemon has no socket to mount, so services that spawn their own containers (Lambda, ECS, EKS) need the daemon address passed in explicitly.
`lstk start` forwards `LOCALSTACK_`-prefixed variables to the emulator, which strips the prefix, so set `LOCALSTACK_DOCKER_HOST` to the `dind` daemon as seen from inside the `dind` network (its bridge gateway, usually `tcp://172.17.0.1:2375`).
:::

#### Service

Alternatively, run LocalStack as a GitLab service container and use `lstk` purely as a client, pointing it at the service with `LSTK_ENDPOINT_URL`.
GitLab passes the job's `variables` to service containers too, so the emulator picks up both the auth token and the Docker connection directly, with no prefixing required.

```yaml showshowLineNumbers
image: node:22

stages:
  - job

job:
  stage: job
  variables:
    DOCKER_SOCK: tcp://docker:2375
    DOCKER_HOST: tcp://docker:2375
    DOCKER_TLS_CERTDIR: ""
    LOCALSTACK_AUTH_TOKEN: $LOCALSTACK_AUTH_TOKEN
    LSTK_ENDPOINT_URL: http://localstack:4566

  services:
    - name: localstack/localstack-pro:latest
      alias: localstack
    - name: docker:dind
      alias: docker
      command: ["--tls=false"]

  before_script:
    - npm install -g @localstack/lstk
    - apt-get update && apt-get install -y awscli curl
    - |
      for _ in $(seq 1 60); do
        curl -sf "${LSTK_ENDPOINT_URL}/_localstack/health" > /dev/null && break
        sleep 2
      done
  script:
    - lstk aws s3 mb s3://test-bucket
    - lstk aws s3 ls
```

GitLab starts service containers before the job's first command, but does not wait for them to become ready, hence the health poll.

### Dump LocalStack logs

```yaml showshowLineNumbers
...
job:
  script:
    - set +e
    - <your test command>; status=$?
    - lstk logs --verbose | tee localstack.log
    - exit $status
  artifacts:
    when: always
    paths:
      - localstack.log
...
```

Collect the logs as the last `script` step rather than in `after_script`, where the emulator container is no longer reachable.
Capturing the test command's exit code keeps the job's result intact while still writing the logs after a failing test, which is when they matter most.

In the [Service](#service) setup, `lstk logs` is not available, because `lstk` does not manage the service container.
Set `CI_DEBUG_SERVICES: "true"` to have GitLab stream the service container's logs into the job log instead.

### Store LocalStack state

You can preserve your AWS infrastructure with LocalStack in various ways.

#### Artifact

```yaml showshowLineNumbers
...
job:
  before_script:
    - (test -f ./ls-state.snapshot && lstk load ./ls-state.snapshot --merge=overwrite) || true
  script:
  ...
    - lstk save ./ls-state.snapshot
  ...
  artifacts:
    paths:
      - $CI_PROJECT_DIR/ls-state.snapshot
...
```

More info about LocalStack's snapshots [here](/aws/developer-tools/snapshots/saving-snapshots-locally/).

#### Cache

```yaml showshowLineNumbers
...
job:
  before_script:
    - (test -f ./ls-state.snapshot && lstk load ./ls-state.snapshot --merge=overwrite) || true
  script:
  ...
    - lstk save ./ls-state.snapshot
  ...
  cache:
    key:
      untracked: true
      files:
        - $CI_PROJECT_DIR/ls-state.snapshot
    paths:
      - $CI_PROJECT_DIR/ls-state.snapshot
...
```

Additional information about snapshots [here](/aws/developer-tools/snapshots/saving-snapshots-locally/).

#### Cloud Pod

```yaml showshowLineNumbers
...
job:
  before_script:
    - lstk load pod:<POD_NAME> || true
  script:
  ...
    - lstk save pod:<POD_NAME>
...
```

Find more information about Cloud Pods [here](/aws/developer-tools/snapshots/cloud-pods).

## Current Limitations

- LocalStack must be able to reach a Docker socket to provision containers for certain services, such as Lambda, EKS, and ECS.
- The runner must be able to resolve the LocalStack domain (by default _localhost.localstack.cloud_); see the sample pipelines for a possible solution.
- To separate steps into their own jobs, you must preserve LocalStack's state, since GitLab does not preserve job-related containers or services across a pipeline.
- Docker tooling is necessary to start up LocalStack in GitLab CI.
- When LocalStack runs as a container, it is not accessible during the `after_script` phase.
