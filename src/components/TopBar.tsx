import React, { useState } from 'react';
import { User, LogIn, LogOut, Palette, Check, Film, Sparkles, ChevronDown, ShieldCheck } from 'lucide-react';
import { TOPBAR_THEME_PRESETS, TopBarTheme } from '../config/theme';

interface TopBarProps {
  currentTheme: TopBarTheme;
  onThemeChange: (theme: TopBarTheme) => void;
  isLoggedIn: boolean;
  onToggleLogin: () => void;
  onNavigateHome: () => void;
  onScrollToListings: () => void;
  activeRoomCode?: string | null;
  onReturnToRoom?: () => void;
  userName?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTheme,
  onThemeChange,
  isLoggedIn,
  onToggleLogin,
  onNavigateHome,
  onScrollToListings,
  activeRoomCode,
  onReturnToRoom,
  userName,
}) => {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isIconAnimating, setIsIconAnimating] = useState(false);

  const handleIconClick = () => {
    setIsIconAnimating(true);
    setTimeout(() => setIsIconAnimating(false), 450);
    onNavigateHome();
  };

  const displayName = isLoggedIn ? 'Rishab S.' : 'Guest Mode';
  const userInitials = isLoggedIn ? 'RS' : null;

  return (
    <header
      style={{
        backgroundColor: currentTheme.backgroundColor,
        borderColor: currentTheme.borderColor,
      }}
      className="sticky top-0 z-50 w-full border-b transition-colors duration-300 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Logo Mark */}
        <button
          onClick={handleIconClick}
          className="group flex items-center text-left focus:outline-none cursor-pointer"
          aria-label="CinemaChord home"
        >
          <div className={`w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:border-teal-400 group-hover:bg-teal-500/20 transition-all ${
            isIconAnimating ? 'animate-icon-click border-teal-300 bg-teal-500/30' : ''
          }`}>
            <Film className="w-4 h-4" />
          </div>
        </button>

        {/* Zone 2: 3-4 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <button
            onClick={onScrollToListings}
            className="hover:text-[#F7F5F0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Watch Rooms
          </button>
          <a
            href="#how-sync-works"
            className="hover:text-[#F7F5F0] transition-colors whitespace-nowrap shrink-0"
          >
            Sync Engine
          </a>
          <a
            href="#campus-protocol"
            className="hover:text-[#F7F5F0] transition-colors whitespace-nowrap shrink-0"
          >
            Campus Notebook
          </a>
        </nav>

        {/* Zone 3: Top Right Corner - Live Party Badge, Log in and Account Details */}
        <div className="relative flex items-center gap-3 shrink-0">
          {/* Live Watch Party Indicator with Red Dot & Party ID */}
          {activeRoomCode && (
            <button
              onClick={onReturnToRoom}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/40 hover:border-red-500/70 text-xs font-mono transition-all cursor-pointer shadow-sm shadow-red-500/10"
              title="Watch party is live — click to return to theater"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-red-400 font-bold tracking-wider text-[11px]">LIVE</span>
              <span className="text-zinc-400 hidden sm:inline text-[11px]">PARTY ID:</span>
              <span className="font-bold tracking-widest text-white text-xs">{activeRoomCode}</span>
            </button>
          )}

          <button
            onClick={() => setIsAccountOpen(!isAccountOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-[#F7F5F0] text-xs font-medium transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-400"
            aria-expanded={isAccountOpen}
            aria-label="Account details and settings"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-500/30 to-teal-700/40 border border-teal-400/40 flex items-center justify-center text-teal-300 font-mono text-[11px]">
              {userInitials ? userInitials : <User className="w-3.5 h-3.5" />}
            </div>
            <div className="flex flex-col text-left">
              <span className="leading-tight font-medium">
                {displayName}
              </span>
              <span className="text-[10px] text-zinc-400 leading-none">
                {isLoggedIn ? 'Film Society' : 'Sign in'}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Account & Appearance Popover Menu */}
          {isAccountOpen && (
            <div className="absolute right-0 top-12 w-80 rounded-2xl bg-[#0f1115] border border-white/10 shadow-2xl p-4 text-[#F7F5F0] z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Account Details Header */}
              <div className="pb-3 border-b border-white/10 flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    {isLoggedIn ? 'Rishab S.' : 'Guest Viewer'}
                    {isLoggedIn && <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />}
                  </div>
                  <div className="text-xs text-zinc-400 font-mono mt-0.5">
                    {isLoggedIn ? 'rishab.sarav.ggl@gmail.com' : 'Anonymous Room Participant'}
                  </div>
                </div>
                <button
                  onClick={onToggleLogin}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-white/10 hover:border-teal-400/40 hover:text-teal-300 transition-colors flex items-center gap-1.5"
                >
                  {isLoggedIn ? (
                    <>
                      <LogOut className="w-3 h-3" />
                      Sign Out
                    </>
                  ) : (
                    <>
                      <LogIn className="w-3 h-3" />
                      Sign In
                    </>
                  )}
                </button>
              </div>

              {/* Account Quick Stats */}
              <div className="py-3 border-b border-white/10 text-xs text-zinc-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Campus Film Pass</span>
                  <span className="text-teal-400 font-mono text-[11px]">Active · 2026 Season</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Synchronized Hours</span>
                  <span className="font-mono text-[11px] text-[#F7F5F0]">18.4 hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Screening Society</span>
                  <span className="text-[#F7F5F0]">Cinematheque Hall B</span>
                </div>
              </div>

              {/* Top Bar Color Customization Section */}
              <div className="pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-teal-400" />
                    Top Bar Appearance
                  </span>
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="text-[11px] text-teal-400 hover:underline"
                  >
                    {showColorPicker ? 'Hide' : 'Customize'}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">
                  Color changeable anytime by prompt or select a theme preset below:
                </p>

                {/* Presets List */}
                <div className="space-y-1.5">
                  {TOPBAR_THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => onThemeChange(preset)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors border ${
                        currentTheme.id === preset.id
                          ? 'border-teal-400/50 bg-teal-500/10 text-teal-200'
                          : 'border-white/5 bg-white/[0.02] text-zinc-300 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-md border border-white/20 shrink-0"
                          style={{ backgroundColor: preset.backgroundColor }}
                        />
                        <span>{preset.name}</span>
                      </div>
                      {currentTheme.id === preset.id && <Check className="w-3.5 h-3.5 text-teal-400" />}
                    </button>
                  ))}
                </div>

                {/* Custom Color Input */}
                {showColorPicker && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2">
                    <input
                      type="color"
                      value={currentTheme.backgroundColor}
                      onChange={(e) =>
                        onThemeChange({
                          id: 'custom',
                          name: 'Custom Hex',
                          backgroundColor: e.target.value,
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          textColor: '#f7f5f0',
                        })
                      }
                      className="w-7 h-7 rounded border border-white/20 bg-transparent cursor-pointer"
                      title="Choose custom top bar color"
                    />
                    <div className="text-[11px] font-mono text-zinc-400 flex-1">
                      Hex: {currentTheme.backgroundColor}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
