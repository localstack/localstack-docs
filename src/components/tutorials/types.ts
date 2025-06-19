export interface Tutorial {
  title: string;
  description: string;
  slug: string;
  leadimage?: string;
  services: string[];
  deployment: string[];
  platform: string[];
  pro: boolean;
}

export interface TutorialFilterState {
  services: string[];
  platforms: string[];
  deployments: string[];
  showProOnly: boolean;
} 