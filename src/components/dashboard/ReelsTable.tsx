'use client';

import React, { useState } from 'react';
import { ReelItem } from '@/lib/types/analytics';
import { DEMO_TOPICS } from '@/lib/mock/demo-data';
import {
  formatCompactNumber,
  formatExactNumber,
  formatPercent,
  formatWatchTime,
  truncateCaption,
} from '@/lib/utils/formatters';
import { exportReelsToCSV } from '@/lib/utils/csv-export';
import {
  Search,
  Filter,
  Download,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Tag,
  Check,
} from 'lucide-react';

interface ReelsTableProps {
  reels: ReelItem[];
  periodLabel: string;
  onTopicChange?: (reelId: string, newTopicId: string) => Promise<void>;
}

type SortField =
  | 'viewsGained'
  | 'lifetimeViews'
  | 'commentsGained'
  | 'commentToViewRatio'
  | 'shares'
  | 'saves'
  | 'attributedFollows'
  | 'engagementRate'
  | 'postedAt';

export function ReelsTable({ reels, periodLabel, onTopicChange }: ReelsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [sortField, setSortField] = useState<SortField>('viewsGained');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [editingTopicReelId, setEditingTopicReelId] = useState<string | null>(null);

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  // Filter and sort
  const filteredReels = reels.filter((r) => {
    const matchesSearch =
      r.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.topicName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === 'all' || r.topicId === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  filteredReels.sort((a, b) => {
    let aVal = 0;
    let bVal = 0;

    switch (sortField) {
      case 'viewsGained':
        aVal = a.periodMetrics.viewsGained;
        bVal = b.periodMetrics.viewsGained;
        break;
      case 'lifetimeViews':
        aVal = a.lifetimeMetrics.views;
        bVal = b.lifetimeMetrics.views;
        break;
      case 'commentsGained':
        aVal = a.periodMetrics.commentsGained;
        bVal = b.periodMetrics.commentsGained;
        break;
      case 'commentToViewRatio':
        aVal = a.periodMetrics.commentToViewRatio;
        bVal = b.periodMetrics.commentToViewRatio;
        break;
      case 'shares':
        aVal = a.periodMetrics.sharesGained ?? -1;
        bVal = b.periodMetrics.sharesGained ?? -1;
        break;
      case 'saves':
        aVal = a.periodMetrics.savesGained ?? -1;
        bVal = b.periodMetrics.savesGained ?? -1;
        break;
      case 'attributedFollows':
        aVal = a.periodMetrics.attributedFollowsGained ?? -1;
        bVal = b.periodMetrics.attributedFollowsGained ?? -1;
        break;
      case 'engagementRate':
        aVal = a.periodMetrics.engagementRate;
        bVal = b.periodMetrics.engagementRate;
        break;
      case 'postedAt':
        aVal = new Date(a.postedAt).getTime();
        bVal = new Date(b.postedAt).getTime();
        break;
    }

    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const handleTopicSelect = async (reelId: string, topicId: string) => {
    setEditingTopicReelId(null);
    if (onTopicChange) {
      await onTopicChange(reelId, topicId);
    } else {
      // Local fallback
      try {
        await fetch('/api/reels/update-topic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reelId, topicId }),
        });
      } catch (err) {
        console.warn('Topic change error:', err);
      }
    }
  };

  return (
    <div className="bg-[#150d1f]/90 rounded-2xl border border-pink-900/40 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-pink-950/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
            <span>Reel Intelligence Performance Table</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-950/70 text-pink-300 border border-pink-800/50">
              {filteredReels.length} Reels
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Sorted by <strong className="text-pink-400">{sortField}</strong> ({sortDir.toUpperCase()}) across {periodLabel}
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search caption or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-[#1d122b] border border-pink-900/50 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
            />
          </div>

          {/* Topic Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="text-xs px-3 py-2 bg-[#1d122b] border border-pink-900/50 rounded-xl font-medium text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-pink-500 transition cursor-pointer"
            >
              <option value="all">All Topics (8)</option>
              {DEMO_TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={() => exportReelsToCSV(filteredReels, periodLabel)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1d122b] hover:bg-pink-950/60 hover:text-pink-300 text-slate-300 font-semibold rounded-xl text-xs transition active:scale-95 shadow-md border border-pink-900/40"
            title="Download full analytics as CSV"
          >
            <Download className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead className="bg-[#1c112a] text-[11px] uppercase tracking-wider font-semibold text-slate-400 border-b border-pink-950/80">
            <tr>
              <th className="py-3 px-4">Reel / Topic</th>
              <th
                onClick={() => handleSort('viewsGained')}
                className="py-3 px-3 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1">
                  <span>Period Views</span>
                  <ArrowUpDown className="w-3 h-3 text-pink-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('lifetimeViews')}
                className="py-3 px-3 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1">
                  <span>Lifetime Views</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('commentsGained')}
                className="py-3 px-3 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1">
                  <span>Comments Gained</span>
                  <ArrowUpDown className="w-3 h-3 text-purple-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('commentToViewRatio')}
                className="py-3 px-3 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1">
                  <span>Comment Rate</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('shares')}
                className="py-3 px-3 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1">
                  <span>Shares / Saves</span>
                  <ArrowUpDown className="w-3 h-3 text-amber-400" />
                </div>
              </th>
              <th className="py-3 px-3">Reach / Watch</th>
              <th
                onClick={() => handleSort('attributedFollows')}
                className="py-3 px-3 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1">
                  <span>Attributed Follows</span>
                  <ArrowUpDown className="w-3 h-3 text-rose-400" />
                </div>
              </th>
              <th className="py-3 px-3">Momentum</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-950/60 font-normal">
            {filteredReels.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-500">
                  No Reels match the active filters.
                </td>
              </tr>
            ) : (
              filteredReels.map((reel) => {
                const isEditingTopic = editingTopicReelId === reel.id;

                return (
                  <tr key={reel.id} className="hover:bg-pink-950/20 transition group">
                    {/* Thumbnail + Caption + Topic */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-start gap-3">
                        <a
                          href={reel.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 relative group/thumb"
                        >
                          <img
                            src={reel.thumbnailUrl}
                            alt="Reel thumbnail"
                            className="w-12 h-16 object-cover rounded-lg border border-slate-200 shadow-2xs group-hover/thumb:opacity-90 transition"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 bg-black/40 rounded-lg transition">
                            <ExternalLink className="w-3.5 h-3.5 text-white" />
                          </div>
                        </a>

                        <div className="min-w-0 flex-1">
                          {/* Caption */}
                          <p
                            className="font-medium text-white line-clamp-2 text-xs leading-snug mb-1"
                            title={reel.caption}
                          >
                            {reel.caption}
                          </p>

                          {/* Topic Pill & Quick Reassignment */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isEditingTopic ? (
                              <div className="flex items-center gap-1 mt-1">
                                <select
                                  autoFocus
                                  defaultValue={reel.topicId}
                                  onChange={(e) => handleTopicSelect(reel.id, e.target.value)}
                                  className="text-[11px] py-0.5 px-1.5 border border-pink-500 rounded bg-[#1e122b] text-white"
                                >
                                  {DEMO_TOPICS.map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.name}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => setEditingTopicReelId(null)}
                                  className="text-[10px] text-pink-300 hover:text-white underline"
                                >
                                  Done
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingTopicReelId(reel.id)}
                                className="group/pill inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border transition"
                                style={{
                                  backgroundColor: `${reel.topicColor}20`,
                                  borderColor: `${reel.topicColor}50`,
                                  color: reel.topicColor,
                                }}
                                title="Click to reassign topic"
                              >
                                <Tag className="w-2.5 h-2.5" />
                                <span>{reel.topicName}</span>
                                <span className="opacity-0 group-hover/pill:opacity-100 text-[9px] underline ml-0.5 text-slate-400">
                                  edit
                                </span>
                              </button>
                            )}

                            <span suppressHydrationWarning className="text-[10px] text-slate-400">
                              {reel.postedAtIST.split(',')[0]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Period Views */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-white text-sm">
                        +{formatCompactNumber(reel.periodMetrics.viewsGained)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {formatExactNumber(reel.periodMetrics.viewsGained)} views
                      </div>
                    </td>

                    {/* Lifetime Views */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">
                        {formatCompactNumber(reel.lifetimeMetrics.views)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {formatExactNumber(reel.lifetimeMetrics.views)}
                      </div>
                    </td>

                    {/* Comments Gained */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">
                        +{reel.periodMetrics.commentsGained}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Total {reel.lifetimeMetrics.comments}
                      </div>
                    </td>

                    {/* Comment-to-View Ratio */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-pink-400">
                        {formatPercent(reel.periodMetrics.commentToViewRatio, 2)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {reel.periodMetrics.engagementRate}% eng.
                      </div>
                    </td>

                    {/* Shares & Saves */}
                    <td className="py-3 px-3">
                      <div className="text-slate-200 font-medium">
                        {reel.periodMetrics.sharesGained !== null ? `+${reel.periodMetrics.sharesGained} sh` : '—'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {reel.periodMetrics.savesGained !== null ? `+${reel.periodMetrics.savesGained} sv` : '—'}
                      </div>
                    </td>

                    {/* Reach & Watch Time */}
                    <td className="py-3 px-3">
                      <div className="text-slate-200 font-medium">
                        {formatCompactNumber(reel.lifetimeMetrics.reach)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {reel.lifetimeMetrics.avgWatchTime ? formatWatchTime(reel.lifetimeMetrics.avgWatchTime) : '—'}
                      </div>
                    </td>

                    {/* Attributed Follows & Conversion */}
                    <td className="py-3 px-3">
                      {reel.periodMetrics.attributedFollowsGained !== null ? (
                        <div>
                          <div className="font-bold text-white">
                            +{reel.periodMetrics.attributedFollowsGained} follows
                          </div>
                          {reel.periodMetrics.followerConversionRate !== null ? (
                            <div
                              className="text-[10px] text-rose-400 font-semibold cursor-help"
                              title={reel.periodMetrics.followerConversionFormula}
                            >
                              {reel.periodMetrics.followerConversionRate}% conv.
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400">No reach denominator</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic" title="Not provided through connected Meta API for this Reel">
                          Not available
                        </div>
                      )}
                    </td>

                    {/* Momentum Trend */}
                    <td className="py-3 px-3">
                      {reel.periodMetrics.momentumTrend === 'surging' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-800/50">
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                          <span>+{reel.periodMetrics.momentumDeltaPercent}%</span>
                        </span>
                      ) : reel.periodMetrics.momentumTrend === 'cooling' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          <TrendingDown className="w-3 h-3 text-slate-400" />
                          <span>{reel.periodMetrics.momentumDeltaPercent}%</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/70 text-blue-300 border border-blue-800/50">
                          <Minus className="w-3 h-3 text-blue-400" />
                          <span>Steady</span>
                        </span>
                      )}
                    </td>

                    {/* Open on Instagram Button */}
                    <td className="py-3 px-4 text-right">
                      <a
                        href={reel.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#221334] hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 text-slate-200 hover:text-white font-semibold rounded-lg text-xs transition border border-pink-900/40 shadow-sm"
                        title="Open Reel on Instagram"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
