---
title: Get Help
description: Choose the right support channel for your LocalStack issue or question.
template: doc
sidebar:
    order: 1
---

If you need help with LocalStack for AWS, choosing the right support channel can help you get a faster and more effective response.

This guide explains when to use each available support option.


## Choose the right support channel

### Community Slack

Use the [LocalStack Slack Community](https://localstack.cloud/slack) for:

- Quick questions  
- General guidance  
- Discussions with other users and maintainers  

Best for:
- Early-stage troubleshooting  
- Learning from others’ experiences  

:::note
Community support is provided on a best-effort basis and is not guaranteed.
:::

### Support email

Contact LocalStack Support via email at [support@localstack.cloud](mailto:support@localstack.cloud).


### Web application chat

To create a support request using the [LocalStack Web Application](https://app.localstack.cloud/) chat:

1. Open the LocalStack Web Application  
2. Click the chat icon in the bottom right corner  
3. Select **Technical Issue** to request technical support or **Account/Billing Issue** to request account related support. 
4. Enter your details and submit. 


### Enterprise support channels

Enterprise customers have access to additional support options, including:

- Dedicated Slack or Teams channel  
- Support ticketing portal  
- Real-time chat support  

For more details, see [Enterprise Support](/aws/help-support/enterprise-support/).


## What to include

To help us troubleshoot your issue efficiently, please include the following information:

- **Logs**  
   aws emulator container logs with the environment variables `SF_LOG=trace` and `DEBUG=1` enabled  

- **Query (if applicable)**  
  The query that triggered the issue  

- **Client details**  
  Client tool or driver used  

- **Connection parameters**  
  Excluding sensitive information  

- **Additional logs (if available)**  
  Client tool or driver logs  

Providing detailed information upfront helps reduce back-and-forth and speeds up resolution time.


:::note
In many scenarios, we ask our customers to use the diagnostics endpoint to provide additional information.

To use LocalStack’s diagnostics endpoint:
- Set the environment variable `LS_LOG=trace`
- Start LocalStack
- Run the affected task(s)
- Call the diagnostic endpoint `curl -s localhost.localstack.cloud:4566/_localstack/diagnose > diagnose.json && zip diagnose.zip diagnose.json && rm diagnose.json` (Endpoint URL depends on your configuration)
- Once you have the `diagnose.zip` file, please send it to our support team via our email at [support@localstack.cloud](mailto:support@localstack.cloud), or via your existing support ticket.
:::


:::danger
Ensure that you avoid sending the diagnostic output to public channels or forums, as it may contain sensitive information.
:::


## Before you reach out

Before contacting support, we recommend:

- Reviewing the documentation and FAQs  
- Verifying your configuration settings  
- Checking logs for errors or warnings  
- Ensuring your setup meets system requirements  

Providing clear and complete information helps us respond more quickly and effectively.
