// @ts-check
import { defineConfig, envField } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightUtils from '@lorenzo_lewis/starlight-utils';
import starlightDocSearch from '@astrojs/starlight-docsearch';
import starlightLinksValidator from 'starlight-links-validator';
import starlightImageZoom from 'starlight-image-zoom';
import sitemap from '@astrojs/sitemap';
import starlightFullViewMode from 'starlight-fullview-mode';
import starlightTocOverviewCustomizer from 'starlight-toc-overview-customizer';

import markdoc from '@astrojs/markdoc';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// Fetch the latest release version from GitHub
const response = await fetch(
  'https://api.github.com/repos/localstack/localstack/releases/latest',
  {
    headers: { Accept: 'application/vnd.github+json' },
  }
);
const data = await response.json();
const latestVersion = data.tag_name.replace('v', '');

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.localstack.cloud',
  env: {
    schema: {
      LOCALSTACK_VERSION: envField.string({
        context: 'server',
        access: 'public',
        default: latestVersion,
        optional: true,
      }),
    },
  },

  integrations: [
    starlight({
      title: 'Docs',
      favicon: '/images/favicons/favicon.ico',
      customCss: ['./src/styles/global.css'],
      editLink: {
        baseUrl: 'https://github.com/localstack/localstack-docs/edit/master/',
      },
      components: {
        PageTitle: './src/components/PageTitleWithBadges.astro',
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
            async: true,
            src: 'https://widget.kapa.ai/kapa-widget.bundle.js',
            'data-website-id': '3dfbd0ac-9e56-4664-8315-032e17917ab6',
            'data-project-name': 'LocalStack',
            'data-project-color': '#281763',
            'data-project-logo':
              'https://avatars.githubusercontent.com/u/28732122?s=280&v=4',
            'data-user-analytics-fingerprint-enabled': 'true',
            'data-modal-disclaimer':
              'This is a custom LocalStack LLM to help you find the information you need by searching across all LocalStack documentation. Give it a try and let us know what you think!',
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
        light: './src/assets/Logo_Light.svg',
        dark: './src/assets/Logo_Dark.svg',
        alt: 'LocalStack',
      },
      plugins: [
        starlightImageZoom({
          showCaptions: true,
        }),
        starlightTocOverviewCustomizer({
          overviewTitle: 'Back to top',
        }),
        starlightFullViewMode({
          leftSidebarEnabled: false,
        }),
        starlightLinksValidator({
          errorOnRelativeLinks: false,
          errorOnLocalLinks: false,
        }),
        starlightUtils({
          multiSidebar: {
            switcherStyle: 'dropdown',
          },
        }),
        starlightDocSearch({
          appId: 'XBW1JU7CW5',
          apiKey: '6b0341e2f50196d328d088dbb5cd6166',
          indexName: 'localstack',
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
              autogenerate: { directory: '/aws/getting-started' },
              collapsed: true,
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
              label: 'Capabilities',
              collapsed: true,
              items: [
                {
                  label: 'Overview',
                  slug: 'aws/capabilities',
                },
                {
                  label: 'LocalStack Web App',
                  autogenerate: {
                    directory: '/aws/capabilities/web-app',
                  },
                  collapsed: true,
                },
                {
                  label: 'Config',
                  autogenerate: {
                    directory: '/aws/capabilities/config',
                  },
                  collapsed: true,
                },
                {
                  label: 'Cloud Sandbox',
                  autogenerate: {
                    directory: '/aws/capabilities/cloud-sandbox',
                  },
                  collapsed: true,
                },
                {
                  label: 'Networking',
                  autogenerate: {
                    directory: '/aws/capabilities/networking',
                  },
                  collapsed: true,
                },
                {
                  label: 'State Management',
                  autogenerate: {
                    directory: '/aws/capabilities/state-management',
                  },
                  collapsed: true,
                },
                {
                  label: 'Chaos Engineering',
                  autogenerate: {
                    directory: '/aws/capabilities/chaos-engineering',
                  },
                  collapsed: true,
                },
                {
                  label: 'Security Testing',
                  autogenerate: {
                    directory: '/aws/capabilities/security-testing',
                  },
                  collapsed: true,
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
                  label: 'LocalStack SDKs',
                  autogenerate: {
                    directory: '/aws/tooling/localstack-sdks',
                  },
                  collapsed: true,
                },
                {
                  label: 'Extensions',
                  items: [
                    {
                      label: 'Overview',
                      slug: 'aws/tooling/extensions',
                    },
                    {
                      label: 'Managing Extensions',
                      slug: 'aws/tooling/extensions/managing-extensions',
                    },
                    {
                      label: 'Developing Extensions',
                      slug: 'aws/tooling/extensions/developing-extensions',
                    },
                    {
                      label: 'Extensions Library',
                      slug: 'aws/tooling/extensions/extensions-library',
                    },
                    {
                      label: 'Official Extensions',
                      link: 'https://app.localstack.cloud/extensions/library/',
                    },
                  ],
                  collapsed: true,
                },
                {
                  label: 'Testing Utils',
                  slug: 'aws/tooling/testing-utils',
                },
                {
                  label: 'LocalSurf',
                  slug: 'aws/tooling/localsurf',
                },
                {
                  label: 'AWS Replicator',
                  slug: 'aws/tooling/aws-replicator',
                },
                {
                  label: 'Event Studio',
                  slug: 'aws/tooling/event-studio',
                },
                {
                  label: 'DNS Server',
                  slug: 'aws/tooling/dns-server',
                },
                {
                  label: 'LocalStack Docker Extension',
                  slug: 'aws/tooling/localstack-docker-extension',
                },
                {
                  label: 'Lambda Tools',
                  autogenerate: {
                    directory: '/aws/tooling/lambda-tools',
                  },
                  collapsed: true,
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
                  autogenerate: {
                    directory: '/aws/integrations/continuous-integration',
                  },
                  collapsed: true,
                },
                {
                  label: 'AWS SDKs',
                  autogenerate: {
                    directory: '/aws/integrations/aws-sdks',
                  },
                  collapsed: true,
                },
                {
                  label: 'AWS Native Tools',
                  autogenerate: {
                    directory: '/aws/integrations/aws-native-tools',
                  },
                  collapsed: true,
                },
                {
                  label: 'Infrastructure as Code',
                  autogenerate: {
                    directory: '/aws/integrations/infrastructure-as-code',
                  },
                  collapsed: true,
                },
                {
                  label: 'Containers',
                  autogenerate: {
                    directory: '/aws/integrations/containers',
                  },
                  collapsed: true,
                },
                {
                  label: 'App Frameworks',
                  autogenerate: {
                    directory: '/aws/integrations/app-frameworks',
                  },
                  collapsed: true,
                },
                {
                  label: 'Messaging',
                  autogenerate: {
                    directory: '/aws/integrations/messaging',
                  },
                  collapsed: true,
                },
                {
                  label: 'Testing',
                  autogenerate: {
                    directory: '/aws/integrations/testing',
                  },
                  collapsed: true,
                },
              ],
            },
            {
              label: 'Enterprise',
              autogenerate: { directory: '/aws/enterprise' },
              collapsed: true,
            },
            {
              label: 'Tutorials',
              slug: 'aws/tutorials',
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
              autogenerate: { directory: '/snowflake/getting-started' },
              collapsed: true,
            },
            {
              label: 'Features',
              collapsed: true,
              autogenerate: { directory: '/snowflake/features' },
            },
            {
              label: 'Capabilities',
              collapsed: true,
              autogenerate: { directory: '/snowflake/capabilities' },
            },
            {
              label: 'Tooling',
              collapsed: true,
              autogenerate: { directory: '/snowflake/tooling' },
            },
            {
              label: 'Integrations',
              collapsed: true,
              autogenerate: { directory: '/snowflake/integrations' },
            },
            {
              label: 'Tutorials',
              collapsed: true,
              autogenerate: { directory: '/snowflake/tutorials' },
            },
            {
              label: 'SQL Functions',
              slug: 'snowflake/sql-functions',
            },
            {
              label: 'Changelog',
              slug: 'snowflake/changelog',
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
    plugins: [tailwindcss()],
  },
});
