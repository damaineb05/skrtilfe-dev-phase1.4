import React from 'react';

import FeedPanel from './panels/FeedPanel';
import DropsPanel from './panels/DropsPanel';
import AnalyticsPanel from './panels/AnalyticsPanel';
import ActivityPanel from './panels/ActivityPanel';
import StudioPanel from './panels/StudioPanel';
import ShopPanel from './panels/ShopPanel';
import WalletPanel from './panels/WalletPanel';
import StatePanel from './panels/StatePanel';
import CuratedPanel from './panels/CuratedPanel';
import MatchesPanel from './panels/MatchesPanel';
import NotificationsPanel from './panels/NotificationsPanel';
import DripSyncPanel from './panels/DripSyncPanel';
import StreamingPanel from './panels/StreamingPanel';
import AssetsPanel from './panels/AssetsPanel';

export default function DynamicPanel({ panelId, user, onPostCreated }) {
  switch (panelId) {
    case 'feed':          return <FeedPanel onPostCreated={onPostCreated} />;
    case 'drops':         return <DropsPanel />;
    case 'curated':       return <CuratedPanel user={user} />;
    case 'matches':       return <MatchesPanel user={user} />;
    case 'notifications': return <NotificationsPanel user={user} />;
    case 'assets':        return <AssetsPanel user={user} />;
    // Legacy aliases — redirect to assets (shouldn't render but kept as safety net)
    case 'nfts':          return <AssetsPanel user={user} />;
    case 'portfolio':     return <AssetsPanel user={user} />;
    case 'analytics':     return <AnalyticsPanel user={user} />;
    case 'activity':      return <ActivityPanel />;
    case 'studio':        return <StudioPanel />;
    case 'shop':          return <ShopPanel />;
    case 'wallet':        return <WalletPanel />;
    case 'dripsync':      return <DripSyncPanel user={user} />;
    case 'streaming':     return <StreamingPanel />;
    case 'state':         return <StatePanel user={user} />;
    default:              return null;
  }
}