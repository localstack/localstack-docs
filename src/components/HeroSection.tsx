export function HeroSection() {
  return (
    <div style={{
      textAlign: 'center',
      marginBottom: '3rem'
    }}>
      
      <p style={{
        fontSize: '18px',
        lineHeight: 1.6,
        color: 'var(--sl-color-gray-2)',
        maxWidth: '900px',
        margin: '0 auto 3rem auto'
      }}>
        LocalStack is a local cloud emulator that lets you build and test cloud applications entirely on your machine. 
        Spin up fully functional local environments that mirror real cloud behavior — including AWS services and Snowflake — without 
        provisioning real cloud infrastructure. Whether you're validating IaC templates, running integration tests, or iterating on 
        data pipelines, LocalStack integrates seamlessly with your tools and CI/CD pipelines to help you ship faster and safer.
      </p>

      <h2 style={{
        fontSize: '32px',
        fontWeight: 600,
        color: 'var(--sl-color-white)',
        marginBottom: '2rem'
      }}>
        Choose a product to get started
      </h2>
    </div>
  );
} 