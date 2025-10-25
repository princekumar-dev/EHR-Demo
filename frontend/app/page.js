import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="card hover-lift text-center" style={{ maxWidth: '480px', padding: '3rem', animation: 'fadeInUp 0.8s ease-out' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(45deg, #1f6feb, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EHR Demo</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Secure, role-based electronic health record platform for patients, doctors,
          and administrators.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="primary-btn fade-in" href="/login" style={{ animationDelay: '0.2s' }}>
            Login
          </Link>
          <Link
            className="primary-btn fade-in"
            href="/register"
            style={{ background: 'var(--secondary)', animationDelay: '0.4s' }}
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}
