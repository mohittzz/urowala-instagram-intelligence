'use client';

import React, { useState } from 'react';
import { CommentInsightItem, ContentIdeaItem, HourlyCommentPoint } from '@/lib/types/analytics';
import { KeywordFrequency } from '@/lib/analytics/comment-analyzer';
import {
  MessageSquareQuote,
  HelpCircle,
  Lightbulb,
  Sparkles,
  ExternalLink,
  Tag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface CommentIntelligenceViewProps {
  comments: CommentInsightItem[];
  contentIdeas: ContentIdeaItem[];
  keywords: KeywordFrequency[];
  hourlyActivity: HourlyCommentPoint[];
}

export function CommentIntelligenceView({
  comments,
  contentIdeas,
  keywords,
}: CommentIntelligenceViewProps) {
  const [filterQuestionsOnly, setFilterQuestionsOnly] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);

  const filteredComments = comments.filter((c) => {
    const matchesQuestion = !filterQuestionsOnly || c.isQuestion;
    const matchesKeyword = !selectedKeyword || c.text.toLowerCase().includes(selectedKeyword.toLowerCase());
    const matchesSearch =
      !searchTerm ||
      c.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.commenterUsername.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesQuestion && matchesKeyword && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Content Ideas Engine */}
      <div className="bg-gradient-to-br from-urowala-950 via-urowala-900 to-navy-900 text-white rounded-3xl p-6 shadow-md border border-urowala-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                AI Content Ideas & Patient Question Patterns
              </h2>
              <p className="text-xs text-slate-300">
                Extracted from repeated Instagram questions & clinical discussions on Dr. Mohit Sharma's Reels
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-urowala-800 text-urowala-200 border border-urowala-700 self-start sm:self-auto">
            {contentIdeas.length} Priority Topics Identified
          </span>
        </div>

        {/* Content Idea Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {contentIdeas.map((idea) => (
            <div
              key={idea.id}
              className="bg-urowala-900/80 rounded-2xl p-4 border border-urowala-700/60 hover:border-urowala-500 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-urowala-800 text-urowala-200 border border-urowala-700">
                    {idea.topicName}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    idea.urgency === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {idea.frequencyCount} questions asked
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                  {idea.questionTheme}
                </h4>

                <div className="p-2.5 rounded-xl bg-urowala-950/60 border border-urowala-800 text-xs text-amber-200/90 mb-3 italic">
                  <strong>Suggested Hook:</strong> {idea.suggestedHook}
                </div>

                <div className="text-xs text-slate-300 mb-2">
                  <strong className="text-slate-100">Clinical Focus:</strong> {idea.clinicalAngle}
                </div>
              </div>

              <div className="pt-2 border-t border-urowala-800/60 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Frequent queries:</span> {idea.sampleQuestions[0]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Comment Feed & Keywords Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Frequent Keywords & Questions Cloud */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#150d1d] rounded-2xl p-4 border border-pink-900/30 shadow-md">
            <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>Frequent Clinical Keywords</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Click a keyword to filter patient comments
            </p>

            <div className="flex flex-wrap gap-1.5">
              {selectedKeyword && (
                <button
                  onClick={() => setSelectedKeyword(null)}
                  className="px-2 py-1 text-xs font-bold rounded-lg bg-pink-600 text-white"
                >
                  Clear filter ({selectedKeyword})
                </button>
              )}
              {keywords.map((kw) => (
                <button
                  key={kw.word}
                  onClick={() => setSelectedKeyword(selectedKeyword === kw.word ? null : kw.word)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                    selectedKeyword === kw.word
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-pink-500 font-bold'
                      : 'bg-[#1c1226] border-pink-900/40 text-slate-300 hover:border-pink-500/50 hover:bg-[#251833]'
                  }`}
                >
                  <span>{kw.word}</span>
                  <span className="ml-1 text-[10px] text-pink-400">({kw.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy & Safety Note */}
          <div className="bg-[#130b1a] rounded-2xl p-4 border border-pink-950/80 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-white mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Privacy & Platform Compliance</span>
            </div>
            <p className="text-slate-400">
              Only public comments authorized through official Instagram Graph API permissions (<code className="text-pink-300">instagram_manage_comments</code>) are processed. No direct messages or private communications are ingested.
            </p>
          </div>
        </div>

        {/* Right Column: Filterable Comments List */}
        <div className="lg:col-span-3 bg-[#150d1d] rounded-2xl p-5 border border-pink-900/30 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-pink-950 gap-3">
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                <MessageSquareQuote className="w-4 h-4 text-pink-400" />
                <span>Audience Questions & Comments Stream</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  {filteredComments.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Real-time patient comments with automatic clinical question detection
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterQuestionsOnly(!filterQuestionsOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  filterQuestionsOnly
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-[#1e1329] text-slate-300 border border-pink-900/40 hover:bg-[#251833]'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{filterQuestionsOnly ? 'Showing Questions Only' : 'Showing All Comments'}</span>
              </button>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-xs pl-8 pr-3 py-1.5 bg-[#1b1124] border border-pink-900/50 text-slate-200 placeholder-slate-500 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {filteredComments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No comments found matching current filter.
              </div>
            ) : (
              filteredComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-xl border border-pink-950/80 hover:border-pink-800/60 bg-[#191022]/80 hover:bg-[#1d1228] transition flex flex-col sm:flex-row items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-pink-300">
                        @{comment.commenterUsername}
                      </span>
                      {comment.isQuestion && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <HelpCircle className="w-2.5 h-2.5" />
                          <span>Question</span>
                        </span>
                      )}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-900/30 text-purple-300 border border-purple-700/40">
                        {comment.topicName}
                      </span>
                      <span suppressHydrationWarning className="text-[10px] text-slate-400">
                        {comment.postedAtIST}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-normal">
                      "{comment.text}"
                    </p>

                    <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-1">
                      <span className="font-semibold text-slate-300">On Reel:</span>
                      <a
                        href={comment.reelPermalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-400 hover:text-pink-300 hover:underline truncate max-w-sm inline-flex items-center gap-0.5"
                      >
                        <span>{comment.reelCaption}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                    <span className="text-[11px] font-semibold text-pink-300 bg-[#160d1f] px-2 py-1 rounded-md border border-pink-900/40">
                      ❤️ {comment.likeCount}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
