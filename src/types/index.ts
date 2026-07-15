export interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId?: string;
  tiktokId?: string;
  videoURL?: string;
  videoType: 'youtube' | 'tiktok' | 'upload';
  thumbnailURL: string;
  scholarId: string;
  scholarName: string;
  category: string;
  duration: string;
  viewCount: number;
  likes: number;
  createdAt: string;
  createdBy?: string;
  isActive: boolean;
}

export interface VideoReview {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  description: string;
  audioURL: string;
  thumbnailURL: string;
  scholarId: string;
  scholarName: string;
  category: string;
  duration: string;
  playCount: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImageURL: string;
  authorName: string;
  category: string;
  readingTime: string;
  createdAt: string;
  createdBy?: string;
  tags?: string[];
  evidences?: string[];
  links?: { title: string; url: string }[];
  isActive?: boolean;
}

export interface GalleryImage {
  id: string;
  imageURL: string;
  thumbnailURL: string;
  caption: string;
  category: string;
  favoriteCount: number;
  uploadedBy?: string;
  createdAt?: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  imageURL: string;
  targetAmount: number;
  raisedAmount: number;
  donorCount: number;
  isUrgent: boolean;
  isFeatured: boolean;
  createdBy?: string;
  createdAt?: string;
  isActive?: boolean;
}

export interface Scholar {
  id: string;
  name: string;
  bio: string;
  photoURL: string;
  specialty: string;
  lectureCount: number;
}

export interface Notification {
  id: string;
  type: 'lecture' | 'article' | 'donation' | 'reminder' | 'announcement';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  createdBy?: string;
  link?: string;
  imageURL?: string;
}

export interface Banner {
  id: string;
  title: string;
  imageURL: string;
  category: string;
  link?: string;
  description?: string;
  details?: string;
  createdBy?: string;
  createdAt?: string;
  isActive?: boolean;
}

export interface UserQuestion {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userResidence: string;
  userPhone?: string;
  question: string;
  category: string;
  answer?: string;
  answeredBy?: string;
  answeredByName?: string;
  status: 'pending' | 'answered';
  createdAt: string;
  answeredAt?: string;
  isPublic: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'admin';
  photoURL?: string;
  isEmailVerified: boolean;
  isApproved: boolean;
  createdAt: string;
  createdBy?: string;
  lastLoginAt?: string;
  permissions: {
    canManageVideos: boolean;
    canManageArticles: boolean;
    canManageGallery: boolean;
    canManageDonations: boolean;
    canManageBanners: boolean;
    canManageAdmins: boolean;
    canManageNotifications: boolean;
    canAnswerQuestions: boolean;
  };
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'video_watched' | 'video_reviewed' | 'audio_listened' | 'question_asked' | 'question_answered' | 'article_read' | 'video_saved' | 'donation_made';
  title: string;
  description: string;
  contentId: string;
  createdAt: string;
  status?: 'pending' | 'completed';
}

export interface SavedVideo {
  id: string;
  videoId: string;
  title: string;
  scholarName: string;
  thumbnailURL: string;
  category: string;
  duration: string;
  savedAt: string;
}

export type TabId = 'home' | 'videos' | 'audio' | 'donate' | 'profile';

export type ViewId = TabId | 'articles' | 'gallery' | 'search' | 'notifications' | 'article-detail' | 'video-player' | 'audio-player' | 'privacy-policy' | 'terms-of-service' | 'admin-dashboard' | 'user-questions';

export type AdminSection = 'overview' | 'videos' | 'articles' | 'gallery' | 'donations' | 'banners' | 'questions' | 'admins' | 'notifications' | 'analytics';
