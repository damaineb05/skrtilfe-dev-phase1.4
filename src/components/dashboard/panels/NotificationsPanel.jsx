import React from 'react';
import NotificationSettings from '../NotificationSettings';

export default function NotificationsPanel({ user }) {
  return <NotificationSettings currentUser={user} />;
}