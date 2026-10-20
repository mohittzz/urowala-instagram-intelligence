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
import { TrendingUp, PieChart as PieChartIcon, MessageSquareQuote } from 'lucide-react';

interface PerformanceChartsProps {
  timeline: HistoricalTimelinePoint[];
  topicStats: TopicPerformanceItem[];
  hourlyComments: HourlyCommentPoint[];
}

export function PerformanceCharts({ timeline, topicStats, hourlyComments }: PerformanceChartsProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'topics' | 'hourly'>('timeline');

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-urowala-600" />
            <span>Interactive Momentum & Velocity Charts</span>
          </h3>
          <p className="text-xs text-slate-500">
            Hourly snapshots comparison & urology content category dynamics
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              activeTab === 'timeline'
                ? 'bg-white text-urowala-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Velocity Timeline
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              activeTab === 'topics'
                ? 'bg-white text-urowala-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Topic Breakdown
          </button>
          <button
            onClick={() => setActiveTab('hourly')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              activeTab === 'hourly'
                ? 'bg-white text-urowala-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
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
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0263c7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0263c7" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="commentsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="displayTime" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                stroke="#cbd5e1"
                tickFormatter={(val) => formatCompactNumber(val)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
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
                stroke="#0263c7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#viewsGradient)"
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
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#64748b' }}
                stroke="#cbd5e1"
                tickFormatter={(val) => formatCompactNumber(val)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
                stroke="#cbd5e1"
                width={130}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                }}
                formatter={(val: any, name: any) => [
                  val.toLocaleString('en-IN'),
                  name === 'viewsGained' ? 'Views Gained' : name === 'commentsGained' ? 'Comments Gained' : name,
                ]}
              />
              <Bar dataKey="viewsGained" name="viewsGained" fill="#0263c7" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'hourly' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyComments} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                }}
                formatter={(val: any, name: any) => [
                  val,
                  name === 'commentsCount' ? 'Total Comments' : 'Patient Questions',
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="commentsCount" name="commentsCount" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="questionCount" name="questionCount" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
