---
title: Connecting Snowpark to Lambda using LocalStack
description: In this tutorial, you will explore how you can use Snowpark to connect to a locally running AWS Lambda using LocalStack.
template: doc
nav: 
label: 
---

## Introduction

In this tutorial, you will explore how to connect Snowpark to AWS Lambda locally using LocalStack. Snowpark allows you to query, process, and transform data in a variety of ways using Snowpark Python. In this example, we create a Lambda function that uses Snowpark to:

- Establish a connection to a local Snowflake database provided by LocalStack.
- Create a cursor object and execute a simple query to create a table.
- Insert rows and execute an insert query with executemany and a query to select data from the table.
- Fetch the results and execute a query to get the current timestamp.

The code in this tutorial is available on [GitHub](https://github.com/localstack-samples/localstack-snowflake-samples/tree/main/lambda-snowpark-connector).

## Prerequisites

- [`localstack` CLI](https://docs.localstack.cloud/getting-started/installation/#localstack-cli) with a [`LOCALSTACK_AUTH_TOKEN`](https://docs.localstack.cloud/getting-started/auth-token/)
- [LocalStack for Snowflake]({{< ref "installation" >}})
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) & [`awslocal` wrapper](https://docs.localstack.cloud/user-guide/integrations/aws-cli/#localstack-aws-cli-awslocal)
- Python 3.10 installed locally

## Create the Lambda function

Create a new directory for your lambda function and navigate to it:

{{< command >}}
$ mkdir -p lambda-snowpark
$ cd lambda-snowpark
{{< / command >}}

Create a new file named `handler.py` and add the following code:

```python
import snowflake.connector as sf

def lambda_handler(event, context):
    snowflake_params = {
        'user': 'test',
        'password': 'test',
        'account': 'test',
        'warehouse': 'test',
        'database': 'test',
        'schema': 'TEST_SCHEMA',
        'host': 'snowflake.localhost.localstack.cloud'
    }

    # Establish a connection
    connection = sf.connect(**snowflake_params)

    try:
        # Create a cursor object
        cursor = connection.cursor()

        # Execute the query to create a table
        cursor.execute("create or replace table ability(name string, skill string )")

        # Rows to insert
        rows_to_insert = [('John', 'SQL'), ('Alex', 'Java'), ('Pete', 'Snowflake')]

        # Execute the insert query with executemany
        cursor.executemany("insert into ability (name, skill) values (%s, %s)", rows_to_insert)

        # Execute a query to select data from the table
        cursor.execute("select name, skill from ability")

        # Fetch the results
        result = cursor.fetchall()
        print("Total # of rows:", len(result))
        print("Row-1 =>", result[0])
        print("Row-2 =>", result[1])

        # Execute a query to get the current timestamp
        cursor.execute("SELECT CURRENT_TIMESTAMP()")
        current_timestamp = cursor.fetchone()[0]
        print("Current timestamp from Snowflake:", current_timestamp)

    finally:
        # Close the cursor
        cursor.close()

        # Close the connection
        connection.close()

    return {
        'statusCode': 200,
        'body': "Successfully connected to Snowflake and inserted rows!"
    }
```

In the above code:

- You import the `snowflake.connector` module to establish a connection to the Snowflake database.
- You define the `lambda_handler` function, which is the entry point for the Lambda function.
- You define the `snowflake_params` dictionary with `snowflake.localhost.localstack.cloud` as the host to connect to the Snowflake emulator.
- You establish a connection to the Snowflake database using the `sf.connect` method.
- You create a cursor object and execute a query to create a table.
- You insert rows and execute an insert query with `executemany` and a query to select data from the table.
- You fetch the results and execute a query to get the current timestamp.
- You close the cursor and the connection.

## Install the dependencies

You can now install the dependencies for your Lambda function. These include:

- `snowflake-connector-python` to connect to the Snowflake database.
- `boto3` and `botocore` to interact with AWS services.

Run the following command:

{{< command >}}
$ pip3 install \
		--platform manylinux2010_x86_64 \
		--implementation cp \
		--only-binary=:all: --upgrade \
		--target ./libs \
 		snowflake-connector-python==2.7.9 boto3==1.26.153 botocore==1.29.153
{{< / command >}}

## Package the Lambda function

Package the Lambda function and its dependencies into a ZIP file. Run the following command:

{{< command >}}
$ mkdir -p build
$ cp -r libs/* build/
$ (cd build && zip -q -r function-py.zip .)
{{< / command >}}

You have now created a ZIP file named `function-py.zip` that contains the Lambda function and its dependencies.

## Start the LocalStack container

Start your LocalStack container in your preferred terminal/shell.

{{< command >}}
$ export LOCALSTACK_AUTH_TOKEN=<your_auth_token>
$ DEBUG=1 \
  LAMBDA_RUNTIME_ENVIRONMENT_TIMEOUT=180 \
  IMAGE_NAME=localstack/snowflake \
  localstack start
{{< / command >}}

> The `DEBUG=1` environment variable is set to enable debug logs. It would allow you to see the SQL queries executed by the Lambda function. The `LAMBDA_RUNTIME_ENVIRONMENT_TIMEOUT` environment variable is set to increase the Lambda function's timeout to 180 seconds.

## Deploy the Lambda function

You can now deploy the Lambda function to LocalStack using the `awslocal` CLI. Run the following command:

{{< command >}}
$ awslocal lambda create-function \
    --function-name localstack-snowflake-lambda-example \
	--runtime python3.10 \
	--timeout 180 \
	--zip-file fileb://build/function-py.zip \
	--handler handler.lambda_handler \
	--role arn:aws:iam::000000000000:role/lambda-role
{{< / command >}}

After successfully deploying the Lambda function, you will receive a response with the details of the function. You can now invoke the function using the `awslocal` CLI:

{{< command >}}
$ awslocal lambda invoke --function-name localstack-snowflake-lambda-example \
	--payload '{"body": "test" }' output.txt
{{< / command >}}

You will receive a response with the details of the invocation. You can view the output in the `output.txt` file. To see the SQL queries executed by the Lambda function, check the logs by navigating to LocalStack logs (`localstack logs`).

```bash
2024-02-07T17:33:36.763 DEBUG --- [   asgi_gw_3] l.s.l.i.version_manager    : [localstack-snowflake-lambda-example-b0813b21-ad5f-4ec7-8fb4-53147df9695e] Total # of rows: 3
2024-02-07T17:33:36.763 DEBUG --- [   asgi_gw_3] l.s.l.i.version_manager    : [localstack-snowflake-lambda-example-b0813b21-ad5f-4ec7-8fb4-53147df9695e] Row-1 => ('John', 'SQL')
2024-02-07T17:33:36.763 DEBUG --- [   asgi_gw_3] l.s.l.i.version_manager    : [localstack-snowflake-lambda-example-b0813b21-ad5f-4ec7-8fb4-53147df9695e] Row-2 => ('Alex', 'Java')
2024-02-07T17:33:36.771 DEBUG --- [   asgi_gw_3] l.s.l.i.version_manager    : [localstack-snowflake-lambda-example-b0813b21-ad5f-4ec7-8fb4-53147df9695e] Current timestamp from Snowflake: 2024-02-07T17:33:36
```

## Conclusion

LocalStack's core cloud emulator supports a wide range of AWS services, including Lambda, and provides a local environment for developing and testing your serverless applications. You can now use LocalStack's Snowpark emulator to connect to locally running AWS services, and develop/test your Snowpark & AWS applications locally.
