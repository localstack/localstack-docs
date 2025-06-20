import React from 'react';

interface OverviewCardProps {
  title: string;
  description: string | React.ReactNode;
  href: string;
  icon: string;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ title, description, href, icon }) => {
  return (
    <a href={href} className="service-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <img src={icon} alt={`${title} icon`} width={40} height={40} style={{ marginBottom: '1rem' }} />
      <div className="service-box-content">
        <div className="service-box-title">{title}</div>
        <div className="service-box-description">{description}</div>
      </div>
    </a>
  );
};

interface OverviewCardsProps {
  cards: OverviewCardProps[];
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ cards }) => {
  return (
    <div className="service-grid">
      {cards.map((card, index) => (
        <OverviewCard key={index} {...card} />
      ))}
    </div>
  );
}; 