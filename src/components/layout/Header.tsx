'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  RefreshCw, 
  ShieldCheck, 
  BarChart3, 
  MessageSquareQuote, 
  Layers, 
  Settings, 
  ExternalLink,
  ChevronDown,
  Check,
  Sparkles
} from 'lucide-react';
import { ActivePlatform } from '@/lib/types/analytics';

function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function FacebookIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

interface HeaderProps {
  isDemo?: boolean;
  lastSyncedAtIST?: string;
  onRefresh?: () => Promise<void>;
  activePlatform?: ActivePlatform;
  onPlatformChange?: (platform: ActivePlatform) => void;
}

export function Header({ 
  isDemo = false, 
  lastSyncedAtIST = 'Today at 02:25 PM IST', 
  onRefresh,
  activePlatform,
  onPlatformChange
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [urlPlatform, setUrlPlatform] = useState<ActivePlatform | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [localSyncedAtIST, setLocalSyncedAtIST] = useState<string | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync url platform if not provided via props
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('platform') as ActivePlatform;
      if (p === 'instagram' || p === 'facebook') {
        setUrlPlatform(p);
      }
    }
  }, [pathname]);

  const currentPlatform: ActivePlatform = activePlatform || urlPlatform || 'instagram';

  const handlePlatformSelect = (platform: ActivePlatform) => {
    if (onPlatformChange) {
      onPlatformChange(platform);
    }
    setProfileDropdownOpen(false);
    if (pathname === '/') {
      router.replace(`/?platform=${platform}`);
    } else {
      router.push(`/?platform=${platform}`);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isInstagram = currentPlatform === 'instagram';

  const handleSyncClick = async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncSuccessMsg(null);
    try {
      // 1. Trigger actual synchronization
      const syncEndpoint = isInstagram ? '/api/instagram/sync' : '/api/facebook/page';
      const syncRes = await fetch(syncEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual' }),
      });
      const syncData = await syncRes.json();
      if (!syncRes.ok && !syncData.success) {
        console.warn('Sync API returned error:', syncData.error);
      }

      // 2. Set current IST timestamp immediately
      const nowIST = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(new Date());
      setLocalSyncedAtIST(`Today at ${nowIST} IST`);

      // 3. Trigger dashboard data reload
      if (onRefresh) {
        await onRefresh();
      }

      setSyncSuccessMsg('Synced!');
      setTimeout(() => setSyncSuccessMsg(null), 3000);
    } catch (err: any) {
      console.warn('Sync notice:', err.message);
      const nowIST = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(new Date());
      setLocalSyncedAtIST(`Today at ${nowIST} IST`);
      if (onRefresh) await onRefresh();
      setSyncSuccessMsg('Refreshed');
      setTimeout(() => setSyncSuccessMsg(null), 3000);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className={`text-white sticky top-0 z-50 shadow-md transition-colors duration-300 ${
      isInstagram 
        ? 'bg-[#150d1b] border-b border-pink-900/40' 
        : 'bg-[#0a1220] border-b border-blue-900/40'
    }`}>
      {/* 1. Signature Brand Color Top Ribbon */}
      <div className={`w-full transition-all duration-300 ${
        isInstagram
          ? 'h-1.5 bg-gradient-to-r from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]'
          : 'h-1.5 bg-[#1877F2]'
      }`} />

      {/* 2. Meta Verification & Asset Status Strip */}
      <div className={`px-4 py-1.5 text-xs font-medium flex items-center justify-between transition-colors ${
        isInstagram
          ? 'bg-pink-950/40 text-pink-200 border-b border-pink-500/20'
          : 'bg-blue-950/50 text-blue-200 border-b border-blue-500/20'
      }`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isInstagram ? 'bg-pink-400' : 'bg-blue-400'
              }`}></span>
            </span>
            <span>
              <strong>Meta Graph API Connected:</strong> Managing {isInstagram ? 'Instagram Creator' : 'Facebook Page'} &bull;{' '}
              {isInstagram ? (
                <>
                  <span className="text-pink-300 font-bold">@dr.mohit_urowala (24,409)</span> &bull; Linked Facebook: Dr Mohit Sharma AIIMS (22.3K)
                </>
              ) : (
                <>
                  <span className="text-blue-300 font-bold">Dr Mohit Sharma AIIMS Urowala (22,327)</span> &bull; Linked Instagram: @dr.mohit_urowala (24.4K)
                </>
              )} &bull; Total Healthcare Network: <strong>46,736</strong>
            </span>
          </div>

          <Link href="/settings" className="hidden sm:inline-flex items-center gap-1 text-slate-300 hover:text-white underline text-[11px]">
            API Settings
          </Link>
        </div>
      </div>

      {/* 3. Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity with Logo Colored Accents */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-105 transition-transform ${
                isInstagram
                  ? 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-pink-500/25 ring-2 ring-pink-500/30'
                  : 'bg-[#1877F2] shadow-blue-500/25 ring-2 ring-blue-500/30'
              }`}>
                {isInstagram ? (
                  <InstagramIcon className="w-5 h-5 text-white" />
                ) : (
                  <FacebookIcon className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-white tracking-tight">UROWALA</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    isInstagram
                      ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}>
                    {isInstagram ? 'Instagram Studio' : 'Facebook Page Studio'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-normal">
                  Dr. Mohit Sharma &bull; {isInstagram ? 'Reels & Creator Analytics' : 'Page Video & Awareness Reach'}
                </p>
              </div>
            </Link>
          </div>

          {/* Account Profile Switcher Dropdown & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Interactive Profile Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition shadow-md ${
                  isInstagram
                    ? 'bg-gradient-to-r from-purple-900/80 via-pink-900/80 to-rose-900/80 border-pink-500/70 text-pink-100 hover:border-pink-400'
                    : 'bg-blue-900/70 border-blue-500/70 text-blue-100 hover:bg-blue-900/90 hover:border-blue-400'
                }`}
                title="Switch Profile / Platform"
              >
                {isInstagram ? (
                  <>
                    <div className="w-6 h-6 rounded-full overflow-hidden p-[1.5px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shrink-0 shadow-xs">
                      <img src="/dr-mohit-profile.jpg" alt="@dr.mohit_urowala" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="font-bold text-white leading-tight">@dr.mohit_urowala</div>
                      <div className="text-[10px] text-pink-300 font-medium">Instagram Creator &bull; 24.4K</div>
                    </div>
                    <span className="sm:hidden font-medium">@dr.mohit_urowala</span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full overflow-hidden p-[1.5px] bg-[#1877F2] shrink-0 shadow-xs">
                      <div className="w-full h-full bg-[#1877F2] flex items-center justify-center text-[10px] font-bold text-white rounded-full">
                        FB
                      </div>
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="font-bold text-white leading-tight">Dr Mohit Sharma AIIMS</div>
                      <div className="text-[10px] text-blue-300 font-medium">Facebook Page &bull; 22.3K</div>
                    </div>
                    <span className="sm:hidden font-medium">Facebook Page</span>
                  </>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#140c1e] border border-pink-900/60 shadow-2xl py-2 z-50 text-xs backdrop-blur-xl">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-pink-950/80">
                    Switch Active Platform
                  </div>

                  {/* Option 1: Instagram */}
                  <button
                    type="button"
                    onClick={() => handlePlatformSelect('instagram')}
                    className={`w-full px-3 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-white/5 transition ${
                      isInstagram ? 'bg-pink-500/15 text-white' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden p-[2px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shrink-0 shadow-xs">
                        <img src="/dr-mohit-profile.jpg" alt="@dr.mohit_urowala" className="w-full h-full object-cover rounded-full" />
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>@dr.mohit_urowala</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-semibold">Instagram</span>
                        </div>
                        <div className="text-[11px] text-pink-300 font-medium">24,409 Followers &bull; Sunset Palette</div>
                      </div>
                    </div>
                    {isInstagram && <Check className="w-4 h-4 text-pink-400" />}
                  </button>

                  {/* Option 2: Facebook */}
                  <button
                    type="button"
                    onClick={() => handlePlatformSelect('facebook')}
                    className={`w-full px-3 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-white/5 transition ${
                      !isInstagram ? 'bg-blue-500/15 text-white' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#1877F2] flex items-center justify-center text-white shrink-0 shadow-xs">
                        <FacebookIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>Dr Mohit Sharma AIIMS</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-semibold">Facebook</span>
                        </div>
                        <div className="text-[11px] text-blue-300 font-medium">22,327 Followers &bull; Royal Blue</div>
                      </div>
                    </div>
                    {!isInstagram && <Check className="w-4 h-4 text-blue-400" />}
                  </button>

                  <div className="mt-1 pt-1 border-t border-slate-800 px-3 py-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Total Meta Reach:</span>
                    <strong className="text-white font-mono">46,736 Audience</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Last Synced Badge */}
            <div className="hidden lg:flex flex-col text-right text-xs">
              <span className="text-slate-400">Last Synced</span>
              <span suppressHydrationWarning className="font-mono text-slate-200 font-medium">{localSyncedAtIST || lastSyncedAtIST}</span>
            </div>

            {/* Sync Now Button with Platform Theming */}
            <button
              onClick={handleSyncClick}
              disabled={syncing}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shadow-md active:scale-95 disabled:opacity-60 ${
                isInstagram
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white shadow-pink-500/20'
                  : 'bg-[#1877F2] hover:bg-blue-600 text-white shadow-blue-500/20'
              }`}
              title="Trigger immediate snapshot collection"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : syncSuccessMsg || 'Sync Now'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs with Platform Theming */}
        <nav className={`flex space-x-1 sm:space-x-3 border-t pt-1 overflow-x-auto no-scrollbar ${
          isInstagram ? 'border-pink-900/50' : 'border-blue-900/50'
        }`}>
          {/* Instagram Main View Tab */}
          <Link
            href="/?platform=instagram"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                handlePlatformSelect('instagram');
              } else {
                handlePlatformSelect('instagram');
              }
            }}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              pathname === '/' && isInstagram
                ? 'border-pink-400 text-pink-300 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:border-slate-500'
            }`}
          >
            <InstagramIcon className={`w-4 h-4 ${pathname === '/' && isInstagram ? 'text-pink-400' : 'text-slate-400'}`} />
            <span>Instagram Reels (24.4K)</span>
          </Link>

          {/* Facebook Page View Tab */}
          <Link
            href="/?platform=facebook"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                handlePlatformSelect('facebook');
              } else {
                handlePlatformSelect('facebook');
              }
            }}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              pathname === '/' && !isInstagram
                ? 'border-blue-400 text-blue-300 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:border-slate-500'
            }`}
          >
            <FacebookIcon className={`w-4 h-4 ${pathname === '/' && !isInstagram ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Facebook Page (22.3K)</span>
          </Link>

          {/* Remaining tabs */}
          <Link
            href="/comments"
            className={`flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap ${
              pathname === '/comments'
                ? (isInstagram ? 'border-pink-400 text-pink-300 font-semibold' : 'border-blue-400 text-blue-300 font-semibold')
                : 'border-transparent text-slate-300 hover:text-white hover:border-slate-500'
            }`}
          >
            <MessageSquareQuote className="w-4 h-4 text-slate-400" />
            <span>Comment Intelligence</span>
          </Link>

          <Link
            href="/topics"
            className={`flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap ${
              pathname === '/topics'
                ? (isInstagram ? 'border-pink-400 text-pink-300 font-semibold' : 'border-blue-400 text-blue-300 font-semibold')
                : 'border-transparent text-slate-300 hover:text-white hover:border-slate-500'
            }`}
          >
            <Layers className="w-4 h-4 text-slate-400" />
            <span>Topic Performance</span>
          </Link>

          <Link
            href="/settings"
            className={`flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap ${
              pathname === '/settings'
                ? (isInstagram ? 'border-pink-400 text-pink-300 font-semibold' : 'border-blue-400 text-blue-300 font-semibold')
                : 'border-transparent text-slate-300 hover:text-white hover:border-slate-500'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings & Meta API</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
