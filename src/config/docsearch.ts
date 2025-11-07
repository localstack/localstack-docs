import type { DocSearchClientOptions } from '@astrojs/starlight-docsearch';

export default {
  appId: 'XBW1JU7CW5',
  apiKey: '6b0341e2f50196d328d088dbb5cd6166',
  indexName: 'localstack',
  searchParameters: {
    facets: ['lvl0'],
  },
  transformSearchClient(searchClient) {
    return {
      ...searchClient,
      search(requests: any) {
        // Get the current pathname at runtime
        const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
        
        // Determine the boost filter based on pathname
        let boostFilter: string | null = null;
        if (pathname.startsWith('/aws/')) {
          boostFilter = "hierarchy.lvl0:LocalStack for AWS";
        } else if (pathname.startsWith('/snowflake/')) {
          boostFilter = "hierarchy.lvl0:LocalStack for Snowflake";
        }

        if (!boostFilter) {
          return searchClient.search(requests);
        }

        if (!requests || typeof requests !== 'object' || !Array.isArray(requests.requests)) {
          return searchClient.search(requests);
        }

        const transformedRequests = {
          ...requests,
          requests: requests.requests.map((request: any) => ({
            ...request,
            optionalFilters: [boostFilter],
            sumOrFiltersScores: true,
          })),
        };

        return searchClient.search(transformedRequests);
      },
    };
  },
} satisfies DocSearchClientOptions;