'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../components/AuthProvider.jsx';
import { RoleGuard } from '../../../components/RoleGuard.jsx';
import { apiClient } from '../../../lib/api.js';

const PatientProfileView = () => {
  const { token, user, login } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    dob: '',
    gender: 'other',
    address: '',
    medicalHistory: '',
  });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!token) return;
    apiClient
      .get('/api/auth/me', token)
      .then(({ user: profile }) => {
        setForm({
          name: profile.name || '',
          phone: profile.phone || '',
          dob: profile.dob ? profile.dob.substring(0, 10) : '',
          gender: profile.gender || 'other',
          address: profile.address || '',
          medicalHistory: profile.medicalHistory || '',
        });
      })
      .catch(console.error);
  }, [token]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { user: updated } = await apiClient.put('/api/auth/me', form, token);
      login(updated, token);
      setStatus('Profile updated');
    } catch (error) {
      setStatus('Unable to save profile');
    }
  };

  return (
    <div className="card hover-lift">
      <h2>Profile</h2>
      <p style={{ color: 'var(--muted)' }}>Update your personal information.</p>
      {status && <div className="message success">{status}</div>}
      <form onSubmit={handleSubmit} className="form-grid two-column">
        <div className="input-group">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label htmlFor="dob">Date of birth</label>
          <input id="dob" type="date" name="dob" value={form.dob} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label htmlFor="gender">Gender</label>
          <select id="gender" name="gender" value={form.gender} onChange={handleChange}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="address">Address</label>
          <input id="address" name="address" value={form.address} onChange={handleChange} />
        </div>
        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="medicalHistory">Medical history notes</label>
          <textarea
            id="medicalHistory"
            name="medicalHistory"
            rows={4}
            value={form.medicalHistory}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="primary-btn" style={{ gridColumn: '1 / -1', justifySelf: 'start' }}>
          Save changes
        </button>
      </form>
    </div>
  );
};

export default function PatientProfilePage() {
  return (
    <RoleGuard roles={['patient']}>
      <PatientProfileView />
    </RoleGuard>
  );
}
