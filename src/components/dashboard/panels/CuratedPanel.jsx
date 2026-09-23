import React from 'react';
import CuratedHighlights from '../CuratedHighlights';

export default function CuratedPanel({ user }) {
  return <CuratedHighlights currentUser={user} />;
}