import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings,
  BarChart3, FileText, Crown, Menu, X, Home, ArrowLeft, Upload, Bot, Image,
  ShieldAlert, Shirt, ChevronRight
} from 'lucide-react';

const adminNavItems = [
  { name: 'Dashboard', path: 'AdminDashboard', icon: LayoutDashboard },
  { name: 'AI Assistant', path: 'AdminAssistant', icon: Bot },
  { name: 'Products', path: 'AdminInventory', icon: Package },
  { name: 'Orders', path: 'AdminOrders', icon: ShoppingCart },
  { name: 'Customers', path: 'AdminCustomers', icon: Users },
  { name: 'Moderation', path: 'AdminModeration', icon: ShieldAlert },
  { name: 'Digital Assets', path: 'AdminWearables', icon: Shirt },
  { name: 'Asset Library', path: 'AdminAssets', icon: Image },
  { name: 'Upload Assets', path: 'AdminAssetUpload', icon: Upload },
  { name: 'Marketplace', path: 'AdminMarketplace', icon: Crown },
  { name: 'Analytics', path: 'AdminAnalytics', icon: BarChart3 },
  { name: 'Content', path: 'AdminContent', icon: FileText },
  { name: 'Settings', path: 'AdminSettings', icon: Settings },
];

export default function AdminLayout({ children, currentPage }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .admin-sidebar-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.4);
          transition: all 0.2s;
          text-decoration: none;
        }
        .admin-sidebar-link:hover {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.85);
        }
        .admin-sidebar-link.active {
          background: rgba(0,212,255,0.1);
          color: #00D4FF;
          border: 1px solid rgba(0,212,255,0.2);
        }
        .admin-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
        }
        .admin-card-hover:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.15);
        }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-60 flex flex-col
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `} style={{ background: '#0D0D14', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ background: '#FF3366' }} />
              <span className="w-2 h-2 rounded-full" style={{ background: '#00D4FF' }} />
              <span className="w-2 h-2 rounded-full" style={{ background: '#FFD700' }} />
            </div>
            <p className="text-xs font-black tracking-[0.2em] uppercase text-white font-harvest">SKRTLIFE</p>
            <p className="text-[9px] tracking-[0.25em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Admin Portal</p>
          </div>
          <button
            className="lg:hidden w-8 h-8 flex items-center justify-center"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {adminNavItems.map((item) => {
            const isActive = currentPage === item.path.replace('Admin', '').toLowerCase() ||
              window.location.pathname.includes(item.path);
            return (
              <Link
                key={item.path}
                to={createPageUrl(item.path)}
                className={`admin-sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <Link to={createPageUrl('Home')} className="admin-sidebar-link">
            <Home className="w-4 h-4" />
            View Site
          </Link>
        </div>
      </div>

      {/* Main */}
      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4"
          style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-[0.15em] text-white">Admin Portal</h1>
              <p className="text-[10px] tracking-[0.1em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Skrtlife Digital Society
              </p>
            </div>
          </div>
          <Link
            to={createPageUrl('Home')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', borderRadius: '6px' }}
          >
            <Home className="w-3 h-3" />
            View Site
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}