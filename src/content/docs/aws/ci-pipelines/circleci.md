---
title: CircleCI
description: Use LocalStack in CircleCI.
template: doc
sidebar:
    order: 3
---

## Introduction

[CircleCI](https://circleci.com) is a continuous integration and continuous delivery (CI/CD) platform which uses a configuration file (usually named `.circleci/config.yml`) to define the build, test, and deployment workflows.
This guide shows how to run LocalStack in CircleCI using the [`lstk` CLI](/aws/developer-tools/running-localstack/lstk/).

## Snippets

### Start up LocalStack

```yaml showshowLineNumbers
version: '2.1'
jobs:
  localstack-test:
    machine:
      image: ubuntu-2204:current
    steps:
      - checkout
      # LOCALSTACK_AUTH_TOKEN comes from the project's environment variables
      - run:
          name: Install lstk
          command: npm install -g @localstack/lstk
      - run:
          name: Start LocalStack
          command: lstk start
      - run:
          name: Test LocalStack
          command: |
            lstk aws s3 mb s3://test-bucket
            lstk aws s3 ls
workflows:
  localstack-test:
    jobs:
      - localstack-test
```

`lstk start` pulls the image, validates your license, and returns only once the emulator is ready, so no separate wait step is needed.
`lstk aws` proxies the `aws` binary with LocalStack's endpoint and credentials applied, so the AWS CLI must be available on the runner; add an install step if your image does not provide it.

### Configuration

To configure LocalStack use the `environment` key on the job level or a shell command, where the latter takes higher precedence.
`lstk start` forwards host environment variables prefixed with `LOCALSTACK_` into the container, where the prefix is stripped, so set `LOCALSTACK_DEBUG` to control the container's `DEBUG` option.

Read more about the [configuration options](/aws/customization/configuration-options) of LocalStack.

#### Job level

```yaml showshowLineNumbers
...
jobs:
  localstack-test:
    machine:
      image: ubuntu-2204:current
    environment:
      LOCALSTACK_DEBUG: "1"
      LOCALSTACK_LS_LOG: "trace"
    steps:
      ...
      - run: lstk start
...
```

#### Shell command

```yaml showshowLineNumbers
...
jobs:
  localstack-test:
    machine:
      image: ubuntu-2204:current
    steps:
      - run:
          name: Configure LocalStack
          command: |
            echo 'export LOCALSTACK_DEBUG=1' >> "$BASH_ENV"
            echo 'export LOCALSTACK_LS_LOG=trace' >> "$BASH_ENV"
...
```

### Configuring a CI Auth Token

To enable LocalStack for AWS, you need to add your LocalStack CI Auth Token to the project's environment variables.
`lstk` will automatically pick it up and activate the licensed features.

Go to the [CI Auth Token page](https://app.localstack.cloud/workspace/auth-tokens) and copy your CI Auth Token.
To add the CI Auth Token to your CircleCI project, follow these steps:

- Click on **Project Settings**.
- Select **Environment Variables** from the left side menu.
- Click **Add Environment Variable**.
- Name your environment variable `LOCALSTACK_AUTH_TOKEN`.
- Paste your CI Auth Token into the input field.

After adding the variable, CircleCI injects `LOCALSTACK_AUTH_TOKEN` into your job environment.

### Dump LocalStack logs

```yaml showshowLineNumbers
...
jobs:
  localstack-test:
    machine:
      image: ubuntu-2204:current
    steps:
...
      - run:
          name: Dump LocalStack logs
          when: always
          command: lstk logs --verbose | tee localstack.log
      - store_artifacts:
          path: localstack.log
          name: localstack-logs
...
```

### Store LocalStack state

You can preserve your AWS infrastructure with LocalStack in various ways.
To be able to use any of the below samples, you must [set a valid CI Auth Token](#configuring-a-ci-auth-token).

_Note: For best result we recommend to use a combination of the below techniques, and you should familiarize yourself with CircleCI's data persistence approach, see their [official documentation](https://circleci.com/docs/persist-data/)._

#### Cloud Pods

Cloud Pods providing an easy solution to persist LocalStack's state, even between workflows or projects.

Find more information about [Cloud Pods](/aws/developer-tools/snapshots/cloud-pods).

##### Multiple projects

Update or create the Cloud Pod in it's own project (ie in a separate Infrastructure as Code repo), this would create a base Cloud Pod, which you can use in the future without any configuration or deployment.

_Note: If there is a previously created Cloud Pod which doesn't need updating this step can be skipped._

```yaml showshowLineNumbers
...
jobs:
  localstack-update-cloud-pod:
    machine:
      image: ubuntu-2204:current

    steps:
      - run: npm install -g @localstack/lstk
      - run: lstk start
      ...
      - run:
          name: Load state if exists
          command: lstk load pod:<POD_NAME> || true
      ...
      # Deploy infrastructure changes
      ...
      - run:
          name: Save Cloud Pod
          command: lstk save pod:<POD_NAME>


workflows:
  localstack-build:
    jobs:
      - localstack-update-cloud-pod
```

In a separate project use the previously created base Cloud Pod as below:

```yaml showshowLineNumbers
...
jobs:
  localstack-use-cloud-pod:
    machine:
      image: ubuntu-2204:current

    steps:
      - run: npm install -g @localstack/lstk
      - run: lstk start
      ...
      - run:
          name: Load Cloud Pod
          command: lstk load pod:<POD_NAME>
      ...
      # Run some tests

workflows:
  localstack-build:
    jobs:
      - localstack-use-cloud-pod
```

##### Same project

To use a dynamically updated Cloud Pod in multiple workflows but in the same project, you must eliminate the race conditions between the update workflow and the others.

Before you are able to use any stored artifacts in your pipeline, you must provide either a valid [project API token](https://circleci.com/docs/managing-api-tokens/#creating-a-project-api-token) or a [personal API token](https://circleci.com/docs/managing-api-tokens/#creating-a-personal-api-token) to CircleCI.

```yaml showshowLineNumbers
...
parameters:
  run_workflow_build:
    default: true
    type: boolean

  run_workflow_test1:
    default: false
    type: boolean

  run_workflow_test2:
    default: false
    type: boolean
...


jobs:
  localstack-update-state:
    machine:
      image: ubuntu-2204:current

    steps:
      - run: npm install -g @localstack/lstk
      - run: lstk start
      ...
      - run:
          name: Load Cloud Pod
          command: lstk load pod:<POD_NAME> || true
      ...
      # Deploy infrastructure
      ...
      - run:
          name: Save Cloud Pod
          command: lstk save pod:<POD_NAME>
      - run:
          name: Trigger other workflows
          # Replace placeholders with right values
          command: |
            curl --request POST \
              --url https://circleci.com/api/v2/project/<vcs-slug>/<org-name>/<repo-name>/pipeline
              --header 'Circle-Token: $CIRCLECI_TOKEN' \
              --header 'content-type: application/json' \
              --data '{"parameters":{"run_workflow_build":false, "run_workflow_test1":true, "run_workflow_test2":true}}'


  localstack-use-state:
    machine:
      image: ubuntu-2204:current

    steps:
      - run: npm install -g @localstack/lstk
      - run: lstk start
      ...
      - run:
          name: Load state if exists
          command: lstk load pod:<POD_NAME> || true
      ...


# Example workflows
workflows:
  localstack-build:
    when: << pipeline.parameters.run_workflow_build >>
    jobs:
      - localstack-update-state
  localstack-test1:
    when: << pipeline.parameters.run_workflow_test1 >>
      - localstack-use-state
      ...
  localstack-test2:
    when: << pipeline.parameters.run_workflow_test2 >>
    jobs:
      - localstack-use-state
      ...
```

#### Workspace

This strategy persist LocalStack's state between jobs for the current workflow.

```yaml showshowLineNumbers
...
jobs:
  localstack-save-state:
    machine:
      image: ubuntu-2204:current
    steps:
      - run: npm install -g @localstack/lstk
      - run: lstk start
      ...
      # LocalStack already running and deployed infrastructure
      - run:
          name: Save a snapshot
          command: lstk save ./ls-state.snapshot
      - persist_to_workspace:
          paths:
            - ls-state.snapshot
      # Store state as artifact for local debugging
      - store_artifacts:
          path: ls-state.snapshot
          name: ls-state
...
  localstack-load-state:
    machine:
      image: ubuntu-2204:current
    steps:
      - run: npm install -g @localstack/lstk
      - run: lstk start
      ...
      # LocalStack already running
      - attach_workspace:
          at: .
      - run:
          name: Load the snapshot
          command: |
            test -f ls-state.snapshot && lstk load ./ls-state.snapshot --merge=overwrite
...
  workflows:
  localstack-build:
    jobs:
      - localstack-save-state
      - localstack-load-state
```

More information about Localstack's [snapshots](/aws/developer-tools/snapshots/saving-snapshots-locally).

#### Cache

To preserve state between workflow runs, you can take leverage of CircleCI's caching too.
This strategy will persist LocalStack's state for every workflow re-runs, but not for different workflows.

```yaml showshowLineNumbers
...
jobs:
  localstack-update-state:
    machine:
      image: ubuntu-2204:current
    steps:
      - run: npm install -g @localstack/lstk
      - run: lstk start
      ...
      # LocalStack already running
      # Let's restore previous workflow run's LocalStack state
      - restore_cache:
          # Use latest "ls-state" prefixed cache
          key: ls-state-
      - run:
          name: Load the snapshot
          command: test -f ls-state.snapshot && lstk load ./ls-state.snapshot --merge=overwrite
      ...
      # Infrastructure had been updated
      # Let's update cached LocalStack state
      - run:
          name: Save a snapshot
          command: lstk save ./ls-state.snapshot
      - save_cache:
          key: ls-state-{{checksum ls-state.snapshot}}
          paths: ls-state.snapshot
  ...
  localstack-do-work:
    machine:
      image: ubuntu-2204:current
    steps:
      - run: npm install -g @localstack/lstk
      - run: lstk start
      # LocalStack already running
      - restore_cache:
          # Use latest "ls-state" prefixed cache
          key: ls-state-
      - run:
          name: Load the snapshot
          command: test -f ls-state.snapshot && lstk load ./ls-state.snapshot --merge=overwrite
      ...


# Example workflows
workflows:
  localstack-build:
    jobs:
      - localstack-update-state
      - localstack-do-work
      ...
```

More information about [snapshots](/aws/developer-tools/snapshots/saving-snapshots-locally).