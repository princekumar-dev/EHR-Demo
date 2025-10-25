'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api.js';
import { useAuth } from '../../../components/AuthProvider.jsx';
import { RoleGuard } from '../../../components/RoleGuard.jsx';

const AdminUsersView = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    const { users: list } = await apiClient.get('/api/users', token);
    setUsers(list);
  };

  useEffect(() => {
    if (!token) return;
    loadUsers().catch(console.error);
  }, [token]);

  const handleDelete = async (id) => {
    if (typeof window !== 'undefined' && !window.confirm('Remove user?')) return;
    await apiClient.delete(`/api/users/${id}`, token);
    await loadUsers();
  };

  return (
    <section className="card hover-lift">
      <h2>Users</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Specialization</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.specialization || '-'}</td>
              <td>
                {user.role !== 'admin' && (
                  <button
                    type="button"
                    className="primary-btn"
                    style={{ padding: '0.5rem 1rem', background: 'var(--error)' }}
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default function AdminUsersPage() {
  return (
    <RoleGuard roles={['admin']}>
      <AdminUsersView />
    </RoleGuard>
  );
}
