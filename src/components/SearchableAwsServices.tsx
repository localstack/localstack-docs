import React, { useState, useMemo } from 'react';
import { ServiceBox } from './ServiceBox.tsx';

interface Service {
  title: string;
  description: string;
  href: string;
}

interface SearchableAwsServicesProps {
  services: Service[];
}

export const SearchableAwsServices: React.FC<SearchableAwsServicesProps> = ({ services }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) {
      return services;
    }

    const lowercaseSearch = searchTerm.toLowerCase();
    return services.filter(service => 
      service.title.toLowerCase().includes(lowercaseSearch) ||
      service.description.toLowerCase().includes(lowercaseSearch)
    );
  }, [services, searchTerm]);

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
            placeholder="Search for Service Name ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {filteredServices.length === 0 && searchTerm.trim() ? (
        <div className="no-results">
          <p>No services found matching "{searchTerm}"</p>
        </div>
      ) : (
        <div className="service-grid">
          {filteredServices.map((service, index) => (
            <ServiceBox 
              key={`${service.href}-${index}`}
              title={service.title}
              description={service.description}
              href={service.href}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 