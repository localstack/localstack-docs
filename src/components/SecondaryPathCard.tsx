import React from 'react';

interface SecondaryPathCardProps {
  title: string;
  href: string;
  children: React.ReactNode;
}

export const SecondaryPathCard: React.FC<SecondaryPathCardProps> = ({ title, href, children }) => {
  return (
    <div className="path-secondary-card">
      <a href={href} className="service-box">
        <div className="service-box-content">
          <h3 className="service-box-title path-secondary-card__title">{title}</h3>
          <div className="service-box-description path-secondary-card__body">{children}</div>
        </div>
      </a>
    </div>
  );
};
