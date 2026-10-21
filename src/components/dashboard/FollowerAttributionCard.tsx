'use client';

import React from 'react';
import { ReelItem } from '@/lib/types/analytics';
import { Target, Info, ShieldAlert, Award, ExternalLink } from 'lucide-react';
import { formatCompactNumber } from '@/lib/utils/formatters';

interface FollowerAttributionCardProps {
  reels: ReelItem[];
}

export function FollowerAttributionCard({ reels }: FollowerAttributionCardProps) {
  // Filter reels with valid attributed follows
  const attributedReels = reels
    .filter((r) => r.periodMetrics.attributedFollowsGained !== null)
    .sort((a, b) => (b.periodMetrics.attributedFollowsGained || 0) - (a.periodMetrics.attributedFollowsGained || 0));

  const hasAttributionData = attributedReels.length > 0;

  return (
    <div className="bg-[#150d1f]/90 rounded-2xl p-5 border border-pink-900/40 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-pink-950/80 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-pink-950/70 text-pink-400 border border-pink-800/40">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base">
              Follower Conversion Attribution Analysis
            </h3>
            <p className="text-xs text-slate-400">
              Per-media conversion efficiency & verified Instagram Graph API metric tracking
            </p>
          </div>
        </div>

        {/* Clinical Attribution Rule Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 border border-pink-900/40 text-slate-300 text-xs font-semibold">
          <Info className="w-3.5 h-3.5 text-pink-400" />
          <span>Formula: <code className="text-pink-300">(Attributed Follows / Reach) &times; 100%</code></span>
        </div>
      </div>

      {/* Verification Notice */}
      <div className="mb-4 p-3 rounded-xl bg-[#1e122b]/80 border border-pink-900/40 text-xs text-slate-300 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Strict Attribution Policy:</strong> Individual Reel conversion rates are derived solely from Meta's native media-level <code>follows</code> insights. Account-level follower gains are never artificially apportioned to individual Reels. If the Meta API does not supply the <code>follows</code> metric for a given post, it is transparently reported as <em>"Not available through connected API"</em>.
        </div>
      </div>

      {/* Leaderboard or Unavailable state */}
      {hasAttributionData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {attributedReels.slice(0, 3).map((reel, idx) => (
            <div
              key={reel.id}
              className="p-3.5 rounded-xl border border-pink-900/40 bg-[#1e122b]/90 hover:border-pink-500/60 transition flex items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  idx === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : idx === 1 ? 'bg-slate-700 text-slate-300' : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                }`}>
                  {idx + 1}
                </div>
                <img
                  src={reel.thumbnailUrl}
                  alt="Thumb"
                  className="w-10 h-14 object-cover rounded-md border border-pink-900/60 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate" title={reel.caption}>
                    {reel.cleanCaption}
                  </h4>
                  <div className="text-[11px] text-slate-400">
                    Reach: <strong className="text-slate-200">{formatCompactNumber(reel.periodMetrics.viewsGained || reel.lifetimeMetrics.reach)}</strong>
                  </div>
                  <div className="text-xs font-bold text-pink-400">
                    +{reel.periodMetrics.attributedFollowsGained} follows ({reel.periodMetrics.followerConversionRate}%)
                  </div>
                </div>
              </div>
              <a
                href={reel.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-pink-300 hover:bg-white/5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-pink-900/50 bg-[#1a0f26]/60 text-center">
          <p className="text-xs text-slate-400">
            Attributed follower conversion data requires Meta media-level Follow insights permission.
          </p>
          <span className="inline-block mt-1 text-[11px] text-pink-300 font-medium">
            Account-level net follower metrics are tracked accurately in the Summary Cards.
          </span>
        </div>
      )}
    </div>
  );
}
