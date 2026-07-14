import { create } from 'zustand';
import type { GalleryImage } from '@/types';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}

export interface SavedLecture {
  id: string;
  videoId: string;
  title: string;
  scholarName: string;
  category: string;
  savedAt: string;
  duration: string;
}

export interface ListeningHistory {
  id: string;
  trackId: string;
  title: string;
  scholarName: string;
  listenedAt: string;
  duration: string;
  timeListened: number; // in seconds
}

export interface DownloadHistory {
  id: string;
  contentId: string;
  contentTitle: string;
  contentType: 'audio' | 'video' | 'article';
  downloadedAt: string;
  fileSize: string;
}

interface UserContentState {
  // Loading state
  isLoading: boolean;
  
  // Donations
  donations: Donation[];
  totalDonated: number;
  fetchDonations: (userId: string) => void;
  addDonation: (userId: string, donation: Omit<Donation, 'id'>) => Promise<void>;

  // Saved Lectures (Videos)
  savedLectures: SavedLecture[];
  fetchSavedLectures: (userId: string) => void;
  addSavedLecture: (userId: string, lecture: Omit<SavedLecture, 'id'>) => Promise<void>;
  removeSavedLecture: (userId: string, videoId: string) => Promise<void>;
  isSavedLecture: (videoId: string) => boolean;

  // Gallery Favorites
  galleryFavorites: GalleryImage[];
  fetchGalleryFavorites: (userId: string) => void;
  addGalleryFavorite: (userId: string, image: GalleryImage) => Promise<void>;
  removeGalleryFavorite: (userId: string, imageId: string) => Promise<void>;
  isGalleryFavorite: (imageId: string) => boolean;

  // Listening History
  listeningHistory: ListeningHistory[];
  fetchListeningHistory: (userId: string) => void;
  addListeningHistory: (userId: string, history: Omit<ListeningHistory, 'id'>) => Promise<void>;
  getTotalListeningTime: () => number;

  // Download History
  downloadHistory: DownloadHistory[];
  fetchDownloadHistory: (userId: string) => void;
  addDownloadHistory: (userId: string, download: Omit<DownloadHistory, 'id'>) => Promise<void>;

  // Subscription un-subscribers
  unsubscribers: (() => void)[];

  // Reset user content (on logout)
  resetUserContent: () => void;
}

export const useUserContentStore = create<UserContentState>((set, get) => ({
  isLoading: false,
  donations: [],
  totalDonated: 0,
  savedLectures: [],
  galleryFavorites: [],
  listeningHistory: [],
  downloadHistory: [],
  unsubscribers: [],

  fetchDonations: (userId: string) => {
    const q = query(collection(db, 'users', userId, 'donations'));
    const unsub = onSnapshot(q, (snapshot) => {
      const donations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));
      set({ 
        donations, 
        totalDonated: donations.reduce((sum, d) => sum + d.amount, 0) 
      });
    });
    set(state => ({ unsubscribers: [...state.unsubscribers, unsub] }));
  },

  addDonation: async (userId: string, donation: Omit<Donation, 'id'>) => {
    await addDoc(collection(db, 'users', userId, 'donations'), {
      ...donation,
      createdAt: Timestamp.now()
    });
  },

  fetchSavedLectures: (userId: string) => {
    const q = query(collection(db, 'users', userId, 'savedLectures'));
    const unsub = onSnapshot(q, (snapshot) => {
      const savedLectures = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedLecture));
      set({ savedLectures });
    });
    set(state => ({ unsubscribers: [...state.unsubscribers, unsub] }));
  },

  addSavedLecture: async (userId: string, lecture: Omit<SavedLecture, 'id'>) => {
    await addDoc(collection(db, 'users', userId, 'savedLectures'), {
      ...lecture,
      createdAt: Timestamp.now()
    });
  },

  removeSavedLecture: async (userId: string, videoId: string) => {
    const q = query(collection(db, 'users', userId, 'savedLectures'), where('videoId', '==', videoId));
    const snapshot = await getDocs(q);
    snapshot.forEach(async (document) => {
      await deleteDoc(doc(db, 'users', userId, 'savedLectures', document.id));
    });
  },

  isSavedLecture: (videoId: string) => {
    return get().savedLectures.some((l) => l.videoId === videoId);
  },

  fetchGalleryFavorites: (userId: string) => {
    const q = query(collection(db, 'users', userId, 'galleryFavorites'));
    const unsub = onSnapshot(q, (snapshot) => {
      const galleryFavorites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage));
      set({ galleryFavorites });
    });
    set(state => ({ unsubscribers: [...state.unsubscribers, unsub] }));
  },

  addGalleryFavorite: async (userId: string, image: GalleryImage) => {
    await addDoc(collection(db, 'users', userId, 'galleryFavorites'), {
      ...image,
      createdAt: Timestamp.now()
    });
  },

  removeGalleryFavorite: async (userId: string, imageId: string) => {
    const q = query(collection(db, 'users', userId, 'galleryFavorites'), where('id', '==', imageId));
    const snapshot = await getDocs(q);
    snapshot.forEach(async (document) => {
      await deleteDoc(doc(db, 'users', userId, 'galleryFavorites', document.id));
    });
  },

  isGalleryFavorite: (imageId: string) => {
    return get().galleryFavorites.some((g) => g.id === imageId);
  },

  fetchListeningHistory: (userId: string) => {
    const q = query(collection(db, 'users', userId, 'listeningHistory'));
    const unsub = onSnapshot(q, (snapshot) => {
      const listeningHistory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ListeningHistory));
      set({ listeningHistory });
    });
    set(state => ({ unsubscribers: [...state.unsubscribers, unsub] }));
  },

  addListeningHistory: async (userId: string, history: Omit<ListeningHistory, 'id'>) => {
    await addDoc(collection(db, 'users', userId, 'listeningHistory'), {
      ...history,
      createdAt: Timestamp.now()
    });
  },

  getTotalListeningTime: () => {
    return get().listeningHistory.reduce((sum, h) => sum + h.timeListened, 0);
  },

  fetchDownloadHistory: (userId: string) => {
    const q = query(collection(db, 'users', userId, 'downloadHistory'));
    const unsub = onSnapshot(q, (snapshot) => {
      const downloadHistory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DownloadHistory));
      set({ downloadHistory });
    });
    set(state => ({ unsubscribers: [...state.unsubscribers, unsub] }));
  },

  addDownloadHistory: async (userId: string, download: Omit<DownloadHistory, 'id'>) => {
    await addDoc(collection(db, 'users', userId, 'downloadHistory'), {
      ...download,
      createdAt: Timestamp.now()
    });
  },

  resetUserContent: () => {
    // Unsubscribe from all Firestore listeners
    get().unsubscribers.forEach(unsub => unsub());
    
    set({
      donations: [],
      totalDonated: 0,
      savedLectures: [],
      galleryFavorites: [],
      listeningHistory: [],
      downloadHistory: [],
      unsubscribers: [],
      isLoading: false
    });
  },
}));
