export interface Movie {
  id: string;
  title: string;
  genre: string;
  year: number;
  runtime: string;
  synopsis: string;
  director: string;
  thumbnail: string;
  videoUrl: string;
  videoType?: 'youtube' | 'direct';
  youtubeId?: string;
  isPrivate?: boolean;
  activeRoomCode?: string;
  activeViewers?: number;
  hostName?: string;
  currentTime?: string;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
  const match = clean.match(regExp);
  return match && match[1] ? match[1] : null;
}

// Initial empty list: only user-created watch parties are stored and displayed
export const FEATURED_MOVIES: Movie[] = [];

export interface RoomParticipant {
  id: string;
  name: string;
  avatar: string;
  isHost?: boolean;
  isYou?: boolean;
  status: 'watching' | 'buffering' | 'paused';
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  videoTime: string;
  isSystem?: boolean;
}

export interface StudyNote {
  id: string;
  author: string;
  note: string;
  videoTime: string;
  createdTime: string;
}
