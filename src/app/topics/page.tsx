'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { TopicManagerView } from '@/components/topics/TopicManagerView';
import { TopicPerformanceItem, ReelItem } from '@/lib/types/analytics';
import { DEMO_TOPIC_STATS, DEMO_REELS } from '@/lib/mock/demo-data';

export default function TopicsPage() {
  const [isDemo, setIsDemo] = useState(true);
  const [topicStats, setTopicStats] = useState<TopicPerformanceItem[]>(DEMO_TOPIC_STATS);
  const [reels, setReels] = useState<ReelItem[]>(DEMO_REELS);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/reels');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setIsDemo(Boolean(data.isDemo));
      setReels(data.reels);
      if (data.topicStats) setTopicStats(data.topicStats);
    } catch (err) {
      setIsDemo(true);
      setTopicStats(DEMO_TOPIC_STATS);
      setReels(DEMO_REELS);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTopicChange = async (reelId: string, newTopicId: string) => {
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
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0712] text-slate-100">
      <Header isDemo={isDemo} onRefresh={fetchData} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <TopicManagerView
          topicStats={topicStats}
          reels={reels}
          onTopicChange={handleTopicChange}
        />
      </main>

      <footer className="mt-auto border-t border-pink-900/30 bg-[#120a1b] py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-bold text-slate-200">UROWALA &bull; Topic Intelligence</span>
          <span>8 Core Clinical Domains</span>
        </div>
      </footer>
    </div>
  );
}
