'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useAuth } from '../../../components/AuthProvider.jsx';
import { RoleGuard } from '../../../components/RoleGuard.jsx';
import { apiClient, apiBaseUrl } from '../../../lib/api.js';

const PatientPrescriptionsView = () => {
  const { token } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    if (!token) return;
    apiClient
      .get('/api/prescriptions', token)
      .then(({ prescriptions: rx }) => setPrescriptions(rx))
      .catch(console.error);
  }, [token]);

  return (
    <section className="card hover-lift">
      <h2>Prescriptions</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Doctor</th>
            <th>Medications</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.map((rx) => (
            <tr key={rx._id}>
              <td>{dayjs(rx.issuedAt).format('MMM D, YYYY')}</td>
              <td>{rx.doctorId?.name}</td>
              <td>{rx.medications.map((m) => m.name).join(', ')}</td>
              <td>
                <button
                  type="button"
                  className="primary-btn"
                  style={{ padding: '0.5rem 1rem' }}
                  onClick={async () => {
                    const res = await fetch(`${apiBaseUrl}/api/prescriptions/${rx._id}/pdf`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `prescription-${rx._id}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  }}
                >
                  Download PDF
                </button>
              </td>
            </tr>
          ))}
          {prescriptions.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center" style={{ color: 'var(--muted)' }}>
                No prescriptions yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
};

export default function PatientPrescriptionsPage() {
  return (
    <RoleGuard roles={['patient']}>
      <PatientPrescriptionsView />
    </RoleGuard>
  );
}
