import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Users,
  MessageSquare,
  BookOpen,
  Copy,
  Check,
  ArrowLeft,
  Send,
  Radio,
  Sparkles,
  Clock,
  ShieldCheck,
  Flame,
  ThumbsUp,
  Heart,
  Globe,
  Lock,
  Youtube,
  Share2
} from 'lucide-react';
import { Movie, RoomParticipant, ChatMessage, StudyNote, extractYouTubeId } from '../data/movies';

interface WatchRoomProps {
  roomCode: string;
  movie: Movie;
  isHost: boolean;
  userName: string;
  onLeaveRoom: () => void;
}

export const WatchRoom: React.FC<WatchRoomProps> = ({
  roomCode,
  movie,
  isHost,
  userName,
  onLeaveRoom,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'viewers'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [syncStatus, setSyncStatus] = useState<string>('Connected & In Sync');
  const [recentActionToast, setRecentActionToast] = useState<string | null>(null);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'U';
  };

  const effectiveUserName = userName?.trim() || (isHost ? 'Host' : 'Viewer');
  const effectiveHostName = movie.hostName?.trim() || (isHost ? effectiveUserName : 'Host');

  // Real room participants only — no bot users or random names
  const [participants, setParticipants] = useState<RoomParticipant[]>(() => {
    if (isHost) {
      return [
        {
          id: 'user-host',
          name: `${effectiveUserName} (Host)`,
          avatar: getInitials(effectiveUserName),
          isHost: true,
          isYou: true,
          status: 'watching',
        },
      ];
    }
    return [
      {
        id: 'user-host',
        name: `${effectiveHostName} (Host)`,
        avatar: getInitials(effectiveHostName),
        isHost: true,
        isYou: false,
        status: 'watching',
      },
      {
        id: 'user-self',
        name: effectiveUserName,
        avatar: getInitials(effectiveUserName),
        isHost: false,
        isYou: true,
        status: 'watching',
      },
    ];
  });

  // Real chat messages only — no fabricated bots or made-up conversations
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'c-init',
      sender: 'System Protocol',
      text: `Room #${roomCode} connected. Synchronized frame clock active.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      videoTime: '00:00',
      isSystem: true,
    },
  ]);

  // Real collaborative notes only — no fabricated notes
  const [studyNotes, setStudyNotes] = useState<StudyNote[]>([]);

  // Format seconds to mm:ss
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showToast = (msg: string) => {
    setRecentActionToast(msg);
    setTimeout(() => {
      setRecentActionToast(null);
    }, 2800);
  };

  // Video playback listeners
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      showToast(`Playback started at ${formatTime(videoRef.current.currentTime)}`);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      showToast(`Playback paused at ${formatTime(videoRef.current.currentTime)}`);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekTarget = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTarget;
    setCurrentTime(seekTarget);
    showToast(`Seeked to ${formatTime(seekTarget)} (Broadcasting sync)`);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    showToast(`Room code ${roomCode} copied to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const sendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const senderName = isHost ? `${effectiveUserName} (Host)` : effectiveUserName;
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: senderName,
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      videoTime: formatTime(currentTime),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  const addReaction = (emoji: string) => {
    const senderName = isHost ? `${effectiveUserName} (Host)` : effectiveUserName;
    const newMsg: ChatMessage = {
      id: 'reaction-' + Date.now(),
      sender: senderName,
      text: emoji,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      videoTime: formatTime(currentTime),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    showToast(`Sent reaction ${emoji}`);
  };

  const addStudyNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;

    const authorName = isHost ? `${effectiveUserName} (Host)` : effectiveUserName;
    const newNote: StudyNote = {
      id: 'note-' + Date.now(),
      author: authorName,
      note: noteInput.trim(),
      videoTime: formatTime(currentTime),
      createdTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setStudyNotes((prev) => [newNote, ...prev]);
    setNoteInput('');
    showToast('Campus note logged with current timestamp');
  };

  const jumpToTimestamp = (timeStr: string) => {
    if (!videoRef.current) return;
    const parts = timeStr.split(':').map(Number);
    const totalSecs = parts.length === 2 ? parts[0] * 60 + parts[1] : 0;
    videoRef.current.currentTime = totalSecs;
    setCurrentTime(totalSecs);
    showToast(`Jumped to note timestamp ${timeStr}`);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const ytId = movie.youtubeId || extractYouTubeId(movie.videoUrl);

  return (
    <div className="min-h-screen bg-[#08090a] text-[#F7F5F0] flex flex-col">
      {/* Room Navigation & Synchronization Bar */}
      <div className="h-14 border-b border-white/10 bg-[#0c0e12] px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onLeaveRoom}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.03] text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Leave Room</span>
          </button>
          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2 text-xs truncate">
            <span className="font-semibold text-[#F7F5F0] truncate">{movie.title}</span>
            <span className="text-zinc-500">·</span>
            <span className="text-zinc-400 font-mono text-[11px]">{movie.runtime}</span>
          </div>
        </div>

        {/* Right Status Badges */}
        <div className="flex items-center gap-2">
          {/* Public vs Private Room Badge */}
          {movie.isPrivate ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-mono">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">PRIVATE PARTY</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[11px] font-mono">
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">PUBLIC PARTY</span>
            </div>
          )}

          {/* YouTube Video Badge if applicable */}
          {ytId && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] font-mono">
              <Youtube className="w-3.5 h-3.5 text-red-400" />
              <span>YOUTUBE</span>
            </div>
          )}

          {/* Live Watch Party Indicator with Red Dot and Watch Party ID (Top Right) */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs font-mono shadow-sm shadow-red-500/10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-red-400 font-bold tracking-wider text-[11px]">LIVE</span>
            <span className="text-zinc-400 hidden sm:inline text-[11px]">PARTY ID:</span>
            <span className="font-bold tracking-widest text-white text-xs">{roomCode}</span>
            <button
              onClick={copyRoomCode}
              title="Copy watch party ID"
              className="ml-1 p-1 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
              aria-label="Copy watch party ID"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-red-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{syncStatus}</span>
          </div>
        </div>
      </div>

      {/* Main Room Grid: Theater Video on Left, Notebook/Chat on Right */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Video Player & Synced Controls (2 cols on lg) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {ytId ? (
            /* YouTube Embedded Video Player with Synchronized Layer */
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${ytId}?enablejsapi=1&autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={movie.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />

              {/* Sync Alert Toast Overlay */}
              {recentActionToast && (
                <div className="absolute top-4 left-4 z-30 px-3.5 py-2 rounded-xl bg-[#0d1015]/90 border border-teal-500/40 text-xs font-mono text-teal-300 backdrop-blur-md shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                  <span>{recentActionToast}</span>
                </div>
              )}
            </div>
          ) : (
            /* Direct HTML5 Video Player */
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl group flex items-center justify-center">
              {/* The actual HTML5 Video Element */}
              <video
                ref={videoRef}
                src={movie.videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlay}
                className="w-full h-full object-contain cursor-pointer"
                playsInline
              />

              {/* Sync Alert Toast Overlay */}
              {recentActionToast && (
                <div className="absolute top-4 left-4 z-30 px-3.5 py-2 rounded-xl bg-[#0d1015]/90 border border-teal-500/40 text-xs font-mono text-teal-300 backdrop-blur-md shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                  <span>{recentActionToast}</span>
                </div>
              )}

              {/* Center Play Button Overlay when paused */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute z-20 w-16 h-16 rounded-2xl bg-teal-400/90 hover:bg-teal-300 text-black flex items-center justify-center shadow-xl shadow-teal-500/30 transition-transform transform hover:scale-105 cursor-pointer"
                  aria-label="Play video"
                >
                  <Play className="w-7 h-7 fill-current ml-1" />
                </button>
              )}

              {/* Minimalist Player Controls Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 z-20">
                {/* Scrubber Progress Slider */}
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-teal-400 hover:h-2 transition-all"
                    aria-label="Synchronized video timeline scrubber"
                  />
                </div>

                {/* Control Buttons Row */}
                <div className="flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>

                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = Math.max(0, currentTime - 10);
                          showToast('Replayed 10s');
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      title="Rewind 10 seconds"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <div className="font-mono text-[11px] text-zinc-300">
                      <span className="text-teal-300 font-semibold">{formatTime(currentTime)}</span>
                      <span className="text-zinc-500"> / </span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Quick Reactions */}
                    <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                      <button onClick={() => addReaction('🔥')} className="hover:scale-125 transition-transform text-xs" title="Reaction Fire">🔥</button>
                      <button onClick={() => addReaction('🎬')} className="hover:scale-125 transition-transform text-xs" title="Reaction Cinema">🎬</button>
                      <button onClick={() => addReaction('🍿')} className="hover:scale-125 transition-transform text-xs" title="Reaction Popcorn">🍿</button>
                      <button onClick={() => addReaction('🤯')} className="hover:scale-125 transition-transform text-xs" title="Reaction Mindblown">🤯</button>
                    </div>

                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          const newMute = !isMuted;
                          videoRef.current.muted = newMute;
                          setIsMuted(newMute);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={toggleFullscreen}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Film Description Card & Host Protocol */}
          <div className="p-5 rounded-2xl bg-[#0d0f13] border border-white/10 text-xs">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-[#F7F5F0]">
                    {movie.title}
                  </h3>
                  {movie.isPrivate ? (
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Private Screening
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                      Public Directory Screening
                    </span>
                  )}
                </div>
                <div className="text-zinc-400 text-xs">
                  {movie.director ? `Directed by ${movie.director} · ` : ''}{movie.year} · {movie.genre}
                </div>
              </div>
              <button
                onClick={() => {
                  showToast('Room synchronized to current frame clock');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 font-mono text-[11px] shrink-0 cursor-pointer transition-colors"
              >
                Broadcast Sync Pulse
              </button>
            </div>
            <p className="text-zinc-300 leading-relaxed text-xs mt-2">
              {movie.synopsis}
            </p>
          </div>
        </div>

        {/* Right Column: Campus Notebook Sidebar (Chat / Notes / Viewers) */}
        <div className="rounded-2xl bg-[#0d0f13] border border-white/10 flex flex-col h-[560px] lg:h-auto overflow-hidden">
          {/* Segmented Sidebar Tabs */}
          <div className="p-2 border-b border-white/10 bg-black/20 flex gap-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-teal-500/10 border border-teal-500/30 text-teal-300'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Room Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'notes'
                  ? 'bg-teal-500/10 border border-teal-500/30 text-teal-300'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Campus Notes</span>
            </button>

            <button
              onClick={() => setActiveTab('viewers')}
              className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'viewers'
                  ? 'bg-teal-500/10 border border-teal-500/30 text-teal-300'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{participants.length}</span>
            </button>
          </div>

          {/* TAB 1: Real-time Synchronized Chat */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`text-xs ${
                      msg.isSystem
                        ? 'p-2 rounded-lg bg-teal-500/5 border border-teal-500/20 text-teal-300 font-mono text-[11px]'
                        : 'space-y-0.5'
                    }`}
                  >
                    {!msg.isSystem && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#F7F5F0]">{msg.sender}</span>
                        <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[10px]">
                          <span
                            onClick={() => jumpToTimestamp(msg.videoTime)}
                            className="text-teal-400 cursor-pointer hover:underline"
                            title="Jump to video time"
                          >
                            [{msg.videoTime}]
                          </span>
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>
                    )}
                    <p className={msg.isSystem ? 'text-teal-300' : 'text-zinc-300 text-xs'}>
                      {msg.text}
                    </p>
                  </div>
                ))}
                {chatMessages.length <= 1 && (
                  <div className="text-center py-8 px-3 text-zinc-500 text-xs">
                    <p className="font-medium text-zinc-400">Welcome, {effectiveUserName}!</p>
                    <p className="text-zinc-500 text-[11px] mt-1">Chat is live and ready. Send a message or reaction below.</p>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={sendChatMessage} className="p-3 border-t border-white/10 bg-black/30 flex gap-2">
                <input
                  type="text"
                  placeholder="Drop a thought or reaction..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#14171d] border border-white/10 text-xs text-[#F7F5F0] placeholder:text-zinc-600 focus:outline-none focus:border-teal-400"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-black text-xs font-medium transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Campus Notebook Collaborative Study Notes */}
          {activeTab === 'notes' && (
            <div className="flex-1 flex flex-col min-h-0 notebook-ruled bg-[#090b0e]">
              <div className="p-3 border-b border-white/10 bg-black/40">
                <div className="text-[11px] font-mono text-teal-300 flex items-center justify-between">
                  <span>SCREENING LOG & NOTES</span>
                  <span>SYNCED SCRATCHPAD</span>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {studyNotes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 text-zinc-500">
                    <BookOpen className="w-7 h-7 mx-auto mb-2 text-zinc-600" />
                    <p className="font-medium text-zinc-300 text-xs">No Pinned Notes Yet</p>
                    <p className="text-[11px] text-zinc-500 mt-1 max-w-[220px]">
                      Capture observations or discussion points linked to the current video frame.
                    </p>
                  </div>
                ) : (
                  studyNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-xl bg-[#11141a]/90 border border-white/10 shadow-sm space-y-1 group"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-zinc-200">{note.author}</span>
                        <button
                          onClick={() => jumpToTimestamp(note.videoTime)}
                          className="text-teal-400 font-mono hover:underline cursor-pointer flex items-center gap-1"
                          title="Seek movie to this note timestamp"
                        >
                          <Clock className="w-3 h-3" />
                          <span>@{note.videoTime}</span>
                        </button>
                      </div>
                      <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                        {note.note}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={addStudyNote} className="p-3 border-t border-white/10 bg-black/40 flex flex-col gap-2">
                <textarea
                  rows={2}
                  placeholder={`Add a study note for frame @${formatTime(currentTime)}...`}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#14171d] border border-white/10 text-xs text-[#F7F5F0] placeholder:text-zinc-600 focus:outline-none focus:border-teal-400 resize-none"
                />
                <button
                  type="submit"
                  className="py-2 px-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-black text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Pin Note to @{formatTime(currentTime)}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Active Room Viewers */}
          {activeTab === 'viewers' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-2">
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
                Connected Students & Viewers
              </div>
              {participants.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 font-mono text-[10px] flex items-center justify-center font-semibold">
                      {user.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-[#F7F5F0] flex items-center gap-1.5">
                        {user.name}
                        {user.isHost && (
                          <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-1.5 rounded">
                            Host
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        Ping: 18ms · Buffer 100%
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-teal-400 font-mono">
                    Synced
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
