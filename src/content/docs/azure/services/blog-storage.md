---
title: "Blob storage"
description: Get started with Blob storage on LocalStack
template: doc
---

## Introduction

Azure Blob storage is a service for storing large amounts of unstructured data, such as text or binary data.
Blob storage is used to serve images or documents directly to a browser, storing files for distributed access, streaming video and audio, and writing to log files.

LocalStack for Azure allows you to use Blob storage APIs in your local environment to upload and download blobs, and manage containers.

## Getting started

This guide is designed for users who are new to Blob storage and assumes that [`azlocal` is installed](/azure/getting-started/).
We will demonstrate how to create a resource group, storage account, container, upload and download blobs, and view blob details.

### Create a resource group

You can create a resource group using the following command:

```
$ az group create \
    --name MyResourceGroup \
    --location westeurope
```

The following output would be displayed:

```bash
{
  "id": "/subscriptions/some-generated-id/resourceGroups/MyResourceGroup",
  "location": "westeurope",
  "managedBy": null,
  "name": "MyResourceGroup",
  "properties": {
    "provisioningState": "Succeeded"
  },
  "tags": null,
  "type": "Microsoft.Resources/resourceGroups"
}
```

### Create a storage account

You can create a storage account using the following command:

```
$ az storage account create \
    --name testaccount \
    --resource-group MyResourceGroup \
    --location westeurope \
    --sku Standard_LRS
```

The following output would be displayed:

```bash
{
  ...
  "id": "/subscriptions/some-generated-id/resourceGroups/MyResourceGroup/providers/Microsoft.Storage/storageAccounts/testaccount",
  ...
  "primaryEndpoints": {
    "blob": "https://testaccountblob.localhost.localstack.cloud:4566",
    "dfs": "https://testaccount.dfs.core.windows.net/",
    "file": "https://testaccount.file.core.windows.net/",
    "internetEndpoints": null,
    "microsoftEndpoints": null,
    "queue": "https://testaccountqueue.localhost.localstack.cloud:4566",
    "table": "https://testaccounttable.localhost.localstack.cloud:4566",
    "web": "https://testaccount.z28.web.core.windows.net/"
  },
  ...
  "sku": {
    "name": "Standard_LRS",
    "tier": "Standard"
  },
  ...
  "type": "Microsoft.Storage/storageAccounts"
}
```

### Create a container

You can create a container using the following command:

```
$ azlocal storage container create \
    --name testcontainer \
    --account-name testaccount \
    --auth-mode login
```

Note the use of `azlocal` here!

There are certain commands, like `az storage container`, that do not properly work with the Emulator. They do work if you use the `azlocal` tool instead.

The following output would be displayed:

```bash
{
  "created": true
}
```

You can list the containers using the following command:

```
$ azlocal storage container list \
    --account-name testaccount \
    --auth-mode login
```

The following output would be displayed:

```bash
[
  {
    "deleted": null,
    ...
    "immutableStorageWithVersioningEnabled": false,
    "metadata": null,
    "name": "testcontainer",
    "properties": {
      "etag": null,
      "hasImmutabilityPolicy": false,
      ...
      "publicAccess": null
    },
    "version": null
  }
]
```

### Upload and download blobs

You can upload a blob using the following command:

```
$ azlocal storage blob upload \
    --container-name testcontainer \
    --account-name testaccount \
    --data "Your raw data here" \
    --name testblog \
    --auth-mode login
```

The following output would be displayed:

```bash
Alive[################################################Finished[#############################################################]  100.0000%
{
  "client_request_id": null,
  ...
  "encryption_key_sha256": null,
  "encryption_scope": null,
  ...
  "version": null,
  "version_id": null
}
```

You can download a blob using the following command:

```
$ azlocal storage blob download \
    --container-name testcontainer \
    --account-name testaccount \
    --file check.txt \
    --name testblog \
    --auth-mode login
```

You can inspect the downloaded file `check.txt` to verify the contents.

### View blob details

You can view blob details using the following command:

```
$ azlocal storage blob show \
    --account-name testaccount \
    --container testcontainer \
    --auth-mode login \
    --name testblog
```

The following output would be displayed:

```bash
Alive[################################################Finished[#############################################################]  100.0000%
{
  "container": "testcontainer",
  ...
  "name": "testblog",
  "objectReplicationDestinationPolicy": null,
  "objectReplicationSourceProperties": [],
  ...
  "rehydratePriority": null,
  "requestServerEncrypted": null,
  "snapshot": null,
  ...
  "versionId": null
}
```