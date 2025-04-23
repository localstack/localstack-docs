---
title: Airflow
description: Use Airflow to run local ETL jobs against the Snowflake emulator
---

{{< preview-notice >}}

## Introduction
 
Apache [Airflow](https://airflow.apache.org) is a platform for running data-centric workflows and scheduled compute jobs.
LocalStack supports the [AWS Managed Workflows for Apache Airflow](https://docs.localstack.cloud/user-guide/aws/mwaa/) (MWAA) service to run Airflow jobs locally.

You can use Airflow to interact with the LocalStack Snowflake emulator and run ETL (Extract-Transform-Load) jobs, using the Airflow `SnowflakeOperator` for running queries against Snowflake.
On this page we outline how to set up the connection between local Airflow and the Snowflake emulator.

## Create an Airflow environment via MWAA in LocalStack

In order to create an Airflow environment in local MWAA, we can use the [`awslocal`](https://github.com/localstack/awscli-local) command:

{{< command>}}
$ awslocal s3 mb s3://my-mwaa-bucket
$ awslocal mwaa create-environment --dag-s3-path /dags \
        --execution-role-arn arn:aws:iam::000000000000:role/airflow-role \
        --network-configuration {} \
        --source-bucket-arn arn:aws:s3:::my-mwaa-bucket \
        --airflow-version 2.6.3 \
        --name my-mwaa-env
{{< /command >}}

## Create an Airflow DAG script that connects to LocalStack Snowflake

We can then create a local file `my_dag.py` with the Airflow DAG definition, for example:
```python
import datetime
import json

from airflow import settings
from airflow.models import Connection, DAG
from airflow.providers.snowflake.operators.snowflake import SnowflakeOperator

# prepare session and connection info

session = settings.Session()
conn_id = "c1"
try:
    # try to look up local Snowflake connection in the session
    session.query(Connection).filter(Connection.conn_id == conn_id).one()
except Exception:
    # create new Snowflake connection, if it doesn't exist yet
    conn = Connection(
        conn_id=conn_id,
        conn_type="snowflake",
        login="test",
        password="test",
        extra=json.dumps({"account": "test", "host": "snowflake.localhost.localstack.cloud", "port": 4566})
    )
    session.add(conn)
    session.commit()

# create DAG

my_dag = DAG(
    "sf_dag1",
    start_date=datetime.datetime.utcnow(),
    default_args={"snowflake_conn_id": conn_id},
    catchup=False,
)

# add Snowflake operator to DAG

sf_task_1 = SnowflakeOperator(
    task_id="sf_query_1",
    dag=my_dag,
    sql="""
    CREATE TABLE IF NOT EXISTS test(id INT);
    COPY INTO test (id) VALUES (1), (2), (3);
    SELECT * FROM test
    """,
)
```

### Patching the `SnowflakeOperator` in the DAG script

In order to use the `SnowflakeOperator` in your Airflow DAG, a small patch is required in the code.
The code listings below contain the patch for different Airflow versions - simply copy the relevant snippet and paste it into the top of your DAG script (e.g., `my_dag.py`).

**Airflow version 2.6.3 and above**:
```python
# ---
# patch for local Snowflake connection, for Airflow 2.6.3 and above
from airflow.providers.snowflake.hooks.snowflake import SnowflakeHook

def _get_conn_params(self):
    result = self._get_conn_params_orig()
    conn = self.get_connection(self.snowflake_conn_id)
    extra_dict = conn.extra_dejson
    if extra_dict.get("host"):
        result["host"] = extra_dict["host"]
    if extra_dict.get("port"):
        result["port"] = extra_dict["port"]
    return result

SnowflakeHook._get_conn_params_orig = SnowflakeHook._get_conn_params
SnowflakeHook._get_conn_params = _get_conn_params
# ---

# ... rest of your DAG script below ...
```

**Airflow version 2.9.2 and above**:
```python
# ---
# patch for local Snowflake connection, for Airflow 2.9.2 / 2.10.1
from airflow.providers.snowflake.hooks.snowflake import SnowflakeHook

@property
def _get_conn_params(self):
    result = self._get_conn_params_orig
    conn = self.get_connection(self.snowflake_conn_id)
    extra_dict = conn.extra_dejson
    if extra_dict.get("host"):
        result["host"] = extra_dict["host"]
    if extra_dict.get("port"):
        result["port"] = extra_dict["port"]
    return result

SnowflakeHook._get_conn_params_orig = SnowflakeHook._get_conn_params
SnowflakeHook._get_conn_params = _get_conn_params
# ---

# ... rest of your DAG script below ...
```

{{< alert type="info" title="Note" >}}
In a future release, we're looking to integrate these patches directly into the LocalStack environment, such that users do not need to apply these patches in DAG scripts manually.
{{< /alert >}}

## Deploying the DAG to Airflow

Next, we copy the `my_dag.py` file to the `/dags` folder within the `my-mwaa-bucket` S3 bucket, to trigger the deployment of the DAG in Airflow:
{{< command>}}
$ awslocal s3 cp my_dag.py s3://my-mwaa-bucket/dags/
{{< /command >}}

You should then be able to open the Airflow UI (e.g., http://localhost.localstack.cloud:4510/dags) to view the status of the DAG and trigger a DAG run.