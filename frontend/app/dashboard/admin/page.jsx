'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useAuth } from '../../components/AuthProvider.jsx';
import { RoleGuard } from '../../components/RoleGuard.jsx';
import { apiClient } from '../../lib/api.js';

const AdminDashboardView = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState([]);

  useEffect(() => {
    if (!token) return;
    apiClient
      .get('/api/appointments/analytics/summary', token)
      .then(({ stats: data }) => setStats(data))
      .catch(console.error);
  }, [token]);

  return (
    <div className="card hover-lift">
      <h2>Appointment analytics</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Status</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {stats.flatMap((entry) =>
            entry.statuses.map((status) => (
              <tr key={`${entry._id}-${status.status}`}>
                <td>{dayjs(entry._id).format('MMM D, YYYY')}</td>
                <td>{status.status}</td>
                <td>{status.count}</td>
              </tr>
            )),
          )}
          {stats.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center" style={{ color: 'var(--muted)' }}>
                No analytics yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default function AdminDashboard() {
  return (
    <RoleGuard roles={['admin']}>
      <AdminDashboardView />
    </RoleGuard>
  );
}
