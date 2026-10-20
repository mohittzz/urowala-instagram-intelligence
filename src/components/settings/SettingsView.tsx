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

interface SettingsViewProps {
  isConfigured?: boolean;
  accountUsername?: string;
  lastSyncedAt?: string;
  hasApifyToken?: boolean;
  provider?: string;
}

export function SettingsView({
  isConfigured = false,
  accountUsername = 'dr.mohit_urowala',
  lastSyncedAt,
  hasApifyToken = false,
  provider = 'apify',
}: SettingsViewProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [apifyTokenInput, setApifyTokenInput] = useState('');
  const [targetUsernameInput, setTargetUsernameInput] = useState(accountUsername || 'dr.mohit_urowala');
  const [testingSync, setTestingSync] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);

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
      <div className="bg-white rounded-3xl p-6 border-2 border-urowala-600/30 shadow-md">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              A
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Apify Instagram Integration</h3>
              <p className="text-xs text-slate-500">
                Directly scrapes public Reels, plays/views, comments, likes, and timestamps for @{targetUsernameInput}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ready for Ingestion</span>
          </span>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Apify API Token (Optional if set in Vercel .env)
            </label>
            <input
              type="password"
              placeholder="apify_api_..."
              value={apifyTokenInput}
              onChange={(e) => setApifyTokenInput(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-urowala-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Found at <a href="https://console.apify.com/account/integrations" target="_blank" rel="noopener noreferrer" className="text-urowala-600 underline">Apify Console &rarr; Settings &rarr; Integrations &rarr; API Token</a>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Instagram Account
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">@</span>
              <input
                type="text"
                value={targetUsernameInput}
                onChange={(e) => setTargetUsernameInput(e.target.value)}
                className="w-full text-xs pl-7 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-urowala-500 font-semibold text-slate-800"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Will fetch recent video plays, captions, and comments for this profile
            </p>
          </div>
        </div>

        {/* Trigger Button & Console */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500">
            Uses <code>apify/instagram-scraper</code> actor with automated timeout and dataset ingestion.
          </div>

          <button
            onClick={handleRunApifySync}
            disabled={testingSync}
            className="px-5 py-2.5 bg-urowala-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingSync ? 'animate-spin' : ''}`} />
            <span>{testingSync ? 'Running Apify Scraper...' : 'Run Apify Sync Now'}</span>
          </button>
        </div>

        {/* Sync Feedback Message */}
        {syncFeedback && (
          <div className={`mt-4 p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2 ${
            syncSuccess
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {syncSuccess ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>{syncFeedback}</div>
          </div>
        )}
      </div>

      {/* Architecture Cards: 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Apify Engine */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">Apify Ingestion</h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Extracts plays, views, comments, hashtags, and media URLs directly without Facebook logins.
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Target: @{targetUsernameInput}</span>
            <span className="text-emerald-600 font-semibold">Zero-auth Scraping</span>
          </div>
        </div>

        {/* Supabase PostgreSQL */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">Supabase PostgreSQL</h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-urowala-50 text-urowala-700 border border-urowala-200">
              RLS Secured
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Stores hourly cumulative snapshots in <code>reel_snapshots</code> for historical delta calculations.
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Schema</span>
            <span className="text-urowala-700 font-semibold">Migration generated</span>
          </div>
        </div>

        {/* Vercel Scheduled Engine */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">Vercel Cron Job</h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Hourly (0 * * * *)
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Triggers Apify or Meta sync every 60 minutes via secure endpoint <code>/api/cron/sync</code>.
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Interval</span>
            <span className="font-semibold text-slate-700">Every 60 minutes</span>
          </div>
        </div>
      </div>

      {/* Meta Graph API Option */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-600" />
            <span>Alternative: Meta Instagram Graph API (OAuth)</span>
          </h3>
          <p className="text-xs text-slate-500">
            If you also wish to connect via official Facebook Business Login for private media insights (e.g. per-media follows, reach, saves).
          </p>
        </div>

        <a
          href="/api/auth/instagram"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition active:scale-95 shrink-0"
        >
          <span>Connect Meta OAuth</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Step-by-Step Production Guide */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Production Deployment Instructions
          </h3>
          <p className="text-xs text-slate-500">
            Quick setup guide for connecting Apify, Supabase, and Vercel for <code>socialmedia.urowala.com</code>.
          </p>
        </div>

        <div className="space-y-4">
          {/* Step 1: Apify Token */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Get Apify API Token</span>
              </h4>
              <a
                href="https://console.apify.com/account/integrations"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>console.apify.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-600">
              Sign up at Apify (free tier includes \$5 monthly credit, sufficient for thousands of periodic Instagram Reel checks). Copy your Personal API Token.
            </p>
          </div>

          {/* Step 2: Supabase Schema */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-urowala-600 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Configure Supabase Database</span>
              </h4>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-urowala-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>supabase.com/dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-600">
              Run the SQL migration script located at:
            </p>
            <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs text-slate-800">
              <code>src/supabase/schema.sql</code>
            </div>
          </div>

          {/* Step 3: Vercel Environment Variables */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-urowala-600 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Set Environment Variables in Vercel</span>
            </h4>
            <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-[11px] space-y-1 overflow-x-auto">
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
