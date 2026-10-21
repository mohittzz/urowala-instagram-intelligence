'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { HistoricalTimelinePoint, TopicPerformanceItem, HourlyCommentPoint } from '@/lib/types/analytics';
import { formatCompactNumber } from '@/lib/utils/formatters';
import { TrendingUp } from 'lucide-react';

interface PerformanceChartsProps {
  timeline: HistoricalTimelinePoint[];
  topicStats: TopicPerformanceItem[];
  hourlyComments: HourlyCommentPoint[];
}

export function PerformanceCharts({ timeline, topicStats, hourlyComments }: PerformanceChartsProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'topics' | 'hourly'>('timeline');

  return (
    <div className="bg-[#150d1f]/90 rounded-2xl p-5 border border-pink-900/40 shadow-xl backdrop-blur-md">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-pink-950/80 gap-3">
        <div>
          <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-pink-400" />
            <span>Interactive Momentum & Velocity Charts</span>
          </h3>
          <p className="text-xs text-slate-400">
            Hourly snapshots comparison & urology content category dynamics
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-black/40 border border-pink-900/40 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'timeline'
                ? 'bg-gradient-to-r from-purple-700 via-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/20 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Velocity Timeline
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'topics'
                ? 'bg-gradient-to-r from-purple-700 via-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/20 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Topic Breakdown
          </button>
          <button
            onClick={() => setActiveTab('hourly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'hourly'
                ? 'bg-gradient-to-r from-purple-700 via-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/20 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Hourly Comment Velocity
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-72 w-full">
        {activeTab === 'timeline' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="instaViewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e1306c" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f09433" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1435" vertical={false} />
              <XAxis dataKey="displayTime" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#3d1d4d" />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                stroke="#3d1d4d"
                tickFormatter={(val) => formatCompactNumber(val)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1c0f2a',
                  color: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #701a75',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.5)',
                }}
                formatter={(val: any, name: any) => [
                  val.toLocaleString('en-IN'),
                  name === 'viewsGained' ? 'Views Gained' : name === 'newComments' ? 'Comments Added' : name,
                ]}
                labelFormatter={(lbl) => `Time: ${lbl} (IST)`}
              />
              <Area
                type="monotone"
                dataKey="viewsGained"
                name="viewsGained"
                stroke="#e1306c"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#instaViewsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'topics' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topicStats}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1435" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                stroke="#3d1d4d"
                tickFormatter={(val) => formatCompactNumber(val)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#e2e8f0', fontWeight: 500 }}
                stroke="#3d1d4d"
                width={130}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1c0f2a',
                  color: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #701a75',
                  fontSize: '12px',
                }}
                formatter={(val: any, name: any) => [
                  val.toLocaleString('en-IN'),
                  name === 'viewsGained' ? 'Views Gained' : name === 'commentsGained' ? 'Comments Gained' : name,
                ]}
              />
              <Bar dataKey="viewsGained" name="viewsGained" fill="#e1306c" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'hourly' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyComments} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1435" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#3d1d4d" />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#3d1d4d" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1c0f2a',
                  color: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #701a75',
                  fontSize: '12px',
                }}
                formatter={(val: any, name: any) => [
                  val,
                  name === 'commentsCount' ? 'Total Comments' : 'Patient Questions',
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="commentsCount" name="commentsCount" fill="#475569" radius={[4, 4, 0, 0]} />
              <Bar dataKey="questionCount" name="questionCount" fill="#e1306c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
