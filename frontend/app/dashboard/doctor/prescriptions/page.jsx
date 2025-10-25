'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useAuth } from '../../../components/AuthProvider.jsx';
import { RoleGuard } from '../../../components/RoleGuard.jsx';
import { apiClient } from '../../../lib/api.js';

const DoctorPrescriptionsView = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [form, setForm] = useState({
    appointmentId: '',
    medications: [{ name: '', dose: '', frequency: '', duration: '', instructions: '' }],
    notes: '',
  });
  const [message, setMessage] = useState(null);

  const loadData = async () => {
    const [{ appointments: appts }, { prescriptions: rx }] = await Promise.all([
      apiClient.get('/api/appointments', token),
      apiClient.get('/api/prescriptions', token),
    ]);
    setAppointments(appts);
    setPrescriptions(rx);
  };

  useEffect(() => {
    if (!token) return;
    loadData().catch(console.error);
  }, [token]);

  const updateMedication = (index, field, value) => {
    setForm((prev) => {
      const meds = prev.medications.map((med, i) => (i === index ? { ...med, [field]: value } : med));
      return { ...prev, medications: meds };
    });
  };

  const addMedication = () => {
    setForm((prev) => ({
      ...prev,
      medications: [...prev.medications, { name: '', dose: '', frequency: '', duration: '', instructions: '' }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/prescriptions', form, token);
      setMessage({ type: 'success', text: 'Prescription issued.' });
      setForm({
        appointmentId: '',
        medications: [{ name: '', dose: '', frequency: '', duration: '', instructions: '' }],
        notes: '',
      });
      await loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Unable to issue prescription.' });
    }
  };

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <section className="card hover-lift">
        <h2>Issue prescription</h2>
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="input-group">
            <label htmlFor="appointmentId">Appointment</label>
            <select
              id="appointmentId"
              value={form.appointmentId}
              onChange={(e) => setForm((prev) => ({ ...prev, appointmentId: e.target.value }))}
              required
            >
              <option value="">Select appointment</option>
              {appointments
                .filter((a) => a.status === 'confirmed' || a.status === 'completed')
                .map((appt) => (
                  <option key={appt._id} value={appt._id}>
                    {dayjs(appt.date).format('MMM D, YYYY')} · {appt.patientId?.name}
                  </option>
                ))}
            </select>
          </div>

          {form.medications.map((med, index) => (
            <div
              key={index}
              className="card"
              style={{
                border: '1px solid var(--muted)',
                padding: '1rem',
                background: 'var(--background)',
              }}
            >
              <h4 style={{ marginTop: 0 }}>Medication {index + 1}</h4>
              <div className="form-grid two-column">
                <div className="input-group">
                  <label>Name</label>
                  <input
                    value={med.name}
                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Dose</label>
                  <input value={med.dose} onChange={(e) => updateMedication(index, 'dose', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Frequency</label>
                  <input
                    value={med.frequency}
                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Duration</label>
                  <input
                    value={med.duration}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                  />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Instructions</label>
                  <textarea
                    value={med.instructions}
                    onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="primary-btn"
            style={{ justifySelf: 'start' }}
            onClick={addMedication}
          >
            Add medication
          </button>

          <div className="input-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              rows={4}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <button type="submit" className="primary-btn" style={{ justifySelf: 'start' }}>
            Issue prescription
          </button>
        </form>
      </section>

      <section className="card hover-lift">
        <h2>Prescriptions history</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient</th>
              <th>Medications</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((rx) => (
              <tr key={rx._id}>
                <td>{dayjs(rx.issuedAt).format('MMM D, YYYY')}</td>
                <td>{rx.patientId?.name}</td>
                <td>{rx.medications.map((m) => m.name).join(', ')}</td>
              </tr>
            ))}
            {prescriptions.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center" style={{ color: 'var(--muted)' }}>
                  No prescriptions issued yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default function DoctorPrescriptionsPage() {
  return (
    <RoleGuard roles={['doctor']}>
      <DoctorPrescriptionsView />
    </RoleGuard>
  );
}
