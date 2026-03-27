---
title: Report an Issue
description: Submit a support request with the right information to help resolve your issue faster.
template: doc
sidebar:
    order: 4
---

If you’re experiencing an issue with LocalStack for Snowflake, providing clear and complete information helps our team identify and resolve the problem more quickly.

This guide explains what to check before reporting an issue and what details to include in your request.


## Before reporting an issue

Before reaching out, we recommend:

- Reviewing the documentation and FAQs  
- Verifying your configuration settings  
- Ensuring your setup meets system requirements  
- Checking logs for errors or warnings  

Many common issues can be resolved quickly by validating your setup and reviewing existing resources.


## What to include

To help us troubleshoot your issue efficiently, please include the following information:

- **Logs**  
  Snowflake emulator container logs with the environment variables `SF_LOG=trace` and `DEBUG=1` enabled  

- **Query (if applicable)**  
  The query that triggered the issue  

- **Client details**  
  Client tool or driver used  

- **Connection parameters**  
  Excluding sensitive information  

- **Additional logs (if available)**  
  Client tool or driver logs  

Providing detailed information upfront helps reduce back-and-forth and speeds up resolution time.


## How to submit an issue

You can report an issue using one of the following methods:

### Web application

1. Open the [LocalStack Web Application](https://app.localstack.cloud/)  
2. Click the chat icon in the bottom right corner  
3. Select **Technical Question**  
4. Enter the required details and submit  


### Support email

Send your request to [support@localstack.cloud](mailto:support@localstack.cloud).


### GitHub Issues

For bugs and feature requests, you can also use GitHub:

- [Report a bug](https://github.com/localstack/localstack/issues/new?template=bug-report.yml)  
- [Request a feature](https://github.com/localstack/localstack/issues/new?template=feature-request.yml)  

Make sure to follow the issue templates and include as much detail as possible.


## What happens next

After submitting your request:

- Our support team will review your issue  
- You may be contacted for additional details  
- Issues are prioritized based on urgency and impact  

Response times depend on your support plan.  
For details, see [Support Plans](../support-plans/).
