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
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Follower Conversion Attribution Analysis
            </h3>
            <p className="text-xs text-slate-500">
              Per-media conversion efficiency & verified Instagram Graph API metric tracking
            </p>
          </div>
        </div>

        {/* Clinical Attribution Rule Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
          <Info className="w-3.5 h-3.5 text-urowala-600" />
          <span>Formula: <code>(Attributed Follows / Reach) &times; 100%</code></span>
        </div>
      </div>

      {/* Verification Notice */}
      <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-urowala-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800">Strict Attribution Policy:</strong> Individual Reel conversion rates are derived solely from Meta's native media-level <code>follows</code> insights. Account-level follower gains are never artificially apportioned to individual Reels. If the Meta API does not supply the <code>follows</code> metric for a given post, it is transparently reported as <em>"Not available through connected API"</em>.
        </div>
      </div>

      {/* Leaderboard or Unavailable state */}
      {hasAttributionData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {attributedReels.slice(0, 3).map((reel, idx) => (
            <div
              key={reel.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-urowala-300 transition flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  idx === 0 ? 'bg-amber-100 text-amber-800' : idx === 1 ? 'bg-slate-200 text-slate-700' : 'bg-orange-100 text-orange-800'
                }`}>
                  {idx + 1}
                </div>
                <img
                  src={reel.thumbnailUrl}
                  alt="Thumb"
                  className="w-10 h-14 object-cover rounded-md border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate" title={reel.caption}>
                    {reel.cleanCaption}
                  </h4>
                  <div className="text-[11px] text-slate-500">
                    Topic: <span className="font-semibold text-slate-700">{reel.topicName}</span>
                  </div>
                  <div className="text-xs font-bold text-rose-600 mt-0.5">
                    +{reel.periodMetrics.attributedFollowsGained} follows
                    {reel.periodMetrics.followerConversionRate !== null && (
                      <span className="text-[11px] font-normal text-slate-500 ml-1">
                        ({reel.periodMetrics.followerConversionRate}% conv.)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <a
                href={reel.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-400 hover:text-urowala-600 transition shrink-0"
                title="Open on Instagram"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <p className="text-sm font-semibold text-slate-700 mb-1">
            Not available through connected API
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Meta Instagram Graph API has not reported per-media follow events for these posts yet. As new follow actions occur, they will automatically rank here.
          </p>
        </div>
      )}
    </div>
  );
}
