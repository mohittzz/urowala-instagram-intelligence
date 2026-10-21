'use client';

import React, { useState, useEffect } from 'react';
import { 
  FacebookPageItem, 
  FacebookPostItem, 
  FacebookPageSummary, 
  CrossPlatformStats, 
  DateRangePreset 
} from '@/lib/types/analytics';
import { formatCompactNumber, formatExactNumber, formatPercent } from '@/lib/utils/formatters';
import { 
  Users, 
  Eye, 
  Share2, 
  MessageCircle, 
  ThumbsUp, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

interface FacebookPageDashboardProps {
  onSwitchToInstagram?: () => void;
}

export function FacebookPageDashboard({ onSwitchToInstagram }: FacebookPageDashboardProps) {
  const [period, setPeriod] = useState<DateRangePreset>('24h');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [page, setPage] = useState<FacebookPageItem | null>(null);
  const [summary, setSummary] = useState<FacebookPageSummary | null>(null);
  const [posts, setPosts] = useState<FacebookPostItem[]>([]);
  const [crossPlatform, setCrossPlatform] = useState<CrossPlatformStats | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'views' | 'shares' | 'likes' | 'comments'>('views');

  const fetchData = async (selectedPeriod: DateRangePreset) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/facebook/page?period=${selectedPeriod}&_t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setPage(data.page);
        setSummary(data.summary);
        setPosts(data.posts);
        setCrossPlatform(data.crossPlatform);
      }
    } catch (err) {
      console.error('Error fetching Facebook page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(period);
  }, [period]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch('/api/facebook/page', { method: 'POST' });
      await fetchData(period);
    } catch (err) {
      console.warn('Facebook sync notice:', err);
      await fetchData(period);
    } finally {
      setSyncing(false);
    }
  };

  const filteredPosts = posts
    .filter((p) => (selectedTopic === 'all' ? true : p.topicId === selectedTopic))
    .sort((a, b) => {
      if (sortBy === 'views') return b.viewsCount - a.viewsCount;
      if (sortBy === 'shares') return b.sharesCount - a.sharesCount;
      if (sortBy === 'likes') return b.likesCount - a.likesCount;
      return b.commentsCount - a.commentsCount;
    });

  const periodOptions: { id: DateRangePreset; label: string }[] = [
    { id: '24h', label: 'Last 24 Hours' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Hero Page Banner with Cover & Profile Photo - Dark Theme */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0d1629]/95 border border-blue-900/50 shadow-2xl backdrop-blur-md">
        {/* Cover Photo */}
        <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 relative">
          {page?.coverUrl && (
            <img 
              src={page.coverUrl} 
              alt="Facebook Cover" 
              className="w-full h-full object-cover opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1629] via-[#0d1629]/30 to-transparent" />
          
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Meta Page Connected
            </span>
            <a
              href={page?.link || "https://www.facebook.com/954202441100149"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Facebook
            </a>
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-12">
          <div className="flex items-end gap-4">
            {/* Profile Avatar */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ring-4 ring-[#0d1629] shadow-2xl overflow-hidden bg-slate-900 shrink-0">
              {page?.pictureUrl ? (
                <img 
                  src={page.pictureUrl} 
                  alt={page.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#1877F2] flex items-center justify-center text-white text-3xl font-bold">
                  FB
                </div>
              )}
              <div className="absolute bottom-1 right-1 bg-[#1877F2] text-white p-1 rounded-full shadow-md">
                <FacebookIcon className="w-3 h-3" />
              </div>
            </div>

            {/* Title & Stats */}
            <div className="space-y-1 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {page?.name || 'Dr Mohit Sharma AIIMS Urowala'}
                </h1>
                <span className="p-0.5 rounded-full bg-blue-500 text-white" title="Verified Professional Medical Page">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/40">
                  Facebook Page
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium flex items-center gap-2">
                <span>Page ID: <code className="text-blue-300 font-mono">954202441100149</code></span>
                <span>&bull;</span>
                <span className="font-semibold text-white">{formatExactNumber(page?.followersCount || 22327)} Followers</span>
                <span>&bull;</span>
                <span>{formatExactNumber(page?.fanCount || 22327)} Likes</span>
              </p>
            </div>
          </div>

          {/* Quick Platform Switcher & Actions */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            {onSwitchToInstagram && (
              <button
                onClick={onSwitchToInstagram}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-pink-950/60 hover:bg-pink-900/60 text-pink-300 border border-pink-800/50 transition shadow-sm"
                title="Switch to Instagram Dashboard"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                <span>Switch to @dr.mohit_urowala</span>
              </button>
            )}

            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1877F2] hover:bg-blue-600 text-white transition shadow-md shadow-blue-500/25 active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Graph API'}</span>
            </button>
          </div>
        </div>

        {/* About snippet */}
        {page?.about && (
          <div className="px-6 pb-5 pt-2 text-xs text-slate-300 border-t border-blue-950/80 bg-blue-950/30">
            <p className="leading-relaxed"><strong className="text-white font-semibold">Page Mission:</strong> {page.about}</p>
          </div>
        )}
      </div>

      {/* 2. Controls & Period Selection - Dark Theme */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0d1629]/95 p-3 rounded-2xl border border-blue-900/50 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span>Reporting Range:</span>
          <span className="font-bold text-white">{summary?.periodLabel || 'Last 24 Hours'}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Last Synced: <span className="font-mono text-blue-300 font-medium">{summary?.lastSyncedAtIST}</span></span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-blue-900/40 rounded-xl">
          {periodOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPeriod(opt.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                period === opt.id
                  ? 'bg-[#1877F2] text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Summary Metric Cards - Dark Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Page Followers & Net Growth */}
        <div className="bg-[#0d1629]/95 rounded-2xl p-5 border border-blue-900/50 shadow-xl flex flex-col justify-between hover:border-[#1877F2] hover:shadow-blue-500/15 transition group backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Page Followers</span>
              <div className="p-2 rounded-xl bg-blue-950/70 text-blue-400 border border-blue-800/40 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white tracking-tight">
                {formatExactNumber(summary?.followersCount || 22327)}
              </span>
              <span className="text-xs font-mono text-slate-400">
                ({formatCompactNumber(summary?.followersCount || 22327)})
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-950/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Net Growth:</span>
            <div className="flex items-center gap-1">
              <span className={`font-bold ${
                (summary?.netFollowerGrowth ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {(summary?.netFollowerGrowth ?? 0) >= 0 ? `+${summary?.netFollowerGrowth}` : summary?.netFollowerGrowth}
              </span>
              <span className="text-slate-400 font-normal">in {summary?.periodLabel}</span>
              <span className={`inline-flex items-center text-[11px] font-semibold ml-1.5 px-1.5 py-0.5 rounded border ${
                (summary?.netFollowerGrowthDeltaPercent ?? 0) >= 0 
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50' 
                  : 'bg-rose-950/60 text-rose-300 border-rose-800/50'
              }`}>
                {(summary?.netFollowerGrowthDeltaPercent ?? 0) >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-0.5" />
                )}
                {formatPercent(summary?.netFollowerGrowthDeltaPercent ?? 0, 1, true)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Page Video & Content Views */}
        <div className="bg-[#0d1629]/95 rounded-2xl p-5 border border-blue-900/50 shadow-xl flex flex-col justify-between hover:border-[#1877F2] hover:shadow-blue-500/15 transition group backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Page Video Views</span>
              <div className="p-2 rounded-xl bg-blue-950/70 text-blue-400 border border-blue-800/40 group-hover:scale-110 transition-transform">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white tracking-tight">
                {formatCompactNumber(summary?.totalViewsGained || 0)}
              </span>
              <span className="text-xs font-mono text-slate-400">
                ({formatExactNumber(summary?.totalViewsGained || 0)})
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-950/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">{summary?.periodLabel}</span>
            <span className={`flex items-center font-bold ${
              (summary?.viewsGainedDeltaPercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {(summary?.viewsGainedDeltaPercent ?? 0) >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {formatPercent(summary?.viewsGainedDeltaPercent ?? 0, 1, true)}
            </span>
          </div>
        </div>

        {/* Card 3: Post Interactions */}
        <div className="bg-[#0d1629]/95 rounded-2xl p-5 border border-blue-900/50 shadow-xl flex flex-col justify-between hover:border-[#1877F2] hover:shadow-blue-500/15 transition group backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Total Interactions</span>
              <div className="p-2 rounded-xl bg-blue-950/70 text-blue-400 border border-blue-800/40 group-hover:scale-110 transition-transform">
                <ThumbsUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white tracking-tight">
                {formatCompactNumber(summary?.totalInteractions || 0)}
              </span>
              <span className="text-xs font-mono text-slate-400">
                ({formatExactNumber(summary?.totalInteractions || 0)})
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-950/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Reactions & Comments</span>
            <span className={`flex items-center font-bold ${
              (summary?.interactionsDeltaPercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {(summary?.interactionsDeltaPercent ?? 0) >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {formatPercent(summary?.interactionsDeltaPercent ?? 0, 1, true)}
            </span>
          </div>
        </div>

        {/* Card 4: Education Shares */}
        <div className="bg-[#0d1629]/95 rounded-2xl p-5 border border-blue-900/50 shadow-xl flex flex-col justify-between hover:border-[#1877F2] hover:shadow-blue-500/15 transition group backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Health Post Shares</span>
              <div className="p-2 rounded-xl bg-blue-950/70 text-blue-400 border border-blue-800/40 group-hover:scale-110 transition-transform">
                <Share2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white tracking-tight">
                {formatCompactNumber(summary?.totalSharesGained || 426)}
              </span>
              <span className="text-xs font-mono text-slate-400">
                ({formatExactNumber(summary?.totalSharesGained || 426)})
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-950/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Community Circulation</span>
            <span className="flex items-center font-bold text-blue-400">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +12.5%
            </span>
          </div>
        </div>
      </div>

      {/* 4. Cross-Platform Health Audience Synergy Banner - Dark Theme */}
      {crossPlatform && (
        <div className="bg-gradient-to-br from-[#060e20] via-[#091328] to-[#040813] rounded-3xl p-6 text-white border border-blue-900/50 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                Dual Meta Asset Intelligence
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Total Healthcare Reach: {formatExactNumber(crossPlatform.totalCombinedFollowers)} Followers
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Dr. Mohit Sharma commands a balanced 46.7K healthcare education footprint across Instagram and Facebook. Facebook engages patient families seeking Kidney Stone & BPH advice, while Instagram attracts youth preventive health audiences.
              </p>
            </div>

            {/* Split Metrics */}
            <div className="w-full md:w-80 shrink-0 bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-1.5 text-pink-300">
                  <InstagramIcon className="w-3.5 h-3.5" />
                  Instagram: <strong>{formatCompactNumber(crossPlatform.instagramFollowers)}</strong> ({crossPlatform.instagramSharePercent}%)
                </span>
                <span className="flex items-center gap-1.5 text-blue-300">
                  <FacebookIcon className="w-3.5 h-3.5" />
                  Facebook: <strong>{formatCompactNumber(crossPlatform.facebookFollowers)}</strong> ({crossPlatform.facebookSharePercent}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-full"
                  style={{ width: `${crossPlatform.instagramSharePercent}%` }}
                  title={`Instagram: ${crossPlatform.instagramSharePercent}%`}
                />
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full"
                  style={{ width: `${crossPlatform.facebookSharePercent}%` }}
                  title={`Facebook: ${crossPlatform.facebookSharePercent}%`}
                />
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>Combined Period Views: <strong className="text-white">{formatCompactNumber(crossPlatform.combinedViewsGained)}</strong></span>
                <span>Combined Interactions: <strong className="text-white">{formatCompactNumber(crossPlatform.combinedInteractions)}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Top Facebook Posts & Video Analytics - Dark Theme */}
      <div className="bg-[#0d1629]/95 rounded-2xl border border-blue-900/50 shadow-xl overflow-hidden backdrop-blur-md">
        <div className="p-5 border-b border-blue-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <FacebookIcon className="w-4 h-4 text-blue-400" />
              <span>Facebook Health Awareness Posts & Video Reach</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified clinical awareness posts published by Dr. Mohit Sharma AIIMS Urowala
            </p>
          </div>

          {/* Filters & Sorting */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="text-xs border border-blue-900/50 rounded-xl px-3 py-1.5 bg-[#131d33] text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Health Topics</option>
              <option value="kidney_stones">Kidney Stones & Prevention</option>
              <option value="prostate_bph">Prostate Health & BPH</option>
              <option value="uti_bladder">UTI & Bladder Care</option>
              <option value="erectile_dysfunction">Men’s Health & ED</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs border border-blue-900/50 rounded-xl px-3 py-1.5 bg-[#131d33] text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="views">Sort: Views (High to Low)</option>
              <option value="shares">Sort: Shares (High to Low)</option>
              <option value="likes">Sort: Likes (High to Low)</option>
              <option value="comments">Sort: Comments (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#131d33] text-slate-400 font-semibold uppercase tracking-wider border-b border-blue-950/80">
              <tr>
                <th className="py-3 px-4">Post Message & Clinical Topic</th>
                <th className="py-3 px-4 text-right">Video Views</th>
                <th className="py-3 px-4 text-right">Reactions</th>
                <th className="py-3 px-4 text-right">Comments</th>
                <th className="py-3 px-4 text-right">Shares</th>
                <th className="py-3 px-4 text-right">Published (IST)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-950/60 text-slate-300">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-blue-950/30 transition">
                  {/* Message & Topic */}
                  <td className="py-3.5 px-4 max-w-md">
                    <div className="space-y-1">
                      <p className="font-medium text-white line-clamp-2 leading-relaxed">
                        {post.message}
                      </p>
                      <div className="flex items-center gap-2">
                        <span 
                          className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white shadow-2xs"
                          style={{ backgroundColor: post.topicColor }}
                        >
                          {post.topicName}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Views */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                    <div className="flex items-center justify-end gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>{formatExactNumber(post.viewsCount)}</span>
                    </div>
                  </td>

                  {/* Likes */}
                  <td className="py-3.5 px-4 text-right font-mono text-slate-200">
                    <div className="flex items-center justify-end gap-1.5">
                      <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
                      <span>{formatExactNumber(post.likesCount)}</span>
                    </div>
                  </td>

                  {/* Comments */}
                  <td className="py-3.5 px-4 text-right font-mono text-slate-200">
                    <div className="flex items-center justify-end gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{formatExactNumber(post.commentsCount)}</span>
                    </div>
                  </td>

                  {/* Shares */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-400">
                    <div className="flex items-center justify-end gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>{formatExactNumber(post.sharesCount)}</span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {post.createdTimeIST}
                  </td>

                  {/* Link */}
                  <td className="py-3.5 px-4 text-center">
                    <a
                      href={post.permalinkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-950/70 hover:bg-[#1877F2] text-blue-300 hover:text-white font-medium transition border border-blue-900/40"
                      title="View on Facebook"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
