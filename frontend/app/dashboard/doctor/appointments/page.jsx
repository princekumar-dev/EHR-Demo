'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useAuth } from '../../../components/AuthProvider.jsx';
import { RoleGuard } from '../../../components/RoleGuard.jsx';
import { apiClient } from '../../../lib/api.js';

const STATUS_OPTIONS = ['confirmed', 'completed', 'cancelled'];

const DoctorAppointmentsView = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('confirmed');
  const [reschedule, setReschedule] = useState({ date: '', startTime: '', endTime: '' });
  const [notes, setNotes] = useState('');

  const loadAppointments = async () => {
    const { appointments: appts } = await apiClient.get('/api/appointments', token);
    setAppointments(appts);
  };

  useEffect(() => {
    if (!token) return;
    loadAppointments().catch(console.error);
  }, [token]);

  const handleSelect = (appt) => {
    setSelected(appt);
    setStatus(appt.status);
    setReschedule({
      date: appt.date ? appt.date.substring(0, 10) : '',
      startTime: appt.startTime,
      endTime: appt.endTime,
    });
    setNotes(appt.notes || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selected) return;
    await apiClient.patch(
      `/api/appointments/${selected._id}/status`,
      {
        status,
        newDate: reschedule.date,
        newStartTime: reschedule.startTime,
        newEndTime: reschedule.endTime,
        notes,
      },
      token,
    );
    await loadAppointments();
  };

  return (
    <div className="card hover-lift" style={{ display: 'grid', gap: '2rem' }}>
      <section>
        <h2>Appointments</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt._id}>
                <td>{dayjs(appt.date).format('MMM D, YYYY')} {appt.startTime}</td>
                <td>
                  <div>
                    <strong>{appt.patientId?.name}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      {appt.patientId?.medicalHistory}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${appt.status}`}>{appt.status}</span>
                </td>
                <td>
                  <button
                    type="button"
                    className="primary-btn"
                    style={{ padding: '0.5rem 1rem' }}
                    onClick={() => handleSelect(appt)}
                  >
                    Manage
                  </button>
                </td>
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

      {selected && (
        <section className="card hover-lift" style={{ background: 'var(--background)', border: '2px solid var(--primary)' }}>
          <h3>Update appointment</h3>
          <p style={{ color: 'var(--muted)' }}>{selected.patientId?.name}</p>
          <form onSubmit={handleUpdate} className="form-grid two-column">
            <div className="input-group">
              <label htmlFor="status">Status</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={reschedule.date}
                onChange={(e) => setReschedule((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="startTime">Start time</label>
              <input
                id="startTime"
                type="time"
                value={reschedule.startTime}
                onChange={(e) =>
                  setReschedule((prev) => ({ ...prev, startTime: e.target.value }))
                }
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="endTime">End time</label>
              <input
                id="endTime"
                type="time"
                value={reschedule.endTime}
                onChange={(e) =>
                  setReschedule((prev) => ({ ...prev, endTime: e.target.value }))
                }
                required
              />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="notes">Visit notes</label>
              <textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Clinical notes and follow-up actions"
              />
            </div>
            <button type="submit" className="primary-btn" style={{ gridColumn: '1 / -1', justifySelf: 'start' }}>
              Save changes
            </button>
          </form>
        </section>
      )}
    </div>
  );
};

export default function DoctorAppointmentsPage() {
  return (
    <RoleGuard roles={['doctor']}>
      <DoctorAppointmentsView />
    </RoleGuard>
  );
}
