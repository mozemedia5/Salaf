import { Play, BookOpen, Hand, Clock, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import { SectionHeader } from '@/components/ui-custom/SectionHeader';
import { CategoryChip } from '@/components/ui-custom/CategoryChip';
import { GlassCard } from '@/components/ui-custom/GlassCard';
import { VideoCard } from '@/components/cards/VideoCard';
import { AudioCard } from '@/components/cards/AudioCard';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { CampaignCard } from '@/components/cards/CampaignCard';
import { useNavigationStore } from '@/stores/navigationStore';
import { CATEGORIES, VIDEOS, AUDIO_TRACKS, ARTICLES, CAMPAIGNS, GALLERY_IMAGES, DAILY_REMINDER, DAILY_VERSE } from '@/lib/data';
import { useState } from 'react';

const QUICK_ACTIONS = [
  { icon: BookOpen, label: 'Read Quran' },
  { icon: Hand, label: 'Daily Dua' },
  { icon: Clock, label: 'Prayer Times' },
  { icon: Compass, label: 'Qibla' },
];

export function HomeView() {
  const { navigateTo, setActiveTab } = useNavigationStore();
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredVideos = activeCategory === 'All' ? VIDEOS : VIDEOS.filter(v => v.category === activeCategory);
  const filteredAudio = activeCategory === 'All' ? AUDIO_TRACKS : AUDIO_TRACKS.filter(a => a.category === activeCategory);

  return (
    <div className="pb-4">
      {/* Hero Banner */}
      <ScrollReveal className="relative px-4 pt-6 pb-6 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url(/images/divider-pattern.jpg)', backgroundSize: '300px' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-900/10 pointer-events-none" />
        
        <div className="relative text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-arabic text-lg italic"
            style={{ color: 'var(--text-secondary)' }}
          >
            Assalamu Alaikum
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-heading font-bold text-2xl mt-1 text-gradient-emerald"
          >
            Welcome to Noor
          </motion.h1>
        </div>

        {/* Daily Reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-5"
        >
          <GlassCard className="relative overflow-hidden">
            <div className="h-1 w-full gradient-emerald rounded-t-2xl absolute top-0 left-0" />
            <p className="text-lg font-arabic italic leading-relaxed text-center" style={{ color: 'var(--text-primary)' }}>
              "{DAILY_REMINDER.quote}"
            </p>
            <p className="text-sm mt-2 text-right font-medium" style={{ color: 'var(--text-muted)' }}>
              — {DAILY_REMINDER.source}
            </p>
          </GlassCard>
        </motion.div>

        {/* Featured Lecture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 -mb-2"
        >
          <GlassCard className="p-0 overflow-hidden cursor-pointer group" onClick={() => navigateTo('videos')}>
            <div className="relative">
              <img src="/images/featured-lecture.jpg" alt="Featured" className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full gradient-emerald flex items-center justify-center shadow-lg animate-pulse-glow">
                  <Play className="w-6 h-6 text-white ml-1 fill-white" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold">
                Featured Lecture
              </span>
              <h3 className="font-heading font-semibold mt-2" style={{ color: 'var(--text-primary)' }}>
                The Light of Faith: Understanding Iman
              </h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Sheikh Ibrahim &middot; 45 min</p>
            </div>
          </GlassCard>
        </motion.div>
      </ScrollReveal>

      {/* Categories */}
      <div className="mt-6">
        <div className="px-4 mb-3">
          <h2 className="font-heading font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Browse by Topic</h2>
        </div>
        <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide snap-x-mandatory pb-1">
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              isActive={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>
      </div>

      {/* Latest Lectures */}
      <div className="mt-8">
        <SectionHeader title="Latest Lectures" action="View All" onAction={() => setActiveTab('videos')} />
        <div className="px-4 grid grid-cols-2 gap-3">
          {filteredVideos.slice(0, 4).map((video, i) => (
            <ScrollReveal key={video.id} delay={i * 0.05}>
              <VideoCard video={video} />
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div className="mt-8">
        <SectionHeader
          title="Trending Now"
          action="View All"
          onAction={() => setActiveTab('videos')}
          icon={<span className="text-amber-500 text-lg">🔥</span>}
        />
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide snap-x-mandatory pb-1">
          {VIDEOS.slice(0, 5).map((video) => (
            <div key={video.id} className="w-[260px] flex-shrink-0 snap-start">
              <VideoCard video={video} variant="trending" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Audio */}
      <div className="mt-8">
        <SectionHeader title="Recent Audio" action="View All" onAction={() => setActiveTab('audio')} />
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide snap-x-mandatory pb-1">
          {filteredAudio.slice(0, 5).map((track) => (
            <div key={track.id} className="w-[180px] flex-shrink-0 snap-start">
              <AudioCard track={track} />
            </div>
          ))}
        </div>
      </div>

      {/* Fundraising */}
      <div className="mt-8 px-4">
        <SectionHeader title="Support Our Cause" />
        <CampaignCard campaign={CAMPAIGNS[0]} featured />
      </div>

      {/* Featured Articles */}
      <div className="mt-8">
        <SectionHeader title="Featured Articles" action="View All" onAction={() => navigateTo('articles')} />
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide snap-x-mandatory pb-1">
          {ARTICLES.slice(0, 4).map((article) => (
            <div key={article.id} className="w-[300px] flex-shrink-0 snap-start">
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      </div>

      {/* Gallery Preview */}
      <div className="mt-8">
        <SectionHeader title="Inspirational Gallery" action="Explore" onAction={() => navigateTo('gallery')} />
        <div className="px-4 grid grid-cols-2 gap-2">
          {GALLERY_IMAGES.slice(0, 3).map((img, i) => (
            <ScrollReveal key={img.id} delay={i * 0.1}>
              <div className="aspect-square rounded-xl overflow-hidden cursor-pointer group" onClick={() => navigateTo('gallery')}>
                <img src={img.imageURL} alt={img.caption} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
            </ScrollReveal>
          ))}
          <ScrollReveal delay={0.3}>
            <div className="aspect-square rounded-xl overflow-hidden cursor-pointer relative group" onClick={() => navigateTo('gallery')}>
              <img src={GALLERY_IMAGES[3].imageURL} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">+{GALLERY_IMAGES.length - 3} more</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 px-4">
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action, i) => (
            <ScrollReveal key={action.label} delay={i * 0.1}>
              <button className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all active:scale-95 hover:bg-emerald-50 dark:hover:bg-emerald-900/10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                  <action.icon className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{action.label}</span>
              </button>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Daily Verse */}
      <div className="mt-8 px-4">
        <ScrollReveal>
          <GlassCard className="relative overflow-hidden border-emerald-200/50 dark:border-emerald-800/30">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="relative text-center">
              <p className="text-[10px] uppercase tracking-[3px] text-emerald-500 font-semibold mb-3">Verse of the Day</p>
              <p className="font-arabic text-xl leading-[2]" style={{ color: 'var(--text-primary)' }}>
                {DAILY_VERSE.arabic}
              </p>
              <p className="text-xs italic mt-3" style={{ color: 'var(--text-muted)' }}>
                {DAILY_VERSE.transliteration}
              </p>
              <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {DAILY_VERSE.translation}
              </p>
              <p className="text-xs mt-3 text-emerald-500 font-medium">
                — {DAILY_VERSE.reference}
              </p>
            </div>
          </GlassCard>
        </ScrollReveal>
      </div>

      {/* Footer */}
      <div className="mt-10 pb-8 text-center">
        <div className="h-px mx-8 mb-6" style={{ background: 'var(--border-color)' }} />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Noor Platform</p>
        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Made with love for the Ummah</p>
      </div>
    </div>
  );
}
