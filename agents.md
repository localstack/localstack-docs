# agents.md — LocalStack Docs

This file helps AI coding agents understand the structure, conventions, and workflows of this repository. Read it before making any changes.

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
| Deployment | Cloudflare Pages (static build to `dist/`) |
| Package manager | npm |

---

## Repository Structure

```
localstack-docs/
├── src/
│   ├── content/docs/         # All documentation pages (MDX/MD)
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
│   ├── _redirects            # Cloudflare Pages 301 redirects
│   ├── _headers              # Security & CORS headers
│   ├── images/               # Static images (screenshots, favicons)
│   ├── js/                   # Vanilla JS (icon-loader.js)
│   └── .well-known/          # Agent/MCP discovery endpoints
├── scripts/                  # Data generation and sync scripts
│   ├── create_data_coverage.py
│   ├── create_azure_coverage.py
│   ├── create_cloudformation_coverage.py
│   ├── generate_cli_docs.py
│   ├── generate_extensions_docs.py
│   ├── docs-release-script.sh
│   └── sync-licensing-tags.mjs
├── astro.config.mjs          # Main Astro + Starlight config
├── ec.config.mjs             # Expressive Code (syntax highlighting) config
├── markdoc.config.mjs        # Markdoc processor config
├── tsconfig.json             # TypeScript (strict mode)
└── package.json
```

---

## Three Products, Three Sidebars

This repo documents three distinct LocalStack products. They share components but have separate content directories and independent sidebars:

| Product | Content path | Sidebar |
|---------|-------------|---------|
| AWS | `src/content/docs/aws/` | AWS sidebar |
| Snowflake | `src/content/docs/snowflake/` | Snowflake sidebar |
| Azure | `src/content/docs/azure/` | Azure sidebar |

Always confirm which product you are editing. Sidebars are auto-generated from directory structure in `astro.config.mjs` — adding a file in the right directory is enough to make it appear.

### AWS content layout

```
aws/
├── index.mdx
├── getting-started/          # Installation, quickstart, auth token, FAQ
├── configuration/            # ← was "capabilities/" before July 2026
│   ├── config/               # Environment vars, initialization hooks, logging
│   ├── networking/           # Port mapping, DNS, endpoint injection
│   ├── web-app/              # LocalStack Web App UI
│   ├── localstack-sdks/      # Python SDK, Java SDK
│   ├── extensions/           # Developing and managing extensions
│   └── [standalone pages]    # DNS Server, Testing Utils, etc.
├── developer-tools/          # CLI, Lambda tools, snapshots, MCP server
├── connecting/               # AWS CLI, SDKs, Console, IDEs
├── services/                 # One .mdx per AWS service (100+ files)
├── tutorials/                # Step-by-step tutorials (21+)
├── integrations/             # CI/CD, containers, frameworks
├── enterprise/               # Kubernetes, SSO
├── help-support/             # FAQ, troubleshooting
└── changelog.md
```

> **Important:** The directory was renamed from `aws/capabilities/` to `aws/configuration/` in mid-2026. Redirects for the old paths are in `public/_redirects`. Always use the new `aws/configuration/` path.

---

## Content Conventions

### File formats

- Use **MDX** (`.mdx`) for pages that import or use custom components.
- Use **Markdown** (`.md`) for simple text-only pages.

### Frontmatter

Every page requires at minimum `title` and `description`. The schema is enforced by Zod in `src/content.config.ts` — unknown fields will cause a build error.

```yaml
---
title: Simple Storage Service (S3)
description: Get started with Amazon S3 on LocalStack
---
```

**All supported frontmatter fields:**

| Field | Type | Purpose |
|-------|------|---------|
| `title` | string | Page heading and `<title>` tag — **required** |
| `description` | string | SEO meta description — **required** |
| `template` | `"doc"` | Explicit Starlight template (usually omitted) |
| `sidebar.order` | number | Position within its sidebar group |
| `sidebar.label` | string | Custom label in sidebar instead of title |
| `sidebar.collapsed` | boolean | Collapse the group by default |
| `tags` | string[] | Custom tags |
| `services` | string[] | AWS services covered (for tutorials) |
| `platform` | string[] | Programming languages/platforms (for tutorials) |
| `deployment` | string[] | Deployment tools (for tutorials) |
| `pro` | boolean | Requires Pro tier? (for tutorials) |
| `leadimage` | string | Hero image filename (for tutorials) |
| `persistence` | string | Persistence support level (e.g., `"full"`) |
| `editUrl` | `false` | Hide the "Edit on GitHub" link |
| `hideCopyPage` | boolean | Hide the "Copy Page" dropdown |

**Frontmatter patterns by page type:**

- **Landing/index pages:** `editUrl: false`
- **Tutorials:** `pro: true`, `leadimage`, `services`, `platform`, `deployment`
- **Service pages:** minimal — usually just `title` and `description`
- **Configuration pages:** `services` array where relevant

### Description style

Use the pattern `"Get started with [Service] on LocalStack"` for AWS service pages. Always include "LocalStack" in the description.

---

## Components

### Starlight built-ins (use freely in MDX)

```mdx
import { Tabs, TabItem, Code, LinkButton, Steps, Aside } from '@astrojs/starlight/components';
```

### Custom Astro components

| Component | Purpose |
|-----------|---------|
| `CardGridLayout.astro` | 2-column responsive grid |
| `SectionCards.astro` | Section card containers |
| `PersistenceBadge.astro` | Persistence support indicator |
| `SearchableAwsServices.astro` | Client-side searchable AWS service list |
| `SearchableSnowflakeFeatures.astro` | Client-side searchable Snowflake feature list |
| `SearchableAzureServices.astro` | Client-side searchable Azure service list |
| `ApplicationsShowcase.astro` | Featured applications grid |
| `DynamicAwsServices.astro` | AWS service list generated from data |
| `DynamicTutorials.astro` | Tutorials list generated from data |

### Custom React components (require `client:load`)

```mdx
import OverviewCards from '@/components/OverviewCards';

<OverviewCards client:load />
```

| Component | Purpose |
|-----------|---------|
| `OverviewCards` | Hero and overview card grids |
| `HeroCards` | Large CTAs on landing pages |
| `ProductCards` | Product/tier comparison cards |
| `HeroSection` | Homepage hero section |
| `ServiceBox` | Individual service card |
| `CopyPageDropdown` | Copy page to ChatGPT/Claude |
| `DocsFeedback` | Inline helpfulness feedback form |
| `SearchableAwsServices` | Searchable + filterable service list |
| `SearchableAzureServices` | Searchable Azure service list |
| `SearchableSnowflakeFeatures` | Searchable Snowflake feature list |
| `FeatureCoverage` | Interactive AWS API coverage table |
| `AzureFeatureCoverage` | Interactive Azure API coverage table |

### Page-level overrides (do not edit without understanding site-wide impact)

These override Starlight's default slots and are wired in `astro.config.mjs`. Changes affect every page:

| Component | What it overrides |
|-----------|-------------------|
| `PageTitleWithCopyButton.astro` | Page title — adds "Copy to AI" dropdown |
| `PageSidebarWithBadges.astro` | Sidebar — injects pricing tier badges |
| `BannerWithPersistentAnnouncement.astro` | Site-wide announcement banner |
| `FooterWithFeedback.astro` | Footer with feedback form |
| `LanguageSelectWithGetStarted.astro` | Header with "Get Started" CTA |
| `StarlightHead.astro` | `<head>` — PostHog, HubSpot, Reo tracking |

---

## Images and Icons

### Static images

Place screenshots and diagrams in `public/images/`. Reference them in MDX with root-relative paths:

```mdx
![Alt text](/images/my-screenshot.png)
```

### Imported SVG assets

Icons and logos in `src/assets/images/` must be imported and accessed via `.src`:

```mdx
import rocketIcon from '../../../assets/images/GettingStarted_Color.svg';

<img src={rocketIcon.src} alt="Getting Started" />
```

### CSS icon classes

Icon classes are defined in `src/styles/custom.css` and applied to HTML elements:

```html
<span class="cube-icon"></span>
<span class="rocket-icon"></span>
```

Available: `.cube-icon`, `.rocket-icon`, `.wrench-icon`, `.connections-icon`, `.starburst-icon`, `.book-icon`, `.file-icon`, `.help-and-support-icon`, `.persistence-icon`, `.pricing-icon`

---

## Build and Dev Commands

```bash
npm run dev              # Dev server at http://localhost:4321
npm run build            # Production build → ./dist/
npm run preview          # Preview production build locally
npm run lint:links       # Build and validate all links (same as build)
npm run sync:licensing-tags  # Sync pricing tags from src/data/licensing/
```

**Always run `npm run lint:links` (or `npm run build`) before opening a PR.** The `starlightLinksValidator` plugin treats broken links and relative URL paths as build errors.

---

## Routing and Redirects

- Starlight auto-generates routes from file paths under `src/content/docs/`.
- Deployment target is **Cloudflare Pages** — redirects use `public/_redirects` (not Netlify format, but compatible syntax):

```
/old/path  /new/path  301
```

- When restructuring or renaming pages, always add redirect entries to `public/_redirects`.
- There are 80+ existing redirects — check for conflicts before adding new ones.
- `public/_headers` controls CORS and security headers — do not edit without understanding the implications.

---

## Data-Driven Content

Several content areas are **auto-generated** from JSON data files. Do not hand-edit generated pages — edit the source data and re-run the script.

| Generated content | Source data | Script |
|-------------------|-------------|--------|
| AWS service coverage tables | `src/data/coverage/` (120 JSON files) | `scripts/create_data_coverage.py` |
| Azure coverage tables | `src/data/azure-coverage/` | `scripts/create_azure_coverage.py` |
| CloudFormation resource tables | `src/data/cloudformation/` | `scripts/create_cloudformation_coverage.py` |
| CLI reference docs | External (CLI helptext) | `scripts/generate_cli_docs.py` |
| Extensions docs | External | `scripts/generate_extensions_docs.py` |
| Licensing tags on service pages | `src/data/licensing/current-plans.json` | `scripts/sync-licensing-tags.mjs` |

---

## TypeScript

- Strict mode is enabled (`astro/tsconfigs/strict`).
- Path alias `@/*` resolves to `./src/*`.
- JSX runtime: `react-jsx` (React 19).
- Use `cn()` from `@/lib/utils` for conditional Tailwind class merging.
- Content frontmatter schema is defined with **Zod** in `src/content.config.ts` — unknown frontmatter fields cause build errors.

---

## Key Gotchas

1. **No relative links between pages.** The `starlightLinksValidator` plugin fails the build. Use root-relative paths like `/aws/services/s3/`.

2. **`aws/capabilities/` is now `aws/configuration/`.** This rename happened in mid-2026. All new content goes in `aws/configuration/`. Old URLs are covered by `public/_redirects`.

3. **Frontmatter schema is strict.** Unknown fields throw a Zod error at build time. Check `src/content.config.ts` before adding new frontmatter fields.

4. **Pricing tags are synced via script.** Do not bulk-edit `tags:` frontmatter manually. Update `src/data/licensing/current-plans.json` and run `npm run sync:licensing-tags`.

5. **React components need `client:load`** to be interactive. Without it, Astro renders them as static HTML with no JS.

6. **Three independent sidebars.** The multi-sidebar switcher (`starlightUtils` plugin) and `routeData.ts` manage which sidebar is active. Do not manually wire sidebar-switching logic.

7. **Some pages are auto-generated.** Check `scripts/` before editing service coverage, CLI docs, extension docs, or CloudFormation resource pages — your changes will be overwritten on the next generation run.

8. **`editUrl: false`** should be set on landing pages and all auto-generated pages to hide the "Edit on GitHub" link.

9. **Fonts are local only.** Only the Aeonik family is used; loaded from `src/fonts/`. No Google Fonts.

10. **Agent discovery endpoints** live in `public/.well-known/` — MCP server cards and agent skills metadata. Do not remove or relocate these files.
