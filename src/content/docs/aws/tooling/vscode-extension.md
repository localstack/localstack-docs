---
title: LocalStack Toolkit for VS Code
description: Install, configure, and run LocalStack without leaving VS Code.
template: doc
tags: ["Free"]
---

## Introduction 

The [LocalStack Toolkit for VS Code](https://github.com/localstack/localstack-toolkit-vscode) enables you to install, configure, and run LocalStack without leaving VS Code.

## Prerequisites

- [VS Code](https://code.visualstudio.com/)


## Install and configure LocalStack

The setup wizard ensures LocalStack is installed and configured for a seamless integration with AWS tools, like the AWS CLI, SDKs, AWS SAM or the AWS CDK.

LocalStack can be installed either locally for the current user or globally for all users.

You can [start using LocalStack for free by signing up for a free account](https://app.localstack.cloud/sign-up?plan=free) or signing into an existing one. The setup wizard facilitates this process and configures your authentication token required to start LocalStack.

The LocalStack Toolkit integrates seamlessly with AWS tools like the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html). It automatically configures a dedicated `localstack` AWS profile in your `.aws/config` and `.aws/credentials` files, if one is not already present.

![Installing LocalStack Toolkit](/images/aws/localstack-toolkit/starting-localstack.png)


## Run LocalStack

The LocalStack button in the VS Code status bar provides an instant view of LocalStack's runtime status, such as `stopped` or `running`.

![LocalStack Toolkit Running](/images/aws/localstack-toolkit/running.png)

The status bar button provides access to `Start` and `Stop` LocalStack commands. The status button turns red if LocalStack is not found or misconfigured. You can also open the LocalStack log view from here.

![Stop LocalStack Toolkit](/images/aws/localstack-toolkit/stop-localstack.png)

## Viewing LocalStack logs

You can see LocalStack logs in the VS Code Output panel. Simply select LocalStack from the drop-down menu.

![LocalStack Toolkit Logs](/images/aws/localstack-toolkit/logs.png)


## `localstack` AWS profile

Once the profile is configured you can use it from your favorite AWS tools like AWS CLI, SDKs, CDK to deploy to and interact with LocalStack.

For example, to list SQS queues using the AWS CLI and your `localstack` profile:

```bash
aws --profile localstack sqs list-queues
```


## LocalStack Commands Table

| ID                                | Title                                | Menu Contexts    |
|-----------------------------------|--------------------------------------|------------------|
| `localstack.configureAwsProfiles` | Configure AWS Profile "localstack"  | `commandPalette` |
| `localstack.setup`                | Run Setup Wizard                     | `commandPalette` |
| `localstack.start`                | Start LocalStack                     | `commandPalette` |
| `localstack.stop`                 | Stop LocalStack                      | `commandPalette` |
| `localstack.viewLogs`             | View Logs                            | `commandPalette` |


:::note
The AWS Toolkit for VS Code, a separate VS Code extension available from Amazon, now provides the ability to connect with LocalStack. This automates much of the existing manual setup required to debug Lambda functions (https://docs.localstack.cloud/aws/tooling/lambda-tools/remote-debugging/).
:::

## Contributing

[Read our contributing guidelines](./CONTRIBUTING.md) to learn how you can help.


### LocalStack Toolkit for VS Code extension support

Please provide feedback or report an issue on the LocalStack Toolkit for VS Code by using our [GitHub Issues](https://github.com/localstack/localstack-toolkit-vscode/issues) page.

### LocalStack general support

For LocalStack-related questions, feedback, and contributions, you can:

- Check our main repository: visit our [get in touch section on LocalStack's GitHub](https://github.com/localstack/localstack?tab=readme-ov-file#get-in-touch) for contact information and support channels.

- Join our Slack Community: Connect with other developers on the official [LocalStack Slack community](https://localstack.cloud/slack).