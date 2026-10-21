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
    <div className="min-h-screen flex flex-col bg-[#0c0712] text-slate-100">
      <Header isDemo={accountStatus.isDemo} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SettingsView
          isConfigured={accountStatus.connected}
          accountUsername={accountStatus.account?.username}
          lastSyncedAt={accountStatus.account?.lastSyncedAt}
          hasApifyToken={(accountStatus as any).hasApifyToken}
          hasMetaApp={(accountStatus as any).hasMetaApp}
          provider={(accountStatus as any).provider}
          storageStats={(accountStatus as any).storageStats}
        />
      </main>

      <footer className="mt-auto border-t border-pink-900/30 bg-[#120a1b] py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-bold text-slate-200">UROWALA &bull; Security & API Settings</span>
          <span>Zero-trust tokens &bull; Encrypted storage</span>
        </div>
      </footer>
    </div>
  );
}
