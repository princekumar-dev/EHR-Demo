'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider.jsx';

const navByRole = {
  patient: [
    { href: '/dashboard/patient', label: 'Overview' },
    { href: '/dashboard/patient/appointments', label: 'Appointments' },
    { href: '/dashboard/patient/prescriptions', label: 'Prescriptions' },
    { href: '/dashboard/patient/profile', label: 'Profile' },
  ],
  doctor: [
    { href: '/dashboard/doctor', label: 'Schedule' },
    { href: '/dashboard/doctor/appointments', label: 'Appointments' },
    { href: '/dashboard/doctor/patients', label: 'Patients' },
    { href: '/dashboard/doctor/prescriptions', label: 'Prescriptions' },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Analytics' },
    { href: '/dashboard/admin/users', label: 'Users' },
    { href: '/dashboard/admin/appointments', label: 'Appointments' },
  ],
};

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navItems = navByRole[user?.role] || [];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="logo">EHR Demo</div>
          <p style={{ fontSize: '0.85rem', opacity: 0.85 }}>Role: {user?.role}</p>
        </div>
        <nav>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="primary-btn"
          style={{ background: 'rgba(15,23,42,0.6)' }}
          onClick={() => {
            logout();
            router.push('/login');
          }}
        >
          Sign out
        </button>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
};
