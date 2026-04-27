# agents.md — LocalStack Docs

This file helps AI coding agents understand the structure, conventions, and workflows of this repository. Read it before making any changes.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Astro](https://astro.build/) 5.x with [Starlight](https://starlight.astro.build/) 0.37.x |
| Markup | MDX (primary) and Markdown |
| UI components | React 19 (Astro islands via `client:load`) |
| Styling | Tailwind CSS v4 |
| Search | Algolia DocSearch |
| Build output | Static HTML → deployed on Netlify |
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
│   ├── styles/               # global.css, custom.css (icon classes)
│   ├── fonts/                # Aeonik font families
│   ├── hooks/                # React hooks
│   ├── lib/                  # Utility functions (cn() for Tailwind)
│   ├── config/               # Algolia DocSearch config
│   ├── content.config.ts     # Content collection schema
│   └── routeData.ts          # Starlight route middleware
├── public/
│   ├── _redirects            # Netlify 301 redirects
│   ├── images/               # Static images (screenshots, favicons)
│   ├── artifacts/            # Downloadable files
│   └── js/                   # Vanilla JS for icon loading, sidebar switching
├── scripts/                  # Data generation and sync scripts
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

---

## Content Conventions

### File formats

- Use **MDX** (`.mdx`) for pages that import or use custom components.
- Use **Markdown** (`.md`) for simple text-only pages.

### Frontmatter

Every page needs at minimum `title` and `description`:

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
| `sidebar.label` | string | Custom label to show in sidebar instead of title |
| `sidebar.collapsed` | boolean | Collapse the group by default |
| `tags` | string[] | Pricing tier: `["Hobby"]`, `["Base"]`, `["Ultimate"]`, `["Enterprise"]` |
| `editUrl` | `false` | Hide the "Edit on GitHub" link (use on landing/generated pages) |
| `persistence` | `"supported"` | Marks the AWS service as supporting state persistence |
| `hideCopyPage` | boolean | Hide the "Copy Page" dropdown |

### Description style

Use the pattern `"Get started with [Service] on LocalStack"` for AWS service pages. Always include "LocalStack" in the description.

### Pricing tags

Tags (`tags: ["Hobby"]`) control the sidebar badge shown next to a service. They are kept in sync with `src/data/licensing/current-plans.json` via a script — do not manually audit or bulk-edit tags. Instead, update the source JSON and run:

```bash
npm run sync:licensing-tags
```

---

## Components

### Starlight built-ins (use freely in MDX)

```mdx
import { Tabs, TabItem, Code, LinkButton, Steps, Aside } from '@astrojs/starlight/components';
```

### Custom Astro components

| Component | Import path | Purpose |
|-----------|-------------|---------|
| `CardGridLayout` | `@/components/CardGridLayout.astro` | 2-column responsive grid |
| `SectionCards` | `@/components/SectionCards.astro` | Section card containers |
| `PersistenceBadge` | `@/components/PersistenceBadge.astro` | Persistence support indicator |
| `SearchableAwsServices` | `@/components/SearchableAwsServices.astro` | Client-side searchable service list |
| `SearchableSnowflakeFeatures` | `@/components/SearchableSnowflakeFeatures.astro` | Client-side searchable feature list |
| `SearchableAzureServices` | `@/components/SearchableAzureServices.astro` | Client-side searchable Azure service list |
| `ApplicationsShowcase` | `@/components/ApplicationsShowcase.astro` | Featured applications grid |
| `DynamicAwsServices` | `@/components/DynamicAwsServices.astro` | AWS service list generated from data |
| `DynamicTutorials` | `@/components/DynamicTutorials.astro` | Tutorials list generated from data |

### Custom React components (require `client:load`)

```mdx
import OverviewCards from '@/components/OverviewCards';

<OverviewCards client:load />
```

| Component | Purpose |
|-----------|---------|
| `OverviewCards` | Hero and overview card grids |
| `ProductCards` | Product/tier comparison cards |
| `HeroSection` | Homepage hero section |
| `ServiceBox` | Individual service card |
| `CopyPageDropdown` | Copy page to ChatGPT/Claude |
| `DocsFeedback` | Inline helpfulness feedback form |

### Page-level overrides (do not edit directly)

These components override Starlight's default slots and are wired up in `astro.config.mjs`. Editing them affects every page site-wide:

- `PageTitleWithCopyButton.astro` — adds "Copy to AI" dropdown to all page titles
- `PageSidebarWithBadges.astro` — injects pricing tier badges into sidebar links
- `BannerWithPersistentAnnouncement.astro` — site-wide announcement banner
- `FooterWithFeedback.astro` — footer with feedback form
- `LanguageSelectWithGetStarted.astro` — header with "Get Started" CTA

---

## Images and Icons

### Static images

Place screenshots and diagrams in `public/images/`. Reference them in MDX with root-relative paths:

```mdx
![Alt text](/images/my-screenshot.png)
```

### SVG icons (inline/CSS)

Icons are in `src/assets/images/`. CSS utility classes are defined in `src/styles/custom.css`:

```html
<span class="cube-icon"></span>
<span class="rocket-icon"></span>
```

Available icon classes: `.cube-icon`, `.rocket-icon`, `.wrench-icon`, `.connections-icon`, `.starburst-icon`, `.book-icon`, `.file-icon`, `.help-and-support-icon`, `.persistence-icon`, `.pricing-icon`.

---

## Build and Dev Commands

```bash
npm run dev              # Dev server at http://localhost:4321
npm run build            # Production build → ./dist/
npm run preview          # Preview production build locally
npm run lint:links       # Build and validate all internal/external links
npm run sync:licensing-tags  # Sync pricing tags from src/data/licensing/
```

**Always run `npm run lint:links` before opening a PR** — the links validator plugin treats broken links and relative URL paths as build errors.

---

## Routing and Redirects

- Starlight auto-generates routes from file paths under `src/content/docs/`.
- When restructuring or renaming pages, add 301 entries to `public/_redirects` (Netlify format):

```
/old/path  /new/path  301
```

- There are 300+ existing redirect entries. Check for conflicts before adding new ones.

---

## Data-Driven Content

Several content areas are **generated automatically** from data files. Do not hand-edit generated pages — edit the source data and re-run the script.

| Generated content | Source data | Script |
|-------------------|-------------|--------|
| AWS service coverage tables | `src/data/coverage/` | `scripts/create_data_coverage.py` |
| Azure coverage tables | `src/data/azure-coverage/` | `scripts/create_azure_coverage.py` |
| CloudFormation resource tables | `src/data/cloudformation/` | `scripts/create_cloudformation_coverage.py` |
| CLI reference docs | External | `scripts/generate_cli_docs.py` |
| Licensing tags on service pages | `src/data/licensing/current-plans.json` | `scripts/sync-licensing-tags.mjs` |

---

## TypeScript

- Strict mode is enabled (`astro/tsconfigs/strict`).
- Path alias `@/*` resolves to `./src/*`.
- JSX runtime: `react-jsx`.
- Use `cn()` from `@/lib/utils` for conditional Tailwind class merging.

---

## Key Gotchas

1. **Do not use relative links between docs pages.** The Starlight links validator will fail the build. Use root-relative paths (`/aws/services/s3/`) instead.

2. **Sidebars are auto-generated** from directory structure — adding a file in the right place is enough. Manual sidebar entries in `astro.config.mjs` exist only for custom ordering or labels.

3. **Pricing tags are synced via script.** Do not bulk-edit `tags:` frontmatter manually across service files. Update `src/data/licensing/current-plans.json` and run `npm run sync:licensing-tags`.

4. **React components need `client:load`** to be interactive. Astro renders them as static HTML by default. Add the directive when the component uses state, effects, or browser APIs.

5. **Three independent sidebars** — the multi-sidebar switcher (`starlightUtils` plugin) and `routeData.ts` manage which sidebar is active. Do not manually wire sidebar-switching logic.

6. **Some pages are auto-generated.** Check `scripts/` before editing service coverage, CLI docs, or CloudFormation resource pages — your changes will be overwritten on the next generation run.

7. **`editUrl: false`** should be set on landing pages and all auto-generated pages to hide the "Edit on GitHub" link.
