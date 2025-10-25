'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../components/AuthProvider.jsx';
import { RoleGuard } from '../../../components/RoleGuard.jsx';
import { apiClient } from '../../../lib/api.js';

const DoctorPatientsView = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!token) return;
    apiClient
      .get('/api/appointments', token)
      .then(({ appointments: appts }) => setAppointments(appts))
      .catch(console.error);
  }, [token]);

  const patients = useMemo(() => {
    const map = new Map();
    appointments.forEach((appt) => {
      if (appt.patientId) {
        map.set(appt.patientId._id, appt.patientId);
      }
    });
    return Array.from(map.values());
  }, [appointments]);

  return (
    <section className="card hover-lift">
      <h2>Patients</h2>
      <div className="cards-grid">
        {patients.map((patient) => (
          <div key={patient._id} className="card hover-lift" style={{ boxShadow: 'none', border: '1px solid var(--muted)' }}>
            <h3 style={{ marginBottom: '0.25rem' }}>{patient.name}</h3>
            <p style={{ margin: 0, color: 'var(--muted)' }}>{patient.email}</p>
            <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>{patient.medicalHistory}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>DOB: {patient.dob ? patient.dob.substring(0, 10) : 'N/A'}</p>
          </div>
        ))}
        {patients.length === 0 && <p className="text-center" style={{ color: 'var(--muted)' }}>No patients yet.</p>}
      </div>
    </section>
  );
};

export default function DoctorPatientsPage() {
  return (
    <RoleGuard roles={['doctor']}>
      <DoctorPatientsView />
    </RoleGuard>
  );
}
