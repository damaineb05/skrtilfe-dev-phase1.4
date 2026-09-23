import React from 'react';
import StreamingHub from '@/components/streaming/StreamingHub';

/**
 * StreamingPanel — renders the full Stream Hub inline inside the dashboard panel.
 */
export default function StreamingPanel() {
  return (
    <div className="h-full overflow-hidden">
      <StreamingHub />
    </div>
  );
}