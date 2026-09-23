import React from 'react';
import SocialHub from '../SocialHub';

export default function FeedPanel({ onPostCreated }) {
  return <SocialHub onPostCreated={onPostCreated} />;
}