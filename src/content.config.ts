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
			}),
		}),
	}),
};
