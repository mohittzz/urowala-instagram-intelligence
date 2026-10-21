'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  Database,
  Calendar,
  Globe,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Terminal,
  Zap,
  Sparkles,
} from 'lucide-react';

export interface SupabaseStorageStats {
  usedBytes: number;
  prettyUsed: string;
  totalQuotaBytes: number;
  prettyQuota: string;
  usedPercent: number;
  reelsSize: string;
  snapshotsSize: string;
  totalReels: number;
  totalSnapshots: number;
}

interface SettingsViewProps {
  isConfigured?: boolean;
  accountUsername?: string;
  lastSyncedAt?: string;
  hasApifyToken?: boolean;
  hasMetaApp?: boolean;
  provider?: string;
  storageStats?: SupabaseStorageStats;
}

export function SettingsView({
  isConfigured = false,
  accountUsername = 'dr.mohit_urowala',
  lastSyncedAt,
  hasApifyToken = false,
  hasMetaApp = false,
  provider = 'apify',
  storageStats,
}: SettingsViewProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [apifyTokenInput, setApifyTokenInput] = useState('');
  const [targetUsernameInput, setTargetUsernameInput] = useState(accountUsername || 'dr.mohit_urowala');
  const [testingSync, setTestingSync] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);

  // Meta Configuration State
  const [showMetaForm, setShowMetaForm] = useState(false);
  const [metaAppId, setMetaAppId] = useState('');
  const [metaAppSecret, setMetaAppSecret] = useState('');
  const [metaToken, setMetaToken] = useState('');
  const [savingMeta, setSavingMeta] = useState(false);
  const [metaFeedback, setMetaFeedback] = useState<string | null>(null);
  const [metaSavedSuccess, setMetaSavedSuccess] = useState<boolean | null>(null);

  const handleSaveMeta = async () => {
    setSavingMeta(true);
    setMetaFeedback(null);
    try {
      const res = await fetch('/api/settings/save-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: metaAppId || undefined,
          appSecret: metaAppSecret || undefined,
          accessToken: metaToken || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMetaSavedSuccess(false);
        setMetaFeedback(data.error || 'Failed to save Meta settings');
      } else {
        setMetaSavedSuccess(true);
        setMetaFeedback(data.message || 'Saved successfully!');
      }
    } catch (err: any) {
      setMetaSavedSuccess(false);
      setMetaFeedback(err.message || 'Network error');
    } finally {
      setSavingMeta(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleRunApifySync = async () => {
    setTestingSync(true);
    setSyncFeedback(null);
    setSyncSuccess(null);

    try {
      const res = await fetch('/api/apify/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: targetUsernameInput,
          token: apifyTokenInput || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setSyncSuccess(false);
        setSyncFeedback(data.error || 'Apify sync failed. Check token or account privacy.');
      } else {
        setSyncSuccess(true);
        setSyncFeedback(
          `Success! Scraped ${data.reelsSynced} Reels and ${data.commentsSynced} comments for @${data.accountUsername} via Apify.`
        );
      }
    } catch (err: any) {
      setSyncSuccess(false);
      setSyncFeedback(err.message || 'Network error triggering Apify sync');
    } finally {
      setTestingSync(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-urowala-950 via-urowala-900 to-navy-900 text-white rounded-3xl p-6 shadow-md border border-urowala-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">
                  Instagram Connection: Apify & Meta
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Recommended: Apify
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Connect <code>@{accountUsername}</code> without Meta App Review hurdles or Facebook Page admin requirements.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://console.apify.com/account/integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-urowala-800 hover:bg-urowala-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition border border-urowala-700"
            >
              <span>Get Apify Token</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Primary: Apify Instagram Connector Card */}
      <div className="bg-[#150d1d] rounded-3xl p-6 border-2 border-pink-900/40 shadow-md">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-pink-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              A
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Apify Instagram Integration</h3>
              <p className="text-xs text-slate-400">
                Directly scrapes public Reels, plays/views, comments, likes, and timestamps for @{targetUsernameInput}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ready for Ingestion</span>
          </span>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Apify API Token (Optional if set in Vercel .env)
            </label>
            <input
              type="password"
              placeholder="apify_api_..."
              value={apifyTokenInput}
              onChange={(e) => setApifyTokenInput(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-[#1c1226] border border-pink-900/50 text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-pink-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Found at <a href="https://console.apify.com/account/integrations" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline">Apify Console &rarr; Settings &rarr; Integrations &rarr; API Token</a>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Target Instagram Account
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">@</span>
              <input
                type="text"
                value={targetUsernameInput}
                onChange={(e) => setTargetUsernameInput(e.target.value)}
                className="w-full text-xs pl-7 pr-3.5 py-2.5 bg-[#1c1226] border border-pink-900/50 text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-pink-500 font-semibold"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Will fetch recent video plays, captions, and comments for this profile
            </p>
          </div>
        </div>

        {/* Trigger Button & Console */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400">
            Uses <code>apify/instagram-scraper</code> actor with automated timeout and dataset ingestion.
          </div>

          <button
            onClick={handleRunApifySync}
            disabled={testingSync}
            className="px-5 py-2.5 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingSync ? 'animate-spin' : ''}`} />
            <span>{testingSync ? 'Running Apify Scraper...' : 'Run Apify Sync Now'}</span>
          </button>
        </div>

        {/* Sync Feedback Message */}
        {syncFeedback && (
          <div className={`mt-4 p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2 ${
            syncSuccess
              ? 'bg-emerald-950/60 text-emerald-200 border-emerald-800'
              : 'bg-rose-950/60 text-rose-200 border-rose-800'
          }`}>
            {syncSuccess ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>{syncFeedback}</div>
          </div>
        )}
      </div>

      {/* Architecture Cards: 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Apify Engine */}
        <div className="bg-[#150d1d] rounded-2xl p-4 border border-pink-900/30 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-white">Apify Ingestion</h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-3">
            Extracts plays, views, comments, hashtags, and media URLs directly without Facebook logins.
          </p>
          <div className="pt-2 border-t border-pink-950 flex items-center justify-between text-[11px] text-slate-400">
            <span>Target: @{targetUsernameInput}</span>
            <span className="text-emerald-400 font-semibold">Zero-auth Scraping</span>
          </div>
        </div>

        {/* Supabase PostgreSQL Storage & Health */}
        <div className="bg-[#150d1d] rounded-2xl p-4 border border-pink-900/30 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
                  <Database className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-white">Supabase PostgreSQL</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {storageStats?.usedPercent ?? 2.5}% Used
              </span>
            </div>

            {/* Storage Gauge / Progress Bar */}
            <div className="space-y-1 mb-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Database Memory:</span>
                <span className="font-bold text-white font-mono">
                  {storageStats?.prettyUsed || '12 MB'} <span className="text-slate-500 font-normal">/ {storageStats?.prettyQuota || '500 MB'}</span>
                </span>
              </div>
              <div className="w-full bg-[#20132b] rounded-full h-2 overflow-hidden border border-pink-950">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(storageStats?.usedPercent || 2.5, 4)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Free: ~{storageStats ? `${(500 - (storageStats.usedBytes / (1024 * 1024))).toFixed(0)} MB` : '488 MB'}</span>
                <span className="text-emerald-400 font-medium">97.5% Available</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-2.5">
              Stores cumulative snapshots in <code className="text-pink-300">reel_snapshots</code> for historical delta calculations.
            </p>
          </div>

          <div className="pt-2 border-t border-pink-950 flex flex-col gap-1 text-[11px] text-slate-400">
            <div className="flex items-center justify-between">
              <span>Reels Index:</span>
              <span className="text-white font-mono">{storageStats?.reelsSize || '288 kB'} ({storageStats?.totalReels || 100} rows)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Snapshots History:</span>
              <span className="text-pink-300 font-mono font-medium">{storageStats?.snapshotsSize || '680 kB'} ({storageStats?.totalSnapshots || 1250} rows)</span>
            </div>
          </div>
        </div>

        {/* Vercel Scheduled Engine */}
        <div className="bg-[#150d1d] rounded-2xl p-4 border border-pink-900/30 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-white">Vercel Cron Job</h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Hourly (0 * * * *)
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-3">
            Triggers Apify or Meta sync every 60 minutes via secure endpoint <code>/api/cron/sync</code>.
          </p>
          <div className="pt-2 border-t border-pink-950 flex items-center justify-between text-[11px] text-slate-400">
            <span>Interval</span>
            <span className="font-semibold text-slate-200">Every 60 minutes</span>
          </div>
        </div>
      </div>

      {/* Meta Graph API Option */}
      <div className="bg-[#150d1d] rounded-2xl p-5 border border-pink-900/30 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                <span>Meta Instagram Graph API (Official Business Insights)</span>
              </h3>
              {hasMetaApp ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  App Configured
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Credentials Required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Required by Meta to pull internal Professional Dashboard data (net follower changes, profile impressions, and private interactions).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasMetaApp ? (
              <a
                href="/api/auth/instagram"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-xs"
              >
                <span>Start Meta OAuth</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setShowMetaForm(!showMetaForm)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-xs"
              >
                <span>{showMetaForm ? 'Close Form' : 'Configure Meta App ID / Token'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Configuration Form if not configured or toggled open */}
        {showMetaForm && (
          <div className="mt-4 pt-4 border-t border-pink-950 space-y-4">
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-200 space-y-1">
              <span className="font-bold block text-pink-300">Why is this required?</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Meta does not allow third-party tools to access your private Instagram Business metrics without either a registered Meta Developer App ID or a Direct Long-Lived Access Token.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Direct Token */}
              <div className="p-4 rounded-xl border border-pink-900/40 bg-[#191024] space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px]">A</span>
                    <span>Direct Meta Access Token (Fastest)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Paste a Long-Lived Token or System User Token from Meta Business Suite / Graph API Explorer.
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Meta Access Token (starts with EAAG...)
                  </label>
                  <input
                    type="password"
                    placeholder="EAAGxxxxxxxxxxxxxxxxxxxx"
                    value={metaToken}
                    onChange={(e) => setMetaToken(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-[#120a1a] border border-pink-900/60 text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              {/* Option B: App ID & Secret for OAuth */}
              <div className="p-4 rounded-xl border border-pink-900/40 bg-[#191024] space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px]">B</span>
                    <span>Meta Developer App Credentials</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Create an App at <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline">developers.facebook.com</a> (Type: Business).
                  </p>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Meta App ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 123456789012345"
                      value={metaAppId}
                      onChange={(e) => setMetaAppId(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-1.5 bg-[#120a1a] border border-pink-900/60 text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Meta App Secret</label>
                    <input
                      type="password"
                      placeholder="App Secret"
                      value={metaAppSecret}
                      onChange={(e) => setMetaAppSecret(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-1.5 bg-[#120a1a] border border-pink-900/60 text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Valid OAuth Redirect URIs Note */}
            <div className="p-3 rounded-xl bg-[#140b1e] border border-pink-950 text-[11px] text-slate-300 space-y-1">
              <span className="font-semibold text-white">Valid OAuth Redirect URIs to add in Facebook Login Settings:</span>
              <div className="font-mono text-[10px] space-y-0.5 text-pink-300">
                <p>• <code>http://localhost:3000/api/auth/instagram/callback</code></p>
                <p>• <code>https://socialmedia.urowala.com/api/auth/instagram/callback</code></p>
              </div>
            </div>

            {metaFeedback && (
              <div className={`p-3 rounded-xl text-xs font-medium ${
                metaSavedSuccess ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {metaFeedback}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowMetaForm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMeta}
                disabled={savingMeta || (!metaToken && !metaAppId)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-xs"
              >
                {savingMeta ? 'Saving...' : 'Save & Connect'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step-by-Step Production Guide */}
      <div className="bg-[#150d1d] rounded-3xl p-6 border border-pink-900/30 shadow-md space-y-6">
        <div>
          <h3 className="text-base font-bold text-white mb-1">
            Production Deployment Instructions
          </h3>
          <p className="text-xs text-slate-400">
            Quick setup guide for connecting Apify, Supabase, and Vercel for <code>socialmedia.urowala.com</code>.
          </p>
        </div>

        <div className="space-y-4">
          {/* Step 1: Apify Token */}
          <div className="p-4 rounded-2xl bg-[#1b1124] border border-pink-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Get Apify API Token</span>
              </h4>
              <a
                href="https://console.apify.com/account/integrations"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>console.apify.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-300">
              Sign up at Apify (free tier includes \$5 monthly credit, sufficient for thousands of periodic Instagram Reel checks). Copy your Personal API Token.
            </p>
          </div>

          {/* Step 2: Supabase Schema */}
          <div className="p-4 rounded-2xl bg-[#1b1124] border border-pink-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Configure Supabase Database</span>
              </h4>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-pink-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>supabase.com/dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-300">
              Run the SQL migration script located at:
            </p>
            <div className="bg-[#120a1a] px-3 py-2 rounded-lg border border-pink-900/50 font-mono text-xs text-pink-300">
              <code>src/supabase/schema.sql</code>
            </div>
          </div>

          {/* Step 3: Vercel Environment Variables */}
          <div className="p-4 rounded-2xl bg-[#1b1124] border border-pink-900/40 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Set Environment Variables in Vercel</span>
            </h4>
            <div className="bg-[#0e0714] border border-pink-950 text-slate-200 p-3.5 rounded-xl font-mono text-[11px] space-y-1 overflow-x-auto">
              <p className="text-amber-300 font-bold"># Apify Instagram Scraping</p>
              <p>APIFY_API_TOKEN=your_apify_api_token</p>
              <p className="text-slate-400 mt-2 font-bold"># Supabase PostgreSQL</p>
              <p>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</p>
              <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key</p>
              <p>SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key</p>
              <p className="text-slate-400 mt-2 font-bold"># Vercel Cron Security</p>
              <p>CRON_SECRET=generate_a_random_32_character_string_here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
