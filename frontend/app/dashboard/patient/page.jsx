'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useAuth } from '../../components/AuthProvider.jsx';
import { RoleGuard } from '../../components/RoleGuard.jsx';
import { apiClient } from '../../lib/api.js';

const PatientDashboardView = () => {
  const { token, user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { appointments: appts } = await apiClient.get('/api/appointments', token);
        const { prescriptions: meds } = await apiClient.get('/api/prescriptions', token);
        setAppointments(appts.slice(0, 5));
        setPrescriptions(meds.slice(0, 3));
      } catch (error) {
        console.error(error);
      }
    };
    if (token) {
      fetchData();
    }
  }, [token]);

  return (
    <div>
      <div className="top-bar">
        <div>
          <h1 style={{ margin: 0 }}>Welcome back, {user?.name}</h1>
          <p style={{ color: '#64748b' }}>Manage your health information.</p>
        </div>
      </div>

      <section className="cards-grid">
        <div className="card hover-lift">
          <h3>Upcoming appointments</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{appointments.length}</p>
        </div>
        <div className="card hover-lift">
          <h3>Active prescriptions</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{prescriptions.length}</p>
        </div>
        <div className="card hover-lift">
          <h3>Medical history</h3>
          <p>{user?.medicalHistory || 'No notes recorded'}</p>
        </div>
      </section>

      <section className="card hover-lift lower-appointments">
        <div className="top-bar">
          <h2 style={{ margin: 0 }}>Next appointments</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Doctor</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt._id}>
                <td>{dayjs(appt.date).format('MMM D, YYYY')} {appt.startTime}</td>
                <td>{appt.doctorId?.name}</td>
                <td>
                  <span className={`status-badge status-${appt.status}`}>
                    {appt.status}
                  </span>
                </td>
                <td>{appt.reason}</td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center" style={{ color: 'var(--muted)' }}>
                  No appointments scheduled yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="card hover-lift lower-prescriptions">
        <div className="top-bar">
          <h2 style={{ margin: 0 }}>Recent prescriptions</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Issued</th>
              <th>Doctor</th>
              <th>Medications</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((rx) => (
              <tr key={rx._id}>
                <td>{dayjs(rx.issuedAt).format('MMM D, YYYY')}</td>
                <td>{rx.doctorId?.name}</td>
                <td>{rx.medications.map((m) => m.name).join(', ')}</td>
              </tr>
            ))}
            {prescriptions.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center" style={{ color: 'var(--muted)' }}>
                  No prescriptions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default function PatientDashboard() {
  return (
    <RoleGuard roles={['patient']}>
      <PatientDashboardView />
    </RoleGuard>
  );
}
