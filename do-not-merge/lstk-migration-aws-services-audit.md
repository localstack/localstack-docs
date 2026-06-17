# `lstk` Migration Audit — `aws/services` Pages

**Scope:** Every page under `src/content/docs/aws/services/` (100 files).
**Goal:** Replace the legacy `localstack` CLI, `awslocal`, `tflocal`, `cdklocal`, and `samlocal` commands with `lstk`.

## Command mapping

| Legacy command            | Replacement      | Notes |
| :------------------------ | :--------------- | :---- |
| `localstack start`        | `lstk start`     | See lifecycle caveats below — inline env vars / `--volume` / `--network` do **not** carry over mechanically. |
| `localstack stop`         | `lstk stop`      | Direct swap. |
| `localstack logs`         | `lstk logs`      | Direct swap (`lstk logs --follow` to stream). |
| `localstack status`       | `lstk status`    | Direct swap. |
| `awslocal <args>`         | `lstk aws <args>`| Direct swap on the command token; arguments unchanged. |
| `samlocal <args>`         | `lstk sam <args>`| Direct swap on the command token; arguments unchanged. |
| `tflocal` / `cdklocal`    | `lstk tf` / `lstk cdk` | **Not present in any `aws/services` page** — no action needed here. |

> **Note:** `lstk aws` and `lstk sam` are very new. Verify the exact subcommand names against the current `lstk` release before applying changes repo-wide. As of this audit they are not yet documented in `aws/developer-tools/running-localstack/lstk.mdx`.

## Headline findings

- **95 of 100 pages** require changes; **5 require none**.
- The dominant change is mechanical: **`awslocal` → `lstk aws`** (used across 95 pages, ~700+ invocations total).
- **`tflocal` and `cdklocal` appear nowhere** in `aws/services`.
- **`samlocal` appears only in `serverlessrepo.mdx`** (1 page).
- **`localstack` CLI lifecycle commands** appear on **7 pages** (8 real invocations); some need more than a token swap — see caveats.
- **No page installs** any of these tools (`pip install`, `brew install`, etc.). Installation guidance lives in `aws/developer-tools/` / `aws/getting-started/`, not in service pages, so no install edits are needed within `aws/services`.

## Lifecycle command caveats (`localstack start` → `lstk start`)

Unlike `awslocal`/`samlocal`, the `localstack start` invocations are **not pure token swaps**. The legacy CLI accepts inline container env vars, `--volume`, and `--network` flags directly; `lstk` instead injects container env vars and volumes via its `config.toml` (`[env.*]` profiles and the `volume` field) and does not expose `--network`. Each occurrence below should be rewritten to use a `lstk` config profile rather than an inline prefix/flag, OR the page should keep the lifecycle example as-is if these container options aren't yet supported by `lstk`.

| Page | Line | Current | Required change |
| :--- | :--- | :------ | :-------------- |
| `bedrock.mdx`       | 146 | `DEFAULT_BEDROCK_MODEL=mistral localstack start` | Move `DEFAULT_BEDROCK_MODEL` into a `config.toml` `[env.*]` profile, then `lstk start`. |
| `ec2.mdx`           | 150 | `localstack logs` | Direct swap → `lstk logs`. |
| `eks.mdx`           | 464 | `DOCKER_FLAGS="-v ${HOME}/.kube/config:/root/.kube/config" localstack start` | `lstk` has no `DOCKER_FLAGS` passthrough; express the volume mount via `lstk` config (`volume`) or document the limitation. |
| `eks.mdx`           | 694 | `EKS_K3D_CLUSTER_TOKEN=my-custom-token localstack start` | Move env var into a `config.toml` `[env.*]` profile, then `lstk start`. |
| `events.mdx`        | 156 | `localstack logs` | Direct swap → `lstk logs`. |
| `neptune.mdx`       | 161 | `LOCALSTACK_ENFORCE_IAM=1 localstack start` | Move env var into a `config.toml` `[env.*]` profile, then `lstk start`. |
| `opensearch.mdx`    | 247 | `localstack start --network ls` | `lstk` exposes no `--network` flag; document the limitation or keep the `localstack` CLI example for this case. |
| `stepfunctions.mdx` | 393 | `localstack start --volume /path/to/MockConfigFile.json:/tmp/MockConfigFile.json` | Express the volume mount via the `lstk` config `volume` field, then `lstk start`. |

> **Excluded false positives:** `bedrock.mdx:33` ("when localstack starts…") and `sqs.mdx:180` ("In the localstack logs you should see…") are prose, not commands — no change.

## `samlocal` occurrences — `serverlessrepo.mdx` (1 page)

| Line | Current | Required change |
| :--- | :------ | :-------------- |
| 20 | prose: "…the SAM CLI and our [`samlocal`](https://github.com/localstack/aws-sam-cli-local) wrapper script." | Update wording/link to reference `lstk sam`. |
| 27 | prose: "…using the `samlocal` CLI…" | → `lstk sam`. |
| 30 | `samlocal init --runtime python3.9` | → `lstk sam init --runtime python3.9`. |
| 38 | prose: "…use the `samlocal` CLI…" | → `lstk sam`. |
| 41 | prose: "…using the `samlocal` CLI…" | → `lstk sam`. |
| 57 | `samlocal package \` | → `lstk sam package \`. |
| 88 | `samlocal publish \` | → `lstk sam publish \`. |

This page also has 3 `awslocal` invocations → `lstk aws`.

## Per-page summary (all 100 pages)

`awslocal` column = number of `awslocal` invocations to rewrite to `lstk aws`. "Lifecycle" / "samlocal" flag the extra cases detailed above.

| Page | `awslocal` | Lifecycle | `samlocal` | Action |
| :--- | ---------: | :-------- | :--------- | :----- |
| account.mdx | 4 | — | — | `awslocal` → `lstk aws` |
| acm.mdx | 5 | — | — | `awslocal` → `lstk aws` |
| acm-pca.mdx | 11 | — | — | `awslocal` → `lstk aws` |
| amplify.mdx | 0 | — | — | **NO CHANGE** (uses `amplify-localstack` npm plugin, unrelated) |
| apigateway.mdx | 14 | — | — | `awslocal` → `lstk aws` |
| appconfig.mdx | 7 | — | — | `awslocal` → `lstk aws` |
| application-autoscaling.mdx | 8 | — | — | `awslocal` → `lstk aws` |
| appsync.mdx | 15 | — | — | `awslocal` → `lstk aws` |
| athena.mdx | 26 | — | — | `awslocal` → `lstk aws` |
| autoscaling.mdx | 7 | — | — | `awslocal` → `lstk aws` |
| backup.mdx | 4 | — | — | `awslocal` → `lstk aws` |
| batch.mdx | 9 | — | — | `awslocal` → `lstk aws` |
| bedrock.mdx | 9 | ✓ (L146) | — | `awslocal` → `lstk aws`; lifecycle env-var caveat |
| ce.mdx | 7 | — | — | `awslocal` → `lstk aws` |
| cloudcontrol.mdx | 4 | — | — | `awslocal` → `lstk aws` |
| cloudformation.mdx | 5 | — | — | `awslocal` → `lstk aws` |
| cloudfront.mdx | 4 | — | — | `awslocal` → `lstk aws` |
| cloudtrail.mdx | 9 | — | — | `awslocal` → `lstk aws` |
| cloudwatch.mdx | 9 | — | — | `awslocal` → `lstk aws` |
| codeartifact.mdx | 16 | — | — | `awslocal` → `lstk aws` |
| codebuild.mdx | 11 | — | — | `awslocal` → `lstk aws` |
| codecommit.mdx | 2 | — | — | `awslocal` → `lstk aws` |
| codeconnections.mdx | 5 | — | — | `awslocal` → `lstk aws` |
| codedeploy.mdx | 15 | — | — | `awslocal` → `lstk aws` |
| codepipeline.mdx | 15 | — | — | `awslocal` → `lstk aws` |
| cognito-idp.mdx | 14 | — | — | `awslocal` → `lstk aws` |
| config.mdx | 9 | — | — | `awslocal` → `lstk aws` |
| dms.mdx | 0 | — | — | **NO CHANGE** |
| docdb.mdx | 7 | — | — | `awslocal` → `lstk aws` |
| dynamodb.mdx | 6 | — | — | `awslocal` → `lstk aws` |
| dynamodbstreams.mdx | 9 | — | — | `awslocal` → `lstk aws` |
| ec2.mdx | 12 | ✓ (L150 `logs`) | — | `awslocal` → `lstk aws`; `localstack logs` → `lstk logs` |
| ecr.mdx | 3 | — | — | `awslocal` → `lstk aws` |
| ecs.mdx | 5 | — | — | `awslocal` → `lstk aws` |
| efs.mdx | 6 | — | — | `awslocal` → `lstk aws` |
| eks.mdx | 14 | ✓ (L464, L694) | — | `awslocal` → `lstk aws`; lifecycle `DOCKER_FLAGS`/env caveats |
| elasticache.mdx | 9 | — | — | `awslocal` → `lstk aws` |
| elasticbeanstalk.mdx | 7 | — | — | `awslocal` → `lstk aws` |
| elb.mdx | 7 | — | — | `awslocal` → `lstk aws` |
| emr.mdx | 2 | — | — | `awslocal` → `lstk aws` |
| es.mdx | 6 | — | — | `awslocal` → `lstk aws` |
| events.mdx | 9 | ✓ (L156 `logs`) | — | `awslocal` → `lstk aws`; `localstack logs` → `lstk logs` |
| firehose.mdx | 8 | — | — | `awslocal` → `lstk aws` |
| fis.mdx | 8 | — | — | `awslocal` → `lstk aws` |
| glacier.mdx | 11 | — | — | `awslocal` → `lstk aws` |
| glue.mdx | 36 | — | — | `awslocal` → `lstk aws` (highest count) |
| iam.mdx | 5 | — | — | `awslocal` → `lstk aws` |
| identitystore.mdx | 4 | — | — | `awslocal` → `lstk aws` |
| index.mdx | 0 | — | — | **NO CHANGE** |
| iot.mdx | 4 | — | — | `awslocal` → `lstk aws` |
| iot-data.mdx | 4 | — | — | `awslocal` → `lstk aws` |
| iotwireless.mdx | 7 | — | — | `awslocal` → `lstk aws` |
| kafka.mdx | 7 | — | — | `awslocal` → `lstk aws` |
| kinesis.mdx | 7 | — | — | `awslocal` → `lstk aws` |
| kinesisanalyticsv2.mdx | 14 | — | — | `awslocal` → `lstk aws` |
| kms.mdx | 8 | — | — | `awslocal` → `lstk aws` |
| lakeformation.mdx | 6 | — | — | `awslocal` → `lstk aws` |
| lambda.mdx | 14 | — | — | `awslocal` → `lstk aws` |
| logs.mdx | 16 | — | — | `awslocal` → `lstk aws` |
| managedblockchain.mdx | 4 | — | — | `awslocal` → `lstk aws` |
| mediaconvert.mdx | 5 | — | — | `awslocal` → `lstk aws` |
| memorydb.mdx | 4 | — | — | `awslocal` → `lstk aws` |
| mq.mdx | 3 | — | — | `awslocal` → `lstk aws` |
| mwaa.mdx | 7 | — | — | `awslocal` → `lstk aws` |
| neptune.mdx | 4 | ✓ (L161) | — | `awslocal` → `lstk aws`; lifecycle env-var caveat |
| opensearch.mdx | 10 | ✓ (L247 `--network`) | — | `awslocal` → `lstk aws`; `--network` not supported by `lstk` |
| organizations.mdx | 14 | — | — | `awslocal` → `lstk aws` |
| pinpoint.mdx | 6 | — | — | `awslocal` → `lstk aws` |
| pipes.mdx | 9 | — | — | `awslocal` → `lstk aws` |
| ram.mdx | 2 | — | — | `awslocal` → `lstk aws` |
| rds.mdx | 9 | — | — | `awslocal` → `lstk aws` |
| redshift.mdx | 11 | — | — | `awslocal` → `lstk aws` |
| resource-groups.mdx | 5 | — | — | `awslocal` → `lstk aws` |
| resource-groups-tagging-api.mdx | 9 | — | — | `awslocal` → `lstk aws` |
| route53.mdx | 13 | — | — | `awslocal` → `lstk aws` |
| route53resolver.mdx | 9 | — | — | `awslocal` → `lstk aws` |
| s3.mdx | 13 | — | — | `awslocal` → `lstk aws` |
| s3tables.mdx | 7 | — | — | `awslocal` → `lstk aws` |
| sagemaker.mdx | 0 | — | — | **NO CHANGE** |
| scheduler.mdx | 7 | — | — | `awslocal` → `lstk aws` |
| secretsmanager.mdx | 9 | — | — | `awslocal` → `lstk aws` |
| serverlessrepo.mdx | 3 | — | ✓ (7 refs) | `awslocal` → `lstk aws`; `samlocal` → `lstk sam` |
| servicediscovery.mdx | 15 | — | — | `awslocal` → `lstk aws` |
| ses.mdx | 4 | — | — | `awslocal` → `lstk aws` |
| shield.mdx | 5 | — | — | `awslocal` → `lstk aws` |
| sns.mdx | 23 | — | — | `awslocal` → `lstk aws` |
| sqs.mdx | 19 | — | — | `awslocal` → `lstk aws` (L180 "localstack logs" is prose — no change) |
| sso-admin.mdx | 4 | — | — | `awslocal` → `lstk aws` |
| ssm.mdx | 4 | — | — | `awslocal` → `lstk aws` |
| stepfunctions.mdx | 8 | ✓ (L393 `--volume`) | — | `awslocal` → `lstk aws`; `--volume` via `lstk` config |
| sts.mdx | 8 | — | — | `awslocal` → `lstk aws` |
| support.mdx | 4 | — | — | `awslocal` → `lstk aws` |
| swf.mdx | 11 | — | — | `awslocal` → `lstk aws` |
| textract.mdx | 4 | — | — | `awslocal` → `lstk aws` |
| timestream-query.mdx | 7 | — | — | `awslocal` → `lstk aws` |
| transcribe.mdx | 7 | — | — | `awslocal` → `lstk aws` |
| transfer.mdx | 0 | — | — | **NO CHANGE** |
| verifiedpermissions.mdx | 5 | — | — | `awslocal` → `lstk aws` |
| waf.mdx | 5 | — | — | `awslocal` → `lstk aws` |
| xray.mdx | 4 | — | — | `awslocal` → `lstk aws` |

## NO CHANGE pages (5)

- `amplify.mdx` — uses the `amplify-localstack` npm plugin and `amplify --use-localstack`, not the LocalStack CLI/wrappers.
- `dms.mdx` — only an incidental "start LocalStack" prose mention (docker-compose).
- `index.mdx` — services landing page; incidental product name only.
- `sagemaker.mdx` — no relevant commands.
- `transfer.mdx` — no relevant commands.

## Additional wording (beyond command invocations)

Prose references and links that recommend the legacy tools but are **not** command lines, so they need rewording rather than a token swap. (Note: the intro-boilerplate mentions below were included in the per-page `awslocal` counts above, but they are prose/links, not `lstk aws` swaps.)

### 1. Intro-guide boilerplate — 84 pages

Nearly every guide opens with a variant of:

> "This guide is designed for users new to **X** and assumes basic knowledge of the AWS CLI and our [`awslocal`](https://github.com/localstack/awscli-local) wrapper script."

This both **names the `awslocal` wrapper** and **links the legacy repo** `https://github.com/localstack/awscli-local`. Needs a wording update (e.g. reference `lstk aws`) and a decision on the new link target. Affects 84 pages — every page in the per-page table with a non-zero `awslocal` count except the few that only use `awslocal` inline (see below).

### 2. Inline "using `awslocal`" prose links

Distinct from the boilerplate; these link the legacy repo at first point of use:

| Page | Line | Text |
| :--- | :--- | :--- |
| `athena.mdx` | 127 | "create an S3 bucket in LocalStack using the `awslocal` command line" (links the legacy repo) |
| `es.mdx` | 17 | "use `awslocal` to create a new elasticsearch domain" (links the legacy repo) |
| `ses.mdx` | 24 | "Basic knowledge of the AWS CLI and LocalStack `awslocal` command is assumed." (links the legacy repo) |
| `timestream-query.mdx` | 23 | "using the `awslocal` command line." (links the legacy repo) |
| `serverlessrepo.mdx` | 75 | "utilize the `awslocal` CLI by running the following command" (links the legacy repo) |

### 3. `samlocal` repo link

| Page | Line | Text |
| :--- | :--- | :--- |
| `serverlessrepo.mdx` | 20 | links the legacy `samlocal` repo `https://github.com/localstack/aws-sam-cli-local` |

### 4. "LocalStack CLI" prose references (3) — two name legacy-only flags

These reference the legacy CLI directly, and two cite flags `lstk` does **not** expose, so they can't be reworded mechanically:

| Page | Line | Text | Concern |
| :--- | :--- | :--- | :------ |
| `eks.mdx` | 461 | "When using the LocalStack CLI, please configure the `DOCKER_FLAGS` to mount the kubeconfig…" | `lstk` has no `DOCKER_FLAGS` passthrough. |
| `route53.mdx` | 23 | "LocalStack CLI does not publish port `53` anymore by default. Use the CLI flag `--host-dns`…" | `lstk` exposes no `--host-dns` flag. |
| `stepfunctions.mdx` | 390 | `<TabItem label="LocalStack CLI">` wrapping a `localstack start --volume` example (sibling tab: "Docker Compose") | Tab label + body both reference the legacy CLI; `--volume` is a `config.toml` field in `lstk`. |

## Suggested execution approach

1. **Bulk pass:** mechanical replace `awslocal` → `lstk aws` across the 95 affected pages (word-boundary safe; arguments unchanged).
2. **`serverlessrepo.mdx`:** replace `samlocal` → `lstk sam` (7 spots) and its 3 `awslocal` invocations.
3. **Lifecycle pass (7 pages):** handle the 8 `localstack start`/`logs` invocations individually — direct swap for `logs`; for `start` invocations with inline env vars / `--volume` / `--network`, rewrite using `lstk` `config.toml` profiles or document the limitation if `lstk` can't yet express them.
4. **Verify** `lstk aws` / `lstk sam` subcommand names against the current `lstk` release before merging.