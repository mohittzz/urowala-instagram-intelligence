'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { PeriodSelector } from '@/components/dashboard/PeriodSelector';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { PerformanceCharts } from '@/components/dashboard/PerformanceCharts';
import { ReelsTable } from '@/components/dashboard/ReelsTable';
import { FollowerAttributionCard } from '@/components/dashboard/FollowerAttributionCard';
import { DateRangePreset, ReelItem, SummaryOverview, TopicPerformanceItem, HistoricalTimelinePoint, HourlyCommentPoint } from '@/lib/types/analytics';
import { DEMO_REELS, getDemoSummaryOverview, DEMO_TOPIC_STATS, DEMO_TIMELINE_24H, DEMO_HOURLY_COMMENTS } from '@/lib/mock/demo-data';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [period, setPeriod] = useState<DateRangePreset>('24h');
  const [customDates, setCustomDates] = useState<{ start?: string; end?: string }>({});
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [summary, setSummary] = useState<SummaryOverview>(getDemoSummaryOverview('24h'));
  const [reels, setReels] = useState<ReelItem[]>(DEMO_REELS);
  const [topicStats, setTopicStats] = useState<TopicPerformanceItem[]>(DEMO_TOPIC_STATS);
  const [timeline, setTimeline] = useState<HistoricalTimelinePoint[]>(DEMO_TIMELINE_24H);
  const [hourlyComments, setHourlyComments] = useState<HourlyCommentPoint[]>(DEMO_HOURLY_COMMENTS);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDashboardData = async (selectedPeriod: DateRangePreset, dates?: { start?: string; end?: string }) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams({ period: selectedPeriod });
      if (selectedPeriod === 'custom' && dates?.start) {
        params.set('startDate', dates.start);
        if (dates.end) params.set('endDate', dates.end);
      }

      const res = await fetch(`/api/reels?${params.toString()}`);
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
      // Graceful fallback to demo data
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
      // Update local state smoothly
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        isDemo={isDemo}
        lastSyncedAtIST={summary.lastSyncedAtIST}
        onRefresh={() => fetchDashboardData(period, customDates)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error notification banner if any */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Date / Period Controls */}
        <PeriodSelector
          selectedPeriod={period}
          onPeriodChange={handlePeriodChange}
        />

        {/* Summary Metric Cards */}
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
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">UROWALA &bull; Dr. Mohit Sharma</span>
            <span>&bull;</span>
            <span>Target: <code>socialmedia.urowala.com</code></span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Official Meta Graph API v19.0</span>
            <span>&bull;</span>
            <span>Timezone: Asia/Kolkata</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
