'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useAuth } from '../../../components/AuthProvider.jsx';
import { RoleGuard } from '../../../components/RoleGuard.jsx';
import { apiClient } from '../../../lib/api.js';

const PatientAppointmentsView = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    doctorId: '',
    date: dayjs().format('YYYY-MM-DD'),
    startTime: '09:00',
    endTime: '09:30',
    reason: '',
  });
  const [message, setMessage] = useState(null);

  const loadData = async () => {
    const [{ appointments: appts }, { doctors: drs }] = await Promise.all([
      apiClient.get('/api/appointments', token),
      apiClient.get('/api/lookup/doctors', token),
    ]);
    setAppointments(appts);
    setDoctors(drs);
  };

  useEffect(() => {
    if (token) {
      loadData().catch(console.error);
    }
  }, [token]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/appointments', form, token);
      setMessage({ type: 'success', text: 'Appointment requested successfully.' });
      setForm((prev) => ({ ...prev, reason: '' }));
      await loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Unable to book appointment. Try another time slot.' });
    }
  };

  return (
    <div>
      <div className="card hover-lift" style={{ marginBottom: '2rem' }}>
        <h2>Book appointment</h2>
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="form-grid two-column">
          <div className="input-group">
            <label htmlFor="doctorId">Doctor</label>
            <select id="doctorId" name="doctorId" value={form.doctorId} onChange={handleChange} required>
              <option value="">Select doctor</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.name} · {doc.specialization}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="date">Date</label>
            <input id="date" type="date" name="date" value={form.date} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="startTime">Start time</label>
            <input id="startTime" type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="endTime">End time</label>
            <input id="endTime" type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              name="reason"
              rows={3}
              value={form.reason}
              onChange={handleChange}
              placeholder="Describe your visit reason"
            />
          </div>
          <button type="submit" className="primary-btn" style={{ gridColumn: '1 / -1', justifySelf: 'start' }}>
            Request appointment
          </button>
        </form>
      </div>

      <section className="card hover-lift">
        <h2>Appointments</h2>
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
                <td>
                  {dayjs(appt.date).format('MMM D, YYYY')} {appt.startTime} - {appt.endTime}
                </td>
                <td>{appt.doctorId?.name}</td>
                <td>
                  <span className={`status-badge status-${appt.status}`}>{appt.status}</span>
                </td>
                <td>{appt.reason}</td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center" style={{ color: 'var(--muted)' }}>
                  No appointments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default function PatientAppointmentsPage() {
  return (
    <RoleGuard roles={['patient']}>
      <PatientAppointmentsView />
    </RoleGuard>
  );
}
