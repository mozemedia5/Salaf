import { create } from 'zustand';
import {
  collection,
  doc,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserActivity, SavedVideo } from '@/types';

interface ActivityStore {
  activities: UserActivity[];
  savedVideos: SavedVideo[];
  isLoading: boolean;
  unsubscribers: (() => void)[];

  fetchActivities: (userId: string) => void;
  fetchSavedVideos: (userId: string) => void;
  addActivity: (userId: string, activity: Omit<UserActivity, 'id' | 'createdAt'>) => Promise<void>;
  logVideoWatched: (userId: string, videoId: string, title: string) => Promise<void>;
  logVideoReviewed: (userId: string, videoId: string, title: string) => Promise<void>;
  logAudioListened: (userId: string, trackId: string, title: string, duration: number) => Promise<void>;
  logQuestionAsked: (userId: string, questionId: string, question: string) => Promise<void>;
  logQuestionAnswered: (userId: string, questionId: string, question: string) => Promise<void>;
  logArticleRead: (userId: string, articleId: string, title: string) => Promise<void>;
  saveVideo: (userId: string, video: SavedVideo) => Promise<void>;
  removeSavedVideo: (userId: string, videoId: string) => Promise<void>;

  getVideosWatched: () => UserActivity[];
  getVideosReviewed: () => UserActivity[];
  getAudioListened: () => UserActivity[];
  getQuestionsAsked: () => UserActivity[];
  getPendingQuestions: () => UserActivity[];
  getAnsweredQuestions: () => UserActivity[];
  getArticlesRead: () => UserActivity[];

  cleanup: () => void;
}

export const useActivityStore = create<ActivityStore>((set, get) => ({
  activities: [],
  savedVideos: [],
  isLoading: false,
  unsubscribers: [],

  fetchActivities: (userId: string) => {
    set({ isLoading: true });
    const q = query(
      collection(db, 'users', userId, 'activities'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserActivity[];
      set({ activities, isLoading: false });
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

  addActivity: async (userId: string, activity) => {
    await addDoc(collection(db, 'users', userId, 'activities'), {
      ...activity,
      createdAt: serverTimestamp(),
    });
  },

  logVideoWatched: async (userId: string, videoId: string, title: string) => {
    await addDoc(collection(db, 'users', userId, 'activities'), {
      userId,
      type: 'video_watched',
      title: `Watched: ${title}`,
      description: title,
      contentId: videoId,
      createdAt: serverTimestamp(),
      status: 'completed',
    });
  },

  logVideoReviewed: async (userId: string, videoId: string, title: string) => {
    await addDoc(collection(db, 'users', userId, 'activities'), {
      userId,
      type: 'video_reviewed',
      title: `Reviewed: ${title}`,
      description: title,
      contentId: videoId,
      createdAt: serverTimestamp(),
      status: 'completed',
    });
  },

  logAudioListened: async (userId: string, trackId: string, title: string, duration: number) => {
    await addDoc(collection(db, 'users', userId, 'activities'), {
      userId,
      type: 'audio_listened',
      title: `Listened: ${title}`,
      description: `${title} (${Math.round(duration / 60)} min)`,
      contentId: trackId,
      createdAt: serverTimestamp(),
      status: 'completed',
    });
  },

  logQuestionAsked: async (userId: string, questionId: string, question: string) => {
    await addDoc(collection(db, 'users', userId, 'activities'), {
      userId,
      type: 'question_asked',
      title: 'Question Asked',
      description: question,
      contentId: questionId,
      createdAt: serverTimestamp(),
      status: 'pending',
    });
  },

  logQuestionAnswered: async (userId: string, questionId: string, question: string) => {
    await addDoc(collection(db, 'users', userId, 'activities'), {
      userId,
      type: 'question_answered',
      title: 'Question Answered',
      description: question,
      contentId: questionId,
      createdAt: serverTimestamp(),
      status: 'completed',
    });
  },

  logArticleRead: async (userId: string, articleId: string, title: string) => {
    await addDoc(collection(db, 'users', userId, 'activities'), {
      userId,
      type: 'article_read',
      title: `Read: ${title}`,
      description: title,
      contentId: articleId,
      createdAt: serverTimestamp(),
      status: 'completed',
    });
  },

  saveVideo: async (userId: string, video: SavedVideo) => {
    await addDoc(collection(db, 'users', userId, 'savedVideos'), {
      ...video,
      savedAt: new Date().toISOString(),
    });
  },

  removeSavedVideo: async (userId: string, videoId: string) => {
    await deleteDoc(doc(db, 'users', userId, 'savedVideos', videoId));
  },

  getVideosWatched: () => {
    return get().activities.filter((a) => a.type === 'video_watched');
  },

  getVideosReviewed: () => {
    return get().activities.filter((a) => a.type === 'video_reviewed');
  },

  getAudioListened: () => {
    return get().activities.filter((a) => a.type === 'audio_listened');
  },

  getQuestionsAsked: () => {
    return get().activities.filter((a) => a.type === 'question_asked');
  },

  getPendingQuestions: () => {
    return get().activities.filter((a) => a.type === 'question_asked' && a.status === 'pending');
  },

  getAnsweredQuestions: () => {
    return get().activities.filter(
      (a) => a.type === 'question_answered' || (a.type === 'question_asked' && a.status === 'completed')
    );
  },

  getArticlesRead: () => {
    return get().activities.filter((a) => a.type === 'article_read');
  },

  cleanup: () => {
    get().unsubscribers.forEach((unsub) => unsub());
    set({ unsubscribers: [], activities: [], savedVideos: [] });
  },
}));
