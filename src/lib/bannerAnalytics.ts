import { 
  doc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  addDoc
} from 'firebase/firestore';
import { db } from './firebase';
import type { BannerEngagementRecord } from '@/types';

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'mobile';
  return 'desktop';
};

const getDateKey = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

export const trackBannerEvent = async (
  bannerId: string,
  bannerTitle: string,
  eventType: BannerEngagementRecord['eventType']
) => {
  try {
    const today = getDateKey();
    const analyticsDocId = `${bannerId}_${today}`;
    const analyticsRef = doc(db, 'bannerAnalytics', analyticsDocId);
    const engagementRef = collection(db, 'bannerEngagements');

    const engagementRecord: BannerEngagementRecord = {
      id: generateUUID(),
      bannerId,
      eventType,
      timestamp: new Date().toISOString(),
      deviceType: getDeviceType()
    };

    await addDoc(engagementRef, {
      ...engagementRecord,
      createdAt: serverTimestamp()
    });

    let incrementField: string;
    switch (eventType) {
      case 'impression':
        incrementField = 'impressions';
        break;
      case 'click':
      case 'link_open':
        incrementField = 'clicks';
        break;
      case 'details_view':
        incrementField = 'detailsViews';
        break;
      case 'link_complete':
        incrementField = 'linkCompletions';
        break;
      default:
        incrementField = 'impressions';
    }

    await setDoc(analyticsRef, {
      bannerId,
      bannerTitle,
      date: today,
      impressions: increment(0),
      clicks: increment(0),
      detailsViews: increment(0),
      linkCompletions: increment(0),
      uniqueUsers: increment(0),
      clickThroughRate: 0,
      avgTimeOnBanner: 0,
      updatedAt: serverTimestamp()
    }, { merge: true });

    await updateDoc(analyticsRef, {
      [incrementField]: increment(1),
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    console.error('Error tracking banner event:', error);
  }
};

export const trackBannerImpression = (bannerId: string, bannerTitle: string) => {
  trackBannerEvent(bannerId, bannerTitle, 'impression');
};

export const trackBannerClick = (bannerId: string, bannerTitle: string) => {
  trackBannerEvent(bannerId, bannerTitle, 'click');
};

export const trackBannerDetailsView = (bannerId: string, bannerTitle: string) => {
  trackBannerEvent(bannerId, bannerTitle, 'details_view');
};

export const trackBannerLinkOpen = (bannerId: string, bannerTitle: string) => {
  trackBannerEvent(bannerId, bannerTitle, 'link_open');
};

export const trackBannerLinkComplete = (bannerId: string, bannerTitle: string) => {
  trackBannerEvent(bannerId, bannerTitle, 'link_complete');
};

export const getBannerAnalytics = async (bannerId?: string, days: number = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = getDateKey(startDate);

    let q = query(
      collection(db, 'bannerAnalytics'),
      where('date', '>=', startDateStr),
      orderBy('date', 'desc')
    );

    if (bannerId) {
      q = query(
        collection(db, 'bannerAnalytics'),
        where('bannerId', '==', bannerId),
        where('date', '>=', startDateStr),
        orderBy('date', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching banner analytics:', error);
    return [];
  }
};

export const getAllBannerAnalytics = async (days: number = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = getDateKey(startDate);

    const q = query(
      collection(db, 'bannerAnalytics'),
      where('date', '>=', startDateStr),
      orderBy('date', 'desc'),
      limit(500)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching all banner analytics:', error);
    return [];
  }
};

export const getBannerEngagements = async (bannerId: string, limitCount: number = 100) => {
  try {
    const q = query(
      collection(db, 'bannerEngagements'),
      where('bannerId', '==', bannerId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching banner engagements:', error);
    return [];
  }
};

export const getAggregatedBannerStats = async (days: number = 30) => {
  try {
    const analytics = await getAllBannerAnalytics(days);
    
    const aggregated: Record<string, {
      bannerId: string;
      bannerTitle: string;
      totalImpressions: number;
      totalClicks: number;
      totalDetailsViews: number;
      totalLinkCompletions: number;
      uniqueDays: number;
      data: any[];
    }> = {};

    analytics.forEach((record: any) => {
      const { bannerId, bannerTitle, impressions, clicks, detailsViews, linkCompletions } = record;
      
      if (!aggregated[bannerId]) {
        aggregated[bannerId] = {
          bannerId,
          bannerTitle: bannerTitle || 'Unknown Banner',
          totalImpressions: 0,
          totalClicks: 0,
          totalDetailsViews: 0,
          totalLinkCompletions: 0,
          uniqueDays: 0,
          data: []
        };
      }
      
      aggregated[bannerId].totalImpressions += impressions || 0;
      aggregated[bannerId].totalClicks += clicks || 0;
      aggregated[bannerId].totalDetailsViews += detailsViews || 0;
      aggregated[bannerId].totalLinkCompletions += linkCompletions || 0;
      aggregated[bannerId].data.push(record);
      aggregated[bannerId].uniqueDays += 1;
    });

    return Object.values(aggregated).map(item => ({
      ...item,
      ctr: item.totalImpressions > 0 ? (item.totalClicks / item.totalImpressions * 100).toFixed(2) : '0.00',
      engagementRate: item.totalImpressions > 0 ? ((item.totalClicks + item.totalDetailsViews + item.totalLinkCompletions) / item.totalImpressions * 100).toFixed(2) : '0.00',
      avgDailyImpressions: item.uniqueDays > 0 ? Math.round(item.totalImpressions / item.uniqueDays) : 0,
      avgDailyClicks: item.uniqueDays > 0 ? Math.round(item.totalClicks / item.uniqueDays) : 0
    }));
  } catch (error) {
    console.error('Error getting aggregated stats:', error);
    return [];
  }
};

export const getTrendData = async (bannerId: string, days: number = 30) => {
  try {
    const analytics = await getBannerAnalytics(bannerId, days);
    
    return analytics.map((record: any) => ({
      date: record.date,
      impressions: record.impressions || 0,
      clicks: record.clicks || 0,
      detailsViews: record.detailsViews || 0,
      linkCompletions: record.linkCompletions || 0,
      ctr: record.impressions > 0 ? (record.clicks / record.impressions * 100).toFixed(2) : '0.00'
    })).reverse();
  } catch (error) {
    console.error('Error getting trend data:', error);
    return [];
  }
};

export const getTimeframeStats = async (days: number) => {
  const analytics = await getAllBannerAnalytics(days);
  
  const totals = analytics.reduce((acc: any, record: any) => {
    acc.impressions += record.impressions || 0;
    acc.clicks += record.clicks || 0;
    acc.detailsViews += record.detailsViews || 0;
    acc.linkCompletions += record.linkCompletions || 0;
    return acc;
  }, { impressions: 0, clicks: 0, detailsViews: 0, linkCompletions: 0 });

  return {
    ...totals,
    ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions * 100).toFixed(2) : '0.00',
    engagementRate: totals.impressions > 0 ? ((totals.clicks + totals.detailsViews + totals.linkCompletions) / totals.impressions * 100).toFixed(2) : '0.00'
  };
};
