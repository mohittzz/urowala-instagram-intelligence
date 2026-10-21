'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { CommentIntelligenceView } from '@/components/comments/CommentIntelligenceView';
import { CommentInsightItem, ContentIdeaItem, HourlyCommentPoint } from '@/lib/types/analytics';
import { KeywordFrequency, extractFrequentKeywords } from '@/lib/analytics/comment-analyzer';
import { DEMO_COMMENTS, DEMO_CONTENT_IDEAS, DEMO_HOURLY_COMMENTS } from '@/lib/mock/demo-data';

export default function CommentsPage() {
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [comments, setComments] = useState<CommentInsightItem[]>(DEMO_COMMENTS);
  const [contentIdeas, setContentIdeas] = useState<ContentIdeaItem[]>(DEMO_CONTENT_IDEAS);
  const [keywords, setKeywords] = useState<KeywordFrequency[]>(extractFrequentKeywords(DEMO_COMMENTS));
  const [hourlyActivity, setHourlyActivity] = useState<HourlyCommentPoint[]>(DEMO_HOURLY_COMMENTS);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/comments');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setIsDemo(Boolean(data.isDemo));
      setComments(data.comments);
      if (data.contentIdeas) setContentIdeas(data.contentIdeas);
      if (data.keywords) setKeywords(data.keywords);
      if (data.hourlyActivity) setHourlyActivity(data.hourlyActivity);
    } catch (err) {
      console.warn('Comments API fallback to demo:', err);
      setIsDemo(true);
      setComments(DEMO_COMMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0712] text-slate-100">
      <Header isDemo={isDemo} onRefresh={fetchComments} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CommentIntelligenceView
          comments={comments}
          contentIdeas={contentIdeas}
          keywords={keywords}
          hourlyActivity={hourlyActivity}
        />
      </main>

      <footer className="mt-auto border-t border-pink-900/30 bg-[#120a1b] py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-bold text-slate-200">UROWALA &bull; Comment Intelligence</span>
          <span>Compliant with Instagram Graph API privacy permissions</span>
        </div>
      </footer>
    </div>
  );
}
