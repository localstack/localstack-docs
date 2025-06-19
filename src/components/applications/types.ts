export interface Application {
  title: string;
  description: string;
  url: string;
  teaser: string;
  services: string[];
  deployment: string[];
  platform: string[];
  tags: string[];
  complexity: string[];
  pro: boolean;
  cloudPods: boolean;
}

export interface FilterState {
  services: string[];
  platforms: string[];
  deployments: string[];
  complexities: string[];
  showProOnly: boolean;
} 