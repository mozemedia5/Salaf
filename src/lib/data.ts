import type { Video, AudioTrack, Article, GalleryImage, Campaign, Scholar, Notification } from '@/types';

export const CATEGORIES = [
  'All', 'Quran', 'Hadith', 'Fiqh', 'Seerah', 'Aqeedah', 'Dua', 'Ramadan', 'Youth', 'Sisters'
];

export const VIDEOS: Video[] = [
  { id: '1', title: 'Understanding Tawhid: The Foundation of Faith', description: 'A comprehensive lecture on the oneness of Allah.', youtubeId: 'dQw4w9WgXcQ', thumbnailURL: '/images/lecture-thumb-1.jpg', scholarId: 's1', scholarName: 'Sheikh Ibrahim', category: 'Aqeedah', duration: '45:23', viewCount: '12.5K', createdAt: '2026-07-10' },
  { id: '2', title: 'The Virtues of Reading Quran Daily', description: 'Discover the blessings of daily Quran recitation.', youtubeId: 'dQw4w9WgXcQ', thumbnailURL: '/images/lecture-thumb-2.jpg', scholarId: 's2', scholarName: 'Dr. Yasir Qadhi', category: 'Quran', duration: '32:15', viewCount: '8.3K', createdAt: '2026-07-08' },
  { id: '3', title: 'Fiqh of Prayer: Common Mistakes', description: 'Learn about common mistakes in Salah and how to correct them.', youtubeId: 'dQw4w9WgXcQ', thumbnailURL: '/images/lecture-thumb-3.jpg', scholarId: 's3', scholarName: 'Sheikh Nouman', category: 'Fiqh', duration: '28:40', viewCount: '15.1K', createdAt: '2026-07-05' },
  { id: '4', title: 'Seerah: The Year of Sorrow', description: 'Understanding the trials faced by the Prophet Muhammad.', youtubeId: 'dQw4w9WgXcQ', thumbnailURL: '/images/lecture-thumb-4.jpg', scholarId: 's1', scholarName: 'Sheikh Ibrahim', category: 'Seerah', duration: '52:10', viewCount: '6.7K', createdAt: '2026-07-01' },
  { id: '5', title: 'Dua for Protection and Healing', description: 'Powerful supplications from the Quran and Sunnah.', youtubeId: 'dQw4w9WgXcQ', thumbnailURL: '/images/lecture-thumb-1.jpg', scholarId: 's4', scholarName: 'Ustadha Maryam', category: 'Dua', duration: '18:30', viewCount: '22.4K', createdAt: '2026-06-28' },
  { id: '6', title: 'Raising Righteous Children', description: 'Islamic parenting principles for the modern world.', youtubeId: 'dQw4w9WgXcQ', thumbnailURL: '/images/lecture-thumb-2.jpg', scholarId: 's5', scholarName: 'Dr. Omar Suleiman', category: 'Youth', duration: '41:00', viewCount: '9.8K', createdAt: '2026-06-25' },
  { id: '7', title: 'The Science of Hadith Authentication', description: 'How scholars verify the authenticity of Hadith.', youtubeId: 'dQw4w9WgXcQ', thumbnailURL: '/images/lecture-thumb-3.jpg', scholarId: 's2', scholarName: 'Dr. Yasir Qadhi', category: 'Hadith', duration: '38:45', viewCount: '4.2K', createdAt: '2026-06-20' },
  { id: '8', title: 'Islamic Manners in Daily Life', description: 'Adab and Akhlaq for Muslims in the modern world.', youtubeId: 'dQw4w9WgXcQ', thumbnailURL: '/images/lecture-thumb-4.jpg', scholarId: 's5', scholarName: 'Dr. Omar Suleiman', category: 'Fiqh', duration: '25:20', viewCount: '11.6K', createdAt: '2026-06-15' },
];

export const AUDIO_TRACKS: AudioTrack[] = [
  { id: '1', title: 'Tafsir of Surah Al-Fatiha', description: 'Detailed explanation of the opening chapter.', audioURL: '#', thumbnailURL: '/images/lecture-thumb-1.jpg', scholarId: 's1', scholarName: 'Sheikh Ibrahim', category: 'Quran', duration: '55:00', playCount: '3.2K' },
  { id: '2', title: 'Stories of the Prophets: Adam AS', description: 'The story of Prophet Adam in depth.', audioURL: '#', thumbnailURL: '/images/lecture-thumb-2.jpg', scholarId: 's2', scholarName: 'Dr. Yasir Qadhi', category: 'Seerah', duration: '42:30', playCount: '5.1K' },
  { id: '3', title: 'Morning Adhkar Collection', description: 'Daily morning supplications with explanation.', audioURL: '#', thumbnailURL: '/images/lecture-thumb-3.jpg', scholarId: 's4', scholarName: 'Ustadha Maryam', category: 'Dua', duration: '15:45', playCount: '8.7K' },
  { id: '4', title: 'Fiqh of Fasting', description: 'Rules and regulations of fasting in Ramadan.', audioURL: '#', thumbnailURL: '/images/lecture-thumb-4.jpg', scholarId: 's3', scholarName: 'Sheikh Nouman', category: 'Fiqh', duration: '38:20', playCount: '2.9K' },
  { id: '5', title: 'Healing the Heart', description: 'Spiritual remedies for anxiety and stress.', audioURL: '#', thumbnailURL: '/images/lecture-thumb-1.jpg', scholarId: 's5', scholarName: 'Dr. Omar Suleiman', category: 'Aqeedah', duration: '28:00', playCount: '6.4K' },
  { id: '6', title: '40 Hadith of Imam Nawawi', description: 'Explanation of the famous 40 Hadith collection.', audioURL: '#', thumbnailURL: '/images/lecture-thumb-2.jpg', scholarId: 's1', scholarName: 'Sheikh Ibrahim', category: 'Hadith', duration: '48:15', playCount: '4.3K' },
];

export const ARTICLES: Article[] = [
  { id: '1', title: 'The Importance of Gratitude in Islam', excerpt: 'Gratitude (Shukr) is one of the most important qualities a Muslim can cultivate. This article explores its significance in the Quran and Sunnah.', content: '<p>Gratitude is a fundamental concept in Islam...</p>', featuredImageURL: '/images/lecture-thumb-1.jpg', authorName: 'Ustadha Amina', category: 'Aqeedah', readingTime: '5 min', createdAt: '2026-07-12' },
  { id: '2', title: 'Preparing for Ramadan: A Complete Guide', excerpt: 'Get ready for the blessed month with this comprehensive guide to spiritual, physical, and practical preparation.', content: '<p>Ramadan is the most blessed month...</p>', featuredImageURL: '/images/lecture-thumb-2.jpg', authorName: 'Sheikh Ibrahim', category: 'Ramadan', readingTime: '8 min', createdAt: '2026-07-08' },
  { id: '3', title: 'Understanding Zakat: Who Qualifies?', excerpt: 'A detailed explanation of the eight categories of people eligible to receive Zakat according to Islamic law.', content: '<p>Zakat is one of the five pillars...</p>', featuredImageURL: '/images/lecture-thumb-3.jpg', authorName: 'Dr. Yasir Qadhi', category: 'Fiqh', readingTime: '6 min', createdAt: '2026-07-05' },
  { id: '4', title: 'The Power of Istighfar', excerpt: 'Seeking forgiveness opens doors of mercy and blessings. Learn how to make istighfar a daily habit.', content: '<p>Istighfar is the act of seeking forgiveness...</p>', featuredImageURL: '/images/lecture-thumb-4.jpg', authorName: 'Ustadha Maryam', category: 'Dua', readingTime: '4 min', createdAt: '2026-07-01' },
  { id: '5', title: 'Building a Strong Muslim Family', excerpt: 'Practical advice for creating an Islamic household filled with love, respect, and faith.', content: '<p>The family is the foundation of society...</p>', featuredImageURL: '/images/lecture-thumb-1.jpg', authorName: 'Dr. Omar Suleiman', category: 'Youth', readingTime: '7 min', createdAt: '2026-06-28' },
  { id: '6', title: 'Lessons from the Hijrah', excerpt: 'What the migration of the Prophet teaches us about patience, trust in Allah, and new beginnings.', content: '<p>The Hijrah was a turning point...</p>', featuredImageURL: '/images/lecture-thumb-2.jpg', authorName: 'Sheikh Nouman', category: 'Seerah', readingTime: '10 min', createdAt: '2026-06-25' },
];

export const GALLERY_IMAGES: GalleryImage[] = [
  { id: '1', imageURL: '/images/gallery-1.jpg', thumbnailURL: '/images/gallery-1.jpg', caption: 'Intricate dome patterns of the Blue Mosque', category: 'Architecture', favoriteCount: 234 },
  { id: '2', imageURL: '/images/gallery-2.jpg', thumbnailURL: '/images/gallery-2.jpg', caption: 'Sunset silhouette of a mosque by the lake', category: 'Nature', favoriteCount: 189 },
  { id: '3', imageURL: '/images/gallery-3.jpg', thumbnailURL: '/images/gallery-3.jpg', caption: 'Prayer beads on an ornate prayer rug', category: 'Lifestyle', favoriteCount: 156 },
  { id: '4', imageURL: '/images/gallery-4.jpg', thumbnailURL: '/images/gallery-4.jpg', caption: 'Beautiful Arabic calligraphy in gold', category: 'Calligraphy', favoriteCount: 312 },
  { id: '5', imageURL: '/images/lecture-thumb-1.jpg', thumbnailURL: '/images/lecture-thumb-1.jpg', caption: 'Majestic mosque interior', category: 'Architecture', favoriteCount: 278 },
  { id: '6', imageURL: '/images/lecture-thumb-4.jpg', thumbnailURL: '/images/lecture-thumb-4.jpg', caption: 'Islamic garden with fountains', category: 'Nature', favoriteCount: 145 },
];

export const CAMPAIGNS: Campaign[] = [
  { id: '1', title: 'Community Mosque Renovation', description: 'Help us renovate the local community mosque to accommodate our growing congregation. The renovation includes expanding the prayer hall, updating facilities, and creating a dedicated sisters\' area.', imageURL: '/images/campaign-1.jpg', targetAmount: 50000, raisedAmount: 28500, donorCount: 342, isUrgent: true, isFeatured: true },
  { id: '2', title: 'Islamic Youth Center', description: 'Building a youth center to engage and educate our young Muslims with Islamic programs, sports facilities, and educational resources.', imageURL: '/images/lecture-thumb-3.jpg', targetAmount: 75000, raisedAmount: 12500, donorCount: 89, isUrgent: false, isFeatured: false },
  { id: '3', title: 'Quran Distribution Program', description: 'Distribute translated Qurans to new Muslims and Islamic centers worldwide. Each donation helps spread the message of Islam.', imageURL: '/images/lecture-thumb-2.jpg', targetAmount: 15000, raisedAmount: 8300, donorCount: 156, isUrgent: false, isFeatured: false },
];

export const SCHOLARS: Scholar[] = [
  { id: 's1', name: 'Sheikh Ibrahim', bio: 'Senior lecturer with 20+ years of experience in Islamic studies.', photoURL: '/images/lecture-thumb-3.jpg', specialty: 'Quran & Tafsir', lectureCount: 142 },
  { id: 's2', name: 'Dr. Yasir Qadhi', bio: 'Renowned Islamic scholar and Dean of Islamic Studies.', photoURL: '/images/lecture-thumb-3.jpg', specialty: 'Aqeedah & Hadith', lectureCount: 289 },
  { id: 's3', name: 'Sheikh Nouman', bio: 'Founder of Bayyinah Institute, expert in Quranic Arabic.', photoURL: '/images/lecture-thumb-3.jpg', specialty: 'Quranic Arabic', lectureCount: 356 },
  { id: 's4', name: 'Ustadha Maryam', bio: 'Dedicated female educator specializing in Islamic spirituality.', photoURL: '/images/lecture-thumb-3.jpg', specialty: 'Spirituality', lectureCount: 98 },
  { id: 's5', name: 'Dr. Omar Suleiman', bio: 'President of Yaqeen Institute, influential American Muslim scholar.', photoURL: '/images/lecture-thumb-3.jpg', specialty: 'Islamic Ethics', lectureCount: 214 },
];

export const NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'lecture', title: 'New Lecture: Understanding Tawhid', body: 'Sheikh Ibrahim just uploaded a new lecture on Aqeedah.', isRead: false, createdAt: '2026-07-14T10:00:00' },
  { id: '2', type: 'reminder', title: 'Jummah Mubarak!', body: 'Don\'t forget to read Surah Al-Kahf and send blessings upon the Prophet.', isRead: false, createdAt: '2026-07-11T08:00:00' },
  { id: '3', type: 'article', title: 'New Article: The Virtues of Charity', body: 'Read our latest article on the importance of sadaqah.', isRead: true, createdAt: '2026-07-10T14:30:00' },
  { id: '4', type: 'donation', title: 'New Campaign: Mosque Renovation', body: 'Help us renovate the local mosque. Target: $50,000', isRead: false, createdAt: '2026-07-08T09:00:00' },
  { id: '5', type: 'announcement', title: 'Platform Update', body: 'We\'ve added new features including offline audio playback!', isRead: true, createdAt: '2026-07-05T16:00:00' },
  { id: '6', type: 'lecture', title: 'New Audio: Tafsir of Surah Al-Fatiha', body: 'Sheikh Ibrahim\'s complete tafsir series continues.', isRead: true, createdAt: '2026-07-03T11:00:00' },
];

export const DAILY_REMINDER = {
  quote: 'Indeed, with hardship [will be] ease.',
  source: 'Quran 94:5',
};

export const DAILY_VERSE = {
  arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
  transliteration: 'Allahu la ilaha illa huwa al-hayyu al-qayyoom...',
  translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep.',
  reference: 'Surah Al-Baqarah, 2:255',
};
