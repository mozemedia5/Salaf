import type { AudioTrack, Article, GalleryImage, Campaign, Scholar, Notification, Banner } from '@/types';

export const VIDEOS: any[] = [
  { id: '1', title: 'Understanding Tawhid: The Foundation of Faith', description: 'A comprehensive lecture on the oneness of Allah.', youtubeId: 'dQw4w9WgXcQ', thumbnailURL: '/images/lecture-thumb-1.jpg', scholarId: 's1', scholarName: 'Sheikh Ibrahim', category: 'Aqeedah', duration: '45:23', viewCount: 12500, likes: 340, createdAt: '2026-07-10' },
  { id: '2', title: 'The Virtues of Reading Quran Daily', description: 'Discover the blessings of daily Quran recitation.', youtubeId: 'dQw4w9WgXcQ', thumbnailURL: '/images/lecture-thumb-2.jpg', scholarId: 's2', scholarName: 'Dr. Yasir Qadhi', category: 'Quran', duration: '32:15', viewCount: 8300, likes: 215, createdAt: '2026-07-08' },
  { id: '3', title: 'Fiqh of Prayer: Common Mistakes', description: 'Learn about common mistakes in Salah and how to correct them.', youtubeId: 'dQw4w9WgXcQ', thumbnailURL: '/images/lecture-thumb-3.jpg', scholarId: 's3', scholarName: 'Sheikh Nouman', category: 'Fiqh', duration: '28:40', viewCount: 15100, likes: 520, createdAt: '2026-07-05' },
  { id: '4', title: 'Seerah: The Year of Sorrow', description: 'Understanding the trials faced by the Prophet Muhammad.', youtubeId: 'dQw4w9WgXcQ', thumbnailURL: '/images/lecture-thumb-4.jpg', scholarId: 's1', scholarName: 'Sheikh Ibrahim', category: 'Seerah', duration: '52:10', viewCount: 6700, likes: 180, createdAt: '2026-07-01' },
  { id: '5', title: 'Dua for Protection and Healing', description: 'Powerful supplications from the Quran and Sunnah.', youtubeId: 'dQw4w9WgXcQ', thumbnailURL: '/images/lecture-thumb-1.jpg', scholarId: 's4', scholarName: 'Ustadha Maryam', category: 'Dua', duration: '18:30', viewCount: 22400, likes: 890, createdAt: '2026-06-28' },
  { id: '6', title: 'Raising Righteous Children', description: 'Islamic parenting principles for the modern world.', youtubeId: 'dQw4w9WgXcQ', thumbnailURL: '/images/lecture-thumb-2.jpg', scholarId: 's5', scholarName: 'Dr. Omar Suleiman', category: 'Youth', duration: '41:00', viewCount: 9800, likes: 410, createdAt: '2026-06-25' },
  { id: '7', title: 'The Science of Hadith Authentication', description: 'How scholars verify the authenticity of Hadith.', youtubeId: 'dQw4w9WgXcQ', thumbnailURL: '/images/lecture-thumb-3.jpg', scholarId: 's2', scholarName: 'Dr. Yasir Qadhi', category: 'Hadith', duration: '38:45', viewCount: 4200, likes: 156, createdAt: '2026-06-20' },
  { id: '8', title: 'Islamic Manners in Daily Life', description: 'Adab and Akhlaq for Muslims in the modern world.', youtubeId: 'dQw4w9WgXcQ', thumbnailURL: '/images/lecture-thumb-4.jpg', scholarId: 's5', scholarName: 'Dr. Omar Suleiman', category: 'Fiqh', duration: '25:20', viewCount: 11600, likes: 378, createdAt: '2026-06-15' },
];

export const AUDIO_TRACKS: AudioTrack[] = [
  { id: '1', title: 'Morning Adhkar', description: 'Daily morning remembrance of Allah.', audioURL: '/audio/morning-adhkar.mp3', thumbnailURL: '/images/lecture-thumb-1.jpg', scholarId: 's1', scholarName: 'Sheikh Ibrahim', category: 'Dua', duration: '12:34', playCount: '45.2K' },
  { id: '2', title: 'Surah Ar-Rahman', description: 'Beautiful recitation of Surah Ar-Rahman.', audioURL: '/audio/surah-rahman.mp3', thumbnailURL: '/images/lecture-thumb-2.jpg', scholarId: 's2', scholarName: 'Sheikh Mishary', category: 'Quran', duration: '18:45', playCount: '128.5K' },
  { id: '3', title: 'Evening Adhkar', description: 'Daily evening remembrance of Allah.', audioURL: '/audio/evening-adhkar.mp3', thumbnailURL: '/images/lecture-thumb-3.jpg', scholarId: 's1', scholarName: 'Sheikh Ibrahim', category: 'Dua', duration: '9:12', playCount: '32.1K' },
  { id: '4', title: 'Tafsir of Surah Al-Fatiha', description: 'Detailed explanation of the opening chapter.', audioURL: '/audio/tafsir-fatiha.mp3', thumbnailURL: '/images/lecture-thumb-4.jpg', scholarId: 's2', scholarName: 'Dr. Yasir Qadhi', category: 'Quran', duration: '28:30', playCount: '18.7K' },
  { id: '5', title: 'The Power of Istighfar', description: 'Understanding the importance of seeking forgiveness.', audioURL: '/audio/power-istighfar.mp3', thumbnailURL: '/images/lecture-thumb-1.jpg', scholarId: 's5', scholarName: 'Dr. Omar Suleiman', category: 'Aqeedah', duration: '15:20', playCount: '22.4K' },
  { id: '6', title: 'Adhan Collection', description: 'Beautiful call to prayer from around the world.', audioURL: '/audio/adhan-collection.mp3', thumbnailURL: '/images/lecture-thumb-2.jpg', scholarId: 's6', scholarName: 'Various', category: 'Dua', duration: '4:32', playCount: '67.8K' },
];

export const CATEGORIES = ['All', 'Quran', 'Hadith', 'Fiqh', 'Seerah', 'Aqeedah', 'Dua', 'Ramadan', 'Youth', 'Sisters'];

export const ARTICLES: Article[] = [
  { id: '1', title: 'Understanding the Five Pillars of Islam', excerpt: 'A comprehensive guide to the foundation of Islamic practice...', content: '<p>Article content...</p>', featuredImageURL: '/images/article-1.jpg', authorName: 'Dr. Yasir Qadhi', category: 'Fiqh', readingTime: '5 min', createdAt: '2026-07-10' },
  { id: '2', title: 'The Virtues of Laylat al-Qadr', excerpt: 'Discover the significance of the Night of Decree...', content: '<p>Article content...</p>', featuredImageURL: '/images/article-2.jpg', authorName: 'Sheikh Ibrahim', category: 'Quran', readingTime: '4 min', createdAt: '2026-07-08' },
  { id: '3', title: 'How to Develop a Consistent Prayer Routine', excerpt: 'Practical tips for maintaining regular Salah...', content: '<p>Article content...</p>', featuredImageURL: '/images/article-3.jpg', authorName: 'Ustadha Maryam', category: 'Fiqh', readingTime: '6 min', createdAt: '2026-07-05' },
  { id: '4', title: 'Lessons from the Hijrah', excerpt: 'What we can learn from the Prophet migration...', content: '<p>Article content...</p>', featuredImageURL: '/images/article-4.jpg', authorName: 'Dr. Omar Suleiman', category: 'Seerah', readingTime: '7 min', createdAt: '2026-07-01' },
  { id: '5', title: 'The Importance of Seeking Knowledge', excerpt: 'Why knowledge is a fundamental obligation...', content: '<p>Article content...</p>', featuredImageURL: '/images/article-1.jpg', authorName: 'Sheikh Nouman', category: 'Aqeedah', readingTime: '5 min', createdAt: '2026-06-28' },
];

export const GALLERY_IMAGES: GalleryImage[] = [
  { id: '1', imageURL: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?w=400&h=400&fit=crop', thumbnailURL: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?w=200&h=200&fit=crop', caption: 'Grand Mosque Architecture', category: 'Architecture', favoriteCount: 234 },
  { id: '2', imageURL: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=400&h=400&fit=crop', thumbnailURL: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=200&h=200&fit=crop', caption: 'Islamic Calligraphy', category: 'Calligraphy', favoriteCount: 189 },
  { id: '3', imageURL: 'https://images.unsplash.com/photo-1542372147193-a7aca54189cd?w=400&h=400&fit=crop', thumbnailURL: 'https://images.unsplash.com/photo-1542372147193-a7aca54189cd?w=200&h=200&fit=crop', caption: 'Sunset at the Mosque', category: 'Nature', favoriteCount: 312 },
  { id: '4', imageURL: 'https://images.unsplash.com/photo-1580537659465-0e0b1c098c6f?w=400&h=400&fit=crop', thumbnailURL: 'https://images.unsplash.com/photo-1580537659465-0e0b1c098c6f?w=200&h=200&fit=crop', caption: 'Quran Pages', category: 'Lifestyle', favoriteCount: 276 },
  { id: '5', imageURL: 'https://images.unsplash.com/photo-1542817137-e8029b49a3d0?w=400&h=400&fit=crop', thumbnailURL: 'https://images.unsplash.com/photo-1542817137-e8029b49a3d0?w=200&h=200&fit=crop', caption: 'Islamic Geometric Patterns', category: 'Architecture', favoriteCount: 198 },
  { id: '6', imageURL: 'https://images.unsplash.com/photo-1574586595054-3be1e14e7c10?w=400&h=400&fit=crop', thumbnailURL: 'https://images.unsplash.com/photo-1574586595054-3be1e14e7c10?w=200&h=200&fit=crop', caption: 'Muslim Community Gathering', category: 'Events', favoriteCount: 145 },
];

export const CAMPAIGNS: Campaign[] = [
  { id: '1', title: 'Build a Mosque in Rural Community', description: 'Help us build a mosque in a rural community that currently has no place of worship. This mosque will serve as a center for prayer, education, and community gathering for over 500 families.', imageURL: '/images/campaign-1.jpg', targetAmount: 50000, raisedAmount: 32500, donorCount: 234, isUrgent: true, isFeatured: true },
  { id: '2', title: 'Quran Distribution Project', description: 'Distribute Qurans to underserved communities around the world. Your donation will help provide translated Qurans to those who cannot afford them.', imageURL: '/images/campaign-2.jpg', targetAmount: 15000, raisedAmount: 8200, donorCount: 156, isUrgent: false, isFeatured: false },
  { id: '3', title: 'Youth Islamic Education Program', description: 'Support our weekend Islamic school for youth. Funds will go towards curriculum development, teacher training, and educational materials.', imageURL: '/images/campaign-3.jpg', targetAmount: 25000, raisedAmount: 18750, donorCount: 89, isUrgent: false, isFeatured: false },
  { id: '4', title: 'Ramadan Food Baskets', description: 'Provide food baskets to families in need during the blessed month of Ramadan. Each basket feeds a family for the entire month.', imageURL: '/images/campaign-1.jpg', targetAmount: 10000, raisedAmount: 6400, donorCount: 312, isUrgent: true, isFeatured: false },
];

export const SCHOLARS: Scholar[] = [
  { id: 's1', name: 'Sheikh Ibrahim', bio: 'Graduate of Al-Azhar University with 20+ years of teaching experience.', photoURL: '/images/scholar-1.jpg', specialty: 'Fiqh & Aqeedah', lectureCount: 156 },
  { id: 's2', name: 'Dr. Yasir Qadhi', bio: 'Dean of Academic Affairs at Al-Maghrib Institute.', photoURL: '/images/scholar-2.jpg', specialty: 'Quran & Hadith', lectureCount: 234 },
  { id: 's3', name: 'Sheikh Nouman', bio: 'Founder of Bayyinah Institute and renowned Quranic scholar.', photoURL: '/images/scholar-3.jpg', specialty: 'Quranic Arabic', lectureCount: 189 },
  { id: 's4', name: 'Ustadha Maryam', bio: 'Specialist in Islamic family studies and women education.', photoURL: '/images/scholar-4.jpg', specialty: 'Family & Youth', lectureCount: 98 },
  { id: 's5', name: 'Dr. Omar Suleiman', bio: 'President of the Yaqeen Institute for Islamic Research.', photoURL: '/images/scholar-5.jpg', specialty: 'Islamic Theology', lectureCount: 267 },
  { id: 's6', name: 'Sheikh Mishary', bio: 'World-renowned Quran reciter and Imam.', photoURL: '/images/scholar-6.jpg', specialty: 'Quran Recitation', lectureCount: 145 },
];

export const NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'lecture', title: 'New Lecture Available', body: 'Sheikh Ibrahim just uploaded a new lecture on "Understanding Tawhid"', isRead: false, createdAt: '2026-07-10T10:00:00Z' },
  { id: '2', type: 'article', title: 'Weekly Article', body: 'Check out this week featured article on the virtues of Laylat al-Qadr', isRead: false, createdAt: '2026-07-09T08:00:00Z' },
  { id: '3', type: 'donation', title: 'Fundraiser Update', body: 'We are 65% towards our mosque building goal! Thank you for your support.', isRead: false, createdAt: '2026-07-08T14:00:00Z' },
  { id: '4', type: 'reminder', title: 'Prayer Time', body: 'Asr prayer is in 15 minutes. May Allah accept your prayers.', isRead: true, createdAt: '2026-07-10T15:30:00Z' },
  { id: '5', type: 'lecture', title: 'Live Session Starting', body: 'Dr. Yasir Qadhi is going live in 30 minutes with a Q&A session', isRead: true, createdAt: '2026-07-10T09:00:00Z' },
];

export const DAILY_REMINDER = {
  quote: 'The best of you are those who learn the Quran and teach it.',
  source: 'Sahih al-Bukhari 4739',
};

export const DAILY_VERSE = {
  arabic: 'اِنَّ مَعَ الْعُسْرِ یُسْرًا',
  transliteration: 'Inna ma al-usr yusr',
  translation: 'Indeed, with hardship [will be] ease.',
  reference: 'Quran 94:5',
};

export const BANNERS: Banner[] = [
  { id: '1', imageURL: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?w=800&h=350&fit=crop', category: 'Ramadan', title: 'Ramadan Kareem' },
  { id: '2', imageURL: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&h=350&fit=crop', category: 'Events', title: 'Islamic Conference 2026' },
];

export const VIDEO_PRESET_THUMBNAILS = [
  { id: 'v1', url: 'https://images.unsplash.com/photo-1542817137-e8029b49a3d0?w=600&h=400&fit=crop', name: 'Islamic Geometric Pattern' },
  { id: 'v2', url: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?w=600&h=400&fit=crop', name: 'Grand Mosque Arches' },
  { id: 'v3', url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=600&h=400&fit=crop', name: 'Arabic Calligraphy' },
  { id: 'v4', url: 'https://images.unsplash.com/photo-1542372147193-a7aca54189cd?w=600&h=400&fit=crop', name: 'Mosque Sunset Silhouette' },
  { id: 'v5', url: 'https://images.unsplash.com/photo-1580537659465-0e0b1c098c6f?w=600&h=400&fit=crop', name: 'Open Holy Quran Pages' },
  { id: 'v6', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', name: 'Calming Blue Sea' },
  { id: 'v7', url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&h=400&fit=crop', name: 'Quiet Forest Paths' },
  { id: 'v8', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=400&fit=crop', name: 'Lush Green Mountain Fog' },
  { id: 'v9', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop', name: 'Stunning Canyon Vista' },
  { id: 'v10', url: 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=600&h=400&fit=crop', name: 'Vibrant Autumn Forest' },
  { id: 'v11', url: 'https://images.unsplash.com/photo-1433832597046-4f10e10ac764?w=600&h=400&fit=crop', name: 'Beautiful Hot Air Balloons' },
  { id: 'v12', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&h=400&fit=crop', name: 'Sun Rays Through Tree Branches' },
  { id: 'v13', url: 'https://images.unsplash.com/photo-1472214222541-d510753a4707?w=600&h=400&fit=crop', name: 'Peaceful Rural Meadows' },
  { id: 'v14', url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=600&h=400&fit=crop', name: 'Sunset Coastline Horizon' },
  { id: 'v15', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop', name: 'Cosmic Nebula Space Art' }
];

export const AUDIO_PRESET_THUMBNAILS = [
  { id: 'a1', url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=400&h=400&fit=crop', name: 'Microphone with Warm Bokeh' },
  { id: 'a2', url: 'https://images.unsplash.com/photo-1484755560693-a4074577af3a?w=400&h=400&fit=crop', name: 'Retro Record Player' },
  { id: 'a3', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop', name: 'Professional Soundboard Sliders' },
  { id: 'a4', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop', name: 'Vibrant Sound Waves Graphic' },
  { id: 'a5', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop', name: 'Acoustic Guitar Close-Up' },
  { id: 'a6', url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop', name: 'Huge Stadium Event Spotlight' },
  { id: 'a7', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop', name: 'Atmospheric Stage Lighting' },
  { id: 'a8', url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop', name: 'Abstract Colorful Energy Wave' },
  { id: 'a9', url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=400&fit=crop', name: 'Textured Flowing Paint Canvas' },
  { id: 'a10', url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=400&fit=crop', name: 'Retro Vintage Cassette Tape' },
  { id: 'a11', url: 'https://images.unsplash.com/photo-1487180144351-b8472da7a4c3?w=400&h=400&fit=crop', name: 'Stylized Music Headset' },
  { id: 'a12', url: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop', name: 'Grand Piano Keys' },
  { id: 'a13', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop', name: 'Abstract Glowing Concentric Rings' },
  { id: 'a14', url: 'https://images.unsplash.com/photo-1453733190148-c44698c265a8?w=400&h=400&fit=crop', name: 'Classic Pocket Watch Details' },
  { id: 'a15', url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=400&fit=crop', name: 'Moody Studio Microphones' }
];

// Dynamic Ayah of the Day — automatically rotates daily without admin input
export const AYAHS_OF_THE_DAY = [
  { arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', translation: 'Indeed, with hardship [will be] ease.', reference: 'Quran 94:6' },
  { arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا', translation: 'And whoever fears Allah — He will make for him a way out.', reference: 'Quran 65:2' },
  { arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', translation: 'For indeed, with hardship will be ease.', reference: 'Quran 94:5' },
  { arabic: 'وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ', translation: 'But perhaps you hate a thing and it is good for you.', reference: 'Quran 2:216' },
  { arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', translation: 'Indeed, Allah is with the patient.', reference: 'Quran 2:153' },
  { arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً', translation: 'Our Lord, give us in this world that which is good and in the Hereafter that which is good.', reference: 'Quran 2:201' },
  { arabic: 'وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ', translation: 'And despair not of relief from Allah.', reference: 'Quran 12:87' },
  { arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', translation: 'Sufficient for us is Allah, and [He is] the best Disposer of affairs.', reference: 'Quran 3:173' },
  { arabic: 'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ', translation: 'And my success is not but through Allah.', reference: 'Quran 11:88' },
  { arabic: 'إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ', translation: 'Indeed, Allah does not allow to be lost the reward of those who do good.', reference: 'Quran 9:120' },
  { arabic: 'وَبَشِّرِ الصَّابِرِينَ', translation: 'And give good tidings to the patient.', reference: 'Quran 2:155' },
  { arabic: 'إِنَّ اللَّهَ مَعَ الَّذِينَ اتَّقَوا', translation: 'Indeed, Allah is with those who fear Him.', reference: 'Quran 16:128' },
  { arabic: 'وَاللَّهُ يُحِبُّ الصَّابِرِينَ', translation: 'And Allah loves the steadfast.', reference: 'Quran 3:146' },
  { arabic: 'قُلْ إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ', translation: 'Say: Indeed, my prayer, my rites of sacrifice, my living and my dying are for Allah.', reference: 'Quran 6:162' },
  { arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ', translation: 'O you who have believed, seek help through patience and prayer.', reference: 'Quran 2:153' },
  { arabic: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ', translation: 'And when My servants ask you concerning Me — indeed I am near.', reference: 'Quran 2:186' },
  { arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا', translation: 'Allah does not burden a soul beyond that it can bear.', reference: 'Quran 2:286' },
  { arabic: 'وَاللَّهُ خَيْرُ الْمَاكِرِينَ', translation: 'And Allah is the best of planners.', reference: 'Quran 3:54' },
  { arabic: 'اللَّهُ وَلِيُّ الَّذِينَ آمَنُوا', translation: 'Allah is the ally of those who believe.', reference: 'Quran 2:257' },
  { arabic: 'كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ', translation: 'Every soul will taste death. And We test you with evil and with good as trial.', reference: 'Quran 21:35' },
  { arabic: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ', translation: 'Indeed we belong to Allah, and indeed to Him we will return.', reference: 'Quran 2:156' },
  { arabic: 'وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا', translation: 'And those who strive for Us — We will surely guide them to Our ways.', reference: 'Quran 29:69' },
  { arabic: 'تَوَكَّلْ عَلَى اللَّهِ ۚ إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ', translation: 'And rely upon Allah; indeed, Allah loves those who rely [upon Him].', reference: 'Quran 3:159' },
  { arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ', translation: 'So remember Me; I will remember you.', reference: 'Quran 2:152' },
  { arabic: 'وَهُوَ مَعَكُمْ أَيْنَمَا كُنتُمْ', translation: 'And He is with you wherever you are.', reference: 'Quran 57:4' },
  { arabic: 'قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا', translation: 'Say: Nothing will befall us except what Allah has decreed for us.', reference: 'Quran 9:51' },
  { arabic: 'وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ', translation: 'And We are closer to him than his jugular vein.', reference: 'Quran 50:16' },
  { arabic: 'ادْعُونِي أَسْتَجِبْ لَكُمْ', translation: 'Call upon Me; I will respond to you.', reference: 'Quran 40:60' },
  { arabic: 'وَلَذِكْرُ اللَّهِ أَكْبَرُ', translation: 'And the remembrance of Allah is greater.', reference: 'Quran 29:45' },
  { arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', translation: 'Verily, in the remembrance of Allah do hearts find rest.', reference: 'Quran 13:28' },
];

/**
 * Returns the Ayah of the Day based on the current date.
 * Automatically rotates daily without any admin input.
 */
export function getDailyAyah() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = dayOfYear % AYAHS_OF_THE_DAY.length;
  return AYAHS_OF_THE_DAY[index];
}
