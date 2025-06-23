---
title: Accessing a resource created by LocalStack
description: This guide will explore different scenarios and provide detailed instructions on accessing resources created by LocalStack under different scenarios.
template: doc
sidebar:
    order: 6
---

If you have created a resource using LocalStack, such as an OpenSearch cluster or RDS database, you may need to access it from your application.
Typically, these resources are accessible through a URL or a hostname provided by LocalStack.
By default, LocalStack returns the hostname `localhost.localstack.cloud`, which resolves to LocalStack using DNS.
For special environments (e.g., proxies), the [configuration](/aws/capabilities/config/configuration) `LOCALSTACK_HOST` customizes the URLs returned by LocalStack.
This guide will explore different scenarios and provide detailed instructions on accessing resources created by LocalStack under different scenarios.

## From your host

![Accessing a resource created by LocalStack](/images/aws/3.svg)

For example, suppose you have created an OpenSearch cluster using LocalStack and want to access it from the same computer.
In such a case, you can set the `LOCALSTACK_HOST` environment variable to specify the desired hostname and port that will be returned.
Check out the [service-specific documentation](/aws/services) for more details.

## From a container LocalStack created

![Accessing a resource created by LocalStack from a container created by LocalStack](/images/aws/6.svg)

Check out our documentation while [using the endpoint URL](/aws/capabilities/networking/accessing-endpoint-url).

<details>
<summary>For LocalStack versions before 2.3.0</summary>
The Lambda service in LocalStack also supports the <code>HOSTNAME_FROM_LAMBDA</code> environment variable, which can be handy if LocalStack is reachable through a specific hostname.
Suppose you're running LocalStack in a <a href="https://docs.docker.com/network/bridge/">user-defined network</a> using Docker, where the LocalStack container can be accessed from other containers in the network using its service name.
In that case, you can set the <code>HOSTNAME_FROM_LAMBDA</code> environment variable to this value to help resolve any issues with lambda functions accessing resources created by LocalStack.
</details>

## From your container

![Accessing a resource created by LocalStack from a Docker container](/images/aws/9.svg)

Check out our documentation [on using the endpoint URL](/aws/capabilities/networking/accessing-endpoint-url#from-your-container).

## From a separate host

![Accessing a resource created by LocalStack from a separate host](/images/aws/12.svg)

LocalStack must listen to the address of the host, or `0.0.0.0`.

Check out our [FAQ article on accessing LocalStack from another computer](/aws/getting-started/faq#how-can-i-access-localstack-from-an-alternative-computer).
