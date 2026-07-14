import { create } from 'zustand';
import type { GalleryImage } from '@/types';

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
  // Donations
  donations: Donation[];
  totalDonated: number;
  addDonation: (donation: Donation) => void;
  getDonations: () => Donation[];
  getDonationTotal: () => number;

  // Saved Lectures (Videos)
  savedLectures: SavedLecture[];
  addSavedLecture: (lecture: SavedLecture) => void;
  removeSavedLecture: (videoId: string) => void;
  getSavedLectures: () => SavedLecture[];
  isSavedLecture: (videoId: string) => boolean;

  // Gallery Favorites
  galleryFavorites: GalleryImage[];
  addGalleryFavorite: (image: GalleryImage) => void;
  removeGalleryFavorite: (imageId: string) => void;
  getGalleryFavorites: () => GalleryImage[];
  isGalleryFavorite: (imageId: string) => boolean;

  // Listening History
  listeningHistory: ListeningHistory[];
  addListeningHistory: (history: ListeningHistory) => void;
  getListeningHistory: () => ListeningHistory[];
  getTotalListeningTime: () => number;

  // Download History
  downloadHistory: DownloadHistory[];
  addDownloadHistory: (download: DownloadHistory) => void;
  getDownloadHistory: () => DownloadHistory[];

  // Reset user content (on logout)
  resetUserContent: () => void;
}

// Mock data for initial state
const MOCK_DONATIONS: Donation[] = [
  {
    id: '1',
    campaignId: 'camp1',
    campaignTitle: 'Quranic Education Initiative',
    amount: 25,
    date: '2024-01-15',
    status: 'completed',
  },
  {
    id: '2',
    campaignId: 'camp2',
    campaignTitle: 'Islamic Scholarship Fund',
    amount: 50,
    date: '2024-01-20',
    status: 'completed',
  },
  {
    id: '3',
    campaignId: 'camp3',
    campaignTitle: 'Hadith Preservation Project',
    amount: 30,
    date: '2024-02-05',
    status: 'completed',
  },
  {
    id: '4',
    campaignId: 'camp1',
    campaignTitle: 'Quranic Education Initiative',
    amount: 40,
    date: '2024-02-14',
    status: 'completed',
  },
  {
    id: '5',
    campaignId: 'camp4',
    campaignTitle: 'Islamic History Archive',
    amount: 15,
    date: '2024-02-28',
    status: 'completed',
  },
];

const MOCK_SAVED_LECTURES: SavedLecture[] = [
  {
    id: '1',
    videoId: 'vid1',
    title: 'Understanding the Quran - Surah Al-Fatiha',
    scholarName: 'Dr. Ahmed Al-Mansouri',
    category: 'Quran',
    savedAt: '2024-01-10',
    duration: '45:32',
  },
  {
    id: '2',
    videoId: 'vid2',
    title: 'The Life of Prophet Muhammad',
    scholarName: 'Sheikh Muhammad Al-Jibali',
    category: 'Seerah',
    savedAt: '2024-01-18',
    duration: '52:15',
  },
  {
    id: '3',
    videoId: 'vid3',
    title: 'Islamic Family Values',
    scholarName: 'Dr. Fatima Al-Zahra',
    category: 'Family',
    savedAt: '2024-02-03',
    duration: '38:47',
  },
  {
    id: '4',
    videoId: 'vid4',
    title: 'Hadith Methodology and Sciences',
    scholarName: 'Prof. Hassan Al-Banna',
    category: 'Hadith',
    savedAt: '2024-02-12',
    duration: '61:20',
  },
];

const MOCK_LISTENING_HISTORY: ListeningHistory[] = [
  {
    id: '1',
    trackId: 'audio1',
    title: 'Daily Quran Recitation - Juz 1',
    scholarName: 'Qari Abdullah Al-Juhani',
    listenedAt: '2024-02-28',
    duration: '45:00',
    timeListened: 2700,
  },
  {
    id: '2',
    trackId: 'audio2',
    title: 'Tafsir Al-Quran - Surah Al-Baqarah Part 1',
    scholarName: 'Dr. Ahmed Al-Mansouri',
    listenedAt: '2024-02-27',
    duration: '52:30',
    timeListened: 3150,
  },
  {
    id: '3',
    trackId: 'audio3',
    title: 'Islamic History Podcast - Early Caliphate',
    scholarName: 'Dr. Muhammad Al-Qahhtani',
    listenedAt: '2024-02-26',
    duration: '38:15',
    timeListened: 2295,
  },
  {
    id: '4',
    trackId: 'audio4',
    title: 'Hadith Explanation - Sahih Al-Bukhari',
    scholarName: 'Sheikh Saleh Al-Uthaymeen',
    listenedAt: '2024-02-25',
    duration: '41:00',
    timeListened: 2460,
  },
  {
    id: '5',
    trackId: 'audio5',
    title: 'Quran Memorization Tips',
    scholarName: 'Ustadh Ibrahim Al-Akbar',
    listenedAt: '2024-02-24',
    duration: '25:30',
    timeListened: 1530,
  },
];

const MOCK_DOWNLOAD_HISTORY: DownloadHistory[] = [
  {
    id: '1',
    contentId: 'audio1',
    contentTitle: 'Daily Quran Recitation - Juz 1',
    contentType: 'audio',
    downloadedAt: '2024-02-28',
    fileSize: '45 MB',
  },
  {
    id: '2',
    contentId: 'vid1',
    contentTitle: 'Understanding the Quran - Surah Al-Fatiha',
    contentType: 'video',
    downloadedAt: '2024-02-27',
    fileSize: '320 MB',
  },
  {
    id: '3',
    contentId: 'audio2',
    contentTitle: 'Tafsir Al-Quran - Surah Al-Baqarah Part 1',
    contentType: 'audio',
    downloadedAt: '2024-02-26',
    fileSize: '52 MB',
  },
  {
    id: '4',
    contentId: 'art1',
    contentTitle: 'Islamic Jurisprudence Guide',
    contentType: 'article',
    downloadedAt: '2024-02-25',
    fileSize: '2.5 MB',
  },
  {
    id: '5',
    contentId: 'audio3',
    contentTitle: 'Islamic History Podcast - Early Caliphate',
    contentType: 'audio',
    downloadedAt: '2024-02-24',
    fileSize: '38 MB',
  },
  {
    id: '6',
    contentId: 'vid2',
    contentTitle: 'The Life of Prophet Muhammad',
    contentType: 'video',
    downloadedAt: '2024-02-23',
    fileSize: '280 MB',
  },
  {
    id: '7',
    contentId: 'audio4',
    contentTitle: 'Hadith Explanation - Sahih Al-Bukhari',
    contentType: 'audio',
    downloadedAt: '2024-02-22',
    fileSize: '41 MB',
  },
];

const MOCK_GALLERY_FAVORITES: GalleryImage[] = [
  {
    id: 'gal1',
    imageURL: '/public/images/gallery-1.jpg',
    thumbnailURL: '/public/images/gallery-1.jpg',
    caption: 'Masjid Al-Haram - Mecca',
    category: 'Islamic Sites',
    favoriteCount: 1,
  },
  {
    id: 'gal2',
    imageURL: '/public/images/gallery-2.jpg',
    thumbnailURL: '/public/images/gallery-2.jpg',
    caption: 'Al-Masjid Al-Nabawi - Medina',
    category: 'Islamic Sites',
    favoriteCount: 1,
  },
  {
    id: 'gal3',
    imageURL: '/public/images/gallery-3.jpg',
    thumbnailURL: '/public/images/gallery-3.jpg',
    caption: 'Islamic Calligraphy Art',
    category: 'Art',
    favoriteCount: 1,
  },
];

export const useUserContentStore = create<UserContentState>((set, get) => ({
  // Donations
  donations: MOCK_DONATIONS,
  totalDonated: MOCK_DONATIONS.reduce((sum, d) => sum + d.amount, 0),

  addDonation: (donation: Donation) =>
    set((state) => ({
      donations: [...state.donations, donation],
      totalDonated: state.totalDonated + donation.amount,
    })),

  getDonations: () => get().donations,

  getDonationTotal: () => get().totalDonated,

  // Saved Lectures
  savedLectures: MOCK_SAVED_LECTURES,

  addSavedLecture: (lecture: SavedLecture) =>
    set((state) => ({
      savedLectures: [...state.savedLectures, lecture],
    })),

  removeSavedLecture: (videoId: string) =>
    set((state) => ({
      savedLectures: state.savedLectures.filter((l) => l.videoId !== videoId),
    })),

  getSavedLectures: () => get().savedLectures,

  isSavedLecture: (videoId: string) =>
    get().savedLectures.some((l) => l.videoId === videoId),

  // Gallery Favorites
  galleryFavorites: MOCK_GALLERY_FAVORITES,

  addGalleryFavorite: (image: GalleryImage) =>
    set((state) => ({
      galleryFavorites: [...state.galleryFavorites, image],
    })),

  removeGalleryFavorite: (imageId: string) =>
    set((state) => ({
      galleryFavorites: state.galleryFavorites.filter((g) => g.id !== imageId),
    })),

  getGalleryFavorites: () => get().galleryFavorites,

  isGalleryFavorite: (imageId: string) =>
    get().galleryFavorites.some((g) => g.id === imageId),

  // Listening History
  listeningHistory: MOCK_LISTENING_HISTORY,

  addListeningHistory: (history: ListeningHistory) =>
    set((state) => ({
      listeningHistory: [history, ...state.listeningHistory],
    })),

  getListeningHistory: () => get().listeningHistory,

  getTotalListeningTime: () =>
    get().listeningHistory.reduce((sum, h) => sum + h.timeListened, 0),

  // Download History
  downloadHistory: MOCK_DOWNLOAD_HISTORY,

  addDownloadHistory: (download: DownloadHistory) =>
    set((state) => ({
      downloadHistory: [download, ...state.downloadHistory],
    })),

  getDownloadHistory: () => get().downloadHistory,

  // Reset on logout
  resetUserContent: () =>
    set({
      donations: [],
      totalDonated: 0,
      savedLectures: [],
      galleryFavorites: [],
      listeningHistory: [],
      downloadHistory: [],
    }),
}));
