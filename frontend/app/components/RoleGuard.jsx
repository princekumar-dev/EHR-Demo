'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './AuthProvider.jsx';

export const RoleGuard = ({ roles, children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (roles && !roles.includes(user.role)) {
        router.replace('/login');
      }
    }
  }, [user, loading, roles, router]);

  if (!user) {
    return null;
  }

  if (roles && !roles.includes(user.role)) {
    return null;
  }

  return children;
};
