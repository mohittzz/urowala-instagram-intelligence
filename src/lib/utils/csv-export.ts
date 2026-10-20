import { ReelItem } from '../types/analytics';

export function exportReelsToCSV(reels: ReelItem[], periodLabel: string) {
  const headers = [
    'Shortcode',
    'Topic',
    'Caption',
    'Posted Date (IST)',
    `Views Gained (${periodLabel})`,
    'Lifetime Views',
    `Comments Gained (${periodLabel})`,
    'Lifetime Comments',
    'Shares Gained',
    'Saves Gained',
    'Reach',
    'Avg Watch Time (s)',
    'Attributed Follows',
    'Follower Conversion Rate (%)',
    'Comment-to-View Ratio (%)',
    'Engagement Rate (%)',
    'Instagram URL',
  ];

  const rows = reels.map((r) => [
    `"${r.shortcode}"`,
    `"${r.topicName.replace(/"/g, '""')}"`,
    `"${r.caption.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    `"${r.postedAtIST}"`,
    r.periodMetrics.viewsGained,
    r.lifetimeMetrics.views,
    r.periodMetrics.commentsGained,
    r.lifetimeMetrics.comments,
    r.periodMetrics.sharesGained ?? 'N/A',
    r.periodMetrics.savesGained ?? 'N/A',
    r.lifetimeMetrics.reach,
    r.lifetimeMetrics.avgWatchTime ?? 'N/A',
    r.periodMetrics.attributedFollowsGained ?? 'N/A',
    r.periodMetrics.followerConversionRate ? `${r.periodMetrics.followerConversionRate}%` : 'N/A',
    `${r.periodMetrics.commentToViewRatio}%`,
    `${r.periodMetrics.engagementRate}%`,
    `"${r.permalink}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `urowala_reels_intelligence_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
