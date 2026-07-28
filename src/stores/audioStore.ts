/**
 * audioStore — real HTML5 <audio> playback
 *
 * Key changes vs the previous version:
 * - Maintains a single HTMLAudioElement instance (audioEl) for true playback.
 * - Progress / currentTime / duration are driven by the element's `timeupdate`
 *   and `loadedmetadata` events so the UI always reflects actual playback.
 * - play() / pause() / seek() operate the real audio element.
 * - download() triggers a browser-native download of the current track.
 * - setProgress() is kept for progress-bar drag-to-seek.
 */

import { create } from 'zustand';
import type { AudioTrack } from '@/types';

// Singleton audio element – created once and reused.
let audioEl: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = 'metadata';
  }
  return audioEl;
}

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
  resume: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  /** Called internally by the audio element event listeners */
  setProgress: (time: number, duration: number) => void;
  setSpeed: (speed: number) => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
  toggleFavorite: (id: string) => void;
  skipForward: () => void;
  skipBackward: () => void;
  closeMiniPlayer: () => void;
  download: () => void;
}

export const useAudioStore = create<AudioStore>((set, get) => {
  // Wire up the singleton audio element event listeners once.
  if (typeof window !== 'undefined') {
    const el = getAudio();

    el.addEventListener('timeupdate', () => {
      const { currentTime, duration } = el;
      set({
        currentTime,
        duration,
        progress: duration > 0 ? (currentTime / duration) * 100 : 0,
      });
    });

    el.addEventListener('loadedmetadata', () => {
      set({ duration: el.duration, currentTime: 0, progress: 0 });
    });

    el.addEventListener('ended', () => {
      set({ isPlaying: false, progress: 0, currentTime: 0 });
    });

    el.addEventListener('pause', () => set({ isPlaying: false }));
    el.addEventListener('play', () => set({ isPlaying: true }));

    el.addEventListener('error', (e) => {
      console.warn('Audio element error:', e);
      set({ isPlaying: false });
    });
  }

  return {
    currentTrack: null,
    isPlaying: false,
    isMiniPlayerVisible: false,
    isFullPlayerOpen: false,
    currentTime: 0,
    duration: 0,
    playbackSpeed: 1,
    progress: 0,
    favorites: [],

    play: (track) => {
      const el = getAudio();
      const state = get();

      if (state.currentTrack?.id === track.id) {
        // Same track — just resume if paused
        if (!state.isPlaying) {
          el.play().catch(console.warn);
        }
        return;
      }

      // New track
      el.src = track.audioURL;
      el.playbackRate = state.playbackSpeed;
      el.play().catch(console.warn);

      set({
        currentTrack: track,
        isPlaying: true,
        isMiniPlayerVisible: true,
        currentTime: 0,
        progress: 0,
        duration: 0,
      });
    },

    pause: () => {
      getAudio().pause();
      set({ isPlaying: false });
    },

    resume: () => {
      const el = getAudio();
      if (get().currentTrack) {
        el.play().catch(console.warn);
      }
    },

    togglePlay: () => {
      const { isPlaying } = get();
      if (isPlaying) {
        get().pause();
      } else {
        get().resume();
      }
    },

    seek: (time) => {
      const el = getAudio();
      el.currentTime = time;
      set({ currentTime: time, progress: el.duration > 0 ? (time / el.duration) * 100 : 0 });
    },

    setProgress: (time, dur) => {
      set({ currentTime: time, duration: dur, progress: dur > 0 ? (time / dur) * 100 : 0 });
    },

    setSpeed: (speed) => {
      getAudio().playbackRate = speed;
      set({ playbackSpeed: speed });
    },

    openFullPlayer: () => set({ isFullPlayerOpen: true }),
    closeFullPlayer: () => set({ isFullPlayerOpen: false }),

    toggleFavorite: (id) =>
      set((s) => ({
        favorites: s.favorites.includes(id)
          ? s.favorites.filter((f) => f !== id)
          : [...s.favorites, id],
      })),

    skipForward: () => {
      const el = getAudio();
      const newTime = Math.min(el.currentTime + 15, el.duration || Infinity);
      el.currentTime = newTime;
    },

    skipBackward: () => {
      const el = getAudio();
      const newTime = Math.max(el.currentTime - 15, 0);
      el.currentTime = newTime;
    },

    closeMiniPlayer: () => {
      const el = getAudio();
      el.pause();
      el.src = '';
      set({
        isMiniPlayerVisible: false,
        isFullPlayerOpen: false,
        isPlaying: false,
        currentTrack: null,
        currentTime: 0,
        progress: 0,
        duration: 0,
      });
    },

    download: () => {
      const { currentTrack } = get();
      if (!currentTrack?.audioURL) return;

      const a = document.createElement('a');
      a.href = currentTrack.audioURL;
      a.download = `${currentTrack.title}.mp3`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
  };
});
