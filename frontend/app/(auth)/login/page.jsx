'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider.jsx';
import { apiClient } from '../../lib/api.js';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { user, token } = await apiClient.post('/api/auth/login', {
        email,
        password,
      });
      login(user, token);
      router.push(`/dashboard/${user.role}`);
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'white',
          padding: '3rem',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px rgba(15, 23, 42, 0.12)',
        }}
      >
        <h2 style={{ marginBottom: '0.5rem' }}>Welcome back</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Access your dashboard.</p>
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#b91c1c',
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group" style={{ marginTop: '1rem' }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="primary-btn" style={{ width: '100%', marginTop: '1.5rem' }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Need an account? <Link href="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
}
