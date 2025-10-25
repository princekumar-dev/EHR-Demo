'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useAuth } from '../../components/AuthProvider.jsx';
import { RoleGuard } from '../../components/RoleGuard.jsx';
import { apiClient } from '../../lib/api.js';

const DoctorDashboardView = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!token) return;
    apiClient
      .get('/api/appointments?status=confirmed', token)
      .then(({ appointments: appts }) => setAppointments(appts.slice(0, 5)))
      .catch(console.error);
  }, [token]);

  return (
    <div>
      <div className="top-bar">
        <div>
          <h1 style={{ margin: 0 }}>Good day, {user?.name}</h1>
          <p style={{ color: '#64748b' }}>Review your upcoming schedule.</p>
        </div>
      </div>

      <section className="cards-grid">
        <div className="card hover-lift">
          <h3>Upcoming visits</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{appointments.length}</p>
        </div>
        <div className="card hover-lift">
          <h3>Specialization</h3>
          <p>{user?.specialization || 'General practitioner'}</p>
        </div>
      </section>

      <section className="card hover-lift day-schedule">
        <h2>Day schedule</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt._id}>
                <td>
                  {dayjs(appt.date).format('MMM D, YYYY')} {appt.startTime}-{appt.endTime}
                </td>
                <td>{appt.patientId?.name}</td>
                <td>
                  <span className={`status-badge status-${appt.status}`}>{appt.status}</span>
                </td>
                <td>{appt.reason}</td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center" style={{ color: 'var(--muted)' }}>
                  Nothing scheduled yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default function DoctorDashboard() {
  return (
    <RoleGuard roles={['doctor']}>
      <DoctorDashboardView />
    </RoleGuard>
  );
}
