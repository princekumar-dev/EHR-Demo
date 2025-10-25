'use client';

import { DashboardLayout as DashboardShell } from '../components/DashboardLayout.jsx';
import { RoleGuard } from '../components/RoleGuard.jsx';

export default function DashboardLayout({ children }) {
  return (
    <RoleGuard roles={['patient', 'doctor', 'admin']}>
      <DashboardShell>{children}</DashboardShell>
    </RoleGuard>
  );
}
