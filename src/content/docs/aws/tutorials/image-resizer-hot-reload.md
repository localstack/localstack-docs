---
title: S3 Image Resizer with Lambda (Hot Reload)
description: Learn how to build and test a serverless image resizing pipeline locally using LocalStack Pro with Lambda hot reload support.
services:
- sqs
- lmb
- s3
platform:
- nodejs
pro: true
deployment:
- docker-compose
leadimage: "image-resizer-hot-reload.png"
---

# S3 Image Resizer with Lambda (Hot Reload)

## Introduction

In this tutorial, you’ll learn how to build and run a **serverless image resizing pipeline** locally using **LocalStack Pro**.  
The workflow is simple:

1. Upload an image to an **S3 source bucket**.
2. An **AWS Lambda** function automatically resizes the image.
3. The resized image is written back to an **S3 target bucket**.
4. Using **hot reload**, you can modify Lambda code locally and instantly test changes without redeployment.

This pattern is ideal for developing and testing serverless media-processing workflows like thumbnails, avatars, and dynamic image scaling.


## Prerequisites

Make sure you have the following installed and configured:

- **LocalStack Pro** (hot reload support requires Pro)
- **Docker** (to run LocalStack services)
- **Node.js** *or* **Python** (depending on the Lambda runtime used)
- **AWS CLI** or **awslocal**
- **Make** (optional, for running build scripts)
- Basic understanding of AWS Lambda and S3 event triggers

## Why / Use Case
Image resizing is a fundamental part of many web applications — whether you’re:
- A **CMS platform** generating thumbnails for uploaded images
- An **e-commerce store** optimizing product visuals
- A **developer** testing media pipelines before production

Running this workflow locally with LocalStack lets you:
- Develop and debug Lambdas faster (no redeploys)
- Avoid AWS costs during experimentation
- Simulate a realistic event-driven workflow
## Architecture Diagram

```text
          ┌────────────────────┐
          │    Source S3       │
          │ (e.g. input-bucket)│
          └───────┬────────────┘
                  │
           (S3 Event Trigger)
                  │
                  ▼
          ┌────────────────────┐
          │     Lambda         │
          │ (Image Resizer)    │
          └───────┬────────────┘
                  │
                  ▼
          ┌─────────────────────┐
          │  Target S3 Bucket   │
          │ (e.g. output-bucket)│
          └─────────────────────┘
```
## Steps
### 1. Clone the Repository
```
git clone https://github.com/localstack-samples/sample-lambda-s3-image-resizer-hot-reload.git
cd sample-lambda-s3-image-resizer-hot-reload
```
### 2. Install Dependencies

If using Python:
```
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
```

If using Node.js Lambdas:
```
npm install
```
### 3. Start LocalStack

Make sure your LocalStack Pro token is set:
```
localstack auth set-token <your-auth-token>
localstack start
```
### 4. Build and Deploy the Lambda
```
Run the provided scripts to build and deploy:

deployment/build-lambdas.sh
deployment/awslocal/deploy.sh
```

This sets up S3 buckets, event triggers, and deploys the Lambda function locally.

### 5. Upload a Sample Image

Once deployment completes, upload a sample image to the input bucket:
```
awslocal s3 cp ./samples/test-image.jpg s3://input-bucket/
```

The Lambda will trigger automatically and write the resized image to s3://output-bucket/.

## Testing the Application
### Step 1: Verify the Resized Image

* List files in the output bucket:
```
awslocal s3 ls s3://output-bucket/

```
* Download and inspect the resized image:
```
awslocal s3 cp s3://output-bucket/test-image.jpg ./output/
```

* Confirm the dimensions (e.g., via any image viewer or identify command from ImageMagick):
```
identify ./output/test-image.jpg
```
### Step 2: Test Hot Reload

* Modify your Lambda code locally (for example, change the resize dimensions or add a watermark).

* Hot reload automatically detects changes—no redeploy needed.

* Upload another image (or the same one under a new name):
```
awslocal s3 cp ./samples/test-image2.jpg s3://input-bucket/
```

Verify that the new logic is applied (e.g., updated size or watermark visible).

## Conclusion

You’ve built and tested a complete serverless image pipeline on LocalStack, featuring:

S3 → Lambda → S3 event-driven workflow

Hot reload for rapid local iteration

End-to-end testing of serverless image processing

This pattern can easily extend to real-world use cases—such as photo galleries, CMS platforms, or social apps—where dynamic image transformation is essential.
