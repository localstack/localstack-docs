import React, { useState, useMemo } from 'react';
import { ServiceBox } from './ServiceBox.tsx';

interface Feature {
  title: string;
  description: string;
  href: string;
}

interface SearchableSnowflakeFeaturesProps {
  features: Feature[];
}

export const SearchableSnowflakeFeatures: React.FC<SearchableSnowflakeFeaturesProps> = ({ features }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFeatures = useMemo(() => {
    if (!searchTerm.trim()) {
      return features;
    }

    const lowercaseSearch = searchTerm.toLowerCase();
    return features.filter(feature => 
      feature.title.toLowerCase().includes(lowercaseSearch) ||
      feature.description.toLowerCase().includes(lowercaseSearch)
    );
  }, [features, searchTerm]);

  return (
    <div className="searchable-services">
      <div className="search-container">
        <div className="search-input-wrapper">
          <svg 
            className="search-icon" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
          <input
            type="text"
            placeholder="Search for Snowflake Feature ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {filteredFeatures.length === 0 && searchTerm.trim() ? (
        <div className="no-results">
          <p>No features found matching "{searchTerm}"</p>
        </div>
      ) : (
        <div className="service-grid">
          {filteredFeatures.map((feature, index) => (
            <ServiceBox 
              key={`${feature.href}-${index}`}
              title={feature.title}
              description={feature.description}
              href={feature.href}
            />
          ))}
        </div>
      )}
    </div>
  );
};
