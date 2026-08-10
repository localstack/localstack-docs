import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({ 
		loader: docsLoader(), 
		schema: docsSchema({
			extend: z.object({
				services: z.array(z.string()).optional(),
				platform: z.array(z.string()).optional(),
				deployment: z.array(z.string()).optional(),
				pro: z.boolean().optional(),
				leadimage: z.string().optional(),
				tags: z.array(z.string()).optional(),
				persistence: z.string().optional(),
				hideCopyPage: z.boolean().optional(),
				// Azure resource provider namespace (e.g. "Microsoft.Network").
				// Drives the provider-grouped view on /azure/services and the
				// Azure breadcrumb trail. Data-plane namespaces are folded into
				// their real ARM parent by src/data/azure-providers.ts.
				resourceProvider: z.string().optional(),
				// Full ARM resource type, e.g. "Microsoft.Storage/storageAccounts".
				// Shown under the title in the flat services view. Values are the
				// canonical ones from `az provider list` — note that Azure Monitor's
				// namespace really is lowercase (`microsoft.insights`).
				resourceType: z.string().optional(),
			}),
		}),
	}),
};
