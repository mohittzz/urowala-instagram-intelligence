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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
      {/* Buttons */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl overflow-x-auto no-scrollbar">
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-urowala-900 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
              }`}
            >
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Timezone & Period Details Pill */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 shadow-2xs">
          <Globe className="w-3.5 h-3.5 text-urowala-600" />
          <span>Dashboard Timezone: <strong className="text-slate-800">Asia/Kolkata (IST)</strong></span>
        </div>
        <div className="hidden lg:flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-500 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Snapshots compare closest hourly checkpoints</span>
        </div>
      </div>

      {/* Custom Date Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">Select Custom Date Range</h3>
            <p className="text-xs text-slate-500 mb-4">
              Historical comparisons will use closest valid snapshots around these dates in Asia/Kolkata timezone.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date (IST)</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-urowala-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Date (IST)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-urowala-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustom}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-urowala-700 hover:bg-urowala-800 rounded-lg shadow-sm"
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
