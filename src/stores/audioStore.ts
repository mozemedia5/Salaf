import { create } from 'zustand';
import type { AudioTrack } from '@/types';

interface AudioStore {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isMiniPlayerVisible: boolean;
  isFullPlayerOpen: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  progress: number;
  favorites: string[];
  play: (track: AudioTrack) => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setProgress: (time: number, duration: number) => void;
  setSpeed: (speed: number) => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
  toggleFavorite: (id: string) => void;
  skipForward: () => void;
  skipBackward: () => void;
  closeMiniPlayer: () => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  isMiniPlayerVisible: false,
  isFullPlayerOpen: false,
  currentTime: 0,
  duration: 0,
  playbackSpeed: 1,
  progress: 0,
  favorites: ['1', '3'],

  play: (track) => set({ currentTrack: track, isPlaying: true, isMiniPlayerVisible: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  seek: (time) => set({ currentTime: time, progress: get().duration ? (time / get().duration) * 100 : 0 }),
  setProgress: (time, dur) => set({ currentTime: time, duration: dur, progress: dur ? (time / dur) * 100 : 0 }),
  setSpeed: (speed) => set({ playbackSpeed: speed }),
  openFullPlayer: () => set({ isFullPlayerOpen: true }),
  closeFullPlayer: () => set({ isFullPlayerOpen: false }),
  toggleFavorite: (id) => set((s) => ({ 
    favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id] 
  })),
  skipForward: () => set((s) => ({ currentTime: Math.min(s.currentTime + 15, s.duration) })),
  skipBackward: () => set((s) => ({ currentTime: Math.max(s.currentTime - 15, 0) })),
  closeMiniPlayer: () => set({ isMiniPlayerVisible: false, isPlaying: false, currentTrack: null }),
}));
