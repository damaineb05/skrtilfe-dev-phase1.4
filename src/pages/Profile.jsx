import React from 'react';
import { Navigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Profile is consolidated into the canonical MyAccount identity surface.
// This route is preserved for deep links and redirects to the single
// account / identity page (Identity tab). No duplicate profile state.
export default function Profile() {
  return <Navigate to={createPageUrl('MyAccount')} replace />;
}