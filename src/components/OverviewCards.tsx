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

interface HeroCardProps {
  title: string;
  href?: string;
}

const HeroCard: React.FC<HeroCardProps> = ({ title, href = "" }) => {
  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    padding: '2rem',
    borderRadius: '0.75rem',
    background: ' #654fec',
    color: 'white',
    textDecoration: 'none',
    fontSize: '1.5rem',
    fontWeight: '600',
    textAlign: 'center' as const,
    transition: 'transform 0.2s ease',
    cursor: href ? 'pointer' : 'default'
  };

  const hoverStyle = {
    ':hover': {
      transform: href ? 'scale(1.02)' : 'none'
    }
  };

  if (href) {
    return (
      <a href={href} style={cardStyle}>
        {title}
      </a>
    );
  }

  return (
    <div style={cardStyle}>
      {title}
    </div>
  );
};

interface HeroCardsProps {
  cards: HeroCardProps[];
}

export const HeroCards: React.FC<HeroCardsProps> = ({ cards }) => {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: '2rem', 
      marginBottom: '3rem' 
    }}>
      {cards.map((card, index) => (
        <HeroCard key={index} {...card} />
      ))}
    </div>
  );
}; 