'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RefreshCw, ShieldCheck, AlertCircle, BarChart3, MessageSquareQuote, Layers, Settings, ExternalLink } from 'lucide-react';

function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

interface HeaderProps {
  isDemo?: boolean;
  lastSyncedAtIST?: string;
  onRefresh?: () => Promise<void>;
}

export function Header({ isDemo = true, lastSyncedAtIST = 'Today at 02:25 PM IST', onRefresh }: HeaderProps) {
  const pathname = usePathname();
  const [syncing, setSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const handleSyncClick = async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncSuccessMsg(null);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        const res = await fetch('/api/instagram/sync', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Sync failed');
      }
      setSyncSuccessMsg('Synced!');
      setTimeout(() => setSyncSuccessMsg(null), 3000);
    } catch (err: any) {
      console.warn('Sync notice:', err.message);
      // In demo mode or offline, simulate quick sync
      await new Promise((r) => setTimeout(r, 800));
      setSyncSuccessMsg('Refreshed Demo');
      setTimeout(() => setSyncSuccessMsg(null), 3000);
    } finally {
      setSyncing(false);
    }
  };

  const navLinks = [
    { href: '/', label: 'Overview & Reels', icon: BarChart3 },
    { href: '/comments', label: 'Comment Intelligence', icon: MessageSquareQuote },
    { href: '/topics', label: 'Topic Performance', icon: Layers },
    { href: '/settings', label: 'Settings & Meta API', icon: Settings },
  ];

  return (
    <header className="bg-urowala-950 text-white border-b border-urowala-800 sticky top-0 z-50 shadow-md">
      {/* Top Banner for Demo / Production Status */}
      <div className={`px-4 py-1.5 text-xs font-medium flex items-center justify-between transition-colors ${
        isDemo ? 'bg-amber-500/15 text-amber-200 border-b border-amber-500/20' : 'bg-emerald-500/15 text-emerald-200 border-b border-emerald-500/20'
      }`}>
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          {isDemo ? (
            <>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span><strong>Demo Mode Active:</strong> Showing realistic simulated data for <code>@dr.mohit_urowala</code>. Connect Meta Instagram Graph API in <Link href="/settings" className="underline hover:text-white font-semibold">Settings</Link> to stream verified live metrics.</span>
            </>
          ) : (
            <>
              <span className="flex h-2 w-2 relative">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span><strong>Live Account Connected:</strong> Official Meta Instagram Graph API linked with verified hourly snapshots for <code>@dr.mohit_urowala</code>.</span>
            </>
          )}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-urowala-600 to-urowala-800 flex items-center justify-center font-bold text-white shadow-inner border border-urowala-400/30 group-hover:scale-105 transition-transform">
                <span className="text-xl tracking-tight">UW</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-white tracking-tight">UROWALA</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-urowala-800/80 text-urowala-200 px-2 py-0.5 rounded border border-urowala-700">
                    Intelligence
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-normal">Dr. Mohit Sharma &bull; Instagram Reel Analytics</p>
              </div>
            </Link>
          </div>

          {/* Account Profile Badge & Quick Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Account pill */}
            <a
              href="https://www.instagram.com/dr.mohit_urowala/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-urowala-900 border border-urowala-700 hover:border-urowala-500 text-slate-200 hover:text-white text-xs transition"
              title="View Instagram Profile"
            >
              <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
              <span className="font-medium">@dr.mohit_urowala</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* Last Synced Badge */}
            <div className="hidden lg:flex flex-col text-right text-xs">
              <span className="text-slate-400">Last Synced</span>
              <span suppressHydrationWarning className="font-mono text-slate-200 font-medium">{lastSyncedAtIST}</span>
            </div>

            {/* Sync Now Button */}
            <button
              onClick={handleSyncClick}
              disabled={syncing}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm ${
                syncing
                  ? 'bg-urowala-800 text-slate-400 cursor-not-allowed'
                  : 'bg-urowala-600 hover:bg-urowala-500 text-white active:scale-95'
              }`}
              title="Trigger immediate snapshot collection"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : syncSuccessMsg || 'Sync Now'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-4 border-t border-urowala-900/60 pt-1 overflow-x-auto no-scrollbar">
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-urowala-400 text-white font-semibold'
                    : 'border-transparent text-slate-300 hover:text-white hover:border-slate-500'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-urowala-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
