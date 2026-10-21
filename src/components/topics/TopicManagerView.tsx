'use client';

import React, { useState } from 'react';
import { TopicPerformanceItem, ReelItem } from '@/lib/types/analytics';
import { DEMO_TOPICS } from '@/lib/mock/demo-data';
import { formatCompactNumber, formatExactNumber, formatPercent } from '@/lib/utils/formatters';
import { Layers, Tag, Edit3, Check, BarChart2, Eye, MessageSquare, ExternalLink, Bookmark, Target } from 'lucide-react';

interface TopicManagerViewProps {
  topicStats: TopicPerformanceItem[];
  reels: ReelItem[];
  onTopicChange?: (reelId: string, newTopicId: string) => Promise<void>;
}

export function TopicManagerView({ topicStats, reels, onTopicChange }: TopicManagerViewProps) {
  const [activeTopicId, setActiveTopicId] = useState<string>('all');
  const [editingReelId, setEditingReelId] = useState<string | null>(null);

  const filteredReels = activeTopicId === 'all'
    ? reels
    : reels.filter((r) => r.topicId === activeTopicId);

  const handleTopicSelect = async (reelId: string, newTopicId: string) => {
    setEditingReelId(null);
    if (onTopicChange) {
      await onTopicChange(reelId, newTopicId);
    } else {
      try {
        await fetch('/api/reels/update-topic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reelId, topicId: newTopicId }),
        });
      } catch (err) {
        console.warn('Update topic failed:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards by Urology Topic */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-pink-400" />
              <span>Urology Topic Performance Dashboard</span>
            </h2>
            <p className="text-xs text-slate-400">
              Aggregated views, comments, and engagement across Dr. Mohit Sharma's 8 core urology pillars
            </p>
          </div>

          <button
            onClick={() => setActiveTopicId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition self-start sm:self-auto ${
              activeTopicId === 'all'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white'
                : 'bg-[#1b1124] text-slate-300 hover:bg-[#251833] border border-pink-900/40'
            }`}
          >
            Show All Topics ({reels.length} Reels)
          </button>
        </div>

        {/* 8 Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topicStats.map((topic) => {
            const isSelected = activeTopicId === topic.id;

            return (
              <div
                key={topic.id}
                onClick={() => setActiveTopicId(topic.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between shadow-md ${
                  isSelected
                    ? 'border-pink-500 bg-pink-950/30 ring-2 ring-pink-500/30'
                    : 'border-pink-900/30 bg-[#150d1d] hover:border-pink-500/50 hover:bg-[#1a1024]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full shadow-xs"
                      style={{ backgroundColor: topic.color }}
                    />
                    <span className="text-[11px] font-semibold text-pink-300 bg-pink-950/60 border border-pink-800/40 px-2 py-0.5 rounded-full">
                      {topic.reelCount} Reels
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm mb-1">{topic.name}</h3>

                  <div className="space-y-1.5 mt-3 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>Period Views</span>
                      </span>
                      <strong className="text-white">+{formatCompactNumber(topic.viewsGained)}</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>New Comments</span>
                      </span>
                      <strong className="text-white">+{topic.commentsGained}</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 text-slate-400" />
                        <span>Attributed Follows</span>
                      </span>
                      <strong className="text-rose-400">
                        {topic.attributedFollows !== null ? `+${topic.attributedFollows}` : '—'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-pink-950/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Engage Rate:</span>
                  <span className="font-bold text-pink-300">{topic.avgEngagementRate}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Topic Assignment Table */}
      <div className="bg-[#150d1d] rounded-2xl p-5 border border-pink-900/30 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-pink-950 gap-2">
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              <Tag className="w-4 h-4 text-pink-400" />
              <span>Topic Tagging & Manual Categorization Manager</span>
            </h3>
            <p className="text-xs text-slate-400">
              Captions are auto-classified via clinical keyword detection. Authorized users can reassign categories below.
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 bg-pink-950/50 border border-pink-800/40 rounded-lg text-pink-300 self-start sm:self-auto">
            Viewing: {activeTopicId === 'all' ? 'All Topics' : DEMO_TOPICS.find((t) => t.id === activeTopicId)?.name} ({filteredReels.length} Reels)
          </span>
        </div>

        {/* List of Reels for this topic */}
        <div className="space-y-3">
          {filteredReels.map((reel) => {
            const isEditing = editingReelId === reel.id;

            return (
              <div
                key={reel.id}
                className="p-3.5 rounded-xl border border-pink-950/80 hover:border-pink-800/60 bg-[#1a1024]/80 hover:bg-[#1f132b] transition flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <img
                    src={reel.thumbnailUrl}
                    alt="Thumb"
                    className="w-12 h-16 object-cover rounded-lg border border-pink-900/40 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white line-clamp-2 mb-1">
                      {reel.caption}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span suppressHydrationWarning>Posted: {reel.postedAtIST.split(',')[0]}</span>
                      <span>&bull;</span>
                      <span>Lifetime: {formatCompactNumber(reel.lifetimeMetrics.views)} views</span>
                      <span>&bull;</span>
                      <span className="text-pink-300 font-medium">Period: +{formatCompactNumber(reel.periodMetrics.viewsGained)} views</span>
                    </div>
                  </div>
                </div>

                {/* Topic Selector */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <select
                        autoFocus
                        defaultValue={reel.topicId}
                        onChange={(e) => handleTopicSelect(reel.id, e.target.value)}
                        className="text-xs py-1 px-2 border border-pink-500 rounded-lg bg-[#251833] text-white shadow-xs focus:outline-hidden"
                      >
                        {DEMO_TOPICS.map((t) => (
                          <option key={t.id} value={t.id} className="bg-[#1f132b] text-white">
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setEditingReelId(null)}
                        className="text-xs text-pink-400 hover:text-pink-300 underline px-1"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5"
                        style={{
                          backgroundColor: `${reel.topicColor}20`,
                          borderColor: `${reel.topicColor}50`,
                          color: '#fce7f3',
                        }}
                      >
                        <Tag className="w-3 h-3 text-pink-400" />
                        <span>{reel.topicName}</span>
                      </span>

                      <button
                        onClick={() => setEditingReelId(reel.id)}
                        className="p-1.5 text-slate-400 hover:text-pink-300 hover:bg-pink-950/60 rounded-lg transition"
                        title="Change Category"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <a
                    href={reel.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-white transition"
                    title="Open on Instagram"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
