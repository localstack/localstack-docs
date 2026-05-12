// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightUtils from '@lorenzo_lewis/starlight-utils';
import starlightDocSearch from '@astrojs/starlight-docsearch';
import starlightLinksValidator from 'starlight-links-validator';
import starlightImageZoom from 'starlight-image-zoom';
import starlightLlmsTxt from 'starlight-llms-txt';
import sitemap from '@astrojs/sitemap';
import starlightFullViewMode from 'starlight-fullview-mode';

import markdoc from '@astrojs/markdoc';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// Used on the AWS and Snowflake installation guides: CLI download URLs and some bash examples.
// Source of truth: public https://github.com/localstack/localstack-cli/releases/latest
const LOCALSTACK_CLI_RELEASE_API =
  'https://api.github.com/repos/localstack/localstack-cli/releases/latest';

/** When the API fails or rate-limits, builds still succeed; bump when CLI ships a new line. */
const LOCALSTACK_CLI_VERSION_FALLBACK = '2026.4.0';

/** @param {unknown} tagName */
function normalizeCliReleaseTag(tagName) {
  if (typeof tagName !== 'string' || !tagName.trim()) return null;
  return tagName.replace(/^v/i, '').trim();
}

/**
 * One request per build when LOCALSTACK_AWS_VERSION is unset. Use that env in CI to skip the
 * network entirely, or set GITHUB_TOKEN for 5k req/hr instead of unauthenticated 60/hr per IP.
 */
async function fetchLatestLocalstackCliVersionFromGitHub() {
  /** @type {Record<string, string>} */
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'localstack-docs-build (https://docs.localstack.cloud)',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const maxAttempts = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (attempt > 1) {
        await new Promise((r) => setTimeout(r, 400 * attempt));
      }
      const response = await fetch(LOCALSTACK_CLI_RELEASE_API, { headers });
      const data = await response.json();

      if (response.ok) {
        const version = normalizeCliReleaseTag(data?.tag_name);
        if (version) return version;
        lastError = new Error('GitHub release response missing tag_name');
      } else {
        const msg =
          typeof data?.message === 'string'
            ? data.message
            : `HTTP ${response.status}`;
        lastError = new Error(msg);
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw (
    lastError ?? new Error('Failed to fetch localstack-cli release from GitHub')
  );
}

const cliVersionFromEnv = normalizeCliReleaseTag(
  process.env.LOCALSTACK_AWS_VERSION ?? '',
);

/** @type {string} */
let latestAWSVersion;

if (cliVersionFromEnv) {
  latestAWSVersion = cliVersionFromEnv;
} else {
  try {
    latestAWSVersion = await fetchLatestLocalstackCliVersionFromGitHub();
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(
      `[astro.config] Could not read localstack-cli version from GitHub (${reason}). ` +
        `Using pinned fallback ${LOCALSTACK_CLI_VERSION_FALLBACK}. ` +
        'Set LOCALSTACK_AWS_VERSION in the build, add GITHUB_TOKEN for higher API limits, or bump LOCALSTACK_CLI_VERSION_FALLBACK.',
    );
    latestAWSVersion = LOCALSTACK_CLI_VERSION_FALLBACK;
  }
}

/** @type {import('./types/astro-local-fonts').AstroLocalFontVariants} */
const aeonikProVariants = [
  {
    src: [
      './src/fonts/AeonikPro/AeonikPro-Regular.woff2',
      './src/fonts/AeonikPro/AeonikPro-Regular.woff',
    ],
    weight: 400,
    style: 'normal',
  },
  {
    src: [
      './src/fonts/AeonikPro/AeonikPro-RegularItalic.woff2',
      './src/fonts/AeonikPro/AeonikPro-RegularItalic.woff',
    ],
    weight: 400,
    style: 'italic',
  },
  {
    src: [
      './src/fonts/AeonikPro/AeonikPro-Medium.woff2',
      './src/fonts/AeonikPro/AeonikPro-Medium.woff',
    ],
    weight: 500,
    style: 'normal',
  },
  {
    src: [
      './src/fonts/AeonikPro/AeonikPro-MediumItalic.woff2',
      './src/fonts/AeonikPro/AeonikPro-MediumItalic.woff',
    ],
    weight: 500,
    style: 'italic',
  },
];

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.localstack.cloud',
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Aeonik Pro',
      cssVariable: '--font-aeonik-pro',
      fallbacks: ['sans-serif'],
      options: { variants: aeonikProVariants },
    },
    {
      provider: fontProviders.local(),
      name: 'Aeonik Fono',
      cssVariable: '--font-aeonik-fono',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          {
            src: [
              './src/fonts/AeonikFono/aeonikfonopro-regular.woff2',
              './src/fonts/AeonikFono/aeonikfonopro-regular.woff',
            ],
            weight: 400,
            style: 'normal',
          },
          {
            src: [
              './src/fonts/AeonikFono/aeonikfonopro-medium.woff2',
              './src/fonts/AeonikFono/aeonikfonopro-medium.woff',
            ],
            weight: 500,
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Aeonik Mono',
      cssVariable: '--font-aeonik-mono',
      fallbacks: ['ui-monospace', 'monospace'],
      options: {
        variants: [
          {
            src: [
              './src/fonts/AeonikMono/AeonikMono-Regular.woff2',
              './src/fonts/AeonikMono/AeonikMono-Regular.woff',
            ],
            weight: 400,
            style: 'normal',
          },
        ],
      },
    },
  ],
  env: {
    schema: {
      LOCALSTACK_AWS_VERSION: envField.string({
        context: 'server',
        access: 'public',
        default: latestAWSVersion,
        optional: true,
      }),
    },
  },

  integrations: [
    starlight({
      title: 'Docs',
      favicon: '/images/favicons/favicon.ico',
      routeMiddleware: './src/routeData.ts',
      customCss: ['./src/styles/global.css', './src/styles/custom.css'],
      editLink: {
        baseUrl: 'https://github.com/localstack/localstack-docs/edit/main/',
      },
      components: {
        Head: './src/components/StarlightHead.astro',
        PageTitle: './src/components/PageTitleWithCopyButton.astro',
        PageSidebar: './src/components/PageSidebarWithBadges.astro',
        LanguageSelect: './src/components/LanguageSelectWithGetStarted.astro',
        Banner: './src/components/BannerWithPersistentAnnouncement.astro',
        Footer: './src/components/FooterWithFeedback.astro',
      },
      expressiveCode: {
        themes: ['one-light', 'one-dark-pro'],
        styleOverrides: {
          codeFontFamily: 'var(--font-aeonik-mono), ui-monospace',
          borderRadius: '0.5rem',
        },
      },
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'sitemap',
            href: '/sitemap-index.xml',
          },
        },
        {
          tag: 'script',
          content: `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]); posthog.init('phc_6bea9iRqN9iwiwf5aM3dVXrKmAQGGMahouBRMIyQfnE', { api_host: 'https://us.i.posthog.com', person_profiles: 'always' });`,
        },
        {
          tag: 'script',
          attrs: {
            type: 'text/javascript',
            id: 'hs-script-loader',
            async: true,
            defer: true,
            src: '//js-eu1.hs-scripts.com/26596507.js',
          },
        },
        {
          tag: 'script',
          attrs: {
            type: 'text/javascript',
          },
          content: `!function(){var e,t,n;e="f528d4d390d322d",t=function(){Reo.init({clientID:"f528d4d390d322d"})},(n=document.createElement("script")).src="https://static.reo.dev/"+e+"/reo.js",n.defer=!0,n.onload=t,document.head.appendChild(n)}();`,
        },
        {
          tag: 'script',
          attrs: {
            type: 'text/javascript',
            id: 'icon-script-loader',
            // defer only: async would win and delay/unorder execution vs parse-complete
            defer: true,
            src: '/js/icon-loader.js',
          },
        },
        {
          tag: 'script',
          attrs: {
            src: 'https://crawlchat.app/embed.js',
            id: 'crawlchat-script',
            'data-id': '698f2c11e688991df3c7e020',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            href: '/images/favicons/favicon-32x32.png',
            sizes: '32x32',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            href: '/images/favicons/android-chrome-192x192.png',
            sizes: '192x192',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            href: '/images/favicons/android-chrome-512x512.png',
            sizes: '512x512',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            href: '/images/favicons/apple-touch-icon.png',
            sizes: '180x180',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            href: '/images/favicons/apple-touch-icon.png',
            sizes: '180x180',
          },
        },
      ],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/localstack/localstack',
        },
        {
          icon: 'slack',
          label: 'Slack',
          href: 'https://slack.localstack.cloud',
        },
        {
          icon: 'linkedin',
          label: 'LinkedIn',
          href: 'https://www.linkedin.com/company/localstack-cloud/',
        },
        {
          icon: 'youtube',
          label: 'YouTube',
          href: 'https://www.youtube.com/@localstack',
        },
      ],
      logo: {
        light: './src/assets/Docs_logo_Light.svg',
        dark: './src/assets/Docs_Logo_Dark.svg',
        alt: 'LocalStack Docs',
        replacesTitle: true,
      },
      plugins: [
        starlightLlmsTxt({
          projectName: 'LocalStack',
          description:
            'LocalStack is a cloud service emulator that runs in a single container on your laptop or in your CI environment. It provides an easy-to-use test/mocking framework for developing cloud applications, with support for AWS services, Snowflake, and Azure.',
          customSets: [
            {
              label: 'AWS',
              description: 'Documentation for LocalStack AWS emulation',
              paths: ['aws/**'],
            },
            {
              label: 'Snowflake',
              description: 'Documentation for LocalStack Snowflake emulation',
              paths: ['snowflake/**'],
            },
            {
              label: 'Azure',
              description: 'Documentation for LocalStack Azure emulation',
              paths: ['azure/**'],
            },
          ],
          exclude: ['aws/changelog', 'snowflake/changelog', 'azure/changelog'],
          rawContent: true,
        }),
        starlightImageZoom({
          showCaptions: true,
        }),
        starlightFullViewMode({
          leftSidebarEnabled: false,
        }),
        starlightLinksValidator({
          errorOnRelativeLinks: true,
          errorOnLocalLinks: false, // Allow localhost links in tutorials (they're instructional)
          errorOnInvalidHashes: true,
        }),
        starlightUtils({
          multiSidebar: {
            switcherStyle: 'dropdown',
          },
        }),
        starlightDocSearch({
          clientOptionsModule: './src/config/docsearch.ts',
        }),
      ],
      sidebar: [
        {
          label: 'AWS',
          collapsed: true,
          items: [
            {
              label: 'Welcome',
              slug: 'aws',
            },
            {
              label: 'Getting Started',
              collapsed: true,
              items: [{ autogenerate: { directory: '/aws/getting-started' } }],
            },
            {
              label: 'Local AWS Services',
              slug: 'aws/services',
            },
            {
              label: 'Sample Apps',
              slug: 'aws/sample-apps',
            },
            {
              label: 'Connecting',
              collapsed: true,
              items: [
                {
                  label: 'Overview',
                  slug: 'aws/connecting',
                },
                {
                  label: 'AWS CLI',
                  slug: 'aws/connecting/aws-cli',
                },
                {
                  label: 'AWS SDKs',
                  collapsed: true,
                  items: [
                    {
                      autogenerate: {
                        directory: '/aws/connecting/aws-sdks',
                      },
                    },
                  ],
                },
                {
                  label: 'Infrastructure as Code',
                  collapsed: true,
                  items: [
                    {
                      autogenerate: {
                        directory: '/aws/connecting/infrastructure-as-code',
                      },
                    },
                  ],
                },
                {
                  label: 'LocalStack Console',
                  collapsed: true,
                  items: [
                    {
                      autogenerate: {
                        directory: '/aws/connecting/console',
                      },
                    },
                  ],
                },
                {
                  label: 'IDE Extensions',
                  collapsed: true,
                  items: [
                    {
                      autogenerate: {
                        directory: '/aws/connecting/ides',
                      },
                    },
                  ],
                },
              ],
            },
            {
              label: 'Capabilities',
              collapsed: true,
              items: [
                {
                  label: 'Overview',
                  slug: 'aws/capabilities',
                },
                {
                  label: 'LocalStack Web App',
                  collapsed: true,
                  items: [
                    {
                      autogenerate: {
                        directory: '/aws/capabilities/web-app',
                      },
                    },
                  ],
                },
                {
                  label: 'Config',
                  collapsed: true,
                  items: [
                    {
                      autogenerate: {
                        directory: '/aws/capabilities/config',
                      },
                    },
                  ],
                },
                {
                  label: 'Cloud Sandbox',
                  collapsed: true,
                  items: [
                    {
                      autogenerate: {
                        directory: '/aws/capabilities/cloud-sandbox',
                      },
                    },
                  ],
                },
                {
                  label: 'Networking',
                  collapsed: true,
                  items: [
                    {
                      autogenerate: {
                        directory: '/aws/capabilities/networking',
                      },
                    },
                  ],
                },
                {
                  label: 'State Management',
                  collapsed: true,
                  items: [
                    {
                      autogenerate: {
                        directory: '/aws/capabilities/state-management',
                      },
                    },
                  ],
                },
                {
                  label: 'Chaos Engineering',
                  collapsed: true,
                  items: [
                    {
                      autogenerate: {
                        directory: '/aws/capabilities/chaos-engineering',
                      },
                    },
                  ],
                },
                {
                  label: 'Security Testing',
                  collapsed: true,
                  items: [
                    {
                      autogenerate: {
                        directory: '/aws/capabilities/security-testing',
                      },
                    },
                  ],
                },
              ],
            },
            {
              label: 'Tooling',
              collapsed: true,
              items: [
                {
                  label: 'Overview',
                  slug: 'aws/tooling',
                },
                {
                  label: 'LocalStack CLI',
                  slug: 'aws/tooling/localstack-cli',
                },
                {
                  label: 'LocalStack MCP Server',
                  slug: 'aws/tooling/mcp-server',
                },
                {
                  label: 'lstk',
                  slug: 'aws/tooling/lstk',
                },
                {
                  label: 'LocalStack SDKs',
                  collapsed: true,
                  items: [
                    {
                      autogenerate: {
                        directory: '/aws/tooling/localstack-sdks',
                      },
                    },
                  ],
                },
                {
                  label: 'Extensions',
                  items: [
                    {
                      autogenerate: {
                        directory: '/aws/tooling/extensions',
                      },
                    },
                    {
                      label: 'Official Extensions',
                      link: 'https://app.localstack.cloud/extensions/library/',
                    },
                  ],
                  collapsed: true,
                },
                {
                  label: 'Lambda Tools',
                  collapsed: true,
                  items: [
                    {
                      autogenerate: {
                        directory: '/aws/tooling/lambda-tools',
                      },
                    },
                  ],
                },
                {
                  label: 'AWS Replicator',
                  slug: 'aws/tooling/aws-replicator',
                },
                {
                  label: 'DNS Server',
                  slug: 'aws/tooling/dns-server',
                },
                {
                  label: 'Testing Utils',
                  slug: 'aws/tooling/testing-utils',
                },
                {
                  label: 'LocalStack Docker Extension',
                  slug: 'aws/tooling/localstack-docker-extension',
                },
                {
                  label: 'LocalSurf',
                  slug: 'aws/tooling/localsurf',
                },
              ],
            },
            {
              label: 'Integrations',
              collapsed: true,
              items: [
                {
                  label: 'Overview',
                  slug: 'aws/integrations',
                },
                {
                  label: 'Continuous Integration',
                  collapsed: true,
                  items: [
                    {
                      autogenerate: {
                        directory: '/aws/integrations/continuous-integration',
                      },
                    },
                  ],
                },
                {
                  label: 'Containers',
                  collapsed: true,
                  items: [
                    {
                      autogenerate: {
                        directory: '/aws/integrations/containers',
                      },
                    },
                  ],
                },
                {
                  label: 'App Frameworks',
                  collapsed: true,
                  items: [
                    {
                      autogenerate: {
                        directory: '/aws/integrations/app-frameworks',
                      },
                    },
                  ],
                },
                {
                  label: 'Messaging',
                  collapsed: true,
                  items: [
                    {
                      autogenerate: {
                        directory: '/aws/integrations/messaging',
                      },
                    },
                  ],
                },
                {
                  label: 'Testing',
                  collapsed: true,
                  items: [
                    {
                      autogenerate: {
                        directory: '/aws/integrations/testing',
                      },
                    },
                  ],
                },
              ],
            },
            {
              label: 'Enterprise',
              collapsed: true,
              items: [
                {
                  label: 'Overview',
                  slug: 'aws/enterprise',
                },
                {
                  label: 'Kubernetes',
                  collapsed: true,
                  items: [
                    {
                      autogenerate: { directory: '/aws/enterprise/kubernetes' },
                    },
                  ],
                },
                {
                  label: 'Single Sign-On',
                  items: [
                    { autogenerate: { directory: '/aws/enterprise/sso' } },
                  ],
                },
                {
                  label: 'Enterprise Image',
                  slug: 'aws/enterprise/enterprise-image',
                },
              ],
            },
            {
              label: 'Tutorials',
              slug: 'aws/tutorials',
            },
            {
              label: 'Changelog',
              slug: 'aws/changelog',
            },
            {
              label: 'Licensing & Tiers',
              slug: 'aws/licensing',
            },
            {
              label: 'Help & Support',
              collapsed: true,
              items: [{ autogenerate: { directory: '/aws/help-support' } }],
            },
          ],
        },
        {
          label: 'Snowflake',
          collapsed: true,
          items: [
            {
              label: 'Welcome',
              slug: 'snowflake',
            },
            {
              label: 'Getting Started',
              collapsed: true,
              items: [
                { autogenerate: { directory: '/snowflake/getting-started' } },
              ],
            },
            {
              label: 'Features',
              slug: 'snowflake/features',
            },
            {
              label: 'Sample Apps',
              slug: 'snowflake/sample-apps',
            },
            {
              label: 'Capabilities',
              collapsed: true,
              items: [
                { autogenerate: { directory: '/snowflake/capabilities' } },
              ],
            },
            {
              label: 'Tooling',
              collapsed: true,
              items: [{ autogenerate: { directory: '/snowflake/tooling' } }],
            },
            {
              label: 'Integrations',
              collapsed: true,
              items: [
                { autogenerate: { directory: '/snowflake/integrations' } },
              ],
            },
            {
              label: 'Tutorials',
              collapsed: true,
              items: [{ autogenerate: { directory: '/snowflake/tutorials' } }],
            },
            {
              label: 'Feature Coverage',
              slug: 'snowflake/feature-coverage',
            },
            {
              label: 'SQL Functions',
              slug: 'snowflake/sql-functions',
            },
            {
              label: 'Changelog',
              slug: 'snowflake/changelog',
            },
            {
              label: 'Help & Support',
              collapsed: true,
              items: [
                { autogenerate: { directory: '/snowflake/help-support' } },
              ],
            },
          ],
        },
        {
          label: 'Azure',
          collapsed: true,
          items: [
            {
              label: 'Welcome',
              slug: 'azure',
            },
            {
              label: 'Getting Started',
              collapsed: true,
              items: [{ autogenerate: { directory: 'azure/getting-started' } }],
            },
            {
              label: 'Local Azure Services',
              slug: 'azure/services',
            },
            {
              label: 'Integrations',
              collapsed: true,
              items: [{ autogenerate: { directory: 'azure/integrations' } }],
            },
            {
              label: 'Changelog',
              slug: 'azure/changelog',
            },
          ],
        },
      ],
    }),
    markdoc(),
    react(),
    sitemap(),
  ],

  vite: {
    // @tailwindcss/vite types `Plugin` against the hoisted `vite` package; Astro types `plugins`
    // against its bundled copy. They are runtime-compatible.
    plugins: [/** @type {any} */ (tailwindcss())],
  },

  // Static site (SSG): deploy the `dist/` folder to any static host (e.g. Cloudflare Pages
  // with build output directory `dist`). Agent discovery uses `public/_headers` and
  // `public/.well-known/` — no Worker or middleware required.
});
