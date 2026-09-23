import React from 'react';
import StateModule from '../../dripsync2/StateModule';

export default function StatePanel({ user }) {
  return <StateModule currentUser={user} />;
}