---
title: Testing Utils
description: Tools to simplify application testing on LocalStack.
template: doc
tags: ["Free"]
nav: 
---

## Introduction

LocalStack provides a set of tools to simplify application testing on LocalStack.
These tools are available for Python and JVM (Java and Kotlin) and can be used to integrate with various unit testing frameworks and simplify the setup of AWS clients with LocalStack.

## Python

This Python Testing Utils streamlines the integration of Localstack with your unit tests.

### Installation

```bash
pip install localstack-utils
```

### Usage

```python showLineNumbers
import time
import boto3
import unittest
from localstack_utils.localstack import startup_localstack, stop_localstack

class TestKinesis(unittest.TestCase):
    def setUp(self):
        startup_localstack()

    def tearDown(self):
        stop_localstack()
        return super().tearDown()

    def test_create_stream(self):
        kinesis = boto3.client(
            service_name="kinesis",
            aws_access_key_id="test",
            aws_secret_access_key="test",
            endpoint_url="http://localhost:4566",
        )

        kinesis.create_stream(StreamName="test", ShardCount=1)
        time.sleep(1)

        response = kinesis.list_streams()
        self.assertGreater(len(response.get("StreamNames", [])), 0)
```