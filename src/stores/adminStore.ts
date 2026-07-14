import { create } from 'zustand';
import type { AdminSection, Video, Article, GalleryImage, Campaign, Banner, Notification, UserQuestion, AdminUser } from '@/types';

interface AdminStore {
  // Navigation
  currentSection: AdminSection;
  setSection: (section: AdminSection) => void;

  // Data states
  videos: Video[];
  articles: Article[];
  galleryImages: GalleryImage[];
  campaigns: Campaign[];
  banners: Banner[];
  notifications: Notification[];
  questions: UserQuestion[];
  admins: AdminUser[];

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Modal states
  isVideoModalOpen: boolean;
  isArticleModalOpen: boolean;
  isGalleryModalOpen: boolean;
  isCampaignModalOpen: boolean;
  isBannerModalOpen: boolean;
  isNotificationModalOpen: boolean;
  isAdminModalOpen: boolean;
  isQuestionModalOpen: boolean;
  editingItem: any | null;

  // Actions
  setVideos: (videos: Video[]) => void;
  setArticles: (articles: Article[]) => void;
  setGalleryImages: (images: GalleryImage[]) => void;
  setCampaigns: (campaigns: Campaign[]) => void;
  setBanners: (banners: Banner[]) => void;
  setNotifications: (notifications: Notification[]) => void;
  setQuestions: (questions: UserQuestion[]) => void;
  setAdmins: (admins: AdminUser[]) => void;

  openVideoModal: (item?: Video | null) => void;
  closeVideoModal: () => void;
  openArticleModal: (item?: Article | null) => void;
  closeArticleModal: () => void;
  openGalleryModal: (item?: GalleryImage | null) => void;
  closeGalleryModal: () => void;
  openCampaignModal: (item?: Campaign | null) => void;
  closeCampaignModal: () => void;
  openBannerModal: (item?: Banner | null) => void;
  closeBannerModal: () => void;
  openNotificationModal: (item?: Notification | null) => void;
  closeNotificationModal: () => void;
  openAdminModal: (item?: AdminUser | null) => void;
  closeAdminModal: () => void;
  openQuestionModal: (item?: UserQuestion | null) => void;
  closeQuestionModal: () => void;

  // Stats
  getStats: () => {
    totalVideos: number;
    totalArticles: number;
    totalQuestions: number;
    pendingQuestions: number;
    totalAdmins: number;
    totalDonations: number;
  };
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  currentSection: 'overview',
  setSection: (section) => set({ currentSection: section }),

  videos: [],
  articles: [],
  galleryImages: [],
  campaigns: [],
  banners: [],
  notifications: [],
  questions: [],
  admins: [],

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  isVideoModalOpen: false,
  isArticleModalOpen: false,
  isGalleryModalOpen: false,
  isCampaignModalOpen: false,
  isBannerModalOpen: false,
  isNotificationModalOpen: false,
  isAdminModalOpen: false,
  isQuestionModalOpen: false,
  editingItem: null,

  setVideos: (videos) => set({ videos }),
  setArticles: (articles) => set({ articles }),
  setGalleryImages: (images) => set({ galleryImages: images }),
  setCampaigns: (campaigns) => set({ campaigns }),
  setBanners: (banners) => set({ banners }),
  setNotifications: (notifications) => set({ notifications }),
  setQuestions: (questions) => set({ questions }),
  setAdmins: (admins) => set({ admins }),

  openVideoModal: (item = null) => set({ isVideoModalOpen: true, editingItem: item }),
  closeVideoModal: () => set({ isVideoModalOpen: false, editingItem: null }),
  openArticleModal: (item = null) => set({ isArticleModalOpen: true, editingItem: item }),
  closeArticleModal: () => set({ isArticleModalOpen: false, editingItem: null }),
  openGalleryModal: (item = null) => set({ isGalleryModalOpen: true, editingItem: item }),
  closeGalleryModal: () => set({ isGalleryModalOpen: false, editingItem: null }),
  openCampaignModal: (item = null) => set({ isCampaignModalOpen: true, editingItem: item }),
  closeCampaignModal: () => set({ isCampaignModalOpen: false, editingItem: null }),
  openBannerModal: (item = null) => set({ isBannerModalOpen: true, editingItem: item }),
  closeBannerModal: () => set({ isBannerModalOpen: false, editingItem: null }),
  openNotificationModal: (item = null) => set({ isNotificationModalOpen: true, editingItem: item }),
  closeNotificationModal: () => set({ isNotificationModalOpen: false, editingItem: null }),
  openAdminModal: (item = null) => set({ isAdminModalOpen: true, editingItem: item }),
  closeAdminModal: () => set({ isAdminModalOpen: false, editingItem: null }),
  openQuestionModal: (item = null) => set({ isQuestionModalOpen: true, editingItem: item }),
  closeQuestionModal: () => set({ isQuestionModalOpen: false, editingItem: null }),

  getStats: () => {
    const state = get();
    return {
      totalVideos: state.videos.length,
      totalArticles: state.articles.length,
      totalQuestions: state.questions.length,
      pendingQuestions: state.questions.filter((q: UserQuestion) => q.status === 'pending').length,
      totalAdmins: state.admins.length,
      totalDonations: state.campaigns.reduce((sum: number, c: Campaign) => sum + c.raisedAmount, 0),
    };
  },
}));
