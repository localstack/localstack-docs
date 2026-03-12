---
title: Python
description: Get started with Azure libraries (SDK) for Python on LocalStack
template: doc
sidebar:
    order: 3
---

## Introduction

Azure SDK for Python is a set of libraries that allow you to interact with Azure services using Python.
This guide will show you how to use the Azure SDK for Python to interact with LocalStack.

## Getting started

This guide is designed for users who are new to LocalStack for Azure emulator and assumes basic knowledge of the Azure SDK for Python.
We will demonstrate how to create an Azure resource group and update it with tags using Python.

### Install the packages

Run the following command to install the required packages:

```
$ pip install azlocal
$ pip install azure-mgmt-resource azure-identity
```

The `azlocal` package is provided by LocalStack to simplify the process of interacting with the Azure Emulator.

The other two packages are packages provided by Azure to interact with Azure services in Python.

### Create a Python file

You can now use the Azure SDK for Python to interact with LocalStack.
Create a Python file named `provision_rg.py`.
The code will perform the following actions:

* Specifies mock credentials for the Azure SDK.
* Creates a resource group.
* Updates the resource group with tags.

Paste the following code into the file:

```python
from azlocal.python_local_sdk import PythonLocalSdk
from azure.mgmt.resource import ResourceManagementClient
from azure.identity import ClientSecretCredential

def get_credentials():
    return ClientSecretCredential(tenant_id="tenant-id", client_id="client_id", client_secret="client_secret")

def create_or_update_resource_group(resource_client, group_name, location, tags=None):
    # Provision or update the resource group
    rg_result = resource_client.resource_groups.create_or_update(
        group_name, 
        {"location": location, "tags": tags if tags else {}}
    )
    # Logging the action taken
    action = "Updated" if tags else "Provisioned"
    print(f"{action} resource group {rg_result.name} in the {rg_result.location} region with tags {tags}")

# Intercept all Azure requests
python_local_sdk = PythonLocalSdk()
python_local_sdk.start_interception()

# Setup credentials and client
credential = get_credentials()
subscription_id = "sub-id"
resource_client = ResourceManagementClient(credential, subscription_id)

# Create or update resource groups
create_or_update_resource_group(resource_client, "PythonAzureExample-rg", "centralus")
create_or_update_resource_group(resource_client, "PythonAzureExample-rg", "centralus", {"environment": "test", "department": "tech"})

# Stop interception of Azure requests
python_local_sdk.stop_interception()
```

### Run the Python file

You can now run the Python file.

```
python3 provision_rg.py
```

The following output will be displayed:

```bash
Provisioned resource group PythonAzureExample-rg in the centralus region with tags None
Updated resource group PythonAzureExample-rg in the centralus region with tags {'environment': 'test', 'department': 'tech'}
```