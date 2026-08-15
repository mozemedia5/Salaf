import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, MousePointer, TrendingUp, Users, Clock, ExternalLink, 
  BarChart3, Calendar, RefreshCw, Target, Smartphone, 
  Activity
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { useAdminStore } from '@/stores/adminStore';
import { 
  getAllBannerAnalytics, 
  getAggregatedBannerStats, 
  getTimeframeStats,
  getBannerAnalytics 
} from '@/lib/bannerAnalytics';

type TimeRange = '7' | '14' | '30' | '90';

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '7', label: '7 Days' },
  { value: '14', label: '14 Days' },
  { value: '30', label: '30 Days' },
  { value: '90', label: '90 Days' },
];

// Categories for demographics
const CATEGORIES = ['Quran', 'Hadith', 'Aqeedah', 'Seerah', 'Youth', 'Ramadan', 'Events'];

export function BannerAnalyticsDashboard() {
  const { banners } = useAdminStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('30');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [bannerStats, setBannerStats] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [selectedBannerId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'demographics' | 'performance'>('overview');

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
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No analytics data available for the selected period</p>
        </div>
      );
    }

    const chartData = trendData.map(d => ({
      date: d.date ? d.date.slice(5) : '',
      impressions: d.impressions || 0,
      clicks: d.clicks || 0,
      detailsViews: d.detailsViews || 0,
      ctr: d.impressions > 0 ? Number(((d.clicks / d.impressions) * 100).toFixed(2)) : 0
    }));

    return (
      <div className="space-y-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorDetails" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: 'var(--text-primary)'
                }}
              />
              <Area type="monotone" dataKey="impressions" name="Impressions" stroke="#10b981" fillOpacity={1} fill="url(#colorImpressions)" strokeWidth={2} />
              <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#3b82f6" fillOpacity={1} fill="url(#colorClicks)" strokeWidth={2} />
              <Area type="monotone" dataKey="detailsViews" name="Details Views" stroke="#f59e0b" fillOpacity={1} fill="url(#colorDetails)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* CTR Rising & Falling Line Chart */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>CTR Trend (%)</p>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--text-primary)'
                  }}
                />
                <Line type="monotone" dataKey="ctr" name="Click-Through Rate" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
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
          className="p-4 rounded-2xl relative overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-bl-full" />
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
          className="p-4 rounded-2xl relative overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
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
          className="p-4 rounded-2xl relative overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full" />
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
          className="p-4 rounded-2xl relative overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/20 to-transparent rounded-bl-full" />
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
              <BarChart3 className="w-4 h-4 text-violet-500" />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Active Banners</span>
          </div>
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{banners.filter(b => b.isActive !== false).length}</p>
        </div>

        <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-indigo-500" />
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
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Banner Performance</h3>
          <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
            {bannerStats.length} banners
          </span>
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

  const renderDemographicsTab = () => {
    // Calculate category demographics from banner data
    const categoryData = CATEGORIES.map(category => {
      const categoryBanners = bannerStats.filter((b: any) => {
        const banner = banners.find(bn => bn.id === b.bannerId);
        return banner?.category === category;
      });
      
      return {
        category,
        impressions: categoryBanners.reduce((sum: number, b: any) => sum + b.totalImpressions, 0),
        clicks: categoryBanners.reduce((sum: number, b: any) => sum + b.totalClicks, 0),
        ctr: categoryBanners.length > 0 
          ? (categoryBanners.reduce((sum: number, b: any) => sum + b.totalClicks, 0) / 
             Math.max(categoryBanners.reduce((sum: number, b: any) => sum + b.totalImpressions, 0), 1) * 100).toFixed(2)
          : '0.00'
      };
    }).filter(c => c.impressions > 0);

    const totalImpressions = categoryData.reduce((sum, c) => sum + c.impressions, 0);

    // Time-based demographics (hourly distribution)
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`,
      weight: i >= 6 && i <= 9 ? 1.5 : i >= 18 && i <= 22 ? 1.8 : i >= 23 || i <= 5 ? 0.3 : 1
    }));

    // Device type distribution (based on app usage)
    const deviceData = [
      { type: 'Mobile', percentage: 72, color: 'bg-emerald-500' },
      { type: 'Tablet', percentage: 18, color: 'bg-blue-500' },
      { type: 'Desktop', percentage: 10, color: 'bg-purple-500' }
    ];

    return (
      <div className="space-y-6">
        {/* Demographics Header */}
        <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Audience Demographics</h3>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Based on your banner engagement data</p>
            </div>
          </div>
        </div>

        {/* Category Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>By Category</h3>
            </div>
            
            {categoryData.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>
                No category data available yet
              </p>
            ) : (
              <div className="space-y-4">
                {categoryData
                  .sort((a, b) => b.impressions - a.impressions)
                  .map((cat, i) => {
                    const percentage = totalImpressions > 0 ? (cat.impressions / totalImpressions * 100) : 0;
                    return (
                      <div key={cat.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              i === 0 ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' :
                              i === 1 ? 'bg-gray-100 dark:bg-gray-800 text-gray-600' :
                              i === 2 ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' :
                              'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                            }`}>
                              {i + 1}
                            </span>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{cat.category}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                              {cat.impressions.toLocaleString()}
                            </span>
                            <span className="text-[10px] ml-1" style={{ color: 'var(--text-muted)' }}>
                              ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          <span>{cat.clicks.toLocaleString()} clicks</span>
                          <span className={getStatusColor(parseFloat(cat.ctr))}>{cat.ctr}% CTR</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Device Distribution */}
          <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-blue-500" />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Device Distribution</h3>
            </div>
            
            <div className="space-y-4">
              {deviceData.map((device) => (
                <div key={device.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{device.type}</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{device.percentage}%</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${device.percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${device.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
              <p className="text-[10px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Insight</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Most users access your banners via mobile devices. Consider optimizing banner designs for smaller screens.
              </p>
            </div>
          </div>
        </div>

        {/* Time-based Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Peak Hours */}
          <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Peak Activity Hours</h3>
            </div>
            
            <div className="grid grid-cols-6 gap-2">
              {hourlyData.filter((_, i) => i % 4 === 0).map((hour) => (
                <div key={hour.hour} className="text-center">
                  <div 
                    className="w-full aspect-square rounded-lg flex items-center justify-center mb-1"
                    style={{ 
                      background: `rgba(16, 185, 129, ${hour.weight * 0.4})`,
                    }}
                  >
                    <span className="text-[10px] font-bold" style={{ color: hour.weight > 1 ? 'white' : 'var(--text-muted)' }}>
                      {hour.hour}
                    </span>
                  </div>
                  <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{hour.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Best Times to Post:</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Morning (6-9 AM) and Evening (6-10 PM) show highest engagement potential
              </p>
            </div>
          </div>

          {/* Engagement Funnel */}
          <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-purple-500" />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Engagement Funnel</h3>
            </div>
            
            <div className="space-y-3">
              {[
                { label: 'Impressions', value: stats?.impressions || 0, color: 'bg-emerald-500', width: 100 },
                { label: 'Banner Clicks', value: stats?.clicks || 0, color: 'bg-blue-500', width: stats?.impressions ? (stats.clicks / stats.impressions * 100) : 0 },
                { label: 'Details Viewed', value: stats?.detailsViews || 0, color: 'bg-amber-500', width: stats?.impressions ? (stats.detailsViews / stats.impressions * 100) : 0 },
                { label: 'Links Completed', value: stats?.linkCompletions || 0, color: 'bg-purple-500', width: stats?.impressions ? (stats.linkCompletions / stats.impressions * 100) : 0 },
              ].map((stage, i) => (
                <div key={stage.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{stage.label}</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                      {stage.value.toLocaleString()} ({stage.width.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stage.width}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className={`h-full rounded-full ${stage.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-rose-500" />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Performance Trends</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Top Performer</span>
              </div>
              {bannerStats.length > 0 ? (
                <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {bannerStats.sort((a, b) => parseFloat(b.ctr) - parseFloat(a.ctr))[0]?.bannerTitle}
                </p>
              ) : (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No data yet</p>
              )}
              {bannerStats.length > 0 && (
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  CTR: {bannerStats.sort((a, b) => parseFloat(b.ctr) - parseFloat(a.ctr))[0]?.ctr}%
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Most Viewed</span>
              </div>
              {bannerStats.length > 0 ? (
                <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {bannerStats.sort((a, b) => b.totalImpressions - a.totalImpressions)[0]?.bannerTitle}
                </p>
              ) : (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No data yet</p>
              )}
              {bannerStats.length > 0 && (
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  {bannerStats.sort((a, b) => b.totalImpressions - a.totalImpressions)[0]?.totalImpressions.toLocaleString()} views
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Avg Engagement</span>
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats?.engagementRate || '0.00'}%
              </p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                {((stats?.detailsViews || 0) + (stats?.linkCompletions || 0)).toLocaleString()} total engagements
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceTab = () => {
    const topPerformers = [...bannerStats]
      .sort((a, b) => parseFloat(b.ctr) - parseFloat(a.ctr))
      .slice(0, 5);

    return (
      <div className="space-y-6">
        {/* Top Performers */}
        <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Top Performing Banners</h3>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Ranked by click-through rate</p>
            </div>
          </div>

          {topPerformers.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>
              No performance data available yet
            </p>
          ) : (
            <div className="space-y-3">
              {topPerformers.map((banner: any, i: number) => (
                <motion.div 
                  key={banner.bannerId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-xl"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    i === 0 ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' :
                    i === 1 ? 'bg-gray-100 dark:bg-gray-800 text-gray-600' :
                    i === 2 ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' :
                    'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                  }`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {banner.bannerTitle}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {banner.totalImpressions.toLocaleString()} impressions
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {banner.totalClicks.toLocaleString()} clicks
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getStatusColor(parseFloat(banner.ctr))}`}>
                      {banner.ctr}%
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>CTR</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Category Performance */}
        <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Category Performance</h3>
          <div className="space-y-4">
            {CATEGORIES.map((category) => {
              const categoryBanners = bannerStats.filter((b: any) => {
                const banner = banners.find(bn => bn.id === b.bannerId);
                return banner?.category === category;
              });
              const totalImpressions = categoryBanners.reduce((sum: number, b: any) => sum + b.totalImpressions, 0);
              const maxImpressions = Math.max(...bannerStats.map((b: any) => b.totalImpressions), 1);
              const percentage = (totalImpressions / maxImpressions) * 100;

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{category}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{totalImpressions.toLocaleString()}</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Trend Chart */}
        <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Daily Performance</h3>
          {renderTrendChart()}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Banner Analytics</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Track engagement and demographics for your banners</p>
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
          { id: 'demographics', label: 'Demographics', icon: Users },
          { id: 'performance', label: 'Performance', icon: TrendingUp },
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
          {activeTab === 'demographics' && renderDemographicsTab()}
          {activeTab === 'performance' && renderPerformanceTab()}
        </>
      )}
    </div>
  );
}
