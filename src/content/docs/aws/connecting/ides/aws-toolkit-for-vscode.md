---
title: AWS Toolkit for VS Code
description: Use the AWS Toolkit for VS Code to browse and operate on AWS resources running on LocalStack.
template: doc
sidebar:
    order: 2
---

## Introduction

The [AWS Toolkit for VS Code](https://docs.aws.amazon.com/toolkit-for-vscode/) is an Amazon-maintained extension for Visual Studio Code that lets you interact with AWS resources directly from the editor.

When configured with a `localstack` profile, the AWS Toolkit operates against your local LocalStack instance instead of a real AWS account, giving you the same AWS-style resource browser experience you already use against AWS.

## AWS Explorer

Once installed, the AWS Toolkit adds an **AWS Explorer** view to the VS Code activity bar. Selecting the `localstack` profile points the Explorer at your local LocalStack instance, where you can browse the resources you have provisioned.

![AWS Explorer view in the AWS Toolkit for VS Code](/images/aws/lambda-remote-debugging/explorer.png)

For installation, profile setup, and the full set of features the AWS Toolkit provides, see the [AWS Toolkit for VS Code User Guide](https://docs.aws.amazon.com/toolkit-for-vscode/).