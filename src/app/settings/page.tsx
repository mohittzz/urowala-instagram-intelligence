'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { SettingsView } from '@/components/settings/SettingsView';

export default function SettingsPage() {
  const [accountStatus, setAccountStatus] = useState({
    connected: false,
    isDemo: true,
    account: {
      username: 'dr.mohit_urowala',
      lastSyncedAt: new Date().toISOString(),
    },
  });

  useEffect(() => {
    fetch('/api/instagram/status')
      .then((res) => res.json())
      .then((data) => setAccountStatus(data))
      .catch((err) => console.warn('Status error:', err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header isDemo={accountStatus.isDemo} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SettingsView
          isConfigured={accountStatus.connected}
          accountUsername={accountStatus.account?.username}
          lastSyncedAt={accountStatus.account?.lastSyncedAt}
          hasApifyToken={(accountStatus as any).hasApifyToken}
          provider={(accountStatus as any).provider}
        />
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-bold text-slate-800">UROWALA &bull; Security & API Settings</span>
          <span>Zero-trust tokens &bull; Encrypted storage</span>
        </div>
      </footer>
    </div>
  );
}
