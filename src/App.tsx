import React, { useState, useEffect } from 'react';
import {
  Film,
  Play,
  KeyRound,
  ArrowRight,
  Radio,
  Clock,
  Sparkles,
  Users,
  Compass,
  CheckCircle2,
  Share2,
  ExternalLink,
  PlusCircle,
  BookOpen,
  Video,
  Trash2,
  Youtube
} from 'lucide-react';
import { TopBar } from './components/TopBar';
import { JoinRoomModal } from './components/JoinRoomModal';
import { CreateRoomModal } from './components/CreateRoomModal';
import { WatchRoom } from './components/WatchRoom';
import { DEFAULT_TOPBAR_THEME, TopBarTheme } from './config/theme';
import { FEATURED_MOVIES, Movie } from './data/movies';

export default function App() {
  const [topbarTheme, setTopbarTheme] = useState<TopBarTheme>(DEFAULT_TOPBAR_THEME);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [quickCodeInput, setQuickCodeInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [transitionKey, setTransitionKey] = useState(0);
  
  // Store only user-created watch parties (saved in localStorage)
  const [moviesList, setMoviesList] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem('cinemachord_active_rooms');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Sync user-created rooms to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cinemachord_active_rooms', JSON.stringify(moviesList));
    } catch {
      // ignore
    }
  }, [moviesList]);

  // User display name state (persisted)
  const [userName, setUserName] = useState<string>(() => {
    try {
      return localStorage.getItem('cinemachord_user_name') || '';
    } catch {
      return '';
    }
  });

  const [joinModalInitialCode, setJoinModalInitialCode] = useState<string>('');

  // Active watching session state
  const [activeSession, setActiveSession] = useState<{
    roomCode: string;
    movie: Movie;
    isHost: boolean;
  } | null>(null);

  // Check URL parameters for direct room joining (e.g. ?room=123456)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room') || window.location.hash.replace('#room=', '').replace('#', '');
    if (roomParam && /^[0-9]{6}$/.test(roomParam)) {
      handleOpenJoinModal(roomParam);
    }
  }, []);

  // Smooth scroll & reset home transition handler (triggered on icon press or open)
  const handleNavigateHome = () => {
    setActiveSession(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTransitionKey((prev) => prev + 1);
  };

  // Smooth scroll handler to the listings grid
  const handleScrollToListings = () => {
    const target = document.getElementById('listings-grid');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Open join room modal with optional pre-filled 6-digit code
  const handleOpenJoinModal = (code: string = '') => {
    setJoinModalInitialCode(code);
    setIsJoinModalOpen(true);
  };

  // Join room by 6-digit code with verified user name
  const handleJoinByCode = (code: string, name?: string) => {
    const cleanCode = code.trim();
    const effectiveName = name?.trim() || userName.trim();

    // The user must enter their name before joining a room
    if (!effectiveName) {
      handleOpenJoinModal(cleanCode);
      return;
    }

    if (name?.trim()) {
      setUserName(name.trim());
    }

    // Check if code corresponds to an existing movie screening in our state
    const matchedMovie = moviesList.find((m) => m.activeRoomCode === cleanCode);
    const movieToWatch =
      matchedMovie || {
        id: 'room-' + cleanCode,
        title: `Watch Party #${cleanCode}`,
        genre: 'Direct Video Stream',
        year: new Date().getFullYear(),
        runtime: 'Live Session',
        director: 'Room Host',
        thumbnail: '',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        activeRoomCode: cleanCode,
        activeViewers: 1,
        hostName: 'Host',
        isPrivate: true,
        synopsis: 'Synchronized watch party room joined via 6-digit key.',
      };

    setActiveSession({
      roomCode: cleanCode,
      movie: movieToWatch,
      isHost: false,
    });
    setIsJoinModalOpen(false);
  };

  // Create room flow: handles public vs private
  const handleRoomCreated = (roomData: {
    roomCode: string;
    roomName: string;
    movie: Movie;
    isHostControlOnly: boolean;
    isPrivate: boolean;
    hostName: string;
  }) => {
    // Store user-created room in our state & storage
    setMoviesList((prev) => [roomData.movie, ...prev.filter((m) => m.id !== roomData.movie.id)]);

    setActiveSession({
      roomCode: roomData.roomCode,
      movie: roomData.movie,
      isHost: true,
    });
    setIsCreateModalOpen(false);
  };

  // Delete/dismiss a user-created room from active listings
  const handleDeleteRoom = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMoviesList((prev) => prev.filter((m) => m.id !== roomId));
  };

  // If in an active watch room, show the full synchronized cinema room view
  if (activeSession) {
    return (
      <WatchRoom
        roomCode={activeSession.roomCode}
        movie={activeSession.movie}
        isHost={activeSession.isHost}
        userName={activeSession.isHost ? (activeSession.movie.hostName || 'Host') : (userName || 'Viewer')}
        onLeaveRoom={handleNavigateHome}
      />
    );
  }

  // Filtered public watch rooms (only public listings shown in directory)
  const publicMovies = moviesList.filter((m) => !m.isPrivate);
  const filteredMovies =
    categoryFilter === 'all'
      ? publicMovies
      : publicMovies.filter((m) =>
          categoryFilter === 'youtube'
            ? m.videoType === 'youtube' || Boolean(m.youtubeId)
            : m.videoType === 'direct' || !m.youtubeId
        );

  return (
    <div className="min-h-screen bg-[#08090a] text-[#F7F5F0] selection:bg-teal-500/30 selection:text-teal-200 notebook-grid relative">
      {/* 1) Top Bar with Log In & Account Details (Color customizable) */}
      <TopBar
        currentTheme={topbarTheme}
        onThemeChange={(newTheme) => setTopbarTheme(newTheme)}
        isLoggedIn={isLoggedIn}
        onToggleLogin={() => setIsLoggedIn(!isLoggedIn)}
        onNavigateHome={handleNavigateHome}
        onScrollToListings={handleScrollToListings}
        userName={userName}
      />

      {/* Main Container with smooth key-based transition on open or icon press */}
      <main key={transitionKey} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HERO SECTION - Responsive spacing & fluid typography for mobile, tablet, and desktop */}
        <section className="pt-10 pb-12 sm:pt-16 sm:pb-16 md:pt-24 md:pb-24 text-center max-w-4xl mx-auto px-2 sm:px-4">

          {/* Centered Website Name: CinemaChord in responsive bold Syne text */}
          <h1 className="text-3xl min-[400px]:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-syne tracking-tight text-[#F7F5F0] mb-2 sm:mb-3 text-balance animate-smooth-reveal-0 whitespace-nowrap">
            CinemaChord
          </h1>

          {/* Tagline Headline - Responsive scale */}
          <div className="text-base sm:text-xl md:text-2xl font-semibold text-teal-300/90 mb-3 sm:mb-4 tracking-tight text-balance max-w-xl mx-auto px-2 animate-smooth-reveal-1">
            Watch films together, frame for frame in real-time.
          </div>

          {/* Value Proposition / Description - Responsive scale */}
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-zinc-300 font-normal leading-relaxed max-w-md sm:max-w-xl md:max-w-2xl mx-auto mb-8 sm:mb-12 px-2 text-balance animate-smooth-reveal-1">
            Synchronized cinema rooms with shared study annotations and zero sign-up friction.
          </p>

          {/* 2) THE MAIN HERO SPLIT: TWO LARGE ACTION BUTTONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 max-w-2xl mx-auto mb-10 sm:mb-12 text-left animate-smooth-reveal-2">
            {/* BUTTON 1: Create Watch Room */}
            <div
              onClick={() => setIsCreateModalOpen(true)}
              className="group relative p-6 sm:p-7 rounded-2xl bg-[#0e1116] hover:bg-[#12161d] border border-teal-500/40 hover:border-teal-400 transition-all cursor-pointer shadow-xl shadow-teal-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-400/10 border border-teal-400/30 flex items-center justify-center text-teal-400 group-hover:bg-teal-400 group-hover:text-black transition-all">
                    <Film className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono text-teal-400/90 group-hover:text-teal-300">
                    YouTube &amp; Video Link →
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-[#F7F5F0] mb-1.5 group-hover:text-teal-200 transition-colors">
                  Create a Watch Room
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  Paste any YouTube or video stream link, choose public or private party mode, and generate an instant 6-digit sync key.
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-medium text-teal-400">
                <span>Paste Link &amp; Launch Room</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* BUTTON 2: Join Created Room Using 6-Digit Code */}
            <div
              onClick={() => setIsJoinModalOpen(true)}
              className="group relative p-6 sm:p-7 rounded-2xl bg-[#0e1116] hover:bg-[#12161d] border border-white/10 hover:border-teal-400/40 transition-all cursor-pointer shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-300 group-hover:border-teal-400/50 group-hover:text-teal-300 transition-all">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 group-hover:text-teal-300">
                    Direct Key →
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-[#F7F5F0] mb-1.5 group-hover:text-teal-200 transition-colors">
                  Join with 6-Digit Code
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  Have a room key from a host or classmate? Enter your 6 digits to jump straight to their live timestamp.
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-medium text-zinc-300 group-hover:text-teal-300 transition-colors">
                <span>Enter 6-Digit Room Key</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Quick Inline 6-Digit Join Bar for Immediate Testing */}
          <div className="max-w-md mx-auto p-2 rounded-2xl bg-[#0e1116] border border-white/10 flex items-center gap-2 animate-smooth-reveal-3">
            <div className="pl-3 text-zinc-400">
              <KeyRound className="w-4 h-4 text-teal-400" />
            </div>
            <input
              type="text"
              maxLength={6}
              placeholder="Or enter 6-digit code here (e.g. 408192)"
              value={quickCodeInput}
              onChange={(e) => setQuickCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleOpenJoinModal(quickCodeInput);
                }
              }}
              className="flex-1 bg-transparent border-none text-xs text-[#F7F5F0] placeholder:text-zinc-600 focus:outline-none font-mono tracking-wider"
            />
            <button
              onClick={() => {
                handleOpenJoinModal(quickCodeInput);
              }}
              className="px-3.5 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-black text-xs font-medium transition-colors shrink-0 cursor-pointer"
            >
              Join Room
            </button>
          </div>

          {/* Clean Unboxed Metadata Proof Row (Anti-Slop Zero-Pills) */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400 animate-smooth-reveal-3">
            <span>
              {publicMovies.length === 0
                ? '0 Active Public Rooms'
                : `${publicMovies.length} Active Public ${publicMovies.length === 1 ? 'Room' : 'Rooms'}`}
            </span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>Sub-20ms Synchronization</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>Zero Sign-Up Required</span>
          </div>
        </section>

        {/* 3) LISTINGS GRID (Smooth scroll target from hero CTA) */}
        <section id="listings-grid" className="pt-12 pb-24 border-t border-white/10 animate-smooth-reveal-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="text-xs font-mono text-teal-400 mb-1">
                LIVE WATCH ROOMS
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F7F5F0]">
                Active Watch Parties
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                Join an active public watch room or create your own with any YouTube or video link.
              </p>
            </div>

            {/* Direct Link / Custom Stream Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-medium transition-colors shrink-0 cursor-pointer self-start md:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Watch Room</span>
            </button>
          </div>

          {/* Interactive Filter Tabs (Zero-pill button segmented styling) */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {[
              { id: 'all', label: `All Rooms (${publicMovies.length})` },
              {
                id: 'youtube',
                label: `YouTube Parties (${publicMovies.filter((m) => m.videoType === 'youtube' || Boolean(m.youtubeId)).length})`,
              },
              {
                id: 'direct',
                label: `Direct Video Streams (${publicMovies.filter((m) => m.videoType === 'direct' || !m.youtubeId).length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
                  categoryFilter === tab.id
                    ? 'bg-teal-500/20 border-teal-400/50 text-teal-200'
                    : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Watch Parties: User created rooms or clean notebook empty state */}
          {filteredMovies.length === 0 ? (
            <div className="p-10 sm:p-14 rounded-2xl bg-[#0c0e12] border border-white/10 text-center flex flex-col items-center justify-center max-w-2xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4">
                <Film className="w-7 h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#F7F5F0] mb-2 font-syne">
                No active watch parties yet
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6 max-w-md">
                Paste any YouTube or video stream link, select public to list it here or private to keep it invite-only, and share your 6-digit room key.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-black text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create First Watch Party</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMovies.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => handleOpenJoinModal(movie.activeRoomCode || movie.id)}
                  className="group p-4 rounded-xl bg-[#0c0e12] hover:bg-[#11141b] border border-white/10 hover:border-teal-400/50 transition-all flex flex-col justify-between shadow-sm cursor-pointer min-h-[190px]"
                >
                  <div>
                    {/* Top Metadata Row: Type / Room Code with Red Dot Live Indicator */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[11px] font-mono text-zinc-400 truncate flex items-center gap-1.5">
                        {movie.videoType === 'youtube' || movie.youtubeId ? (
                          <>
                            <Youtube className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span>YouTube</span>
                          </>
                        ) : (
                          <>
                            <Video className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                            <span>Direct Video</span>
                          </>
                        )}
                      </span>
                      {movie.activeRoomCode && (
                        <span className="text-[10px] font-mono text-red-300 bg-red-950/40 border border-red-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1.5 shrink-0 shadow-sm shadow-red-500/10">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                          <span className="font-bold text-red-400 text-[9px] tracking-wider">LIVE</span>
                          <span className="text-white font-mono font-medium">#{movie.activeRoomCode}</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-[#F7F5F0] group-hover:text-teal-200 transition-colors line-clamp-2 mb-1.5">
                      {movie.title}
                    </h3>

                    {/* Host details */}
                    <div className="text-[11px] text-zinc-400 line-clamp-1 mb-1">
                      Host: <span className="text-zinc-300">{movie.hostName || 'Room Host'}</span>
                    </div>

                    <p className="text-[10px] font-mono text-zinc-500 truncate">
                      {movie.videoUrl}
                    </p>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="pt-3 border-t border-white/5 mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenJoinModal(movie.activeRoomCode || movie.id);
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-teal-400 hover:bg-teal-300 text-black text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-teal-500/20"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Join Room</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteRoom(movie.id, e)}
                      title="Remove watch party"
                      className="p-1.5 rounded-lg border border-white/5 hover:border-rose-500/40 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4) CAMPUS SYNC PROTOCOL DETAILS (Editorial Chapter Format) */}
        <section id="how-sync-works" className="py-20 border-t border-white/10">
          <div className="max-w-3xl mb-12">
            <div className="text-xs font-mono text-teal-400 mb-1">
              02 / TECHNICAL ARCHITECTURE
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F7F5F0]">
              Built for campus study halls &amp; midnight screenings.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
              No buffering lag, no desynchronized reactions, and no accounts required for participants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0c0e12] border border-white/5 space-y-3">
              <div className="text-xs font-mono text-teal-400">01. DRIFT CORRECTION</div>
              <h3 className="text-base font-semibold text-[#F7F5F0]">Sub-20ms Frame Alignment</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When anyone in the room pauses or scrubs, timestamp events propagate across clients with continuous playback rate micro-adjustments.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0c0e12] border border-white/5 space-y-3">
              <div className="text-xs font-mono text-teal-400">02. CAMPUS NOTEBOOK</div>
              <h3 className="text-base font-semibold text-[#F7F5F0]">Frame-Tagged Study Notes</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Film analysis notes and reactions automatically pin to exact timestamps in the movie timeline, clickable for instant playback review.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0c0e12] border border-white/5 space-y-3">
              <div className="text-xs font-mono text-teal-400">03. 6-DIGIT PROTOCOL</div>
              <h3 className="text-base font-semibold text-[#F7F5F0]">Instant Key Dispatch</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                No complex authentication hurdles or Discord bot installs. Simply drop a 6-digit key into the box to synchronize instantly.
              </p>
            </div>
          </div>
        </section>

        {/* 5) QUIET FOOTER */}
        <footer id="campus-protocol" className="py-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-bold font-syne text-[#F7F5F0]">CinemaChord</span>
            <span>·</span>
            <span>Synchronized Movie Watching Protocol</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={handleScrollToListings}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Watch Rooms
            </button>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              6-Digit Join
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Host Screening
            </button>
          </div>
        </footer>
      </main>

      {/* MODALS */}
      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => {
          setIsJoinModalOpen(false);
          setJoinModalInitialCode('');
        }}
        onJoinRoom={handleJoinByCode}
        initialCode={joinModalInitialCode}
        defaultUserName={userName}
      />

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRoomCreated={handleRoomCreated}
        defaultHostName={userName}
      />
    </div>
  );
}
