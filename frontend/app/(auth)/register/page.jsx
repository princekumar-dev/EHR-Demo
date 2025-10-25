'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider.jsx';
import { apiClient } from '../../lib/api.js';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    specialization: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Client-side validation to give quicker feedback and avoid common 400s
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in name, email and password');
      setLoading(false);
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    if (!form.email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (form.role === 'doctor' && !form.specialization) {
      setError('Please provide your specialization');
      setLoading(false);
      return;
    }
    try {
      const payload = { ...form };
      if (form.role !== 'doctor') {
        delete payload.specialization;
      }
      const { user, token } = await apiClient.post('/api/auth/register', payload);
      login(user, token);
      router.push(`/dashboard/${user.role}`);
    } catch (err) {
      // Prefer server-provided message when available, otherwise fallback
      console.error('Register error', err);
      const serverMsg = err?.data?.message || err?.message || 'Unable to register with the provided details';
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2.5rem' }}>
      <form onSubmit={handleSubmit} className="glass-hero" style={{ width: '100%', maxWidth: 620, display: 'grid', gap: '1rem' }}>
        <div>
          <h2 className="hero-title">Create your account</h2>
          <p className="muted">Sign up as a patient or doctor.</p>
        </div>
        {error && <div className="error-box">{error}</div>}
        <div className="form-grid two-column">
          <div className="input-group">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              minLength={6}
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
          {form.role === 'doctor' && (
            <div className="input-group">
              <label htmlFor="specialization">Specialization</label>
              <input
                id="specialization"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                required
              />
            </div>
          )}
        </div>
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Creating...' : 'Create account'}
        </button>
        <p style={{ fontSize: '0.9rem' }}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
