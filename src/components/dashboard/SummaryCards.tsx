'use client';

import React from 'react';
import { SummaryOverview } from '@/lib/types/analytics';
import { formatCompactNumber, formatExactNumber, formatPercent } from '@/lib/utils/formatters';
import { Eye, MessageSquare, Bookmark, UserPlus, Trophy, Target, ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';

interface SummaryCardsProps {
  summary: SummaryOverview;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const topReel = summary.topPerformingReel;
  const topConversionReel = summary.topFollowerConversionReel;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* 1. Views Gained - Dark Theme with Sunset Pink Glow */}
      <div className="bg-[#160d22]/90 rounded-2xl p-4 border border-pink-900/40 shadow-xl flex flex-col justify-between hover:border-pink-500/70 hover:shadow-pink-500/15 transition-all group backdrop-blur-md">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-300">Views Gained</span>
            <div className="p-2 rounded-xl bg-pink-950/70 text-pink-400 border border-pink-800/40 group-hover:scale-110 transition-transform">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {formatCompactNumber(summary.totalViewsGained)}
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({formatExactNumber(summary.totalViewsGained)})
            </span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-pink-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">{summary.periodLabel}</span>
          <span className={`flex items-center font-bold ${
            summary.viewsGainedDeltaPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {summary.viewsGainedDeltaPercent >= 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {formatPercent(summary.viewsGainedDeltaPercent, 1, true)}
          </span>
        </div>
      </div>

      {/* 2. New Comments - Dark Theme with Sunset Purple Glow */}
      <div className="bg-[#160d22]/90 rounded-2xl p-4 border border-purple-900/40 shadow-xl flex flex-col justify-between hover:border-purple-500/70 hover:shadow-purple-500/15 transition-all group backdrop-blur-md">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">New Comments</span>
            <div className="p-2 rounded-xl bg-purple-950/70 text-purple-400 border border-purple-800/40 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {formatExactNumber(summary.totalNewComments)}
            </span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-purple-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">{summary.periodLabel}</span>
          <span className={`flex items-center font-bold ${
            summary.newCommentsDeltaPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {summary.newCommentsDeltaPercent >= 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {formatPercent(summary.newCommentsDeltaPercent, 1, true)}
          </span>
        </div>
      </div>

      {/* 3. Total Interactions - Dark Theme with Sunset Amber Glow */}
      <div className="bg-[#160d22]/90 rounded-2xl p-4 border border-amber-900/40 shadow-xl flex flex-col justify-between hover:border-amber-500/70 hover:shadow-amber-500/15 transition-all group backdrop-blur-md">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Interactions</span>
            <div className="p-2 rounded-xl bg-amber-950/70 text-amber-400 border border-amber-800/40 group-hover:scale-110 transition-transform">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {formatExactNumber(summary.totalInteractions ?? (summary.totalSharesGained || 0) + (summary.totalSavesGained || 0))}
            </span>
            <span className="text-xs text-slate-400">actions</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Shares</span>
              <span className="text-xs font-bold text-slate-200">
                {summary.totalSharesGained !== null ? formatCompactNumber(summary.totalSharesGained) : '—'}
              </span>
            </div>
            <div className="w-px h-3.5 bg-slate-700" />
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Saves</span>
              <span className="text-xs font-bold text-slate-200">
                {summary.totalSavesGained !== null ? formatCompactNumber(summary.totalSavesGained) : '—'}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-amber-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">Period Total</span>
          <span className="text-pink-300 font-semibold text-[11px] bg-pink-950/60 border border-pink-900/40 px-1.5 py-0.5 rounded">
            Meta Insights
          </span>
        </div>
      </div>

      {/* 4. Net Follower Growth - Dark Theme with Sunset Rose Glow */}
      <div className="bg-[#160d22]/90 rounded-2xl p-4 border border-rose-900/40 shadow-xl flex flex-col justify-between hover:border-rose-500/70 hover:shadow-rose-500/15 transition-all group backdrop-blur-md">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300">Net Follower Growth</span>
            <div className="p-2 rounded-xl bg-rose-950/70 text-rose-400 border border-rose-800/40 group-hover:scale-110 transition-transform">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight ${
              summary.netFollowerGrowth >= 0 ? 'text-white' : 'text-amber-400'
            }`}>
              {summary.netFollowerGrowth > 0 ? `+${formatExactNumber(summary.netFollowerGrowth)}` : formatExactNumber(summary.netFollowerGrowth)}
            </span>
            <span className="text-xs text-slate-400">followers</span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-rose-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px] truncate" title={summary.followerGrowthFormulaNote}>
            Account-level net
          </span>
          <span className={`font-semibold text-[11px] px-2 py-0.5 rounded border ${
            summary.netFollowerGrowth >= 0 
              ? 'text-emerald-300 bg-emerald-950/60 border-emerald-800/40' 
              : 'text-amber-300 bg-amber-950/60 border-amber-800/40'
          }`}>
            {summary.netFollowerGrowth >= 0 ? 'Verified Growth' : 'Verified Delta'}
          </span>
        </div>
      </div>

      {/* 5. Best-Performing Reel - Dark Theme */}
      <div className="bg-[#160d22]/90 rounded-2xl p-4 border border-pink-900/40 shadow-xl flex flex-col justify-between hover:border-pink-500/70 hover:shadow-pink-500/15 transition-all group backdrop-blur-md">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Top Velocity Reel</span>
            <div className="p-2 rounded-xl bg-amber-950/70 text-amber-400 border border-amber-800/40 group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          {topReel ? (
            <div className="flex items-center gap-2.5">
              <img
                src={topReel.thumbnailUrl}
                alt="Top Reel"
                className="w-9 h-12 object-cover rounded-md border border-pink-900/60 shadow-md shrink-0 ring-1 ring-pink-500/30"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate" title={topReel.caption}>
                  {topReel.cleanCaption}
                </span>
                <span className="text-xs font-bold text-pink-400">
                  +{formatCompactNumber(topReel.periodMetrics.viewsGained)} views
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-500">No data for period</span>
          )}
        </div>
        <div className="mt-3 pt-2.5 border-t border-pink-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">Highest period views</span>
          {topReel && (
            <a
              href={topReel.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 flex items-center gap-0.5 font-bold"
            >
              <span>View</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* 6. Follower Conversion Top Reel - Dark Theme */}
      <div className="bg-[#160d22]/90 rounded-2xl p-4 border border-purple-900/40 shadow-xl flex flex-col justify-between hover:border-purple-500/70 hover:shadow-purple-500/15 transition-all group backdrop-blur-md">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Top Conversion Reel</span>
            <div className="p-2 rounded-xl bg-purple-950/70 text-purple-400 border border-purple-800/40 group-hover:scale-110 transition-transform">
              <Target className="w-4 h-4" />
            </div>
          </div>
          {topConversionReel && topConversionReel.periodMetrics.followerConversionRate !== null ? (
            <div className="flex items-center gap-2.5">
              <img
                src={topConversionReel.thumbnailUrl}
                alt="Conversion Reel"
                className="w-9 h-12 object-cover rounded-md border border-purple-900/60 shadow-md shrink-0 ring-1 ring-purple-500/30"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate" title={topConversionReel.caption}>
                  {topConversionReel.cleanCaption}
                </span>
                <span className="text-xs font-bold text-purple-400">
                  {topConversionReel.periodMetrics.followerConversionRate}% conv.
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              {topConversionReel ? 'Attributed follows: ' + (topConversionReel.periodMetrics.attributedFollowsGained || '0') : 'Not available through connected API'}
            </div>
          )}
        </div>
        <div className="mt-3 pt-2.5 border-t border-purple-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]" title="Attributed Follows / Period Reach">
            Formula: Follows / Reach
          </span>
          <span className="text-purple-300 font-semibold text-[11px] bg-purple-950/60 border border-purple-900/40 px-1.5 py-0.5 rounded">
            Per-Media
          </span>
        </div>
      </div>
    </div>
  );
}
