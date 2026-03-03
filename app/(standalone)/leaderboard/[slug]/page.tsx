export default function SponsorshipPage() {
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#0a0e1a' }}>
      <iframe
        src="/sponsership/index.html"
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          display: 'block',
        }}
        title="Sponsorship"
      />
    </div>
  );
}
