import { useEffect } from 'react';
import { useNavigationStore } from '@/stores/navigationStore';
import { pathForRoute } from '@/lib/routing';
import type { ViewId } from '@/types';

const SITE_NAME = 'Salaf';
const SITE_DESCRIPTION = 'A place to access beneficial Islamic lectures, audio, articles, and resources.';

const ROUTE_METADATA: Record<string, { title: string; description: string; heading: string }> = {
  home: { title: 'Salaf | Beneficial Islamic Knowledge', description: SITE_DESCRIPTION, heading: 'Beneficial knowledge for everyday life' },
  explore: { title: 'Explore Islamic Resources | Salaf', description: 'Discover announcements, featured resources, and curated Islamic content on Salaf.', heading: 'Explore' },
  videos: { title: 'Islamic Lectures and Videos | Salaf', description: 'Browse Islamic lectures and educational videos available on Salaf.', heading: 'Lectures and videos' },
  audio: { title: 'Islamic Audio | Salaf', description: 'Listen to Islamic lessons and audio resources available on Salaf.', heading: 'Audio lessons' },
  articles: { title: 'Islamic Articles | Salaf', description: 'Read articles and written resources published on Salaf.', heading: 'Articles' },
  gallery: { title: 'Islamic Gallery | Salaf', description: 'View the public image gallery and visual resources available on Salaf.', heading: 'Gallery' },
  donate: { title: 'Support Salaf | Donations', description: 'Learn about active public fundraising campaigns and ways to support Salaf.', heading: 'Support the work' },
  profile: { title: 'Profile | Salaf', description: 'Manage your Salaf profile and personal activity.', heading: 'Your profile' },
  notifications: { title: 'Notifications | Salaf', description: 'Review your Salaf notifications.', heading: 'Notifications' },
  'privacy-policy': { title: 'Privacy Policy | Salaf', description: 'Read the Salaf privacy policy.', heading: 'Privacy Policy' },
  'terms-of-service': { title: 'Terms of Service | Salaf', description: 'Read the Salaf terms of service.', heading: 'Terms of Service' },
  'admin-dashboard': { title: 'Administration | Salaf', description: 'Restricted Salaf administration area.', heading: 'Administration' },
  'user-questions': { title: 'My Questions | Salaf', description: 'Review questions submitted through your Salaf account.', heading: 'My questions' },
  'article-detail': { title: 'Article | Salaf', description: 'Read an article published on Salaf.', heading: 'Article' },
  'not-found': { title: 'Page Not Found | Salaf', description: 'The requested Salaf page could not be found.', heading: 'Page not found' },
};

function setMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = url;
}

export function MetadataManager() {
  const currentView = useNavigationStore((state) => state.currentView);
  const selectedArticleId = useNavigationStore((state) => state.selectedArticleId);

  useEffect(() => {
    const metadata = ROUTE_METADATA[currentView] ?? ROUTE_METADATA.home;
    const isPrivate = ['profile', 'notifications', 'admin-dashboard', 'user-questions', 'not-found'].includes(currentView);
    const pathname = pathForRoute(currentView as ViewId, selectedArticleId);
    const url = new URL(pathname, window.location.origin).toString();
    const robots = isPrivate ? 'noindex, nofollow, noarchive' : 'index, follow';

    document.title = metadata.title;
    document.documentElement.lang = 'en';
    setMeta('description', metadata.description);
    setMeta('robots', robots);
    setMeta('author', SITE_NAME);
    setMeta('og:title', metadata.title, 'property');
    setMeta('og:description', metadata.description, 'property');
    setMeta('og:type', currentView === 'article-detail' ? 'article' : 'website', 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:site_name', SITE_NAME, 'property');
    setMeta('twitter:card', 'summary', 'name');
    setMeta('twitter:title', metadata.title, 'name');
    setMeta('twitter:description', metadata.description, 'name');
    if (currentView === 'not-found') {
      document.head.querySelector('link[rel="canonical"]')?.remove();
    } else {
      setCanonical(url);
    }

    const existing = document.getElementById('salaf-route-jsonld');
    existing?.remove();
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': currentView === 'home' ? 'WebSite' : 'WebPage',
      name: metadata.title,
      description: metadata.description,
      url,
      inLanguage: 'en',
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: new URL('/', window.location.origin).toString() },
      ...(currentView === 'home' ? { potentialAction: { '@type': 'SearchAction', target: `${window.location.origin}/articles?search={search_term_string}`, 'query-input': 'required name=search_term_string' } } : {}),
    };
    const script = document.createElement('script');
    script.id = 'salaf-route-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }, [currentView, selectedArticleId]);

  return null;
}
