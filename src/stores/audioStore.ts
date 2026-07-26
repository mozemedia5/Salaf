import { create } from "zustand";
import type { AudioTrack } from "@/types";

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

let audioInstance: HTMLAudioElement | null = null;

if (typeof window !== "undefined") {
  audioInstance = new Audio();
}

export const useAudioStore = create<AudioStore>((set, get) => {
  // Bind event listeners to HTML5 Audio element to update store state reactively
  if (audioInstance) {
    audioInstance.addEventListener("timeupdate", () => {
      if (audioInstance) {
        const current = audioInstance.currentTime;
        const dur = audioInstance.duration || 0;
        set({
          currentTime: current,
          duration: dur,
          progress: dur ? (current / dur) * 100 : 0
        });
      }
    });

    audioInstance.addEventListener("durationchange", () => {
      if (audioInstance) {
        set({ duration: audioInstance.duration || 0 });
      }
    });

    audioInstance.addEventListener("loadedmetadata", () => {
      if (audioInstance) {
        set({ duration: audioInstance.duration || 0 });
      }
    });

    audioInstance.addEventListener("ended", () => {
      set({ isPlaying: false, currentTime: 0, progress: 0 });
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
    favorites: ["1", "3"],

    play: (track) => {
      if (audioInstance) {
        const url = track.audioURL || track.audioUrl || "";
        if (url) {
          // If a new source is selected, load it
          if (audioInstance.src !== url) {
            audioInstance.src = url;
            audioInstance.load();
          }
          audioInstance.playbackRate = get().playbackSpeed;
          audioInstance.play().catch(err => {
            console.error("HTML5 Audio playback failed:", err);
          });
        }
      }
      set({ currentTrack: track, isPlaying: true, isMiniPlayerVisible: true });
    },

    pause: () => {
      if (audioInstance) {
        audioInstance.pause();
      }
      set({ isPlaying: false });
    },

    togglePlay: () => {
      const isPlayingNow = get().isPlaying;
      if (audioInstance) {
        if (isPlayingNow) {
          audioInstance.pause();
        } else {
          // Try to play
          const url = get().currentTrack?.audioURL || get().currentTrack?.audioUrl || "";
          if (audioInstance.src !== url && url) {
            audioInstance.src = url;
            audioInstance.load();
          }
          audioInstance.playbackRate = get().playbackSpeed;
          audioInstance.play().catch(err => {
            console.error("HTML5 Audio playback failed:", err);
          });
        }
      }
      set({ isPlaying: !isPlayingNow });
    },

    seek: (time) => {
      if (audioInstance) {
        audioInstance.currentTime = time;
      }
      const dur = get().duration;
      set({ currentTime: time, progress: dur ? (time / dur) * 100 : 0 });
    },

    setProgress: (time, dur) => {
      if (audioInstance) {
        // Only set native time if the difference is substantial (to prevent infinite loops)
        if (Math.abs(audioInstance.currentTime - time) > 1.5) {
          audioInstance.currentTime = time;
        }
      }
      set({ currentTime: time, duration: dur, progress: dur ? (time / dur) * 100 : 0 });
    },

    setSpeed: (speed) => {
      if (audioInstance) {
        audioInstance.playbackRate = speed;
      }
      set({ playbackSpeed: speed });
    },

    openFullPlayer: () => set({ isFullPlayerOpen: true }),
    closeFullPlayer: () => set({ isFullPlayerOpen: false }),
    toggleFavorite: (id) => set((s) => ({
      favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id]
    })),
    skipForward: () => {
      if (audioInstance) {
        const nextTime = Math.min(audioInstance.currentTime + 15, audioInstance.duration || 0);
        audioInstance.currentTime = nextTime;
        set({ currentTime: nextTime });
      } else {
        set((s) => ({ currentTime: Math.min(s.currentTime + 15, s.duration) }));
      }
    },
    skipBackward: () => {
      if (audioInstance) {
        const nextTime = Math.max(audioInstance.currentTime - 15, 0);
        audioInstance.currentTime = nextTime;
        set({ currentTime: nextTime });
      } else {
        set((s) => ({ currentTime: Math.max(s.currentTime - 15, 0) }));
      }
    },
    closeMiniPlayer: () => {
      if (audioInstance) {
        audioInstance.pause();
        audioInstance.src = "";
      }
      set({ isMiniPlayerVisible: false, isPlaying: false, currentTrack: null, currentTime: 0, progress: 0 });
    },
  };
});
