'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { PeriodSelector } from '@/components/dashboard/PeriodSelector';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { PerformanceCharts } from '@/components/dashboard/PerformanceCharts';
import { ReelsTable } from '@/components/dashboard/ReelsTable';
import { FollowerAttributionCard } from '@/components/dashboard/FollowerAttributionCard';
import { FacebookPageDashboard } from '@/components/dashboard/FacebookPageDashboard';
import { 
  DateRangePreset, 
  ReelItem, 
  SummaryOverview, 
  TopicPerformanceItem, 
  HistoricalTimelinePoint, 
  HourlyCommentPoint,
  ActivePlatform 
} from '@/lib/types/analytics';
import { DEMO_REELS, getDemoSummaryOverview, DEMO_TOPIC_STATS, DEMO_TIMELINE_24H, DEMO_HOURLY_COMMENTS } from '@/lib/mock/demo-data';
import { RefreshCw, AlertCircle, Sparkles, CheckCircle2, ExternalLink } from 'lucide-react';

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialPlatform = (searchParams.get('platform') as ActivePlatform) || 'instagram';
  
  const [activePlatform, setActivePlatform] = useState<ActivePlatform>(initialPlatform);
  const [period, setPeriod] = useState<DateRangePreset>('24h');
  const [customDates, setCustomDates] = useState<{ start?: string; end?: string }>({});
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [summary, setSummary] = useState<SummaryOverview>(getDemoSummaryOverview('24h'));
  const [reels, setReels] = useState<ReelItem[]>(DEMO_REELS);
  const [topicStats, setTopicStats] = useState<TopicPerformanceItem[]>(DEMO_TOPIC_STATS);
  const [timeline, setTimeline] = useState<HistoricalTimelinePoint[]>(DEMO_TIMELINE_24H);
  const [hourlyComments, setHourlyComments] = useState<HourlyCommentPoint[]>(DEMO_HOURLY_COMMENTS);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isInstagram = activePlatform === 'instagram';

  const fetchDashboardData = async (selectedPeriod: DateRangePreset, dates?: { start?: string; end?: string }) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams({ period: selectedPeriod });
      if (selectedPeriod === 'custom' && dates?.start) {
        params.set('startDate', dates.start);
        if (dates.end) params.set('endDate', dates.end);
      }

      params.set('_t', Date.now().toString());
      const res = await fetch(`/api/reels?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setIsDemo(Boolean(data.isDemo));
      setSummary(data.summary);
      setReels(data.reels);
      if (data.topicStats) setTopicStats(data.topicStats);
      if (data.timeline) setTimeline(data.timeline);
      if (data.hourlyComments) setHourlyComments(data.hourlyComments);
    } catch (err: any) {
      console.warn('API fetch notice, falling back to local dataset:', err);
      setIsDemo(true);
      setSummary(getDemoSummaryOverview(selectedPeriod));
      setReels(DEMO_REELS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(period, customDates);
  }, [period]);

  useEffect(() => {
    const platformQuery = searchParams.get('platform') as ActivePlatform;
    if (platformQuery === 'instagram' || platformQuery === 'facebook') {
      setActivePlatform(platformQuery);
    }
  }, [searchParams]);

  const handlePeriodChange = (newPeriod: DateRangePreset, dates?: { start: string; end: string }) => {
    setPeriod(newPeriod);
    if (dates) {
      setCustomDates(dates);
      fetchDashboardData(newPeriod, dates);
    }
  };

  const handleTopicReassign = async (reelId: string, newTopicId: string) => {
    try {
      await fetch('/api/reels/update-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reelId, topicId: newTopicId }),
      });
      setReels((prev) =>
        prev.map((r) => {
          if (r.id === reelId) {
            const foundTopic = topicStats.find((t) => t.id === newTopicId);
            return {
              ...r,
              topicId: newTopicId,
              topicName: foundTopic?.name || 'General Urology',
              topicColor: foundTopic?.color || '#475569',
              topicManualOverride: true,
            };
          }
          return r;
        })
      );
    } catch (err) {
      console.error('Failed to update topic:', err);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isInstagram 
        ? 'bg-[#0d0714] text-slate-100 selection:bg-pink-500 selection:text-white' 
        : 'bg-[#070b16] text-slate-100 selection:bg-blue-600 selection:text-white'
    }`}>
      {/* Dynamic Ambient Background Glow */}
      <div className={`fixed inset-x-0 top-0 h-[500px] pointer-events-none opacity-60 transition-opacity duration-500 ${
        isInstagram
          ? 'bg-[radial-gradient(ellipse_at_top,_rgba(225,48,108,0.22),_rgba(131,58,180,0.15),_transparent_75%)]'
          : 'bg-[radial-gradient(ellipse_at_top,_rgba(24,119,242,0.22),_rgba(12,99,212,0.12),_transparent_75%)]'
      }`} />

      <Header
        isDemo={isDemo}
        lastSyncedAtIST={summary.lastSyncedAtIST}
        onRefresh={() => fetchDashboardData(period, customDates)}
        activePlatform={activePlatform}
        onPlatformChange={(p) => setActivePlatform(p)}
      />

      <main className="relative flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error notification banner if any */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2 backdrop-blur-md">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Distinctive Dark Profile Switcher Bar with Logo Colors */}
        <div className={`rounded-2xl p-2.5 border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors backdrop-blur-md ${
          isInstagram
            ? 'bg-[#150d1e]/90 border-pink-900/40 shadow-pink-500/5'
            : 'bg-[#0b1222]/90 border-blue-900/40 shadow-blue-500/5'
        }`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-2">Active Profile:</span>
            
            <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
              {/* Instagram Button */}
              <button
                onClick={() => setActivePlatform('instagram')}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  isInstagram
                    ? 'bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white shadow-lg shadow-pink-500/30 ring-2 ring-pink-500/40'
                    : 'text-slate-400 hover:text-pink-300 hover:bg-white/5'
                }`}
              >
                <div className={`p-1 rounded-md ${isInstagram ? 'bg-white/20' : 'bg-pink-950/60 text-pink-400'}`}>
                  <InstagramIcon className="w-3.5 h-3.5" />
                </div>
                <span>Instagram: @dr.mohit_urowala</span>
                <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded font-extrabold ${
                  isInstagram ? 'bg-white/20 text-white' : 'bg-pink-950/60 text-pink-300 border border-pink-900/50'
                }`}>
                  24.4K
                </span>
              </button>

              {/* Facebook Button */}
              <button
                onClick={() => setActivePlatform('facebook')}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  !isInstagram
                    ? 'bg-[#1877F2] text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/40'
                    : 'text-slate-400 hover:text-blue-300 hover:bg-white/5'
                }`}
              >
                <div className={`p-1 rounded-md ${!isInstagram ? 'bg-white/20' : 'bg-blue-950/60 text-blue-400'}`}>
                  <FacebookIcon className="w-3.5 h-3.5" />
                </div>
                <span>Facebook: Dr Mohit Sharma AIIMS</span>
                <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded font-extrabold ${
                  !isInstagram ? 'bg-white/20 text-white' : 'bg-blue-950/60 text-blue-300 border border-blue-900/50'
                }`}>
                  22.3K
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs pr-2">
            <span className={`inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl border font-medium backdrop-blur-xs ${
              isInstagram 
                ? 'bg-pink-950/40 text-pink-300 border-pink-800/50' 
                : 'bg-blue-950/40 text-blue-300 border-blue-800/50'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              Cross-Platform Total: <strong className="font-mono font-bold text-white">46,736</strong> Followers
            </span>
          </div>
        </div>

        {/* 2. Platform View Switcher */}
        {activePlatform === 'facebook' ? (
          <FacebookPageDashboard onSwitchToInstagram={() => setActivePlatform('instagram')} />
        ) : (
          <>
            {/* Instagram Studio Header Banner with Dr. Mohit Sharma Official Scrub Picture */}
            <div className="bg-gradient-to-r from-[#170a24] via-[#10081a] to-[#1e0d28] rounded-3xl p-6 text-white border border-pink-900/50 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-500/15 via-purple-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex items-center gap-5">
                  {/* Avatar with User's Official Uploaded Image & Instagram Story Rainbow Ring */}
                  <div className="p-[3px] rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-xl shadow-pink-500/25 shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-slate-900 p-0.5">
                      <img 
                        src="/dr-mohit-profile.jpg" 
                        alt="Dr. Mohit Sharma MCh Urology" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                        {summary.accountUsername ? `@${summary.accountUsername}` : '@dr.mohit_urowala'}
                      </h2>
                      <span className="p-0.5 rounded-full bg-blue-500 text-white" title="Verified Creator">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40">
                        Instagram Creator
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 font-semibold flex items-center gap-2">
                      <span>Dr. Mohit Sharma</span>
                      <span className="text-pink-400 font-medium">&bull;</span>
                      <span className="text-pink-300 font-medium">MCh Urology (AIIMS)</span>
                      <span className="text-pink-400 font-medium">&bull;</span>
                      <span className="text-slate-300 font-normal">Laser & Robotic Surgery</span>
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                      <span><strong className="text-white font-mono">{summary.followersCount.toLocaleString()}</strong> Followers</span>
                      <span>&bull;</span>
                      <span><strong className="text-white font-mono">{summary.mediaCount}</strong> Reels</span>
                      <span>&bull;</span>
                      <span className="text-pink-300 font-medium">socialmedia.urowala.com</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
                  <a
                    href={`https://www.instagram.com/${summary.accountUsername || 'dr.mohit_urowala'}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition border border-white/10 shadow-sm"
                  >
                    <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                  <button
                    onClick={() => setActivePlatform('facebook')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1877F2] hover:bg-blue-600 text-white transition shadow-md shadow-blue-500/20"
                  >
                    <FacebookIcon className="w-3.5 h-3.5" />
                    <span>View Facebook Page</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Date / Period Controls */}
            <PeriodSelector
              selectedPeriod={period}
              onPeriodChange={handlePeriodChange}
            />

            {/* Summary Metric Cards with Instagram Sunset Colors */}
            <SummaryCards summary={summary} />

            {/* Follower Attribution Deep Dive Card */}
            <FollowerAttributionCard reels={reels} />

            {/* Interactive Charts: Velocity & Topics */}
            <PerformanceCharts
              timeline={timeline}
              topicStats={topicStats}
              hourlyComments={hourlyComments}
            />

            {/* Comprehensive Reels Table */}
            <ReelsTable
              reels={reels}
              periodLabel={summary.periodLabel}
              onTopicChange={handleTopicReassign}
            />
          </>
        )}
      </main>

      {/* Dynamic Dark Footer with Platform Branding */}
      <footer className={`mt-auto border-t py-6 text-xs transition-colors ${
        isInstagram
          ? 'bg-[#09050f] border-pink-900/30 text-slate-400'
          : 'bg-[#050913] border-blue-900/30 text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">UROWALA &bull; Dr. Mohit Sharma</span>
            <span>&bull;</span>
            <span className={isInstagram ? 'text-pink-400 font-semibold' : 'text-blue-400 font-semibold'}>
              {isInstagram ? 'Instagram Studio Active' : 'Facebook Page Studio Active'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Official Meta Graph API v19.0</span>
            <span>&bull;</span>
            <span>Asia/Kolkata (IST)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0d0714]">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin text-pink-500" />
          <span>Loading Urowala Intelligence...</span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
