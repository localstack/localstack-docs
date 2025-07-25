---
title: AWS Python Boto3
description: How to use the Python Boto3 AWS SDK with LocalStack.
template: doc
sidebar:
    order: 7
---

[Boto3](https://github.com/boto/boto3) is the Amazon Web Services (AWS) Software Development Kit (SDK) for Python, which allows Python developers to write software that makes use of AWS services.

You can easily create a `boto3` client that interacts with your LocalStack instance.
The example below creates a `boto3` client that lists all available Lambda functions:

```python showshowLineNumbers
import boto3

endpoint_url = "http://localhost.localstack.cloud:4566"
# alternatively, to use HTTPS endpoint on port 443:
# endpoint_url = "https://localhost.localstack.cloud"

def main():
    client = boto3.client("lambda", endpoint_url=endpoint_url)
    result = client.list_functions()
    print(result)

if __name__ == "__main__":
    main()
```

:::note

If you're connecting from within a Python **Lambda function** handler in LocalStack, you can create a default client without configuring the `endpoint_url` - LocalStack will automatically forward the invocations to the local API endpoints (available in Pro, see [here](/aws/capabilities/networking/transparent-endpoint-injection) for more details).
:::

```python
client = boto3.client("lambda")
...
```

Alternatively, if you prefer to (or need to) set the endpoints directly, you can use the environment variable `AWS_ENDPOINT_URL`,  which is available when executing user code (e.g., Lambda functions) in LocalStack:

```python
import os
client = boto3.client("lambda", endpoint_url=os.getenv("AWS_ENDPOINT_URL"))
...
```

### Further Material

* [localstack-python-client](https://github.com/localstack/localstack-python-client): small Python library with additional utils for interacting with LocalStack