'use client';

import React, { useState } from 'react';
import { DateRangePreset } from '@/lib/types/analytics';
import { Calendar, Clock, Globe } from 'lucide-react';

interface PeriodSelectorProps {
  selectedPeriod: DateRangePreset;
  onPeriodChange: (period: DateRangePreset, customDates?: { start: string; end: string }) => void;
  isCustomOpen?: boolean;
}

export function PeriodSelector({ selectedPeriod, onPeriodChange }: PeriodSelectorProps) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const presets: { id: DateRangePreset; label: string; subtext: string }[] = [
    { id: '24h', label: 'Last 24 Hours', subtext: 'Rolling 24h window' },
    { id: '7d', label: 'Last 7 Days', subtext: 'Trailing 168 hours' },
    { id: '30d', label: 'Last 30 Days', subtext: 'Trailing 720 hours' },
    { id: 'custom', label: 'Custom Range', subtext: 'Date boundaries' },
  ];

  const handleApplyCustom = () => {
    setShowCustomModal(false);
    onPeriodChange('custom', { start: startDate, end: endDate });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-pink-900/40">
      {/* Buttons */}
      <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-pink-900/40 rounded-xl overflow-x-auto no-scrollbar">
        {presets.map((p) => {
          const isSelected = selectedPeriod === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                if (p.id === 'custom') {
                  setShowCustomModal(true);
                } else {
                  onPeriodChange(p.id);
                }
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-700 via-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Timezone & Period Details Pill */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 bg-[#170e24] px-3 py-1.5 rounded-xl border border-pink-900/40 text-slate-300 shadow-sm">
          <Globe className="w-3.5 h-3.5 text-pink-400" />
          <span>Dashboard Timezone: <strong className="text-white">Asia/Kolkata (IST)</strong></span>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 bg-[#170e24] px-3 py-1.5 rounded-xl border border-pink-900/30 text-slate-400 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Hourly checkpoint analysis</span>
        </div>
      </div>

      {/* Custom Date Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#180e25] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-pink-900/60 text-white">
            <h3 className="font-bold text-white text-base mb-1">Select Custom Date Range</h3>
            <p className="text-xs text-slate-400 mb-4">
              Historical comparisons will use closest valid snapshots around these dates in Asia/Kolkata timezone.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date (IST)</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#221435] border border-pink-900/60 rounded-lg text-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">End Date (IST)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#221435] border border-pink-900/60 rounded-lg text-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustom}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg shadow-md shadow-pink-500/20"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
