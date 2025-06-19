import React, { useState, useMemo } from 'react';

interface Application {
  title: string;
  description: string;
  url: string;
  teaser: string;
  services: string[];
  platform: string[];
  deployment: string[];
  tags: string[];
  complexity: string[];
  pro: boolean;
  cloudPods: boolean;
}

interface FilterState {
  services: string[];
  platforms: string[];
  deployments: string[];
  complexities: string[];
  showProOnly: boolean;
}

interface ApplicationsShowcaseProps {
  applications: Application[];
  services: Record<string, string>;
  platforms: Record<string, string>;
  deployments: Record<string, string>;
  complexities: { data: Record<string, string>; order: string[] };
}

const ApplicationCard: React.FC<{ 
  app: Application; 
  services: Record<string, string>;
  platforms: Record<string, string>;
  deployments: Record<string, string>;
}> = ({ app, services, platforms, deployments }) => {
  return (
    <div className="app-card">
      <div className="card-image">
        <img src={app.teaser} alt={app.title} loading="lazy" />
        <div className="card-badges">
          {app.pro && <span className="pro-badge">Pro</span>}
          <span className="complexity-badge">{app.complexity[0]}</span>
        </div>
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{app.title}</h3>
        <p className="card-description">{app.description}</p>
        
        <div className="card-footer">
          <div className="service-icons">
            {app.services.slice(0, 10).map((serviceCode) => (
              <div key={serviceCode} className="service-icon" title={services[serviceCode] || serviceCode}>
                <img
                  src={`/images/aws/${serviceCode}.svg`}
                  alt={services[serviceCode] || serviceCode}
                />
              </div>
            ))}
            {app.services.length > 10 && (
              <div className="service-more">+{app.services.length - 10}</div>
            )}
          </div>
          
          <a 
            href={app.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="card-link"
          >
            View Project →
          </a>
        </div>
      </div>
    </div>
  );
};

export const ApplicationsShowcase: React.FC<ApplicationsShowcaseProps> = ({
  applications,
  services,
  platforms,
  deployments,
  complexities,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    services: [],
    platforms: [],
    deployments: [],
    complexities: [],
    showProOnly: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'complexity'>('title');

  // Get unique values for filters
  const uniqueServices = useMemo(() => {
    const allServices = new Set(applications.flatMap(app => app.services));
    return Array.from(allServices).sort((a, b) => (services[a] || a).localeCompare(services[b] || b));
  }, [applications, services]);

  const uniquePlatforms = useMemo(() => {
    const allPlatforms = new Set(applications.flatMap(app => app.platform));
    return Array.from(allPlatforms).sort((a, b) => (platforms[a] || a).localeCompare(platforms[b] || b));
  }, [applications, platforms]);

  const uniqueDeployments = useMemo(() => {
    const allDeployments = new Set(applications.flatMap(app => app.deployment));
    return Array.from(allDeployments).sort((a, b) => (deployments[a] || a).localeCompare(deployments[b] || b));
  }, [applications, deployments]);

  const uniqueComplexities = useMemo(() => {
    const allComplexities = new Set(applications.flatMap(app => app.complexity));
    return complexities.order.filter(complexity => allComplexities.has(complexity));
  }, [applications, complexities.order]);

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    let filtered = applications.filter(app => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          app.title.toLowerCase().includes(searchLower) ||
          app.description.toLowerCase().includes(searchLower) ||
          app.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
          app.services.some(service => (services[service] || service).toLowerCase().includes(searchLower)) ||
          app.platform.some(platform => (platforms[platform] || platform).toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Other filters
      if (filters.services.length > 0 && !filters.services.some(service => app.services.includes(service))) return false;
      if (filters.platforms.length > 0 && !filters.platforms.some(platform => app.platform.includes(platform))) return false;
      if (filters.deployments.length > 0 && !filters.deployments.some(deployment => app.deployment.includes(deployment))) return false;
      if (filters.complexities.length > 0 && !filters.complexities.some(complexity => app.complexity.includes(complexity))) return false;
      if (filters.showProOnly && !app.pro) return false;

      return true;
    });

    // Sort applications
    return filtered.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else {
        const complexityOrder = { basic: 0, intermediate: 1, advanced: 2 };
        const aComplexity = complexityOrder[a.complexity[0] as keyof typeof complexityOrder] ?? 1;
        const bComplexity = complexityOrder[b.complexity[0] as keyof typeof complexityOrder] ?? 1;
        return aComplexity - bComplexity;
      }
    });
  }, [applications, filters, searchTerm, sortBy, services, platforms]);

  const toggleFilter = (filterType: keyof FilterState, item: string) => {
    if (filterType === 'showProOnly') return;
    
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(item)
        ? prev[filterType].filter(i => i !== item)
        : [...prev[filterType], item]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      services: [],
      platforms: [],
      deployments: [],
      complexities: [],
      showProOnly: false,
    });
    setSearchTerm('');
  };

  const hasActiveFilters = filters.services.length > 0 || 
    filters.platforms.length > 0 || 
    filters.deployments.length > 0 || 
    filters.complexities.length > 0 || 
    filters.showProOnly || 
    searchTerm.length > 0;

  return (
    <div className="applications-showcase">
      <div className="top-bar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="search-clear">
              ×
            </button>
          )}
        </div>
        
        <select 
          value={filters.services[0] || ''} 
          onChange={(e) => e.target.value ? toggleFilter('services', e.target.value) : null}
          className="filter-select"
        >
          <option value="">All Services</option>
          {uniqueServices.map((service) => (
            <option key={service} value={service}>
              {services[service] || service}
            </option>
          ))}
        </select>

        <select 
          value={filters.platforms[0] || ''} 
          onChange={(e) => e.target.value ? toggleFilter('platforms', e.target.value) : null}
          className="filter-select"
        >
          <option value="">All Languages</option>
          {uniquePlatforms.map((platform) => (
            <option key={platform} value={platform}>
              {platforms[platform] || platform}
            </option>
          ))}
        </select>

        <select 
          value={filters.deployments[0] || ''} 
          onChange={(e) => e.target.value ? toggleFilter('deployments', e.target.value) : null}
          className="filter-select"
        >
          <option value="">All Deployment</option>
          {uniqueDeployments.map((deployment) => (
            <option key={deployment} value={deployment}>
              {deployments[deployment] || deployment}
            </option>
          ))}
        </select>

        <select 
          value={filters.complexities[0] || ''} 
          onChange={(e) => e.target.value ? toggleFilter('complexities', e.target.value) : null}
          className="filter-select"
        >
          <option value="">All Complexity</option>
          {uniqueComplexities.map((complexity) => (
            <option key={complexity} value={complexity}>
              {complexities.data[complexity] || complexity}
            </option>
          ))}
        </select>

        <label className="pro-toggle">
          <input
            type="checkbox"
            checked={filters.showProOnly}
            onChange={(e) => setFilters(prev => ({ ...prev, showProOnly: e.target.checked }))}
          />
          Pro Only
        </label>
        
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value as 'title' | 'complexity')}
          className="sort-select"
        >
          <option value="title">A-Z</option>
          <option value="complexity">By Complexity</option>
        </select>

        {hasActiveFilters && (
          <button onClick={clearAllFilters} className="clear-filters">
            Clear
          </button>
        )}
      </div>

      <div className="results-info">
        {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
      </div>

      <div className="applications-grid">
        {filteredApplications.map((app, index) => (
          <ApplicationCard
            key={`${app.title}-${index}`}
            app={app}
            services={services}
            platforms={platforms}
            deployments={deployments}
          />
        ))}
        
        {filteredApplications.length === 0 && (
          <div className="no-results">
            <h3>No applications found</h3>
            <p>Try adjusting your search or filters.</p>
            <button onClick={clearAllFilters} className="reset-button">
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 