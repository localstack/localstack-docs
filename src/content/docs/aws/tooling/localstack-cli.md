---
title: LocalStack CLI
description: Reference guide for LocalStack CLI commands, options, and usage.
template: doc
sidebar:
    order: 10
tags: ["Free"]
---

## Introduction

The LocalStack Command Line Interface (CLI) is a tool for starting, managing, and configuring your LocalStack container.
It provides convenience features to interact with LocalStack features like Cloud Pods, Extensions, State Management, and more.

To install the LocalStack CLI, follow the [installation guide](/aws/getting-started/installation/#installing-localstack-cli).


## LocalStack CLI

:::note
This documentation was auto-generated from LocalStack CLI version `LocalStack CLI 4.14.0`.
:::

### Global Options

The following global options are available for the `localstack` CLI:

| Option | Description |
|--------|-------------|
| `-v`, `--version` | Show the version and exit |
| `-d`, `--debug` | Enable CLI debugging mode |
| `-p`, `--profile TEXT` | Set the configuration profile |
| `-h`, `--help` | Show help message and exit |

### Commands

The following commands are available for managing your LocalStack instance.

### `auth`

Authenticate with your LocalStack account

```bash
Usage: localstack auth [OPTIONS] COMMAND [ARGS]...

  Authenticate with your LocalStack account.

  Manage your credentials and authenticate with your LocalStack account.

Options:
  -h, --help  Show this message and exit.

Commands:
  clear-token  Clear any existing LocalStack auth token from your environment
  set-token    Set your Localstack auth token to allow you to start LocalStack
               Pro
  show-token   Show the auth token in your configuration

Deprecated:
  login   Login to the your LocalStack account (DEPRECATED)
  logout  Log out from your LocalStack account (DEPRECATED)
```

<details>
<summary>Subcommands for <code>localstack auth</code></summary>

#### `auth clear-token`

Clear any existing LocalStack auth token from your environment

```bash
Usage: localstack auth clear-token [OPTIONS]

Options:
  -h, --help  Show this message and exit.
```

#### `auth set-token`

Set your Localstack auth token to allow you to start LocalStack

```bash
Usage: localstack auth set-token [OPTIONS] AUTH_TOKEN

  Configure your auth token. Your auth token is used the license activation to
  activate LocalStack Pro. This is different from `localstack auth login`
  which enables platform features such as pushing cloud pods to your webapp
  account.

  The auth token you configure here will be passed to the
  `LOCALSTACK_AUTH_TOKEN` environment variable of the LocalStack container
  when you run `localstack start`.

  AUTH_TOKEN: Your Localstack auth token that you can find in
  https://app.localstack.cloud.

Options:
  -h, --help  Show this message and exit.
```

#### `auth show-token`

Show the auth token in your configuration

```bash
Usage: localstack auth show-token [OPTIONS]

  Show the token that LocalStack picks up from your environment. This can
  either be the auth token set via `localstack auth set-token`, or the value
  of `LOCALSTACK_AUTH_TOKEN`.

Options:
  --plain     Setting this flag will output only the value of the token in
              plain text, so it can be used as input to other programs, like
              `LOCALSTACK_AUTH_TOKEN=$(localstack auth show-token --plain)`.
  -h, --help  Show this message and exit.
```

#### `auth login`

(Deprecated) Login to the your LocalStack account (DEPRECATED)

```bash
Usage: localstack auth login [OPTIONS]

  Login to the LocalStack Platform.

  This command performs a login to your LocalStack account, giving you access
  to features that require platform permissions, such as uploading cloud pods
  to your account.

  This command is deprecated and it will be removed soon. To use LocalStack
  features that requires authentication to the LocalStack platform (e.g.,
  Cloud Pods), please run `localstack auth set-token <AUTH_TOKEN>`, or set the
  environment variable `LOCALSTACK_AUTH_TOKEN` to a valid auth token.
  (DEPRECATED)

Options:
  -u, --username USER  Username (email address) for login  [required]
  -p, --password PWD   Password for login  [required]
  -h, --help           Show this message and exit.
```

#### `auth logout`

(Deprecated) Log out from your LocalStack account (DEPRECATED)

```bash
Usage: localstack auth logout [OPTIONS]

  Log out from the LocalStack Platform.

  This command performs a logout from the LocalStack platform and deletes all
  session information on your machine. (DEPRECATED)

Options:
  -h, --help  Show this message and exit.
```

</details>

### `completion`

CLI shell completion

```bash
Usage: localstack completion [OPTIONS] {bash|zsh|fish}

   Print shell completion code for the specified shell (bash, zsh, or fish).
   The shell code must be evaluated to enable the interactive shell completion
   of LocalStack CLI commands.  This is usually done by sourcing it from the
   .bash_profile.

    Examples:
      # Bash
      ## Bash completion on Linux depends on the 'bash-completion' package.
      ## Write the LocalStack CLI completion code for bash to a file and source it from .bash_profile
      localstack completion bash > ~/.localstack/completion.bash.inc
      printf "
      # LocalStack CLI bash completion
      source '$HOME/.localstack/completion.bash.inc'
      " >> $HOME/.bash_profile
      source $HOME/.bash_profile
   
      # zsh
      ## Set the LocalStack completion code for zsh to autoload on startup:
      localstack completion zsh > "${fpath[1]}/_localstack"
   
      # fish
      ## Set the LocalStack completion code for fish to autoload on startup:
      localstack completion fish > ~/.config/fish/completions/localstack.fish

Options:
  -h, --help  Show this message and exit.
```

### `config`

Manage your LocalStack config

```bash
Usage: localstack config [OPTIONS] COMMAND [ARGS]...

  Inspect and validate your LocalStack configuration.

Options:
  -h, --help  Show this message and exit.

Commands:
  show      Show your config
  validate  Validate your config
```

<details>
<summary>Subcommands for <code>localstack config</code></summary>

#### `config show`

Show your config

```bash
Usage: localstack config show [OPTIONS]

  Print the current LocalStack config values.

  This command prints the LocalStack configuration values from your
  environment. It analyzes the environment variables as well as the LocalStack
  CLI profile. It does _not_ analyze a specific file (like a docker-compose-
  yml).

Options:
  -f, --format [table|plain|dict|json]
                                  The formatting style for the command output.
                                  [default: table]
  -h, --help                      Show this message and exit.
```

#### `config validate`

Validate your config

```bash
Usage: localstack config validate [OPTIONS]

  Validate your LocalStack configuration (docker compose).

  This command inspects the given docker-compose file (by default docker-
  compose.yml in the current working directory) and validates if the
  configuration is valid.

  It will show an error and return a non-zero exit code if:
  - The docker-compose file is syntactically incorrect.
  - If the file contains common issues when configuring LocalStack.

Options:
  -f, --file PATH  Path to compose file  [default: docker-compose.yml]
  -h, --help       Show this message and exit.
```

</details>

### `logs`

Show LocalStack logs

```bash
Usage: localstack logs [OPTIONS]

  Show the logs of the current LocalStack runtime.

  This command shows the logs of the currently running LocalStack docker
  container. By default, this command looks for a container named `localstack-
  main` (which is the default container name used by the `localstack start`
  command). If your LocalStack container has a different name, set the config
  variable `MAIN_CONTAINER_NAME`.

Options:
  -f, --follow  Block the terminal and follow the log output
  -n, --tail N  Print only the last <N> lines of the log output
  -h, --help    Show this message and exit.
```

### `restart`

Restart LocalStack

```bash
Usage: localstack restart [OPTIONS]

  Restarts the current LocalStack runtime.

Options:
  -h, --help  Show this message and exit.
```

### `ssh`

Obtain a shell in LocalStack

```bash
Usage: localstack ssh [OPTIONS]

  Obtain a shell in the current LocalStack runtime.

  This command starts a new interactive shell in the currently running
  LocalStack container. By default, this command looks for a container named
  `localstack-main` (which is the default container name used by the
  `localstack start` command). If your LocalStack container has a different
  name, set the config variable `MAIN_CONTAINER_NAME`.

Options:
  -h, --help  Show this message and exit.
```

### `start`

Start LocalStack

```bash
Usage: localstack start [OPTIONS]

  Start the LocalStack runtime.

  This command starts the LocalStack runtime with your current configuration.
  By default, it will start a new Docker container from the latest
  LocalStack(-Pro) Docker image with best-practice volume mounts and port
  mappings.

Options:
  --docker            Start LocalStack in a docker container [default]
  --host              Start LocalStack directly on the host(DEPRECATED)
  --no-banner         Disable LocalStack banner
  -d, --detached      Start LocalStack in the background
  --network TEXT      The container network the LocalStack container should be
                      started in. By default, the default docker bridge
                      network is used.
  -e, --env TEXT      Additional environment variables that are passed to the
                      LocalStack container
  -p, --publish TEXT  Additional port mappings that are passed to the
                      LocalStack container
  -v, --volume TEXT   Additional volume mounts that are passed to the
                      LocalStack container
  --host-dns          Expose the LocalStack DNS server to the host using port
                      bindings.
  -s, --stack TEXT    Use a specific stack with optional version. Examples:
                      [localstack:4.5, snowflake]
  -h, --help          Show this message and exit.
```

### `status`

Query status info

```bash
Usage: localstack status [OPTIONS] COMMAND [ARGS]...

  Query status information about the currently running LocalStack instance.

Options:
  -h, --help  Show this message and exit.

Commands:
  docker    Query LocalStack Docker status
  services  Query LocalStack services status
```

<details>
<summary>Subcommands for <code>localstack status</code></summary>

#### `status docker`

Query LocalStack Docker status

```bash
Usage: localstack status docker [OPTIONS]

  Query information about the currently running LocalStack Docker image, its
  container, and the LocalStack runtime.

Options:
  -f, --format [table|plain|dict|json]
                                  The formatting style for the command output.
                                  [default: table]
  -h, --help                      Show this message and exit.
```

#### `status services`

Query LocalStack services status

```bash
Usage: localstack status services [OPTIONS]

  Query information about the services of the currently running LocalStack
  instance.

Options:
  -f, --format [table|plain|dict|json]
                                  The formatting style for the command output.
                                  [default: table]
  -h, --help                      Show this message and exit.
```

</details>

### `stop`

Stop LocalStack

```bash
Usage: localstack stop [OPTIONS]

  Stops the current LocalStack runtime.

  This command stops the currently running LocalStack docker container. By
  default, this command looks for a container named `localstack-main` (which
  is the default container name used by the `localstack start` command). If
  your LocalStack container has a different name, set the config variable
  `MAIN_CONTAINER_NAME`.

Options:
  -h, --help  Show this message and exit.
```

### `update`

Update LocalStack

```bash
Usage: localstack update [OPTIONS] COMMAND [ARGS]...

  Update different LocalStack components.

Options:
  -h, --help  Show this message and exit.

Commands:
  all             Update all LocalStack components
  docker-images   Update docker images LocalStack depends on
  localstack-cli  Update LocalStack CLI
```

<details>
<summary>Subcommands for <code>localstack update</code></summary>

#### `update all`

Update all LocalStack components

```bash
Usage: localstack update all [OPTIONS]

  Update all LocalStack components.

  This is the same as executing `localstack update localstack-cli` and
  `localstack update docker-images`. Updating the LocalStack CLI is currently
  only supported if the CLI is installed and run via Python / PIP. If you used
  a different installation method, please follow the instructions on
  https://docs.localstack.cloud/.

Options:
  -h, --help  Show this message and exit.
```

#### `update docker-images`

Update docker images LocalStack depends on

```bash
Usage: localstack update docker-images [OPTIONS]

  Update all Docker images LocalStack depends on.

  This command updates all Docker LocalStack docker images, as well as other
  Docker images LocalStack depends on (and which have been used before / are
  present on the machine).

Options:
  -h, --help  Show this message and exit.
```

#### `update localstack-cli`

Update LocalStack CLI

```bash
Usage: localstack update localstack-cli [OPTIONS]

  Update the LocalStack CLI.

  This command updates the LocalStack CLI. This is currently only supported if
  the CLI is installed and run via Python / PIP. If you used a different
  installation method, please follow the instructions on
  https://docs.localstack.cloud/.

Options:
  -h, --help  Show this message and exit.
```

</details>

### `wait`

Wait for LocalStack

```bash
Usage: localstack wait [OPTIONS]

  Wait for the LocalStack runtime to be up and running.

  This commands waits for a started LocalStack runtime to be up and running,
  ready to serve requests. By default, this command looks for a container
  named `localstack-main` (which is the default container name used by the
  `localstack start` command). If your LocalStack container has a different
  name, set the config variable `MAIN_CONTAINER_NAME`.

Options:
  -t, --timeout N  Only wait for <N> seconds before raising a timeout error
  -h, --help       Show this message and exit.
```

## Advanced Commands

The following advanced commands provide additional functionality for power users.

### `aws`

Access additional functionality on LocalStack AWS Services

```bash
Usage: localstack aws [OPTIONS] COMMAND [ARGS]...

  Accesses additional functionality on LocalStack emulated AWS services.

  This command provides tools to enhance your experience with certain emulated
  AWS services.

Options:
  -h, --help  Show this message and exit.

Commands:
  iam  (Preview) Access LocalStack IAM features
```

<details>
<summary>Subcommands for <code>localstack aws</code></summary>

#### `aws iam`

(Preview) Access LocalStack IAM features

```bash
Usage: localstack aws iam [OPTIONS] COMMAND [ARGS]...

  Access LocalStack IAM features.

  This command provides tools to make it easier to write IAM policies for your
  cloud application.

Options:
  -h, --help  Show this message and exit.

Commands:
  stream   Stream policies for all requests enforced on LocalStack
  summary  Summary of policies for all requests enforced on LocalStack
```

</details>

### `dns`

Manage LocalStack DNS host config

```bash
Usage: localstack dns [OPTIONS] COMMAND [ARGS]...

  Manage the usage of the LocalStack DNS on your host.

  This command provides tools to configure your the DNS on your host machine
  to use the LocalStack DNS on your host machine. The LocalStack DNS is used
  for certain Pro features (like the transparent endpoint injection).

  Visit https://docs.localstack.cloud/user-guide/tools/transparent-endpoint-injection/dns-server/
  for more information on the LocalStack DNS and how it is used.

Options:
  -h, --help  Show this message and exit.

Commands:
  systemd-resolved  Manage LocalStack DNS in systemd-resolved
```

<details>
<summary>Subcommands for <code>localstack dns</code></summary>

#### `dns systemd-resolved`

Manage LocalStack DNS in systemd-resolved

```bash
Usage: localstack dns systemd-resolved [OPTIONS]

  Manage the LocalStack DNS configuration using systemd-resolved (Ubuntu,
  Debian, etc.).

  This command sets (or reverts) the LocalStack DNS, running in the current
  LocalStack runtime, in systemd-resolved for the docker network interface.
  Most current Linux systems - like Ubuntu, Debian, or Fedora - use systemd-
  resolved for the network name resolution.

Options:
  -s, --set / -r, --revert  Set or revert DNS settings  [default: set]
  -h, --help                Show this message and exit.
```

</details>

### `ephemeral`

(Preview) Manage ephemeral LocalStack instances

```bash
Usage: localstack ephemeral [OPTIONS] COMMAND [ARGS]...

  (Preview) Manage ephemeral LocalStack instances in the cloud.

  This command group allows you to create, list, and delete ephemeral
  LocalStack instances. Ephemeral instances are temporary cloud instances that
  can be used for testing and development.

Options:
  -h, --help  Show this message and exit.

Commands:
  create  Create a new ephemeral instance
  delete  Delete an ephemeral instance
  list    List all ephemeral instances
  logs    Fetch logs from an ephemeral instance
```

<details>
<summary>Subcommands for <code>localstack ephemeral</code></summary>

#### `ephemeral create`

Create a new ephemeral instance

```bash
Usage: localstack ephemeral create [OPTIONS]

  Create a new ephemeral LocalStack instance in the cloud.

  Specify an instance name and optional parameters like lifetime and
  environment variables. The instance will be created with the specified
  configuration and its connection details will be returned.

  Examples:
      localstack ephemeral create --name my-test-instance
      localstack ephemeral create --name my-instance --lifetime 60
      localstack ephemeral create --name my-instance --env DEBUG=1

Options:
  --name TEXT         Name of the ephemeral instance  [required]
  --lifetime INTEGER  Lifetime of the instance in minutes
  -e, --env TEXT      Additional environment variables that are passed to the
                      LocalStack instance
  -h, --help          Show this message and exit.
```

#### `ephemeral delete`

Delete an ephemeral instance

```bash
Usage: localstack ephemeral delete [OPTIONS]

  Delete a specific ephemeral LocalStack instance.

  Specify the name of the instance you want to delete. Once deleted, the
  instance cannot be recovered.

  Example:
      localstack ephemeral delete --name my-test-instance

Options:
  --name TEXT  Name of the ephemeral instance to delete  [required]
  -h, --help   Show this message and exit.
```

#### `ephemeral list`

List all ephemeral instances

```bash
Usage: localstack ephemeral list [OPTIONS]

  List all available ephemeral LocalStack instances.

  This command shows all ephemeral instances associated with your account,
  including their names, status, and other relevant details.

  Examples:
      localstack ephemeral list

Options:
  -h, --help  Show this message and exit.
```

#### `ephemeral logs`

Fetch logs from an ephemeral instance

```bash
Usage: localstack ephemeral logs [OPTIONS]

  Fetch logs from a specific ephemeral LocalStack instance.

  Retrieve the logs of a running ephemeral instance by specifying its name.
  The logs are returned in chronological order.

  Example:
      localstack ephemeral logs --name my-test-instance

Options:
  --name TEXT  Name of the ephemeral instance to fetch logs from  [required]
  -h, --help   Show this message and exit.
```

</details>

### `extensions`

(Preview) Manage LocalStack extensions

```bash
Usage: localstack extensions [OPTIONS] COMMAND [ARGS]...

  (Preview) Manage LocalStack extensions.

  LocalStack Extensions allow developers to extend and customize LocalStack.
  The feature and the API are currently in a preview stage and may be subject
  to change.

  If you are using LocalStack extensions with docker-compose, you can use the
  CLI by pointing the `LOCALSTACK_VOLUME_DIR=` variable to localstack volume
  directory on your host. By default, the volume on your host is located in
  `~/.cache/localstack` on Linux, and `~/Library/Caches` on Mac.

  Visit https://docs.localstack.cloud/references/localstack-extensions/ for
  more information on LocalStack Extensions.

Options:
  -v, --verbose  Print more output
  -h, --help     Show this message and exit.

Commands:
  dev        Developer tools for developing LocalStack extensions.
  init       Initialize the LocalStack extensions environment.
  install    Install a LocalStack extension.
  list       List installed extension.
  uninstall  Remove a LocalStack extension.
```

<details>
<summary>Subcommands for <code>localstack extensions</code></summary>

#### `extensions dev`

Developer tools for developing LocalStack extensions.

```bash
Usage: localstack extensions dev [OPTIONS] COMMAND [ARGS]...

  Developer tools for developing LocalStack extensions.

Options:
  -h, --help  Show this message and exit.

Commands:
  disable  Disables an extension on the host for developer mode.
  enable   Enables an extension on the host for developer mode.
  list     List LocalStack extensions for which dev mode is enabled.
  new      Create a new LocalStack extension from the official extension...
```

#### `extensions init`

Initialize the LocalStack extensions environment.

```bash
Usage: localstack extensions init [OPTIONS]

  Initialize the LocalStack extensions environment.

  The environment variable `LOCALSTACK_VOLUME_DIR` currently defaults to
  ~/.cache/localstack, where the extension environment will be installed into
  ./lib/extensions/

Options:
  -h, --help  Show this message and exit.
```

#### `extensions install`

Install a LocalStack extension.

```bash
Usage: localstack extensions install [OPTIONS] NAME

  Install a LocalStack extension.

  This command installs a LocalStack extension, where the name can be any
  valid pip dependency identifier. Additionally, we support the installation
  of distribution files from disk, which you can indicate by a ``file://``
  prefix in the name

  Example invocations:
      localstack extensions install localstack-extension-stripe
      localstack extensions install "git+https://github.com/localstack/localstack-stripe.git#egg=localstack-stripe"
      localstack extensions install file://./dist/localstack-extension-hello-world-0.1.0.tar.gz
      localstack extensions install file://.  # assumes the current directory is a source distribution

Options:
  -h, --help  Show this message and exit.
```

#### `extensions list`

List installed extension.

```bash
Usage: localstack extensions list [OPTIONS]

  List installed extension.

  The environment variable `LOCALSTACK_VOLUME_DIR` currently defaults to
  ~/.cache/localstack, where the extension environment will be installed into
  ./lib/extensions/

Options:
  -h, --help  Show this message and exit.
```

#### `extensions uninstall`

Remove a LocalStack extension.

```bash
Usage: localstack extensions uninstall [OPTIONS] NAME

  Remove a LocalStack extension.

  This command removes a previously installed LocalStack extension, where the
  name can be any valid package name.

  Example invocations:
      localstack extensions uninstall localstack-extension-stripe

Options:
  -h, --help  Show this message and exit.
```

</details>

### `license`

(Preview) Manage and verify your LocalStack license

```bash
Usage: localstack license [OPTIONS] COMMAND [ARGS]...

  (Preview) Manage and verify your LocalStack license.

  Your LocalStack license allows you to use advanced features of LocalStack.

Options:
  -h, --help  Show this message and exit.

Commands:
  activate
  info
```

<details>
<summary>Subcommands for <code>localstack license</code></summary>

#### `license activate`



```bash
Usage: localstack license activate [OPTIONS]

Options:
  -h, --help  Show this message and exit.
```

#### `license info`



```bash
Usage: localstack license info [OPTIONS]

Options:
  -h, --help  Show this message and exit.
```

</details>

### `pod`

Manage the state of your instance via Cloud Pods.

```bash
Usage: localstack pod [OPTIONS] COMMAND [ARGS]...

  Manage the state of your instance via Cloud Pods.

Options:
  -h, --help  Show this message and exit.

Commands:
  delete    Delete a Cloud Pod
  list      List all available Cloud Pods
  load      Load the state of a Cloud Pod into the application runtime.
  remote    Manage cloud pod remotes
  save      Create a new Cloud Pod
  versions  List all available versions for a Cloud Pod
```

<details>
<summary>Subcommands for <code>localstack pod</code></summary>

#### `pod delete`

Delete a Cloud Pod

```bash
Usage: localstack pod delete [OPTIONS] NAME [REMOTE]

  Delete a Cloud Pod registered on a remote (by default, the LocalStack
  platform).

  This command will remove all the versions of a Cloud Pod, and the operation
  is not reversible.

Options:
  -h, --help  Show this message and exit.
```

#### `pod list`

List all available Cloud Pods

```bash
Usage: localstack pod list [OPTIONS] [REMOTE]

  List all the Cloud Pods available for a single user, or for an entire
  organization, if the user is part of one.

  With the --public flag, it lists the all the available public Cloud Pods. A
  public Cloud Pod is available across the boundary of a user and/or
  organization. In other words, any public Cloud Pod can be injected by any
  other user holding a LocalStack Pro (or above) license.

Options:
  -p, --public               List all the available public Cloud Pods
  -m, --mine                 List only the Cloud Pods created by the current
                             user
  -f, --format [table|json]  The formatting style for the list pods command
                             output.  [default: table]
  -h, --help                 Show this message and exit.
```

#### `pod load`

Load the state of a Cloud Pod into the application runtime.

```bash
Usage: localstack pod load [OPTIONS] NAME [REMOTE]

  Load the state of a Cloud Pod into the application runtime. Users can import
  Cloud Pods from different remotes, with the LocalStack platform being the
  default one. Users can also load a specific version by appending a version
  number to the pod name after a colon (e.g., `localstack pod load my-pod:3`).
  If not specified, the latest version will be loaded. Use the `localstack pod
  versions` to list all the available versions.

  Loading the state of a Cloud Pod into LocalStack might cause some conflicts
  with the current state of the container. LocalStack will attempt a best-
  effort merging strategy between the current state and the one from the Cloud
  Pod. For a service X present in both the current state and the Cloud Pod, we
  will attempt to merge states across different accounts and regions. If the
  service X has a state for the same account and region both in the running
  container and the Cloud Pod, the latter will be used. If a service Y is
  present in the running container but not in the Cloud Pod, it will be left
  untouched. This is the default merge strategy which is activated by either
  the `--strategy account-region-merge` option or by omitting the `--strategy`
  option at all.

  In addition to the default one, LocalStack provides two more strategies:

  - overwrite, in which the state of LocalStack is completely reset before loading the state from the Cloud Pod.
  This strategy is activated with the `--strategy overwrite` option .
  - service-merge: in which LocalStack merges the state of a service under the same account and region when
  there is no resource overlap. In such a case, the loaded resources are preferred.
  This option is activated with the `--strategy service-merge` option.

  To load a local copy of a LocalStack state, you can use the 'localstack
  state import' command.

Options:
  -s, --secret TEXT               Secret for the Cloud Pod encryption.
                                  Encryption is an Enterprise only feature.
  --strategy [overwrite|account-region-merge|service-merge]
                                  The merge strategy to adopt when loading the
                                  Cloud Pod.  [default: account-region-merge]
  -y, --yes                       Automatic yes to prompts. Assume a positive
                                  answer to all prompts and run non-
                                  interactively.
  --dry-run                       Checks the resources added or modified in
                                  the application runtime by loading a Cloud
                                  Pod.
  -h, --help                      Show this message and exit.
```

#### `pod remote`

Manage cloud pod remotes

```bash
Usage: localstack pod remote [OPTIONS] COMMAND [ARGS]...

  Manage cloud pod remotes

Options:
  -h, --help  Show this message and exit.

Commands:
  add     Add a remote
  delete  Delete a remote
  list    Lists the available remotes
```

#### `pod save`

Create a new Cloud Pod

```bash
Usage: localstack pod save [OPTIONS] NAME [REMOTE]

  Save the current state of the LocalStack container in a Cloud Pod.

  A Cloud Pod can be registered and saved with different storage options,
  called remotes. By default, Cloud Pods are hosted in the LocalStack
  platform. However, users can decide to store their Cloud Pods in other
  remotes, such as AWS S3 buckets or ORAS registries.

  An optional message can be attached to any Cloud Pod. Furthermore, one could
  decide to export only a subset of services with the optional --services
  option.

  To use the LocalStack platform for storage, the desired Cloud Pod's name will suffice, e.g.:

  localstack pod save <pod_name>

  Please be aware that each following save invocation with the same name will
  result in a new version being created.

  To save a local copy of your state, you can use the 'localstack state export' command.

Options:
  -m, --message TEXT             Add a comment describing this Cloud Pod's
                                 version
  -s, --services TEXT            Comma-delimited list of services to push in
                                 the Cloud Pod (all by default)
  --visibility [public|private]  Set the visibility of the Cloud Pod [`public`
                                 or `private`]. Does not create a new version
  -S, --secret TEXT              Secret for the Cloud Pod encryption.
                                 Encryption is an Enterprise only feature.
  -f, --format [json]            The formatting style for the save command
                                 output.
  -h, --help                     Show this message and exit.
```

#### `pod versions`

List all available versions for a Cloud Pod

```bash
Usage: localstack pod versions [OPTIONS] NAME

  List all available versions for a Cloud Pod

  This command lists the versions available for a Cloud Pod. Each invocation
  of the save command is going to create a new version for a named Cloud Pod,
  if a Pod with such name already does exist in the LocalStack platform.

Options:
  -f, --format [table|json]  The formatting style for the version command
                             output.  [default: table]
  -h, --help                 Show this message and exit.
```

</details>

### `replicator`

(Preview) Start a replication job or check its status

```bash
Usage: localstack replicator [OPTIONS] COMMAND [ARGS]...

  *** Preview Feature ***

  This feature is currently in preview mode in our Teams offering and it's
  availability may change in future releases.

  The replicator command group allows you to replicate AWS resources into
  LocalStack.

Options:
  -h, --help  Show this message and exit.

Commands:
  resources  List supported resources
  start      Replicate an AWS resource
  status     Check replication status
```

<details>
<summary>Subcommands for <code>localstack replicator</code></summary>

#### `replicator resources`

List supported resources

```bash
Usage: localstack replicator resources [OPTIONS]

Options:
  -h, --help  Show this message and exit.

*** Preview Feature ***

This feature is currently in preview mode in our Teams offering and it's availability may change in future releases.
```

#### `replicator start`

Replicate an AWS resource

```bash
Usage: localstack replicator start [OPTIONS]

  Starts a job to replicate an AWS resource into localstack. You must have
  credentials with sufficient read access to the resource trying to replicate.
  At the moment only environment variables are recognized.
  `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_DEFAULT_REGION` must
  be set. `AWS_ENDPOINT_URL` and `AWS_SESSION_TOKEN` are optional.

Options:
  --replication-type [MOCK|SINGLE_RESOURCE|BATCH]
                                  Type of replication job: MOCK,
                                  SINGLE_RESOURCE, BATCH  [default:
                                  SINGLE_RESOURCE]
  --resource-arn TEXT             ARN of the resource to recreate. Optional
                                  for SINGLE_RESOURCE replication
  --resource-type TEXT            CloudControl type of the resource to
                                  recreate. Optional for SINGLE_RESOURCE
                                  replication
  --resource-identifier TEXT      CloudControl identifier of the resource to
                                  recreate. Mandatory if --resource-type is
                                  used
  --target-account-id TEXT        Localstack account ID where the resources
                                  will be replicated. Defaults to
                                  000000000000. See <docs> to enable same
                                  account replication
  --target-region-name TEXT       Localstack region where the resources will
                                  be replicated. Only provide if different
                                  than source AWS account.
  --delay TEXT                    Delay for the MOCK replication work
  -h, --help                      Show this message and exit.

*** Preview Feature ***

This feature is currently in preview mode in our Teams offering and it's availability may change in future releases.
```

#### `replicator status`

Check replication status

```bash
Usage: localstack replicator status [OPTIONS] JOB_ID

  Check the status of a replication job using its Job ID. Use the --follow
  flag to continuously check the status until the job is completed.

Options:
  --follow         Follow the status until completed
  --delay INTEGER  Delay between calls  [default: 5]
  -h, --help       Show this message and exit.

*** Preview Feature ***

This feature is currently in preview mode in our Teams offering and it's availability may change in future releases.
```

</details>

### `state`

(Preview) Export, restore, and reset LocalStack state.

```bash
Usage: localstack state [OPTIONS] COMMAND [ARGS]...

  (Preview) Manage and manipulate the localstack state.

  The state command group allows you to interact with LocalStack's state
  backend.

  Read more: https://docs.localstack.cloud/references/persistence-
  mechanism/#snapshot-based-persistence

Options:
  -h, --help  Show this message and exit.

Commands:
  export   Export the state of LocalStack services
  import   Import the state of LocalStack services
  inspect  Inspect the state of LocalStack services
  reset    Reset the state of LocalStack services
```

<details>
<summary>Subcommands for <code>localstack state</code></summary>

#### `state export`

Export the state of LocalStack services

```bash
Usage: localstack state export [OPTIONS] [DESTINATION]

  Save the current state of the LocalStack container to a file on the local
  disk. This file can be restored at any point in time using the `localstack
  state import` command. Please be aware that this might not be possible when
  importing the state with a different version of LocalStack.

  If you are looking for a managed solution to handle the state of your
  LocalStack container, please check out the Cloud Pods feature:
  https://docs.localstack.cloud/user-guide/tools/cloud-pods/.

  Use the DESTINATION argument to specify an absolute or relative path for the
  exported file. If no destination is specified, a file named `ls-state-
  export` will be saved in the current working directory.

  Examples:
      localstack state export my-state
      localstack state export ../parent-dir/my-state
      localstack state export /home/johndoe/my-state

  You can also specify a subset of services to export with the `--services`
  option.

  For example:
      localstack state export my-state --services s3,lambda

  By default, the state of all running services is exported.

Options:
  -s, --services TEXT  Comma-delimited list of services to reset. By default,
                       the state of all running services is exported.
  -f, --format [json]  The formatting style for the save command output.
  -h, --help           Show this message and exit.
```

#### `state import`

Import the state of LocalStack services

```bash
Usage: localstack state import [OPTIONS] SOURCE

  Load the state of LocalStack from a file into the running container. The
  SOURCE argument is the absolute or relative path to the file containing the
  state to import. This file must have been generated from a previous
  `localstack state export` command. Please be aware that it might not be
  possible to import a state generated from a different version of LocalStack.

  Examples:
      localstack state import my-state
      localstack state import ../parent-dir/my-state
      localstack state import /home/johndoe/my-state

Options:
  -h, --help  Show this message and exit.
```

#### `state inspect`

Inspect the state of LocalStack services

```bash
Usage: localstack state inspect [OPTIONS]

  Inspect the state of the Localstack Container.

  By default, it starts a curses interface which allows an interactive
  inspection of the contents of the LocalStack running instance.

Options:
  -f, --format [curses|rich|json]
                                  The formatting style for the inspect command
                                  output.  [default: curses]
  -h, --help                      Show this message and exit.
```

#### `state reset`

Reset the state of LocalStack services

```bash
Usage: localstack state reset [OPTIONS]

  Reset the service states of the current LocalStack runtime.

  This command invokes a reset of services in the currently running LocalStack
  container. By default, all services are rest. The `services` options allows
  to select a subset of services which should be reset.

  This command tries to automatically discover the running LocalStack
  instance. If LocalStack has not been started with `localstack start` (and is
  not automatically discoverable), please set `LOCALSTACK_HOST`.

Options:
  -s, --services TEXT  Comma-delimited list of services to reset. By default,
                       the state of all running services is reset.
  -h, --help           Show this message and exit.
```

</details>




## lstk

:::note
**lstk**: We are currently rolling out a new, high-performance CLI written in Go. During this initial phase, the new CLI (`lstk`) supports core lifecycle commands (start, stop, logs). For advanced features such as **Cloud Pods**, **Extensions**, and **Ephemeral Instances**, please continue to use the current LocalStack CLI. Both tools can be installed and used on the same machine.

Advanced features in `lstk` are coming soon.
::: 

`lstk` is meant to provide a modern terminal experience with a built-in terminal UI (TUI). It currently includes some interactivity, but it's not a dashboard-style long-running TUI yet.

To install the new CLI and test it out, follow the [installation steps.](https://github.com/localstack/lstk/blob/main/README.md#installation)

### Configuration

`lstk` uses a TOML config file, created automatically on first run. The file itself includes guidance for manual modifications.

**Search Order**
`lstk` uses the first configuration file found in this priority:

1. **Local**: `./lstk.toml` or `./.lstk/config.toml` (automatically used as the active profile)
2. **User**: `$HOME/.config/lstk/config.toml`
3. **OS Default**: 
   * **macOS**: `$HOME/Library/Application Support/lstk/config.toml`
   * **Windows**: `%AppData%\lstk\config.toml`

:::note
On first run, the config is created at path #2 if `$HOME/.config/` exists; otherwise, it uses path #3. By default, the global config is set to pull the latest updates.
:::

### Commands
**See active config path:**
```bash
lstk config path
```

**Manual override:**
```bash
lstk --config /path/to/config.toml start
```


### Global Options
The following global options are available for the `lstk` CLI:

| Option | Description |
| :--- | :--- |
| --config string | Path to a specific TOML config file |
| --non-interactive | Disable the interactive TUI and use plain text output |
| -v, --version | Show the version and exit |
| -h, --help | Show help message and exit |

### Commands
The new CLI uses a flat command structure. Advanced subcommands aren't available in this initial release.

#### lstk
Start LocalStack interactively.

Running `lstk` automatically handles authentication, updating, and starting LocalStack automatically.


#### start
Start the LocalStack emulator. If run interactively, it launches the Terminal UI.
 
```bash
Usage: lstk start [OPTIONS]

# Start in non-interactive mode (CI/CD)
lstk start --non-interactive
```

#### stop
Stop the running LocalStack emulator.
 
```bash
Usage: lstk stop
```

#### status
Show emulator status and a summary of deployed resources.
 
```bash
Usage: lstk status
```

#### logs
Show or stream emulator logs.
 
```bash
Usage: lstk logs [OPTIONS]

Options:
  --follow     Stream logs in real-time
  --verbose    Show all logs without filtering
```

#### login / logout
Manage your LocalStack authentication. `login` will open a browser window to authenticate.
 
```bash
Usage: lstk login
Usage: lstk logout
```

#### config
Manage the CLI configuration. Use `path` to find your active configuration file.
 
```bash
Usage: lstk config COMMAND

Commands:
  path    Show the path to the current config.toml
```

#### update
Check for or install the latest version of the `lstk` binary.
 
```bash
Usage: lstk update [OPTIONS]

Options:
  --check    Check for updates without installing
```
