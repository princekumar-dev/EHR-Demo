'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { apiClient } from '../../../lib/api.js';
import { useAuth } from '../../../components/AuthProvider.jsx';
import { RoleGuard } from '../../../components/RoleGuard.jsx';

const AdminAppointmentsView = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');

  const loadAppointments = async () => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const { appointments: list } = await apiClient.get(`/api/appointments?${params}`, token);
    setAppointments(list);
  };

  useEffect(() => {
    if (!token) return;
    loadAppointments().catch(console.error);
  }, [token, status]);

  const filtered = appointments.filter((appt) => {
    const haystack = `${appt.patientId?.name || ''} ${appt.doctorId?.name || ''} ${appt.reason || ''}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <section className="card hover-lift" style={{ display: 'grid', gap: '1.5rem' }}>
      <h2>Appointments directory</h2>
      <div className="form-grid two-column">
        <div className="input-group">
          <label htmlFor="query">Search</label>
          <input
            id="query"
            value={query}
            placeholder="Search by patient, doctor, or reason"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Status</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((appt) => (
            <tr key={appt._id}>
              <td>{dayjs(appt.date).format('MMM D, YYYY')} {appt.startTime}</td>
              <td>{appt.patientId?.name}</td>
              <td>{appt.doctorId?.name}</td>
              <td>
                <span className={`status-badge status-${appt.status}`}>{appt.status}</span>
              </td>
              <td>{appt.reason}</td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center" style={{ color: 'var(--muted)' }}>
                No appointments match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
};

export default function AdminAppointmentsPage() {
  return (
    <RoleGuard roles={['admin']}>
      <AdminAppointmentsView />
    </RoleGuard>
  );
}
