import React from 'react';
import MemberMatchmaking from '../MemberMatchmaking';

export default function MatchesPanel({ user }) {
  return <MemberMatchmaking currentUser={user} />;
}