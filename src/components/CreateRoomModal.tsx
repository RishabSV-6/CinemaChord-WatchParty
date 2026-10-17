import React, { useState, useEffect } from 'react';
import { X, Play, Film, Link as LinkIcon, Shield, Globe, Lock, Youtube, Video, User, Sparkles } from 'lucide-react';
import { Movie, extractYouTubeId } from '../data/movies';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (roomData: {
    roomCode: string;
    roomName: string;
    movie: Movie;
    isHostControlOnly: boolean;
    isPrivate: boolean;
    hostName: string;
  }) => void;
  defaultHostName?: string;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onRoomCreated,
  defaultHostName = '',
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [hostName, setHostName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isHostControlOnly, setIsHostControlOnly] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = defaultHostName || '';
      setHostName(saved);
      setUrlError(null);
    }
  }, [isOpen, defaultHostName]);

  if (!isOpen) return null;

  const ytId = extractYouTubeId(videoUrl);
  const isDirectVideo =
    videoUrl.endsWith('.mp4') ||
    videoUrl.endsWith('.webm') ||
    videoUrl.endsWith('.mkv') ||
    videoUrl.includes('googlevideo') ||
    videoUrl.includes('commondatastorage.googleapis.com');

  const handleLaunch = () => {
    setUrlError(null);

    if (!videoUrl.trim()) {
      setUrlError('Please paste a YouTube or video stream URL.');
      return;
    }

    const trimmedHost = hostName.trim() || 'Host';

    // Generate clean random 6-digit room code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const detectedYt = extractYouTubeId(videoUrl.trim());
    const finalPartyTitle = customTitle.trim() || (detectedYt ? 'YouTube Watch Party' : 'Video Stream Watch Party');

    const movieToUse: Movie = {
      id: 'party-' + Date.now(),
      title: finalPartyTitle,
      genre: detectedYt ? 'YouTube Live Sync' : 'Direct Video Stream',
      year: new Date().getFullYear(),
      runtime: 'Live Stream',
      director: trimmedHost,
      thumbnail: detectedYt
        ? `https://img.youtube.com/vi/${detectedYt}/hqdefault.jpg`
        : '',
      videoUrl: videoUrl.trim(),
      videoType: detectedYt ? 'youtube' : 'direct',
      youtubeId: detectedYt || undefined,
      isPrivate,
      activeRoomCode: generatedCode,
      activeViewers: 1,
      hostName: trimmedHost,
      synopsis: `Synchronized watch party "${finalPartyTitle}" hosted by ${trimmedHost}.`
    };

    onRoomCreated({
      roomCode: generatedCode,
      roomName: finalPartyTitle,
      movie: movieToUse,
      isHostControlOnly,
      isPrivate,
      hostName: trimmedHost,
    });
  };

  const samplePresets = [
    {
      label: 'YouTube: Sintel Animation',
      url: 'https://www.youtube.com/watch?v=eYq7WapuDLU',
      title: 'Sintel (Blender Film)'
    },
    {
      label: 'YouTube: Elephants Dream',
      url: 'https://www.youtube.com/watch?v=TLkA0RELQ1E',
      title: 'Elephants Dream'
    },
    {
      label: 'Direct 4K MP4: Tears of Steel',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      title: 'Tears of Steel (Direct MP4)'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0d0f12] border border-white/10 shadow-2xl p-6 sm:p-8 text-[#F7F5F0] max-h-[90vh] overflow-y-auto">
        {/* Notebook Accent Rule */}
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-teal-500/60 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Film className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-[#F7F5F0]">
            Create a Watch Party
          </h2>
        </div>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          Provide any YouTube or video link. You can choose whether to make it public for everyone to join, or private with your 6-digit key.
        </p>

        {/* Room Inputs */}
        <div className="space-y-4 mb-6">
          {/* Watch Party Name (Option to name the watch party) */}
          <div>
            <label className="block text-[11px] text-zinc-300 font-medium mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                Watch Party Name
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Give your party a name</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Interstellar Movie Night, Friday Chill Session, Anime Marathon"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              maxLength={60}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12151a] border border-white/10 text-xs text-[#F7F5F0] placeholder:text-zinc-600 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 font-medium"
            />
          </div>

          {/* YouTube or Video Stream Link */}
          <div>
            <label className="block text-[11px] text-zinc-300 font-medium mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-teal-400" />
                YouTube or Video Stream Link
              </span>
              <span className="text-[10px] text-rose-400 font-mono">* Required</span>
            </label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=... or https://.../movie.mp4"
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                setUrlError(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12151a] border border-white/10 text-xs text-[#F7F5F0] placeholder:text-zinc-600 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 font-mono text-[11px]"
            />

            {/* URL Detection Feedback */}
            {ytId && (
              <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-300 flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-400 shrink-0" />
                <span>YouTube Video detected (ID: <strong className="font-mono text-white">{ytId}</strong>). In-app synchronized playback ready.</span>
              </div>
            )}

            {isDirectVideo && (
              <div className="mt-2 p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-300 flex items-center gap-2">
                <Video className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Direct HTML5 video stream detected. Native synchronization ready.</span>
              </div>
            )}

            {urlError && (
              <div className="mt-2 text-xs text-rose-400">
                {urlError}
              </div>
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">
              Quick Test Links:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {samplePresets.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => {
                    setVideoUrl(preset.url);
                    if (!customTitle) setCustomTitle(preset.title);
                    setUrlError(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-[11px] text-zinc-300 transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Host Display Name (In Room Chat) */}
          <div>
            <label className="block text-[11px] text-zinc-300 font-medium mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-400" />
                Your Display Name (In Room Chat)
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Defaults to Host</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Maya S. (or leave blank for Host)"
              value={hostName}
              onChange={(e) => {
                setHostName(e.target.value);
                setUrlError(null);
              }}
              maxLength={32}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12151a] border border-white/10 text-xs text-[#F7F5F0] placeholder:text-zinc-600 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
            />
          </div>
        </div>

        {/* PUBLIC VS PRIVATE OPTION */}
        <div className="p-4 rounded-xl bg-[#11141a] border border-white/10 mb-5">
          <div className="text-xs font-semibold text-[#F7F5F0] mb-2.5 flex items-center gap-1.5">
            {isPrivate ? <Lock className="w-3.5 h-3.5 text-teal-400" /> : <Globe className="w-3.5 h-3.5 text-teal-400" />}
            Room Visibility &amp; Privacy
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Public Option */}
            <button
              type="button"
              onClick={() => setIsPrivate(false)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                !isPrivate
                  ? 'border-teal-400/50 bg-teal-500/15 text-teal-200'
                  : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-[#F7F5F0] mb-1">
                <Globe className="w-3.5 h-3.5 text-teal-400" />
                <span>Public Party</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Listed in CinemaChord active rooms. Anyone on the website can see &amp; join with 1 click.
              </p>
            </button>

            {/* Private Option */}
            <button
              type="button"
              onClick={() => setIsPrivate(true)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isPrivate
                  ? 'border-teal-400/50 bg-teal-500/15 text-teal-200'
                  : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-[#F7F5F0] mb-1">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Private Party</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Hidden from public directory. Only friends with your 6-digit room key can join.
              </p>
            </button>
          </div>
        </div>

        {/* Synchronization Mode Toggle */}
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              Host-Authoritative Sync
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isHostControlOnly}
                onChange={(e) => setIsHostControlOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            {isHostControlOnly
              ? 'Only you (the host) control play, pause, and scrubber. Viewers sync automatically.'
              : 'Collaborative mode: Any participant in the room can pause or seek playback.'}
          </p>
        </div>

        {/* Launch Button */}
        <button
          onClick={handleLaunch}
          className="w-full py-3.5 px-4 rounded-xl font-medium text-sm text-black bg-teal-400 hover:bg-teal-300 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Launch {isPrivate ? 'Private' : 'Public'} Party &amp; Get 6-Digit Key</span>
        </button>
      </div>
    </div>
  );
};
