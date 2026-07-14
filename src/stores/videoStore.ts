import { create } from 'zustand';
import {
  collection,
  doc,
  query,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  increment,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Video, VideoReview, SavedVideo } from '@/types';

interface VideoStore {
  videos: Video[];
  reviews: VideoReview[];
  savedVideos: SavedVideo[];
  currentVideo: Video | null;
  isLoading: boolean;
  unsubscribers: (() => void)[];

  fetchVideos: () => void;
  setVideos: (videos: Video[]) => void;
  fetchReviews: (videoId: string) => void;
  fetchSavedVideos: (userId: string) => void;
  addVideo: (video: Omit<Video, 'id' | 'createdAt' | 'likes' | 'viewCount'>) => Promise<void>;
  updateVideo: (id: string, video: Partial<Video>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  incrementViews: (videoId: string) => Promise<void>;
  toggleLike: (videoId: string, userId: string) => Promise<boolean>;
  addReview: (review: Omit<VideoReview, 'id' | 'createdAt'>) => Promise<void>;
  saveVideo: (userId: string, video: Video) => Promise<void>;
  removeSavedVideo: (userId: string, videoId: string) => Promise<void>;
  isVideoSaved: (videoId: string) => boolean;
  setCurrentVideo: (video: Video | null) => void;
  getVideoById: (id: string) => Video | undefined;
  cleanup: () => void;
}

export const useVideoStore = create<VideoStore>((set, get) => ({
  videos: [],
  reviews: [],
  savedVideos: [],
  currentVideo: null,
  isLoading: false,
  unsubscribers: [],

  fetchVideos: () => {
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const videos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Video[];
      set({ videos });
    });
    set((state) => ({ unsubscribers: [...state.unsubscribers, unsub] }));
  },

  setVideos: (videos) => set({ videos }),

  fetchReviews: (videoId: string) => {
    const q = query(
      collection(db, 'video_reviews'),
      where('videoId', '==', videoId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VideoReview[];
      set({ reviews });
    });
    set((state) => ({ unsubscribers: [...state.unsubscribers, unsub] }));
  },

  fetchSavedVideos: (userId: string) => {
    const q = query(
      collection(db, 'users', userId, 'savedVideos'),
      orderBy('savedAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const savedVideos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SavedVideo[];
      set({ savedVideos });
    });
    set((state) => ({ unsubscribers: [...state.unsubscribers, unsub] }));
  },

  addVideo: async (video) => {
    await addDoc(collection(db, 'videos'), {
      ...video,
      likes: 0,
      viewCount: 0,
      createdAt: serverTimestamp(),
      isActive: true,
    });
  },

  updateVideo: async (id, video) => {
    const ref = doc(db, 'videos', id);
    await updateDoc(ref, {
      ...video,
      updatedAt: serverTimestamp(),
    });
  },

  deleteVideo: async (id) => {
    await deleteDoc(doc(db, 'videos', id));
  },

  incrementViews: async (videoId: string) => {
    const ref = doc(db, 'videos', videoId);
    await updateDoc(ref, {
      viewCount: increment(1),
    });
  },

  toggleLike: async (videoId: string, userId: string) => {
    const likeRef = doc(db, 'video_likes', `${videoId}_${userId}`);
    const likeDoc = await getDoc(likeRef);
    const videoRef = doc(db, 'videos', videoId);

    if (likeDoc.exists()) {
      await deleteDoc(likeRef);
      await updateDoc(videoRef, { likes: increment(-1) });
      return false;
    } else {
      await setDoc(likeRef, {
        videoId,
        userId,
        createdAt: serverTimestamp(),
      });
      await updateDoc(videoRef, { likes: increment(1) });
      return true;
    }
  },

  addReview: async (review) => {
    await addDoc(collection(db, 'video_reviews'), {
      ...review,
      createdAt: serverTimestamp(),
    });
  },

  saveVideo: async (userId: string, video: Video) => {
    const savedRef = doc(db, 'users', userId, 'savedVideos', video.id);
    await setDoc(savedRef, {
      videoId: video.id,
      title: video.title,
      scholarName: video.scholarName,
      thumbnailURL: video.thumbnailURL,
      category: video.category,
      duration: video.duration,
      savedAt: new Date().toISOString(),
    });
  },

  removeSavedVideo: async (userId: string, videoId: string) => {
    await deleteDoc(doc(db, 'users', userId, 'savedVideos', videoId));
  },

  isVideoSaved: (videoId: string) => {
    return get().savedVideos.some((v) => v.videoId === videoId);
  },

  setCurrentVideo: (video) => set({ currentVideo: video }),

  getVideoById: (id: string) => {
    return get().videos.find((v) => v.id === id);
  },

  cleanup: () => {
    get().unsubscribers.forEach((unsub) => unsub());
    set({ unsubscribers: [], videos: [], reviews: [], savedVideos: [], currentVideo: null });
  },
}));
