import React from 'react';
import { ServiceBox } from './ServiceBox.tsx';

interface Section {
  title: string;
  description: string;
  href: string;
}

interface SectionCardsProps {
  sections: Section[];
  title?: string;
}

export const SectionCards: React.FC<SectionCardsProps> = ({ 
  sections, 
  title 
}) => {
  return (
    <div className="searchable-services">
      {title && <h2 className="section-cards-title">{title}</h2>}
      
      <div className="service-grid">
        {sections.map((section, index) => (
          <ServiceBox 
            key={`${section.href}-${index}`}
            title={section.title}
            description={section.description}
            href={section.href}
          />
        ))}
      </div>
    </div>
  );
}; 