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
        LocalStack runs AWS, Snowflake, and Azure APIs in containers on your own machine, so you can build,
        test, and debug cloud applications without a real cloud account. You use the same SDKs, CLIs, and
        infrastructure-as-code tools you already work with, then deploy to the real cloud when you are ready.
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