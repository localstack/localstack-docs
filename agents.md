# agents.md for LocalStack for AWS Docs

This file is an MVP AI Documentation Agent tailored for the LocalStack for AWS documentation in our documentation repository. 

This agent will automate the research, verification, and drafting of service documentation, tutorials, and configuration guides while ensuring strict alignment with our internal technical standards.

Read this file fully before making any changes.

---

## How to Work on a Docs Task

Follow this process for every task, in order. Do not skip steps.

### Step 1: Understand the task

Before writing anything, clarify:
- Which **product** is this for? (AWS, Snowflake, Azure)
- What **type of doc** is needed? (aws service doc, tutorial, configuration, getting-started, changelog entry, etc.)
- Is there an **existing doc** to update, or is this a **new doc**?
- Is there a **Linear ticket** with more context?


### Step 2: Research before writing

Never write from memory, and never guess. Treat lack of documentation as a research puzzle, not an invitation to improvise. You must cross-reference real AWS behavior with LocalStack's actual implementation before drafting text.

#### EXPLICIT HALT & CONSENT REQUIRED
If you encounter a conflict between what AWS docs state and what LocalStack code/coverage files support, **do not guess or gloss over it.** Stop and explicitly ask the user for clarification. State what you found, where the data thins out, and ask how they want the limitation or behavior documented. Never apply silent assumptions.

#### Research Protocols by Doc Type

**For AWS service docs:**
1. **Analyze LocalStack Coverage (Ground Truth):** Open and fully parse `src/data/coverage/<service>.json`. Identify exactly which API operations are supported, supported with limitations, or completely missing. 
2. **Read Existing Context:** Read the existing doc at `src/content/docs/aws/services/<service>.mdx` entirely to understand what is currently exposed to users.
3. **Cross-Reference Live AWS Docs:** Look up the official AWS API reference documentation for that service. Verify the exact payload structures, required parameters, and intent of the API operations.
4. **Audit the Ecosystem:** 
   - Search the core LocalStack repo (`github.com/localstack/localstack`) for PRs, issues, or changelog entries matching the service/feature to catch undocumented quirks.
   - Search `github.com/localstack-samples` to see if real, working sample applications already exist for this service.

**For configuration or capability docs:**
1. Open and thoroughly review the existing files under `src/content/docs/aws/customization/`.
2. Look up the specific environment variables or configuration flags in LocalStack's core source code or release notes to verify their exact type, default values, and behavioral impact.

**For tutorials:**
1. Review 2-3 active tutorials under `src/content/docs/aws/tutorials/` to benchmark the depth and progression of instructions.
2. **Prerequisite Verification:** Mechanically verify that all required CLI tools, auth tokens, or Pro plans are listed.
3. **Live Link Audit:** Confirm that any linked sample repositories or external assets actually exist. No placeholder URLs.

#### MANDATORY INTERNAL AUDIT TRAIL
For every new doc or major change you draft, you must generate a short **Audit Trail** in your response or PR scratchpad containing:
- **Sources Accessed:** Direct URLs to the official AWS documentation docs you referenced.
- **Coverage Files Parsed:** The exact path and key data metrics checked from `src/data/coverage/`.
- **Confidence & Gaps Assessment:** Explicitly state if data was thin or if you encountered places where LocalStack's behavior diverged from AWS. Note any features you deliberately omitted due to lack of verified local support.

#### Anti-Hallucination Guardrails
- **Zero-Tolerance for Fictional APIs:** Never invent `awslocal` commands, CLI flags, configuration variables, or JSON output fields. If a flag or parameter is not explicitly found in active AWS documentation or LocalStack's data/source code, do not write it down.



### Step 3: Check for existing patterns

Before creating a new doc, read 2–3 similar existing docs to match their structure. For service docs, read `s3.mdx` and `lambda.mdx`. For tutorials, read any tutorial in `aws/tutorials/`. This repo has strong internal consistency, match it.

### Step 4: Write

Follow the writing conventions below. Draft the full doc, not just sections.

### Step 5: Verify before finishing

- Run `npm run build` to catch broken links and frontmatter errors.
- Check that all internal links use root-relative paths (`/aws/services/s3/`), never relative paths (`../../s3`).
- Confirm frontmatter fields match what `src/content.config.ts` allows because unknown fields cause build errors.
- If you renamed or moved a doc, add the old URL to `public/_redirects`.

---

## Writing Style and Tone

### Voice

- **Direct and instructional.** Tell the user exactly what to do.
- **Second person.** Address the reader as "you."
- **Present tense.** "Run the following command" not "You will run the following command."
- **Active voice.** "LocalStack supports X" not "X is supported by LocalStack."
- No filler phrases like "In this section, we will explore..." Start with the content.

### Tone markers

- Professional but helpful. Not stiff, not casual.
- When noting limitations, be factual and specific: "LocalStack does not support X" or "X is not yet supported in LocalStack and will be available in a future release."
- Link to AWS docs when explaining AWS concepts. Do not re-explain what AWS already explains well.

### What to always include in a service doc

1. **Introduction**: What the AWS service does (2–4 sentences). What LocalStack lets you do with it. Link to the API coverage section.
2. **Getting started**: A short, self-contained walkthrough using `awslocal` commands. Assume the user has LocalStack running. Show real commands with real expected output.
3. **Feature sections**: Cover notable behaviors, limitations, or LocalStack-specific quirks. Use `:::note` or `:::tip` callouts for important caveats.
4. **Resource Browser**: If the service has a LocalStack Web App Resource Browser, include a section with a screenshot and a bulleted list of actions available.
5. **Examples**: Links to relevant sample apps from `github.com/localstack-samples` or tutorials on the docs site.
6. **API Coverage**: Always end with the `<FeatureCoverage>` component.

### What to always include in a tutorial

1. **Introduction**: The problem being solved and what the reader will build.
2. **Architecture diagram**: If the tutorial involves multiple services, include a diagram.
3. **Prerequisites**: Bulleted list: LocalStack, awslocal, any other tools. State if Pro plan is required.
4. **Step-by-step tutorial**: Use `###` for each step. Each step should have a clear goal, the command(s) to run, and the expected output.
5. No "Summary" section at the end: just end with the last meaningful step or a "Next steps" pointing to related content.

---

## doc Structure Templates

### Service doc (MDX)

````mdx
---
title: "Service Name (Abbreviation)"
description: Get started with [Service Name] on LocalStack
tags: ["Hobby"]
persistence: supported        # or: "supported with limitations" or omit if not applicable
---

import FeatureCoverage from "../../../../components/feature-coverage/FeatureCoverage";

## Introduction

[2–4 sentences: what the AWS service does. What LocalStack lets you do with it.]

LocalStack allows you to use the [Service] APIs in your local environment to [key actions].
The supported APIs are available on the [API coverage section](#api-coverage).

## Getting started

This guide is designed for users new to [Service] and assumes basic knowledge of the AWS CLI and our [`awslocal`](https://github.com/localstack/awscli-local) wrapper script.

Start your LocalStack container using your preferred method.

### [First task]

[Explanation sentence.]

```bash
awslocal <service> <command> --option value
```

```bash title="Output"
{
  "Field": "value"
}
```

## [Feature or behavior section]

[Explain a notable LocalStack-specific behavior, limitation, or configuration option.]

:::note
[Important caveat or limitation.]
:::

## Resource Browser

The LocalStack Web Application provides a [Resource Browser](/aws/connecting/console/resource-browser) for managing [Service] resources.
You can access the Resource Browser by opening the LocalStack Web Application in your browser, navigating to the **Resources** section, and then clicking on **[Service]**.

![Resource Browser](/images/aws/<service>-resource-browser.png)

The Resource Browser allows you to perform the following actions:

- **Action One**: Description.
- **Action Two**: Description.

## Examples

The following code snippets and sample applications provide practical examples of how to use [Service] in LocalStack:

- [Description of sample app](https://github.com/localstack-samples/sample-...)

## API Coverage

<FeatureCoverage service="<service-id>" client:load />
````

### Tutorial doc (MDX)

````mdx
---
title: "Tutorial title — what the user will build"
description: Learn how to [goal] using [services] with LocalStack. [One more sentence of context.]
services:
  - s3
  - lmb
platform:
  - Python
deployment:
  - terraform
pro: true       # only if LocalStack Pro is required
leadimage: "tutorial-banner-filename.png"
---

## Introduction

[Problem statement. What the reader will build. Why it matters.]

## Architecture

![Architecture Diagram](/images/aws/tutorial-diagram.png)

[2–3 sentences describing the architecture.]

## Prerequisites

- [LocalStack](https://localstack.cloud/) with an [auth token](https://app.localstack.cloud/workspace/auth-tokens) (Pro plan required)
- [awslocal](https://github.com/localstack/awscli-local)
- [Other tool](link)

## Tutorial: [Goal]

### Step 1 — [Action]

[Explanation.]

```bash
command here
```

### Step 2 — [Action]


````

---

## Code Examples

### CLI commands

Always use `awslocal` (not `aws`). Every command block must:
- Show the command itself
- Show the expected output in a separate block with `title="Output"`

````mdx
```bash
awslocal s3api create-bucket --bucket my-bucket
```

```bash title="Output"
{
    "Location": "/my-bucket"
}
```
````

### Multi-line commands

Use `\` for line continuation:

```bash
awslocal lambda create-function \
    --function-name my-function \
    --runtime python3.11 \
    --handler handler.handler \
    --role arn:aws:iam::000000000000:role/lambda-role \
    --zip-file fileb://function.zip
```

### File content blocks

Use `title` to label the filename and `showLineNumbers` for longer snippets:

````mdx
```json title="cors-config.json" showLineNumbers
{
  "CORSRules": [...]
}
```
````

### Callout types

Use Starlight callout syntax:

````mdx
:::note
Use this for important caveats, limitations, or things that differ from AWS behavior.
:::

:::tip
Use this for helpful shortcuts or recommendations.
:::

:::caution
Use this for destructive or irreversible actions.
:::
````

---

## Linking

### Internal links

Always use **root-relative paths**. Never use relative paths (`../../`).

```mdx
[SDK documentation](/aws/customization/integrations/localstack-sdks/)
[API coverage](/aws/services/s3/#api-coverage)
```

Relative links will fail the build (`starlightLinksValidator` treats them as errors).

### AWS documentation links

Link to AWS docs when explaining AWS concepts users may not know:

```mdx
[`CreateBucket`](https://docs.aws.amazon.com/cli/latest/reference/s3api/create-bucket.html)
```

### Sample app links

Link to `github.com/localstack-samples` for examples, not inline code snippets. Use descriptive link text:

```mdx
- [Full-Stack application with Lambda, DynamoDB & S3 for shipment validation](https://github.com/localstack-samples/sample-shipment-list-demo-lambda-dynamodb-s3)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Astro](https://astro.build/) 7.x with [Starlight](https://starlight.astro.build/) 0.41.x |
| Markup | MDX (primary) and Markdown |
| UI components | React 19 (Astro islands via `client:load`) |
| Styling | Tailwind CSS v4 + custom CSS |
| Code highlighting | Expressive Code (Shiki, themes: one-light / one-dark-pro) |
| Search | Algolia DocSearch |
| Deployment | Cloudflare docs (static build to `dist/`) |
| Package manager | npm |

---

## Repository Structure

```
localstack-docs/
├── src/
│   ├── content/docs/         # All documentation docs (MDX/MD)
│   │   ├── aws/              # AWS product docs
│   │   ├── snowflake/        # Snowflake product docs
│   │   └── azure/            # Azure product docs
│   ├── components/           # Astro + React components
│   │   ├── ui/               # shadcn-style table component
│   │   ├── feature-coverage/ # API coverage tables
│   │   ├── cloudformation-coverage/
│   │   ├── snowflake-coverage/
│   │   ├── kubernetes-operator/
│   │   ├── licensing-coverage/
│   │   ├── persistence-coverage/
│   │   ├── replicator-coverage/
│   │   ├── tutorials/
│   │   └── applications/
│   ├── data/                 # JSON source data (coverage, licensing, etc.)
│   ├── assets/images/        # SVG icons and logos
│   ├── styles/               # global.css, custom.css (Tailwind layers + icon classes)
│   ├── fonts/                # Aeonik font families (Pro, Fono, Mono)
│   ├── hooks/                # React hooks
│   ├── lib/                  # Utility functions (cn() for Tailwind)
│   ├── config/               # Algolia DocSearch config
│   ├── content.config.ts     # Content collection schema (Zod)
│   └── routeData.ts          # Starlight route middleware
├── public/
│   ├── _redirects            # Cloudflare docs 301 redirects
│   ├── _headers              # Security & CORS headers
│   ├── images/               # Static images (screenshots, favicons)
│   ├── js/                   # Vanilla JS (icon-loader.js)
│   └── .well-known/          # Agent/MCP discovery endpoints
├── scripts/                  # Data generation and sync scripts
├── astro.config.mjs          # Main Astro + Starlight config
├── ec.config.mjs             # Expressive Code config
├── markdoc.config.mjs        # Markdoc processor config
├── tsconfig.json             # TypeScript (strict mode)
└── package.json
```

---

## Three Products, Three Sidebars

| Product | Content path | Sidebar |
|---------|-------------|---------|
| AWS | `src/content/docs/aws/` | AWS sidebar |
| Snowflake | `src/content/docs/snowflake/` | Snowflake sidebar |
| Azure | `src/content/docs/azure/` | Azure sidebar |

Sidebars are auto-generated from directory structure — adding a file in the right directory is enough to make it appear.

### AWS content layout

```
aws/
├── index.mdx
├── getting-started/          # Installation, quickstart, auth token, CI/CD, FAQ
├── customization/            # Config, logging, networking, Kubernetes, extensions, SDKs
│   ├── kubernetes/           # Helm chart, eksctl, concepts, FAQ
│   ├── networking/           # Port mapping, DNS, endpoint injection
│   ├── advanced/             # Init hooks, filesystem, multi-account, ARM64
│   ├── other-installations/  # Docker images, devcontainers, Podman, Rancher Desktop
│   └── integrations/         # Extensions, SDKs, app frameworks, testing tools
├── developer-tools/          # CLI, Lambda tools, snapshots, MCP server, security testing
├── connecting/               # AWS CLI, SDKs, Console, IDEs, IaC, credentials
├── services/                 # One .mdx per AWS service (100+ files)
├── tutorials/                # Step-by-step tutorials
├── quickstart-library/       # Curated quickstart tutorials
├── ci-pipelines/             # CI provider guides (GitHub Actions, GitLab CI, etc.)
├── organizations-admin/      # Accounts, workspaces, licenses, SSO, stack insights
├── tooling/                  # Extensions marketplace listing
├── help-support/             # FAQ, troubleshooting, support offerings
├── legal/                    # Third-party software/tools
├── changelog.md
├── licensing.mdx
└── sample-apps.mdx
```

> **Note:** There is no `aws/configuration/` or `aws/capabilities/` directory. Environment variables, networking, Kubernetes, extensions, and SDK integration docs all live under `aws/customization/`. Check the actual directory listing before citing a path — this tree can drift from reality as the repo evolves.

---

## Frontmatter

Every doc requires at minimum `title` and `description`. The schema is enforced by Zod in `src/content.config.ts` — **unknown fields cause a build error**.

| Field | Type | Purpose |
|-------|------|---------|
| `title` | string | doc heading — **required** |
| `description` | string | SEO meta description — **required** |
| `template` | `"doc"` | Explicit Starlight template (usually omitted) |
| `sidebar.order` | number | Position within its sidebar group |
| `sidebar.label` | string | Custom sidebar label |
| `sidebar.collapsed` | boolean | Collapse group by default |
| `tags` | string[] | Custom tags (managed by sync script — do not bulk-edit) |
| `services` | string[] | AWS services covered (tutorials only) |
| `platform` | string[] | Programming languages/platforms (tutorials only) |
| `deployment` | string[] | Deployment tools (tutorials only) |
| `pro` | boolean | Requires Pro plan (tutorials only) |
| `leadimage` | string | Hero image filename (tutorials only) |
| `persistence` | string | Persistence support level (service docs) |
| `editUrl` | `false` | Hide "Edit on GitHub" link |
| `hideCopydoc` | boolean | Hide the "Copy doc" dropdown |

---

## Components

### Starlight built-ins

```mdx
import { Tabs, TabItem, Code, LinkButton, Steps, Aside } from '@astrojs/starlight/components';
```

### Custom React components (require `client:load`)

```mdx
import FeatureCoverage from "../../../../components/feature-coverage/FeatureCoverage";

<FeatureCoverage service="s3" client:load />
```

| Component | Purpose |
|-----------|---------|
| `FeatureCoverage` | AWS API coverage table — always at the bottom of service docs |
| `AzureFeatureCoverage` | Azure API coverage table |
| `OverviewCards` | Hero and overview card grids |
| `HeroCards` | Large CTAs on landing docs |
| `SearchableAwsServices` | Searchable + filterable service list |
| `DocsFeedback` | Inline helpfulness feedback form |

### doc-level overrides (do not edit without understanding site-wide impact)

| Component | What it overrides |
|-----------|-------------------|
| `docTitleWithCopyButton.astro` | doc title — adds "Copy to AI" dropdown |
| `docSidebarWithBadges.astro` | Sidebar — injects pricing tier badges |
| `BannerWithPersistentAnnouncement.astro` | Site-wide announcement banner |
| `FooterWithFeedback.astro` | Footer with feedback form |
| `StarlightHead.astro` | `<head>` — PostHog, HubSpot, Reo tracking |

---

## Build and Dev Commands

```bash
npm run dev              # Dev server at http://localhost:4321
npm run build            # Production build → ./dist/
npm run preview          # Preview production build locally
npm run lint:links       # Build + validate all links (same as build)
npm run sync:licensing-tags  # Sync pricing tags from src/data/licensing/
```

Always run `npm run build` before opening a PR. Broken links and invalid frontmatter are caught at build time.

---

## Data-Driven Content

Do not hand-edit these docs — they are auto-generated. Edit the source data and re-run the script.

| Generated content | Source data | Script |
|-------------------|-------------|--------|
| AWS service coverage tables | `src/data/coverage/` | `scripts/create_data_coverage.py` |
| Azure coverage tables | `src/data/azure-coverage/` | `scripts/create_azure_coverage.py` |
| CloudFormation tables | `src/data/cloudformation/` | `scripts/create_cloudformation_coverage.py` |
| CLI reference docs | External | `scripts/generate_cli_docs.py` |
| Extensions docs | External | `scripts/generate_extensions_docs.py` |
| Pricing tags | `src/data/licensing/current-plans.json` | `scripts/sync-licensing-tags.mjs` |

---

## Redirects

When renaming or restructuring docs, add entries to `public/_redirects` (Cloudflare docs format):

```
/old/path  /new/path  301
```

There are 80+ existing redirects. Check for conflicts before adding new ones.

---

## Key Gotchas

1. **No relative links.** Use root-relative paths (`/aws/services/s3/`). Relative paths (`../../s3`) fail the build.

2. **The directory is `aws/customization/`, not `aws/configuration/` or `aws/capabilities/`.** Neither of those exists. All configuration, networking, Kubernetes, extensions, and SDK content goes there.

3. **Frontmatter schema is strict.** Unknown fields throw a Zod error at build time. Check `src/content.config.ts` first.

4. **Pricing tags are synced via script.** Don't bulk-edit `tags:` frontmatter. Update the JSON source and run the sync script.

5. **React components need `client:load`** to be interactive. Without it, they render as static HTML with no JS.

6. **Some docs are auto-generated.** Check `scripts/` before editing service coverage, CLI docs, or extension docs — changes will be overwritten.

7. **`editUrl: false`** on landing docs and auto-generated docs to hide the "Edit on GitHub" link.

8. **Agent discovery endpoints** in `public/.well-known/` — do not remove or relocate.
