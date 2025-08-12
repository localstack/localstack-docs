export interface Application {
  name: string;
  description: string;
  githubUrl: string;
  teaser: string;
  services: string[];
  integrations: string[];
  useCases: string[];
}

export interface FilterState {
  services: string[];
  useCases: string[];
  integrations: string[];
} 