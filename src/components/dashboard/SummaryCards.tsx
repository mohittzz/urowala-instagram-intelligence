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
      {/* 1. Views Gained */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-urowala-300 transition group">
        <div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Views Gained</span>
            <div className="p-2 rounded-xl bg-urowala-50 text-urowala-600 group-hover:bg-urowala-100 transition">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatCompactNumber(summary.totalViewsGained)}
            </span>
            <span className="text-xs font-mono text-slate-500">
              ({formatExactNumber(summary.totalViewsGained)})
            </span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">{summary.periodLabel}</span>
          <span className="flex items-center text-emerald-600 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            {formatPercent(summary.viewsGainedDeltaPercent, 1, true)}
          </span>
        </div>
      </div>

      {/* 2. New Comments */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-urowala-300 transition group">
        <div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">New Comments</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-100 transition">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatExactNumber(summary.totalNewComments)}
            </span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">{summary.periodLabel}</span>
          <span className="flex items-center text-emerald-600 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            {formatPercent(summary.newCommentsDeltaPercent, 1, true)}
          </span>
        </div>
      </div>

      {/* 3. Shares & Saves */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-urowala-300 transition group">
        <div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Shares & Saves</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Shares</span>
              <span className="text-lg font-bold text-slate-900">
                {summary.totalSharesGained !== null ? formatCompactNumber(summary.totalSharesGained) : '—'}
              </span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div>
              <span className="text-xs text-slate-400 block font-medium">Saves</span>
              <span className="text-lg font-bold text-slate-900">
                {summary.totalSavesGained !== null ? formatCompactNumber(summary.totalSavesGained) : '—'}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Period Gain</span>
          <span className="text-slate-400 text-[11px]">Direct API counts</span>
        </div>
      </div>

      {/* 4. Net Follower Growth (Account-Level) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-urowala-300 transition group">
        <div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Follower Growth</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              +{formatExactNumber(summary.netFollowerGrowth)}
            </span>
            <span className="text-xs text-slate-400">followers</span>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px] truncate" title={summary.followerGrowthFormulaNote}>
            Account-level net
          </span>
          <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded">
            Diff verified
          </span>
        </div>
      </div>

      {/* 5. Best-Performing Reel */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-urowala-300 transition group">
        <div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Top Velocity Reel</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          {topReel ? (
            <div className="flex items-center gap-2.5">
              <img
                src={topReel.thumbnailUrl}
                alt="Top Reel"
                className="w-9 h-12 object-cover rounded-md border border-slate-200 shadow-2xs shrink-0"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate" title={topReel.caption}>
                  {topReel.cleanCaption}
                </span>
                <span className="text-xs font-bold text-urowala-600">
                  +{formatCompactNumber(topReel.periodMetrics.viewsGained)} views
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-400">No data for period</span>
          )}
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Highest period views</span>
          {topReel && (
            <a
              href={topReel.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-urowala-600 hover:text-urowala-800 flex items-center gap-0.5 font-medium"
            >
              <span>View</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* 6. Follower Conversion Top Reel */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-urowala-300 transition group">
        <div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Top Conversion Reel</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition">
              <Target className="w-4 h-4" />
            </div>
          </div>
          {topConversionReel && topConversionReel.periodMetrics.followerConversionRate !== null ? (
            <div className="flex items-center gap-2.5">
              <img
                src={topConversionReel.thumbnailUrl}
                alt="Conversion Reel"
                className="w-9 h-12 object-cover rounded-md border border-slate-200 shadow-2xs shrink-0"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate" title={topConversionReel.caption}>
                  {topConversionReel.cleanCaption}
                </span>
                <span className="text-xs font-bold text-rose-600">
                  {topConversionReel.periodMetrics.followerConversionRate}% conv.
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic">
              {topConversionReel ? 'Attributed follows: ' + (topConversionReel.periodMetrics.attributedFollowsGained || '0') : 'Not available through connected API'}
            </div>
          )}
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]" title="Attributed Follows / Period Reach">
            Formula: Follows / Reach
          </span>
          <span className="text-rose-700 font-semibold text-[11px] bg-rose-50 px-1.5 py-0.5 rounded">
            Per-Media
          </span>
        </div>
      </div>
    </div>
  );
}
