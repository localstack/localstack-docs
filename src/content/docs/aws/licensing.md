---
title: "Licensing & Tiers"
description: Service availability and licensing details across LocalStack for AWS tiers.
---

## Introduction

This document outlines the features, emulated AWS services, and enhancements included in each LocalStack for AWS tier.
It also clarifies how licensing works across workspaces and users.

As of **March 23rd, 2026**, LocalStack for AWS offers the following subscriptions that provide licenses for commercial use::

- Base
- Ultimate
- Enterprise 

Customers looking to purchase LocalStack for use primarily in automated environments or through shared infrastructure, such as an internal developer platform are encouraged to reach out to our sales team. For more information, please refer to our fair use policy. 

We provide the following subscription for non-commercial use:
- Hobby

We offer special subscriptions for select segments:
- Student, requires a verified GitHub Education student account
- OSS project sponsorship, requires approval from LocalStack. Applications can be submitted here.

If you purchased a LocalStack license **before May 8, 2025**, [click here to learn about your available features and legacy entitlements](#legacy-plan-usage-allocations).

### Licensing & Access Rules

Each **workspace** can only be assigned a single pricing tier.
You cannot mix and match (e.g., Base and Ultimate) within the same workspace.

Licenses must be assigned to individual users.
This generates an authentication token that enables access to the emulator and any enhancements included in the tier.

Not sure which tier fits your use case?
Explore our [pricing page](https://www.localstack.cloud/pricing).

For unique licensing needs across teams or environments, please contact Sales.

### Usage Allocation Per Workspace

All paid tiers include a fixed allocation of:

- Cloud Sandbox (Ephemeral Instance) minutes (monthly pool)
- State Management (Cloud Pod) storage (per contract, shared across all users)


### Service Coverage Clarification

The table below shows which AWS services are available in each pricing tier.
It does not indicate the level of API coverage or feature availability.

To learn more about how a service behaves in LocalStack, refer to that individual service page or contact Support.

| AWS Services | Hobby | Base | Ultimate | Enterprise | Student |
| --- | --- | --- | --- | --- | --- |
| Analytics |  |  |  |  |  |
| [Amazon ElasticSearch](https://docs.localstack.cloud/user-guide/aws/es/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon Kinesis Streams](https://docs.localstack.cloud/references/coverage/coverage_kinesis/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon Kinesis Data Firehose](https://docs.localstack.cloud/references/coverage/coverage_firehose/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon OpenSearch](https://docs.localstack.cloud/references/coverage/coverage_opensearch/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon Redshift](https://docs.localstack.cloud/references/coverage/coverage_redshift/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon Athena](https://docs.localstack.cloud/references/coverage/coverage_athena/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [Amazon EMR](https://docs.localstack.cloud/references/coverage/coverage_emr/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [Amazon EMR Serverless](https://docs.localstack.cloud/references/coverage/coverage_emr-serverless/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [AWS Glue](https://docs.localstack.cloud/references/coverage/coverage_glue/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [Amazon Redshift Data API](https://docs.localstack.cloud/references/coverage/coverage_redshift-data/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [AWS Lake Formation](https://docs.localstack.cloud/references/coverage/coverage_lakeformation/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [Amazon Managed Streaming for Apache Kafka](https://docs.localstack.cloud/user-guide/aws/msk/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [Amazon Managed Service for Apache Flink](https://docs.localstack.cloud/user-guide/aws/kinesisanalyticsv2/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Application Integration |  |  |  |  |  |
| [Amazon Simple Workflow Service (SWF)](https://docs.localstack.cloud/user-guide/aws/swf/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon Simple Notification Service (SNS)](https://docs.localstack.cloud/user-guide/aws/sns/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon Simple Queue Service (SQS)](https://docs.localstack.cloud/user-guide/aws/sqs/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [AWS Step Functions](https://docs.localstack.cloud/user-guide/aws/stepfunctions/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon EventBridge](https://docs.localstack.cloud/user-guide/aws/events/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon EventBridge Scheduler](https://docs.localstack.cloud/user-guide/aws/scheduler/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon MQ](https://docs.localstack.cloud/user-guide/aws/mq/) | ❌ | ✅ | ✅ | ✅ | ✅ |
| [Amazon EventBridge Pipes](https://docs.localstack.cloud/user-guide/aws/pipes/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [Amazon Managed Workflows for Apache Airflow](https://docs.localstack.cloud/user-guide/aws/mwaa/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| BlockChain |  |  |  |  |  |
| [Amazon Managed Blockchain](https://docs.localstack.cloud/user-guide/aws/managedblockchain/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Business Applications |  |  |  |  |  |
| [Amazon Simple Email Service (SES)](https://docs.localstack.cloud/user-guide/aws/ses/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon Simple Email Service API V2 (SES)](https://docs.localstack.cloud/user-guide/aws/ses/) | ❌ | ✅ | ✅ | ✅ | ✅ |
| [Amazon Pinpoint](https://docs.localstack.cloud/user-guide/aws/pinpoint/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Cloud Financial Management |  |  |  |  |  |
| [AWS Cost Explorer](https://docs.localstack.cloud/user-guide/aws/ce/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Compute |  |  |  |  |  |
| [Amazon Elastic Compute Cloud (EC2)](https://docs.localstack.cloud/user-guide/aws/ec2/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [AWS Lambda](https://docs.localstack.cloud/user-guide/aws/lambda/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [AWS Batch](https://docs.localstack.cloud/user-guide/aws/batch/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [AWS Elastic Beanstalk](https://docs.localstack.cloud/user-guide/aws/elasticbeanstalk/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [AWS Serverless Application Repository](https://docs.localstack.cloud/user-guide/aws/serverlessrepo/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Containers |  |  |  |  |  |
| [Amazon Elastic Container Registry (ECR)](https://docs.localstack.cloud/user-guide/aws/ecr/) | ❌ | ✅ | ✅ | ✅ | ✅ |
| [Amazon Elastic Container Service (ECS)](https://docs.localstack.cloud/user-guide/aws/ecr/) | ❌ | ✅ | ✅ | ✅ | ✅ |
| [Amazon Elastic Kubernetes Service (EKS)](https://docs.localstack.cloud/user-guide/aws/eks/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Customer Enablement |  |  |  |  |
| [AWS Support API](https://docs.localstack.cloud/user-guide/aws/support/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| DataBases |  |  |  |  |  |
| [Amazon DynamoDB](https://docs.localstack.cloud/user-guide/aws/dynamodb/) | ✅ | ✅ | ✅ | ✅ |
| [Amazon DynamoDB Streams](https://docs.localstack.cloud/user-guide/aws/dynamodbstreams/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon ElastiCache](https://docs.localstack.cloud/user-guide/aws/elasticache/) | ❌ | ✅ | ✅ | ✅ | ✅ |
| [Amazon Relational Database Service (RDS)](https://docs.localstack.cloud/user-guide/aws/rds/) | ❌ | ✅ | ✅ | ✅ | ✅ |
| [Amazon RDS Data API](https://docs.localstack.cloud/references/coverage/coverage_rds-data/) | ❌ | ✅ | ✅ | ✅ | ✅ |
| [Amazon DocumentDB](https://docs.localstack.cloud/user-guide/aws/docdb/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [Amazon MemoryDB](https://docs.localstack.cloud/user-guide/aws/memorydb/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [Amazon Neptune](https://docs.localstack.cloud/user-guide/aws/neptune/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [Amazon Timestream](https://docs.localstack.cloud/user-guide/aws/timestream/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Developer Tools |  |  |  |  |  |
| [AWS CodeCommit](https://docs.localstack.cloud/references/coverage/coverage_codecommit/) | ❌ | ✅ | ✅ | ✅ | ✅ |
| AWS CodeArtifact | ❌ | ✅ | ✅ | ✅ | ✅ |
| AWS CodeBuild | ❌ | ✅ | ✅ | ✅ | ✅ |
| AWS CodeConnections | ❌ | ✅ | ✅ | ✅ | ✅ |
| [AWS Fault Injection Service](https://docs.localstack.cloud/user-guide/aws/fis/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| AWS CodeDeploy | ❌ | ❌ | ✅ | ✅ | ✅ |
| AWS CodePipeline | ❌ | ❌ | ✅ | ✅ | ✅ |
| [AWS X-Ray](https://docs.localstack.cloud/user-guide/aws/xray/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Frontend Web & Mobile Services |  |  |  |  |  |
| [AWS Amplify](https://docs.localstack.cloud/user-guide/aws/amplify/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [AWS AppSync](https://docs.localstack.cloud/user-guide/aws/appsync/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| IoT |  |  |  |  |  |
| [AWS IoT](https://docs.localstack.cloud/user-guide/aws/iot/) | ❌ | ✅ | ✅ | ✅ | ✅ |
| [AWS IoT Wireless](https://docs.localstack.cloud/user-guide/aws/iotwireless/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [AWS IoT Data](https://docs.localstack.cloud/user-guide/aws/iotdata/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Management & Governance |  |  |  |  |  |
| [AWS CloudFormation](https://docs.localstack.cloud/user-guide/aws/cloudformation/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon CloudWatch Metrics](https://docs.localstack.cloud/user-guide/aws/cloudwatch/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon CloudWatch Logs](https://docs.localstack.cloud/user-guide/aws/logs/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [AWS Resource Groups](https://docs.localstack.cloud/user-guide/aws/resource_groups/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [AWS Systems Manager Parameter Store](https://docs.localstack.cloud/references/coverage/coverage_ssm/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [AWS Cloud Control](https://docs.localstack.cloud/references/coverage/coverage_cloudcontrol/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [AWS Application Auto Scaling](https://docs.localstack.cloud/references/coverage/coverage_application-autoscaling/) | ❌ | ✅ | ✅ | ✅ | ✅ |
| [Amazon EC2 Auto Scaling](https://docs.localstack.cloud/references/coverage/coverage_autoscaling/) | ❌ | ✅ | ✅ | ✅ | ✅ |
| [AWS Config](https://docs.localstack.cloud/references/coverage/coverage_config/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [AWS AppConfig](https://docs.localstack.cloud/references/coverage/coverage_appconfig/) | ❌ | ✅ | ✅ | ✅ | ✅ |
| [AWS CloudTrail](https://docs.localstack.cloud/references/coverage/coverage_cloudtrail/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [AWS Account Management](https://docs.localstack.cloud/references/coverage/coverage_account/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [AWS Organizations](https://docs.localstack.cloud/references/coverage/coverage_organizations/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Media |  |  |  |  |  |
| [AWS Elemental MediaConvert](https://docs.localstack.cloud/references/coverage/coverage_mediaconvert/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Migration & Transfer |  |  |  |  |  |
| [AWS Transfer Family](https://docs.localstack.cloud/references/coverage/coverage_transfer/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [AWS Database Migration Service](https://docs.localstack.cloud/references/coverage/coverage_dms/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Machine Learning |  |  |  |  |  |
| [Amazon Transcribe](https://docs.localstack.cloud/references/coverage/coverage_transcribe/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon Textract](https://docs.localstack.cloud/references/coverage/coverage_textract/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [Amazon SageMaker AI](https://docs.localstack.cloud/references/coverage/coverage_sagemaker/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [Amazon SageMaker Runtime](https://docs.localstack.cloud/references/coverage/coverage_sagemaker-runtime/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [Amazon Bedrock](https://docs.localstack.cloud/references/coverage/coverage_bedrock/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [Amazon Bedrock Runtime](https://docs.localstack.cloud/references/coverage/coverage_bedrock-runtime/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Networking & Content Delivery |  |  |  |  |  |
| [Amazon Route 53](https://docs.localstack.cloud/references/coverage/coverage_route53/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon Route 53 Resolver](https://docs.localstack.cloud/user-guide/aws/route53resolver/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon API Gateway REST API](https://docs.localstack.cloud/references/coverage/coverage_apigateway/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon API Gateway HTTP and WebSocket API](https://docs.localstack.cloud/references/coverage/coverage_apigatewayv2/) | ❌ | ✅ | ✅ | ✅ | ✅ |
| [Amazon API Gateway Management API](https://docs.localstack.cloud/references/coverage/coverage_apigatewaymanagementapi/) | ❌ | ✅ | ✅ | ✅ | ✅ |
| [Elastic Load Balancing](https://docs.localstack.cloud/references/coverage/coverage_elb/) | ❌ | ✅ | ✅ | ✅ | ✅ |
| [Elastic Load Balancing v2 (Application, Network)](https://docs.localstack.cloud/references/coverage/coverage_elbv2/) | ❌ | ✅ | ✅ | ✅ | ✅ |
| [Amazon CloudFront](https://docs.localstack.cloud/references/coverage/coverage_cloudfront/) | ❌ | ✅ | ✅ | ✅ | ✅ |
| [AWS Cloud Map](https://docs.localstack.cloud/references/coverage/coverage_servicediscovery/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Security, Identity & Compliance |  |  |  |  |  |
| [AWS Key Management Service (KMS)](https://docs.localstack.cloud/references/coverage/coverage_kms/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [AWS Secrets Manager](https://docs.localstack.cloud/references/coverage/coverage_secretsmanager/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [AWS Security Token Service](https://docs.localstack.cloud/references/coverage/coverage_sts/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [AWS Certificate Manager](https://docs.localstack.cloud/references/coverage/coverage_acm/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon Cognito Identity Pools](https://docs.localstack.cloud/references/coverage/coverage_cognito-identity/) | ❌ | ✅ | ✅ | ✅ | ✅ |
| [Amazon Cognito User Pools](https://docs.localstack.cloud/references/coverage/coverage_cognito-idp/) | ❌ | ✅ | ✅ | ✅ | ✅ |
| [Amazon Verified Permissions](https://docs.localstack.cloud/aws/services/verifiedpermissions/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [AWS Private Certificate Authority](https://docs.localstack.cloud/references/coverage/coverage_acm-pca/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [AWS Web Application Firewall (WAF)](https://docs.localstack.cloud/references/coverage/coverage_wafv2/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [AWS Identity and Access Management (IAM)](https://docs.localstack.cloud/references/coverage/coverage_iam/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [AWS IAM Identity Store API](https://docs.localstack.cloud/references/coverage/coverage_identitystore/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [AWS IAM Identity Center](https://docs.localstack.cloud/references/coverage/coverage_sso-admin/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [AWS Resource Access Manager (RAM)](https://docs.localstack.cloud/references/coverage/coverage_ram/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [AWS Shield](https://docs.localstack.cloud/references/coverage/coverage_shield/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Storage |  |  |  |  |  |
| [Amazon S3](https://docs.localstack.cloud/references/coverage/coverage_s3/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon S3 Control](https://docs.localstack.cloud/references/coverage/coverage_s3control/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Amazon S3 Glacier](https://docs.localstack.cloud/references/coverage/coverage_glacier/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [AWS Backup](https://docs.localstack.cloud/user-guide/aws/backup/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| [Amazon EFS](https://docs.localstack.cloud/references/coverage/coverage_efs/) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Emulator Enhancements |  |  |  |  |  |
| Personal Developer Sandbox | 1 | Per License | Per License | Per License | 1 | 1 |
| Testing in CI  | ✅ | ✅ | ✅ | ✅ | ✅ |
Debug and Inspect through App Inspector | ✅|✅|✅|✅|✅|
[Extensions](https://docs.localstack.cloud/aws/tooling/extensions/) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Stack Insights | ❌ | ✅ | ✅ | ✅ | ✅ |
| Local state persistence | ❌ | ✅ | ✅ | ✅ | ✅|
| Cloud-based state persistence via Cloud pods | ❌ | ✅ 300 MB, lifetime per workspace | ✅ 3 GB, lifetime per workspace | ✅ 5 GB per user, lifetime | ✅ 500 MB cloud pod storage (lifetime) |
| [Cloud Sandbox](https://docs.localstack.cloud/user-guide/cloud-sandbox/) previews & ephemeral instances | ❌ | ✅ 100 minutes monthly per workspace | ✅ 500 minutes monthly per workspace | ✅ 3000 minutes monthly per workspace | ❌ |
| AWS Replicator | ❌ | ❌ | ✅ | ✅ | ✅
| IAM Policy Enforcement | ❌ | ✅ | ✅ | ✅ | ✅
| IAM Policy Streams | ❌ | ❌ | ✅ | ✅ | ✅
| Air-gapped Delivery | ❌ | ❌ | ❌ | Optional  | ❌| 
| Custom SSO & SCIM  | ❌ | ❌ | ❌ | ✅ | ❌ |
| [Resiliency Testing](https://docs.localstack.cloud/user-guide/chaos-engineering/) | ❌ | ❌ | ❌| ✅  | ✅ | ✅ |
| [Kubernetes Delivery Operator](https://docs.localstack.cloud/user-guide/localstack-enterprise/k8s-operator/) & [Executor](https://docs.localstack.cloud/user-guide/localstack-enterprise/kubernetes-executor/)) | ❌ | ❌ | ❌ | ✅ | ❌
|  |  |  |  |  |
[Telemetry Sharing](https://docs.localstack.cloud/aws/capabilities/config/usage-tracking/) | enforced | default on | default on | optional | default on |
| [Support](https://docs.localstack.cloud/getting-started/help-and-support/) | Basic | Standard | Priority | Enterprise | Basic |

## Legacy Plans

As of **May 8, 2025**, the following plans are no longer available for new purchases.
If you’re an existing customer on one of these tiers, your subscription remains active and unchanged.
You’ll continue receiving all regular version updates and will not experience any downgrade or loss of access.
If you have questions or concerns, please contact Support.

### Subscription Continuity

You may continue purchasing new licenses under your current legacy plan for the duration of your active subscription.
However, if your subscription lapses, we may not be able to restore access to these legacy plans.

### Legacy Plan Usage Allocations

**Starter:**

- 100 CI credits for the first 3 licenses
- +20 CI credits per additional license
- 240 CI credits maximum

**Teams:**

- 1000 CI credits for the first 3 licenses
- +200 CI credits per additional license
- 2400 CI credits maximum
- Includes workspace-wide Ephemeral Instance minutes and Cloud Pod storage

For any subscription or access-related questions, please reach out to Support.

| AWS Services | Legacy Plan: Starter | Legacy Plan: Teams |
| --- | --- | --- |
| Analytics |  |  | 
| [Amazon ElasticSearch](https://docs.localstack.cloud/user-guide/aws/es/) | ✅ | ✅ | 
| [Amazon Kinesis Streams](https://docs.localstack.cloud/references/coverage/coverage_kinesis/) | ✅ | ✅ | 
| [Amazon Kinesis Data Firehose](https://docs.localstack.cloud/references/coverage/coverage_firehose/) | ✅ | ✅ | 
| [Amazon OpenSearch](https://docs.localstack.cloud/references/coverage/coverage_opensearch/) | ✅ | ✅ | 
| [Amazon Redshift](https://docs.localstack.cloud/references/coverage/coverage_redshift/) | ✅ | ✅ | 
| [Amazon Athena](https://docs.localstack.cloud/references/coverage/coverage_athena/) | ✅ | ✅ | 
| [Amazon EMR](https://docs.localstack.cloud/references/coverage/coverage_emr/) | ✅ | ✅ | 
| [Amazon EMR Serverless](https://docs.localstack.cloud/references/coverage/coverage_emr-serverless/) | ✅ | ✅ | 
| [AWS Glue](https://docs.localstack.cloud/references/coverage/coverage_glue/) | ✅ | ✅ | 
| [Amazon Redshift Data API](https://docs.localstack.cloud/references/coverage/coverage_redshift-data/) | ✅ | ✅ | 
| [AWS Lake Formation](https://docs.localstack.cloud/references/coverage/coverage_lakeformation/) | ✅ | ✅ | 
| [Amazon Managed Streaming for Apache Kafka](https://docs.localstack.cloud/user-guide/aws/msk/) | ✅ | ✅ | 
| [Amazon Managed Service for Apache Flink](https://docs.localstack.cloud/user-guide/aws/kinesisanalyticsv2/) | ✅ | ✅ | 
| Application Integration |  |  | 
| [Amazon Simple Workflow Service (SWF)](https://docs.localstack.cloud/user-guide/aws/swf/) | ✅ | ✅ |
| [Amazon Simple Notification Service (SNS)](https://docs.localstack.cloud/user-guide/aws/sns/) | ✅ | ✅ | 
| [Amazon Simple Queue Service (SQS)](https://docs.localstack.cloud/user-guide/aws/sqs/) | ✅ | ✅ | 
| [AWS Step Functions](https://docs.localstack.cloud/user-guide/aws/stepfunctions/) | ✅ | ✅ | 
| [Amazon EventBridge](https://docs.localstack.cloud/user-guide/aws/events/) | ✅ | ✅ | 
| [Amazon EventBridge Scheduler](https://docs.localstack.cloud/user-guide/aws/scheduler/) | ✅ | ✅ | 
| [Amazon MQ](https://docs.localstack.cloud/user-guide/aws/mq/) | ✅ | ✅ | 
| [Amazon EventBridge Pipes](https://docs.localstack.cloud/user-guide/aws/pipes/) | ✅ | ✅ | 
| [Amazon Managed Workflows for Apache Airflow](https://docs.localstack.cloud/user-guide/aws/mwaa/) | ✅ | ✅ | 
| BlockChain |  |  | 
| [Amazon Managed Blockchain](https://docs.localstack.cloud/user-guide/aws/managedblockchain/) | ✅ | ✅ | 
| Business Applications |  |  | 
| [Amazon Simple Email Service (SES)](https://docs.localstack.cloud/user-guide/aws/ses/) | ✅ | ✅ | 
| [Amazon Simple Email Service API V2 (SES)](https://docs.localstack.cloud/user-guide/aws/ses/) | ✅ | ✅ | 
| [Amazon Pinpoint](https://docs.localstack.cloud/user-guide/aws/pinpoint/) | ✅ | ✅ | 
| Cloud Financial Management |  |  | 
| [AWS Cost Explorer](https://docs.localstack.cloud/user-guide/aws/ce/) | ✅ | ✅ | 
| Compute |  |  | 
| [Amazon Elastic Compute Cloud (EC2)](https://docs.localstack.cloud/user-guide/aws/ec2/) | ✅ | ✅ | 
| [AWS Lambda](https://docs.localstack.cloud/user-guide/aws/lambda/) | ✅ | ✅ |
| [AWS Batch](https://docs.localstack.cloud/user-guide/aws/batch/) | ✅ | ✅ | 
| [AWS Elastic Beanstalk](https://docs.localstack.cloud/user-guide/aws/elasticbeanstalk/) | ✅ | ✅ | 
| [AWS Serverless Application Repository](https://docs.localstack.cloud/user-guide/aws/serverlessrepo/) | ✅ | ✅ | 
| Containers |  |  | 
| [Amazon Elastic Container Registry (ECR)](https://docs.localstack.cloud/user-guide/aws/ecr/) | ✅ | ✅ | 
| [Amazon Elastic Container Service (ECS)](https://docs.localstack.cloud/user-guide/aws/ecr/) | ✅ | ✅ | 
| [Amazon Elastic Kubernetes Service (EKS)](https://docs.localstack.cloud/user-guide/aws/eks/) | ✅ | ✅ | 
| Customer Enablement |  |  | 
| [AWS Support API](https://docs.localstack.cloud/user-guide/aws/support/) | ✅ | ✅ | 
| DataBases |  |  | 
| [Amazon DynamoDB](https://docs.localstack.cloud/user-guide/aws/dynamodb/) | ✅ | ✅ | 
| [Amazon DynamoDB Streams](https://docs.localstack.cloud/user-guide/aws/dynamodbstreams/) | ✅ | ✅ | 
| [Amazon ElastiCache](https://docs.localstack.cloud/user-guide/aws/elasticache/) | ✅ | ✅ | 
| [Amazon Relational Database Service (RDS)](https://docs.localstack.cloud/user-guide/aws/rds/) | ✅ | ✅ | 
| [Amazon RDS Data API](https://docs.localstack.cloud/references/coverage/coverage_rds-data/) | ✅ | ✅ | 
| [Amazon DocumentDB](https://docs.localstack.cloud/user-guide/aws/docdb/) | ✅ | ✅ | 
| [Amazon MemoryDB](https://docs.localstack.cloud/user-guide/aws/memorydb/) | ✅ | ✅ | 
| [Amazon Neptune](https://docs.localstack.cloud/user-guide/aws/neptune/) | ✅ | ✅ | 
| [Amazon Timestream](https://docs.localstack.cloud/user-guide/aws/timestream/) | ✅ | ✅ | 
| Developer Tools |  |  | 
| [AWS CodeCommit](https://docs.localstack.cloud/references/coverage/coverage_codecommit/) | ✅ | ✅ | 
| AWS CodeBuild | ✅ | ✅ | 
| AWS CodeConnections | ✅ | ✅ | 
| [AWS Fault Injection Service](https://docs.localstack.cloud/user-guide/aws/fis/) | ❌ | ❌ | 
| AWS CodeDeploy | ✅ | ✅ | 
| AWS CodePipeline | ✅ | ✅ | 
| [AWS X-Ray](https://docs.localstack.cloud/user-guide/aws/xray/) | ✅ | ✅ | 
| Frontend Web & Mobile Services |  |  | 
| [AWS Amplify](https://docs.localstack.cloud/user-guide/aws/amplify/) | ✅ | ✅ | 
| [AWS AppSync](https://docs.localstack.cloud/user-guide/aws/appsync/) | ✅ | ✅ | 
| IoT |  |  | 
| [AWS IoT](https://docs.localstack.cloud/user-guide/aws/iot/) | ✅ | ✅ | 
| [AWS IoT Wireless](https://docs.localstack.cloud/user-guide/aws/iotwireless/) | ✅ | ✅ | 
| [AWS IoT Data](https://docs.localstack.cloud/user-guide/aws/iotdata/) | ✅ | ✅ | 
| Management & Governance |  |  | 
| [AWS CloudFormation](https://docs.localstack.cloud/user-guide/aws/cloudformation/) | ✅ | ✅ | 
| [Amazon CloudWatch Metrics](https://docs.localstack.cloud/user-guide/aws/cloudwatch/) | ✅ | ✅ | 
| [Amazon CloudWatch Logs](https://docs.localstack.cloud/user-guide/aws/logs/) | ✅ | ✅ | 
| [AWS Resource Groups](https://docs.localstack.cloud/user-guide/aws/resource_groups/) | ✅ | ✅ | 
| [AWS Systems Manager Parameter Store](https://docs.localstack.cloud/references/coverage/coverage_ssm/) | ✅ | ✅ | 
| [AWS Cloud Control](https://docs.localstack.cloud/references/coverage/coverage_cloudcontrol/) | ✅ | ✅ | 
| [AWS Application Auto Scaling](https://docs.localstack.cloud/references/coverage/coverage_application-autoscaling/) | ✅ | ✅ | 
| [Amazon EC2 Auto Scaling](https://docs.localstack.cloud/references/coverage/coverage_autoscaling/) | ✅ | ✅ | 
| [AWS Config](https://docs.localstack.cloud/references/coverage/coverage_config/) | ✅ | ✅ | 
| [AWS AppConfig](https://docs.localstack.cloud/references/coverage/coverage_appconfig/) | ✅ | ✅ | 
| [AWS CloudTrail](https://docs.localstack.cloud/references/coverage/coverage_cloudtrail/) | ✅ | ✅ | 
| [AWS Account Management](https://docs.localstack.cloud/references/coverage/coverage_account/) | ✅ | ✅ | 
| [AWS Organizations](https://docs.localstack.cloud/references/coverage/coverage_organizations/) | ✅ | ✅ | 
| Media |  |  | 
| [AWS Elemental MediaConvert](https://docs.localstack.cloud/references/coverage/coverage_mediaconvert/) | ✅ | ✅ | 
| Migration & Transfer |  |  | 
| [AWS Transfer Family](https://docs.localstack.cloud/references/coverage/coverage_transfer/) | ✅ | ✅ | 
| [AWS Database Migration Service](https://docs.localstack.cloud/references/coverage/coverage_dms/) | ✅ | ✅ | 
| Machine Learning |  |  | 
| [Amazon Transcribe](https://docs.localstack.cloud/references/coverage/coverage_transcribe/) | ✅ | ✅ |
| [Amazon Textract](https://docs.localstack.cloud/references/coverage/coverage_textract/) | ✅ | ✅ | 
| [Amazon SageMaker AI](https://docs.localstack.cloud/references/coverage/coverage_sagemaker/) | ✅ | ✅ | 
| [Amazon SageMaker Runtime](https://docs.localstack.cloud/references/coverage/coverage_sagemaker-runtime/) | ✅ | ✅ | 
| [Amazon Bedrock](https://docs.localstack.cloud/references/coverage/coverage_bedrock/) | ❌ | ❌ | 
| [Amazon Bedrock Runtime](https://docs.localstack.cloud/references/coverage/coverage_bedrock-runtime/) | ❌ | ❌ | 
| Networking & Content Delivery |  |  | 
| [Amazon Route 53](https://docs.localstack.cloud/references/coverage/coverage_route53/) | ✅ | ✅ | 
| [Amazon Route 53 Resolver](https://docs.localstack.cloud/user-guide/aws/route53resolver/) | ✅ | ✅ | 
| [Amazon API Gateway REST API](https://docs.localstack.cloud/references/coverage/coverage_apigateway/) | ✅ | ✅ | 
| [Amazon API Gateway HTTP and WebSocket API](https://docs.localstack.cloud/references/coverage/coverage_apigatewayv2/) | ✅ | ✅ | 
| [Amazon API Gateway Management API](https://docs.localstack.cloud/references/coverage/coverage_apigatewaymanagementapi/) | ✅ | ✅ | 
| [Elastic Load Balancing](https://docs.localstack.cloud/references/coverage/coverage_elb/) | ✅ | ✅ | 
| [Elastic Load Balancing v2 (Application, Network)](https://docs.localstack.cloud/references/coverage/coverage_elbv2/) | ✅ | ✅ | 
| [Amazon CloudFront](https://docs.localstack.cloud/references/coverage/coverage_cloudfront/) | ✅ | ✅ | 
| [AWS Cloud Map](https://docs.localstack.cloud/references/coverage/coverage_servicediscovery/) | ✅ | ✅ | 
| Security, Identity & Compliance |  |  | 
| [AWS Key Management Service (KMS)](https://docs.localstack.cloud/references/coverage/coverage_kms/) | ✅ | ✅ | 
| [AWS Secrets Manager](https://docs.localstack.cloud/references/coverage/coverage_secretsmanager/) | ✅ | ✅ | 
| [AWS Security Token Service](https://docs.localstack.cloud/references/coverage/coverage_sts/) | ✅ | ✅ | 
| [AWS Certificate Manager](https://docs.localstack.cloud/references/coverage/coverage_acm/) | ✅ | ✅ | 
| [Amazon Cognito Identity Pools](https://docs.localstack.cloud/references/coverage/coverage_cognito-identity/) | ✅ | ✅ | 
| [Amazon Cognito User Pools](https://docs.localstack.cloud/references/coverage/coverage_cognito-idp/) | ✅ | ✅ | 
| [AWS Private Certificate Authority](https://docs.localstack.cloud/references/coverage/coverage_acm-pca/) | ✅ | ✅ | 
| [AWS Web Application Firewall (WAF)](https://docs.localstack.cloud/references/coverage/coverage_wafv2/) | ✅ | ✅ | 
| [AWS Identity and Access Management (IAM)](https://docs.localstack.cloud/references/coverage/coverage_iam/) | ✅ | ✅ | 
| [AWS IAM Identity Store API](https://docs.localstack.cloud/references/coverage/coverage_identitystore/) | ✅ | ✅ | 
| [AWS IAM Identity Center](https://docs.localstack.cloud/references/coverage/coverage_sso-admin/) | ✅ | ✅ | 
| [AWS Resource Access Manager (RAM)](https://docs.localstack.cloud/references/coverage/coverage_ram/) | ✅ | ✅ | 
| [AWS Shield](https://docs.localstack.cloud/references/coverage/coverage_shield/) | ✅ | ✅ | 
| Storage |  |  | 
| [Amazon S3](https://docs.localstack.cloud/references/coverage/coverage_s3/) | ✅ | ✅ |
| [Amazon S3 Control](https://docs.localstack.cloud/references/coverage/coverage_s3control/) | ✅ | ✅ | 
| [Amazon S3 Glacier](https://docs.localstack.cloud/references/coverage/coverage_glacier/) | ✅ | ✅ | 
| [AWS Backup](https://docs.localstack.cloud/user-guide/aws/backup/) | ✅ | ✅ | 
| [Amazon EFS](https://docs.localstack.cloud/references/coverage/coverage_efs/) | ✅ | ✅ | 
| Emulator Enhancements |  |  | 
| CI Credits | ✅ Up to 240 credits monthly per workspace | ✅ Up to 2400 credits monthly per workspace | 
| Stack Insights | ✅ For all supported services | ✅ For all supported services | 
| Local state persistence | ✅ | ✅ | 
| Cloud-based state persistence via Cloud pods | ❌ | ✅ 1 GB, lifetime per license | 
| [Cloud Sandbox](https://docs.localstack.cloud/user-guide/cloud-sandbox/) previews & ephemeral instances | ❌ | ✅ 1000 minutes monthly per workspace | 
| AWS Replicator | ❌ | ✅ | 
| IAM Policy Enforcement | ❌ | ❌ | 
| IAM Policy Streams | ❌ | ❌ | 
| Emulator Compliance Pack | ❌ | ❌ | 
| User Security Pack | ❌ | ❌ | 
| [Chaos Engineering](https://docs.localstack.cloud/user-guide/chaos-engineering/) | ❌ | ❌ | 
| Kubernetes Pack ([Operator](https://docs.localstack.cloud/user-guide/localstack-enterprise/k8s-operator/) & [Executor](https://docs.localstack.cloud/user-guide/localstack-enterprise/kubernetes-executor/)) | ❌ | ❌ | 
|  |  |  | 
| [Support](https://docs.localstack.cloud/getting-started/help-and-support/) | Standard | Priority | 

