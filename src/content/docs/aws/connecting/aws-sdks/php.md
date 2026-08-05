---
title: AWS SDK for PHP
description: How to use the PHP AWS SDK with LocalStack.
template: doc
sidebar:
    order: 6
---

## Overview

The [AWS SDK for PHP](https://aws.amazon.com/sdk-for-php/), like other AWS SDKs, lets you set the endpoint when creating resource clients,
which is the preferred way of integrating the PHP SDK with LocalStack.

## Example

Here is an example of how to create an `S3Client` with the endpoint set to LocalStack.

```php showshowLineNumbers
use Aws\S3\S3Client;
use Aws\Exception\AwsException;

// Configuring S3 Client with virtual-hosted-style addressing (recommended)
$s3 = new Aws\S3\S3Client([
    'version' => '2006-03-01',
    'region' => 'us-east-1',
    'endpoint' => 'http://s3.localhost.localstack.cloud:4566',
]);
```

This configuration uses virtual-hosted-style addressing, which AWS recommends and some regions require.

If you need to use path-style addressing (for non-DNS-compliant bucket names or other specific requirements), enable it explicitly:

```php showshowLineNumbers
// Only use path-style if you have a specific requirement for it
$s3 = new Aws\S3\S3Client([
    'version' => '2006-03-01',
    'region' => 'us-east-1',
    'use_path_style_endpoint' => true,
    'endpoint' => 'http://localhost:4566',  // Use non-S3-prefixed endpoint with path-style
]);
```

A full example can be found [in our samples repository](https://github.com/localstack/localstack-aws-sdk-examples/tree/main/php).

## Resources

* [localstack-aws-sdk-examples for PHP](https://github.com/localstack/localstack-aws-sdk-examples/tree/main/php)
* [AWS SDK for PHP](https://aws.amazon.com/sdk-for-php/)
* [Official repository of the AWS SDK for PHP](https://github.com/aws/aws-sdk-php)