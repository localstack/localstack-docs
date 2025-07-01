import React from 'react';

interface ProductCardProps {
  title: string;
  description: string;
  primaryHref: string;
  primaryText: string;
  secondaryButtons: Array<{
    text: string;
    href: string;
  }>;
  mainColor: string;
  bgColor: string;
  borderColor: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  description,
  primaryHref,
  primaryText,
  secondaryButtons,
  mainColor,
  bgColor,
  borderColor,
}) => {
  return (
    <div
      style={{
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        borderRadius: '16px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        minWidth: 0,
        height: '100%',
        marginTop: '0',
      }}
    >
      <h3
        style={{
          color: mainColor,
          fontWeight: 700,
          fontSize: '2rem',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: '#444',
          fontSize: '1.1rem',
          marginBottom: '2rem',
        }}
      >
        {description}
      </p>
      <a
        href={primaryHref}
        style={{
          display: 'block',
          width: '100%',
          background: mainColor,
          color: '#fff',
          fontWeight: 700,
          fontSize: '1.1rem',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem 0',
          textAlign: 'center',
          marginBottom: '1rem',
          textDecoration: 'none',
          transition: 'background 0.2s',
        }}
      >
        {primaryText}
      </a>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
        }}
      >
        {secondaryButtons.map((button, idx) => (
          <a
            key={idx}
            href={button.href}
            style={{
              flex: 1,
              display: 'block',
              background: '#fff',
              color: mainColor,
              border: `1.5px solid ${mainColor}`,
              borderRadius: '8px',
              padding: '0.6rem 0',
              textAlign: 'center',
              fontWeight: 500,
              fontSize: '1rem',
              textDecoration: 'none',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {button.text}
          </a>
        ))}
      </div>
    </div>
  );
};

export function ProductCards() {
  const cards: ProductCardProps[] = [
    {
      title: 'LocalStack for AWS Docs',
      description: "Run your AWS services locally to emulate cloud, serverless, and AI applications, without touching your live AWS instance.",
      primaryHref: '/aws',
      primaryText: 'Explore the Docs',
      secondaryButtons: [
        { text: 'Getting Started', href: '/aws/getting-started/' },
        { text: 'Local AWS Services', href: '/aws/services/' },
      ],
      mainColor: '#5C1AE2',
      bgColor: '#ede9fe',
      borderColor: '#5C1AE2',
    },
    {
      title: 'LocalStack for Snowflake Docs',
      description: "Run your queries and pipelines locally with full control over your data workflows, without touching your live Snowflake instance.",
      primaryHref: '/snowflake',
      primaryText: 'Explore the Docs',
      secondaryButtons: [
        { text: 'Getting Started', href: '/snowflake/getting-started/' },
        { text: 'Local Snowflake Features', href: '/snowflake/features/' },
      ],
      mainColor: '#2563eb',
      bgColor: '#dbeafe',
      borderColor: '#2563eb',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem',
        alignItems: 'start',
      }}
    >
      {cards.map((card, idx) => (
        <ProductCard key={idx} {...card} />
      ))}
    </div>
  );
}
