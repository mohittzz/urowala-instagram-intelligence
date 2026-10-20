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
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-urowala-600" />
              <span>Urology Topic Performance Dashboard</span>
            </h2>
            <p className="text-xs text-slate-500">
              Aggregated views, comments, and engagement across Dr. Mohit Sharma's 8 core urology pillars
            </p>
          </div>

          <button
            onClick={() => setActiveTopicId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition self-start sm:self-auto ${
              activeTopicId === 'all'
                ? 'bg-urowala-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between shadow-2xs ${
                  isSelected
                    ? 'border-urowala-600 bg-urowala-50/40 ring-2 ring-urowala-500/20'
                    : 'border-slate-200 bg-white hover:border-urowala-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: topic.color }}
                    />
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {topic.reelCount} Reels
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1">{topic.name}</h3>

                  <div className="space-y-1.5 mt-3 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>Period Views</span>
                      </span>
                      <strong className="text-slate-900">+{formatCompactNumber(topic.viewsGained)}</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>New Comments</span>
                      </span>
                      <strong className="text-slate-900">+{topic.commentsGained}</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 text-slate-400" />
                        <span>Attributed Follows</span>
                      </span>
                      <strong className="text-rose-600">
                        {topic.attributedFollows !== null ? `+${topic.attributedFollows}` : '—'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Engage Rate:</span>
                  <span className="font-bold text-urowala-700">{topic.avgEngagementRate}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Topic Assignment Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Tag className="w-4 h-4 text-urowala-600" />
              <span>Topic Tagging & Manual Categorization Manager</span>
            </h3>
            <p className="text-xs text-slate-500">
              Captions are auto-classified via clinical keyword detection. Authorized users can reassign categories below.
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600 self-start sm:self-auto">
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
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <img
                    src={reel.thumbnailUrl}
                    alt="Thumb"
                    className="w-12 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 line-clamp-2 mb-1">
                      {reel.caption}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span>Posted: {reel.postedAtIST.split(',')[0]}</span>
                      <span>&bull;</span>
                      <span>Lifetime: {formatCompactNumber(reel.lifetimeMetrics.views)} views</span>
                      <span>&bull;</span>
                      <span>Period: +{formatCompactNumber(reel.periodMetrics.viewsGained)} views</span>
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
                        className="text-xs py-1 px-2 border border-urowala-500 rounded-lg bg-white text-slate-900 shadow-xs"
                      >
                        {DEMO_TOPICS.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setEditingReelId(null)}
                        className="text-xs text-slate-500 hover:text-slate-800 underline px-1"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5"
                        style={{
                          backgroundColor: `${reel.topicColor}12`,
                          borderColor: `${reel.topicColor}30`,
                          color: reel.topicColor,
                        }}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{reel.topicName}</span>
                      </span>

                      <button
                        onClick={() => setEditingReelId(reel.id)}
                        className="p-1.5 text-slate-400 hover:text-urowala-600 hover:bg-urowala-50 rounded-lg transition"
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
                    className="p-1.5 text-slate-400 hover:text-slate-700 transition"
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
