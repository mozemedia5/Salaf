export interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  thumbnailURL: string;
  scholarId: string;
  scholarName: string;
  category: string;
  duration: string;
  viewCount: string;
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
}

export interface GalleryImage {
  id: string;
  imageURL: string;
  thumbnailURL: string;
  caption: string;
  category: string;
  favoriteCount: number;
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
}

export type TabId = 'home' | 'videos' | 'audio' | 'donate' | 'profile';

export type ViewId = TabId | 'articles' | 'gallery' | 'search' | 'notifications' | 'article-detail' | 'video-player' | 'audio-player';
