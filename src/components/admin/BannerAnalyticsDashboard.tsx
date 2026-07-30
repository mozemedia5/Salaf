import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, MousePointer, TrendingUp, Users, Clock, ExternalLink, 
  BarChart3, Calendar, ChevronDown, RefreshCw, Search,
  TrendingDown, Award, Hash, Globe, Smartphone, Target
} from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { 
  getAllBannerAnalytics, 
  getAggregatedBannerStats, 
  getTimeframeStats,
  getBannerAnalytics 
} from '@/lib/bannerAnalytics';
import type { BannerAnalytics, TikTokCreatorInsight, GoogleTrendData } from '@/types';

type TimeRange = '7' | '14' | '30' | '90';

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '7', label: '7 Days' },
  { value: '14', label: '14 Days' },
  { value: '30', label: '30 Days' },
  { value: '90', label: '90 Days' },
];

// Mock TikTok Creator data - In production, this would come from an API
const MOCK_TIKTOK_CREATORS: TikTokCreatorInsight[] = [
  { id: '1', creatorName: 'Islamic Reminders', handle: '@islamic_reminders', followers: 1250000, avgLikes: 45000, avgViews: 320000, engagementRate: 14.2, category: 'Islamic Content', lastUpdated: new Date().toISOString() },
  { id: '2', creatorName: 'Quran Recitation', handle: '@quran_voice', followers: 890000, avgLikes: 32000, avgViews: 210000, engagementRate: 15.5, category: 'Quran', lastUpdated: new Date().toISOString() },
  { id: '3', creatorName: 'Daily Hadith', handle: '@hadith_daily', followers: 560000, avgLikes: 18000, avgViews: 145000, engagementRate: 12.8, category: 'Hadith', lastUpdated: new Date().toISOString() },
  { id: '4', creatorName: 'Arabic Learning', handle: '@learn_arabic_islam', followers: 420000, avgLikes: 12000, avgViews: 98000, engagementRate: 12.3, category: 'Education', lastUpdated: new Date().toISOString() },
  { id: '5', creatorName: 'Scholar Talks', handle: '@scholar_talks', followers: 380000, avgLikes: 15000, avgViews: 112000, engagementRate: 13.2, category: 'Lectures', lastUpdated: new Date().toISOString() },
];

// Mock Google Trends data - In production, this would come from Google Trends API
const MOCK_GOOGLE_TRENDS: Record<string, GoogleTrendData> = {
  'Quran': { keyword: 'Quran', interest: 85, timeframe: '90 days', relatedTopics: [{ topic: 'Holy Quran', value: 100 }, { topic: 'Quran Recitation', value: 78 }, { topic: ' Quran Translation', value: 65 }], relatedQueries: [{ query: 'listen to Quran', value: 100 }, { query: 'Quran verses', value: 82 }, { query: 'Quran translation', value: 71 }] },
  'Hadith': { keyword: 'Hadith', interest: 62, timeframe: '90 days', relatedTopics: [{ topic: 'Hadith Collection', value: 100 }, { topic: 'Prophet Muhammad', value: 88 }, { topic: 'Sunnah', value: 72 }], relatedQueries: [{ query: 'hadith of the day', value: 100 }, { query: 'prophet hadith', value: 85 }, { query: 'authentic hadith', value: 68 }] },
  'Ramadan': { keyword: 'Ramadan', interest: 95, timeframe: '90 days', relatedTopics: [{ topic: 'Ramadan Mubarak', value: 100 }, { topic: 'Ramadan Fasting', value: 92 }, { topic: 'Islamic Calendar', value: 78 }], relatedQueries: [{ query: 'ramadan 2024', value: 100 }, { query: 'ramadan timing', value: 88 }, { query: 'ramadan dua', value: 76 }] },
  'Islamic Lecture': { keyword: 'Islamic Lecture', interest: 58, timeframe: '90 days', relatedTopics: [{ topic: 'Islamic Scholar', value: 100 }, { topic: 'Islamic Lecture', value: 85 }, { topic: 'Friday Khutbah', value: 62 }], relatedQueries: [{ query: 'islamic lecture video', value: 100 }, { query: 'muslim scholar lecture', value: 78 }, { query: 'islamic talk', value: 65 }] },
  'Aqeedah': { keyword: 'Aqeedah', interest: 45, timeframe: '90 days', relatedTopics: [{ topic: 'Islamic Beliefs', value: 100 }, { topic: 'Tawheed', value: 88 }, { topic: 'Islamic Theology', value: 72 }], relatedQueries: [{ query: 'aqeedah course', value: 100 }, { query: 'islamic creed', value: 82 }, { query: 'tawheed explained', value: 68 }] },
};

export function BannerAnalyticsDashboard() {
  const { banners } = useAdminStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('30');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [bannerStats, setBannerStats] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [selectedBannerId, setSelectedBannerId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'tiktok' | 'trends-search'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const days = parseInt(timeRange);
      const [statsData, bannerStatsData, trendDataResult] = await Promise.all([
        getTimeframeStats(days),
        getAggregatedBannerStats(days),
        selectedBannerId === 'all' 
          ? getAllBannerAnalytics(days).then(data => aggregateByDate(data))
          : getBannerAnalytics(selectedBannerId, days)
      ]);
      
      setStats(statsData);
      setBannerStats(bannerStatsData);
      setTrendData(trendDataResult);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const aggregateByDate = (data: any[]) => {
    const byDate: Record<string, any> = {};
    data.forEach((record: any) => {
      if (!byDate[record.date]) {
        byDate[record.date] = { date: record.date, impressions: 0, clicks: 0, detailsViews: 0, linkCompletions: 0 };
      }
      byDate[record.date].impressions += record.impressions || 0;
      byDate[record.date].clicks += record.clicks || 0;
      byDate[record.date].detailsViews += record.detailsViews || 0;
      byDate[record.date].linkCompletions += record.linkCompletions || 0;
    });
    return Object.values(byDate).sort((a: any, b: any) => a.date.localeCompare(b.date));
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, selectedBannerId]);

  const getStatusColor = (value: number) => {
    if (value >= 5) return 'text-emerald-500';
    if (value >= 2) return 'text-amber-500';
    return 'text-red-500';
  };

  const renderTrendChart = () => {
    if (trendData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center rounded-xl" style={{ background: 'var(--bg-primary)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No data available for the selected period</p>
        </div>
      );
    }

    const maxValue = Math.max(
      ...trendData.map(d => Math.max(d.impressions || 0, d.clicks || 0, d.detailsViews || 0))
    );

    return (
      <div className="space-y-3">
        {/* Simple Bar Chart */}
        <div className="relative h-48 flex items-end gap-2 px-2">
          {trendData.slice(-14).map((day: any, i: number) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: '180px' }}>
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${maxValue > 0 ? (day.impressions / maxValue) * 100 : 0}%` }}
                  className="w-full bg-emerald-500/60 rounded-t-sm"
                />
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${maxValue > 0 ? (day.clicks / maxValue) * 100 : 0}%` }}
                  className="w-full bg-blue-500/80 rounded-t-sm"
                />
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${maxValue > 0 ? (day.detailsViews / maxValue) * 100 : 0}%` }}
                  className="w-full bg-amber-500/80 rounded-t-sm"
                />
              </div>
              <span className="text-[8px] rotate-0" style={{ color: 'var(--text-muted)' }}>
                {day.date?.slice(5)}
              </span>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-emerald-500/60" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Impressions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-blue-500/80" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Clicks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-amber-500/80" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Details Views</span>
          </div>
        </div>
      </div>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-3">
            <Eye className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{(stats?.impressions || 0).toLocaleString()}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Total Impressions</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-3">
            <MousePointer className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{(stats?.clicks || 0).toLocaleString()}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Total Clicks</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-3">
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <p className={`text-2xl font-bold ${getStatusColor(parseFloat(stats?.ctr || '0'))}`}>
            {stats?.ctr || '0.00'}%
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Click-Through Rate</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <p className={`text-2xl font-bold ${getStatusColor(parseFloat(stats?.engagementRate || '0'))}`}>
            {stats?.engagementRate || '0.00'}%
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Engagement Rate</p>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center">
              <Eye className="w-4 h-4 text-cyan-500" />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Details Views</span>
          </div>
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{(stats?.detailsViews || 0).toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
              <ExternalLink className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Link Completions</span>
          </div>
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{(stats?.linkCompletions || 0).toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
              <Hash className="w-4 h-4 text-violet-500" />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Active Banners</span>
          </div>
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{banners.filter(b => b.isActive !== false).length}</p>
        </div>

        <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>With Analytics</span>
          </div>
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{bannerStats.length}</p>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Performance Trend</h3>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Last 14 days</span>
          </div>
        </div>
        {renderTrendChart()}
      </div>

      {/* Per-Banner Breakdown */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Banner Performance Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] uppercase" style={{ color: 'var(--text-muted)', background: 'var(--bg-primary)' }}>
                <th className="px-4 py-3 font-medium">Banner</th>
                <th className="px-4 py-3 font-medium text-right">Impressions</th>
                <th className="px-4 py-3 font-medium text-right">Clicks</th>
                <th className="px-4 py-3 font-medium text-right">Details</th>
                <th className="px-4 py-3 font-medium text-right">Links</th>
                <th className="px-4 py-3 font-medium text-right">CTR</th>
                <th className="px-4 py-3 font-medium text-right">Eng. Rate</th>
              </tr>
            </thead>
            <tbody>
              {bannerStats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    No analytics data available yet. Banners will appear here once they receive impressions.
                  </td>
                </tr>
              ) : (
                bannerStats
                  .filter(b => b.bannerTitle?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .sort((a, b) => b.totalImpressions - a.totalImpressions)
                  .map((banner: any, i: number) => (
                    <motion.tr 
                      key={banner.bannerId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-t"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium truncate max-w-[150px]" style={{ color: 'var(--text-primary)' }}>
                          {banner.bannerTitle}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {banner.uniqueDays} days active
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {banner.totalImpressions.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {banner.totalClicks.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {banner.totalDetailsViews.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {banner.totalLinkCompletions.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-medium ${getStatusColor(parseFloat(banner.ctr))}`}>
                          {banner.ctr}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-medium ${getStatusColor(parseFloat(banner.engagementRate))}`}>
                          {banner.engagementRate}%
                        </span>
                      </td>
                    </motion.tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTrendsTab = () => (
    <div className="space-y-6">
      {/* Daily Breakdown Chart */}
      <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Daily Performance Trend</h3>
        {renderTrendChart()}
      </div>

      {/* Demographics by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Performance by Category</h3>
          <div className="space-y-3">
            {['Quran', 'Hadith', 'Aqeedah', 'Seerah', 'Youth', 'Ramadan', 'Events'].map((category) => {
              const categoryBanners = bannerStats.filter((b: any) => {
                const banner = banners.find(bn => bn.id === b.bannerId);
                return banner?.category === category;
              });
              const totalImpressions = categoryBanners.reduce((sum: number, b: any) => sum + b.totalImpressions, 0);
              const maxImpressions = Math.max(...bannerStats.map((b: any) => b.totalImpressions), 1);
              const percentage = (totalImpressions / maxImpressions) * 100;

              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{category}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{totalImpressions.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full rounded-full gradient-emerald"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Top Performing Banners</h3>
          <div className="space-y-3">
            {bannerStats
              .sort((a: any, b: any) => parseFloat(b.ctr) - parseFloat(a.ctr))
              .slice(0, 5)
              .map((banner: any, i: number) => (
                <div key={banner.bannerId} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    i === 0 ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' :
                    i === 1 ? 'bg-gray-100 dark:bg-gray-800 text-gray-600' :
                    i === 2 ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' :
                    'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{banner.bannerTitle}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      CTR: <span className={getStatusColor(parseFloat(banner.ctr))}>{banner.ctr}%</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{banner.totalClicks}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>clicks</p>
                  </div>
                </div>
              ))
            )}
            {bannerStats.length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTikTokTab = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>TikTok Creator Search Insights</h3>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Discover trending Islamic content creators for potential collaborations</p>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search creators by name or handle..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
            style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
        </div>

        {/* Creator Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_TIKTOK_CREATORS
            .filter(c => 
              c.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.handle.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((creator, i) => (
              <motion.div 
                key={creator.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-2xl" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {creator.creatorName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{creator.creatorName}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{creator.handle}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {(creator.followers / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Followers</p>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {(creator.avgViews / 1000).toFixed(0)}K
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Avg Views</p>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                    <p className={`text-sm font-bold ${creator.engagementRate >= 10 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {creator.engagementRate}%
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Eng. Rate</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 font-medium">
                    {creator.category}
                  </span>
                  <button className="text-[10px] px-3 py-1 rounded-full bg-black text-white font-medium hover:bg-gray-800 transition-colors">
                    View Profile
                  </button>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderGoogleTrendsTab = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Google Trends Insights</h3>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Discover trending search topics to optimize banner content</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(MOCK_GOOGLE_TRENDS).map(([key, data]) => (
            <motion.div 
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{data.keyword}</h4>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{data.timeframe}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    data.interest >= 80 ? 'text-emerald-500' :
                    data.interest >= 50 ? 'text-amber-500' : 'text-gray-500'
                  }`}>
                    {data.interest}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Interest</p>
                </div>
              </div>

              {/* Interest Bar */}
              <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: 'var(--bg-secondary)' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${data.interest}%` }}
                  className={`h-full rounded-full ${
                    data.interest >= 80 ? 'bg-emerald-500' :
                    data.interest >= 50 ? 'bg-amber-500' : 'bg-gray-400'
                  }`}
                />
              </div>

              {/* Related Topics */}
              <div className="mb-3">
                <p className="text-[10px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Related Topics</p>
                <div className="flex flex-wrap gap-1">
                  {data.relatedTopics.map((topic, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                      {topic.topic} ({topic.value})
                    </span>
                  ))}
                </div>
              </div>

              {/* Related Queries */}
              <div>
                <p className="text-[10px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Related Queries</p>
                <div className="flex flex-wrap gap-1">
                  {data.relatedQueries.map((query, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600">
                      {query.query}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Content Recommendations</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Ramadan Content is Hot!</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Interest is at 95% - Consider creating more Ramadan-themed banners</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
              <Award className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Quran Recitation Popular</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Audio content with Quran recitations shows high engagement potential</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Youth Category Growing</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Consider creating more content targeting the youth audience</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Banner Analytics</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Comprehensive engagement insights for Super Admin</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="h-10 px-3 rounded-xl border text-sm outline-none focus:border-emerald-500"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            {TIME_RANGES.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <button 
            onClick={loadAnalytics}
            className="h-10 px-3 rounded-xl border text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'trends', label: 'Trends', icon: TrendingUp },
          { id: 'tiktok', label: 'TikTok Insights', icon: Smartphone },
          { id: 'trends-search', label: 'Google Trends', icon: Globe },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'gradient-emerald text-white shadow-glow'
                  : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
              }`}
              style={activeTab !== tab.id ? { color: 'var(--text-secondary)' } : undefined}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading analytics...</p>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'trends' && renderTrendsTab()}
          {activeTab === 'tiktok' && renderTikTokTab()}
          {activeTab === 'trends-search' && renderGoogleTrendsTab()}
        </>
      )}
    </div>
  );
}
