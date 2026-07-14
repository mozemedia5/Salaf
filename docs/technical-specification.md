# Noor Platform — Technical Specification

## 1. Development Environment

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| TypeScript | ~5.6 | Type safety |
| Vite | ~6 | Build tool & dev server |
| Tailwind CSS | 3 | Utility-first styling |
| shadcn/ui | latest | Base UI component library |

**PWA Tooling:**
- `vite-plugin-pwa` — PWA manifest, service worker generation, workbox integration
- Output targets: installable on Android, iOS, Windows, desktop browsers

---

## 2. Dependencies

### Core Framework (pre-installed with scaffolding)

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.0.0 | UI framework |
| `react-dom` | ^19.0.0 | React DOM renderer |
| `typescript` | ~5.6.0 | Type system |
| `vite` | ^6.0.0 | Build tool |
| `tailwindcss` | ^3.4.0 | CSS utility framework |
| `@tailwindcss/vite` | ^4.0.0 | Tailwind Vite integration |
| `class-variance-authority` | ^0.7.0 | Component variant styling (shadcn dep) |
| `clsx` | ^2.1.0 | Conditional classnames (shadcn dep) |
| `tailwind-merge` | ^2.6.0 | Tailwind class deduplication (shadcn dep) |
| `lucide-react` | ^0.460.0 | Icon library (shadcn dep) |

### UI Enhancement

| Package | Version | Purpose |
|---------|---------|---------|
| `framer-motion` | ^11.0.0 | Declarative animations, AnimatePresence for view transitions, layout animations |
| `@radix-ui/react-*` | ^1.0.0 | Accessible UI primitives (dialog, sheet, switch, tabs, scroll-area, dropdown-menu, select, toast/sonner) — installed via `npx shadcn add` |
| `sonner` | ^1.0.0 | Toast notifications (installed via shadcn) |
| `embla-carousel-react` | ^8.0.0 | Touch-enabled horizontal scroll carousels with snap |

### State & Logic

| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | ^5.0.0 | Lightweight global state management (auth, audio player, theme, notifications, navigation stack) |
| `@tanstack/react-query` | ^5.0.0 | Server state management, caching, Firestore query abstraction |
| `zod` | ^3.23.0 | Schema validation for forms and Firestore data |
| `react-hook-form` | ^7.53.0 | Performant form handling with validation |
| `@hookform/resolvers` | ^3.9.0 | Zod resolver for react-hook-form |

### Routing & Navigation

| Package | Version | Purpose |
|---------|---------|---------|
| `react-router-dom` | ^7.0.0 | SPA client-side routing, nested routes for admin dashboard |

### Firebase (Backend)

| Package | Version | Purpose |
|---------|---------|---------|
| `firebase` | ^11.0.0 | Firebase SDK — Auth, Firestore, Storage, Cloud Messaging |

### PWA

| Package | Version | Purpose |
|---------|---------|---------|
| `vite-plugin-pwa` | ^0.20.0 | PWA configuration, service worker generation, manifest injection |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@types/react` | ^19.0.0 | React type definitions |
| `@types/react-dom` | ^19.0.0 | React DOM type definitions |
| `@vitejs/plugin-react` | ^4.0.0 | Vite React plugin (JSX transform, HMR) |
| `eslint` | ^9.0.0 | Linting |
| `@eslint/js` | ^9.0.0 | ESLint JS config |
| `typescript-eslint` | ^8.0.0 | TypeScript ESLint |
| `globals` | ^15.0.0 | Global variables for ESLint |
| `autoprefixer` | ^10.4.0 | CSS vendor prefixing |
| `postcss` | ^8.4.0 | CSS processing |

---

## 3. Component Inventory

### 3.1 shadcn/ui Components (install via CLI)

| Component | Install Command | Customization |
|-----------|----------------|---------------|
| Button | `npx shadcn add button` | Emerald gradient variant, gold accent variant for donation |
| Input | `npx shadcn add input` | Focus ring emerald, icon prefix support |
| Dialog | `npx shadcn add dialog` | Bottom sheet variant (mobile), backdrop blur |
| Sheet | `npx shadcn add sheet` | Bottom sheet for video player, audio player, article reader, filters |
| Switch | `npx shadcn add switch` | Emerald track, used in profile settings |
| Tabs | `npx shadcn add tabs` | Category filter tabs, view toggle |
| Select | `npx shadcn add select` | Sort dropdowns, language selector |
| Dropdown Menu | `npx shadcn add dropdown-menu` | Action menus (audio more options, admin actions) |
| Scroll Area | `npx shadcn add scroll-area` | Custom scrollable containers |
| Toast / Sonner | `npx shadcn add sonner` | Toast notifications (success, error, warning, info) |
| Skeleton | `npx shadcn add skeleton` | Loading placeholders |
| Avatar | `npx shadcn add avatar` | User avatars (profile, comments, scholars) |
| Badge | `npx shadcn add badge` | Category badges, status badges, notification type badges |
| Card | `npx shadcn add card` | Base card structure for content cards |
| Progress | `npx shadcn add progress` | Donation progress bars, audio playback progress |
| Separator | `npx shadcn add separator` | Dividers between sections |
| Checkbox | `npx shadcn add checkbox` | Multi-select mode, terms agreement |
| Textarea | `npx shadcn add textarea` | Article content input, notification message |
| Label | `npx shadcn add label` | Form labels |
| Form | `npx shadcn add form` | Form wrapper with react-hook-form integration |

### 3.2 Custom Components

#### Layout Components

| Component | File | Description |
|-----------|------|-------------|
| `AppShell` | `components/layout/AppShell.tsx` | Persistent app shell: header + content area + bottom nav |
| `AppHeader` | `components/layout/AppHeader.tsx` | Glassmorphism header with logo/title, search icon, notification bell |
| `BottomNav` | `components/layout/BottomNav.tsx` | Fixed bottom nav bar with 5 tabs, glassmorphism, active indicator dot |
| `Sidebar` | `components/layout/Sidebar.tsx` | Admin sidebar navigation (desktop), dark navy theme |
| `MobileDrawer` | `components/layout/MobileDrawer.tsx` | Admin mobile side drawer with overlay backdrop |
| `AuthModal` | `components/auth/AuthModal.tsx` | Centered auth overlay modal with backdrop, hosts login/signup/forgot/verify screens |
| `BottomSheet` | `components/layout/BottomSheet.tsx` | Reusable bottom sheet modal pattern with drag handle, swipe-to-dismiss |

#### Shared UI Components

| Component | File | Description |
|-----------|------|-------------|
| `GlassCard` | `components/ui/GlassCard.tsx` | Glassmorphism card wrapper: backdrop-blur, border, shadow, hover lift |
| `CategoryChip` | `components/ui/CategoryChip.tsx` | Pill-shaped category filter with active/inactive states |
| `ActionButton` | `components/ui/ActionButton.tsx` | Primary (emerald gradient) and secondary (outlined) action buttons |
| `IconButton` | `components/ui/IconButton.tsx` | 40px circular icon button with hover/active states |
| `SkeletonLoader` | `components/ui/SkeletonLoader.tsx` | Shimmer-animated skeleton rectangles for loading states |
| `ContentBadge` | `components/ui/ContentBadge.tsx` | Badge/tag variants: primary, gold, info, gray |
| `ProgressBar` | `components/ui/ProgressBar.tsx` | Animated progress bar with emerald or gold gradient fill |
| `FloatingActionButton` | `components/ui/FloatingActionButton.tsx` | Fixed bottom-right FAB with emerald gradient |
| `EmptyState` | `components/ui/EmptyState.tsx` | Centered empty state with illustration, heading, subtext, action button |
| `ErrorState` | `components/ui/ErrorState.tsx` | Inline error message with retry button |
| `LoadingOverlay` | `components/ui/LoadingOverlay.tsx` | Full-screen overlay with spinner and "Loading..." text |
| `OfflineBanner` | `components/ui/OfflineBanner.tsx` | Top banner showing offline status, auto-dismiss on reconnect |
| `RippleEffect` | `components/ui/RippleEffect.tsx` | Tap/click ripple animation wrapper for buttons and cards |
| `IslamicDivider` | `components/ui/IslamicDivider.tsx` | Decorative geometric pattern divider between sections |
| `ToggleSwitch` | `components/ui/ToggleSwitch.tsx` | Custom toggle switch with emerald track, animated thumb |
| `ScrollReveal` | `components/ui/ScrollReveal.tsx` | IntersectionObserver wrapper for fade-in-up scroll animations with stagger |
| `HorizontalCarousel` | `components/ui/HorizontalCarousel.tsx` | Snap-scroll horizontal carousel with fade mask indicator |
| `MasonryGrid` | `components/ui/MasonryGrid.tsx` | CSS columns-based masonry layout for gallery |

#### Audio Player Components

| Component | File | Description |
|-----------|------|-------------|
| `MiniPlayer` | `components/audio/MiniPlayer.tsx` | Fixed bottom player bar above nav: thumbnail, title, play/pause, progress |
| `FullAudioPlayer` | `components/audio/FullAudioPlayer.tsx` | Bottom sheet modal with large artwork, controls, progress, speed, queue |
| `PlaybackControls` | `components/audio/PlaybackControls.tsx` | Play/pause, skip forward/back, shuffle, repeat button group |
| `ProgressBar` | `components/audio/AudioProgressBar.tsx` | Seekable progress bar with draggable knob, time labels |
| `PlaybackSpeed` | `components/audio/PlaybackSpeed.tsx` | Speed selector cycling through 0.5×–2× |

#### Video Components

| Component | File | Description |
|-----------|------|-------------|
| `VideoPlayer` | `components/video/VideoPlayer.tsx` | Bottom sheet with YouTube iframe embed, 16:9 aspect ratio |
| `VideoCard` | `components/video/VideoCard.tsx` | Glassmorphism card with thumbnail, duration badge, play overlay, metadata |
| `VideoGrid` | `components/video/VideoGrid.tsx` | Responsive grid (2/3/4 columns) of VideoCards with staggered entrance |

#### Card Components

| Component | File | Description |
|-----------|------|-------------|
| `AudioCard` | `components/cards/AudioCard.tsx` | Square thumbnail audio card with play overlay, title, scholar, duration |
| `AudioListItem` | `components/cards/AudioListItem.tsx` | Horizontal list item with thumbnail, info, play button, more menu |
| `ArticleCard` | `components/cards/ArticleCard.tsx` | Featured image card with category badge, title, excerpt, reading time |
| `ArticleCompactCard` | `components/cards/ArticleCompactCard.tsx` | Compact horizontal card for related articles section |
| `CampaignCard` | `components/cards/CampaignCard.tsx` | Full-width donation campaign card with image, progress bar, stats, donate button |
| `CampaignListCard` | `components/cards/CampaignListCard.tsx` | Compact horizontal campaign card for campaign list |
| `GalleryImageCard` | `components/cards/GalleryImageCard.tsx` | Masonry image card with hover overlay (favorite/share/download) |
| `ContinueListeningCard` | `components/cards/ContinueListeningCard.tsx` | Horizontal card with thumbnail, title, scholar, progress bar, play button |
| `TrendingCard` | `components/cards/TrendingCard.tsx` | Video card with trending flame badge and view count |
| `ScholarCard` | `components/cards/ScholarCard.tsx` | Avatar + name + specialty for search results |
| `QuickActionButton` | `components/cards/QuickActionButton.tsx` | Vertical icon + label action button for home quick actions |

#### Auth Components

| Component | File | Description |
|-----------|------|-------------|
| `LoginScreen` | `components/auth/LoginScreen.tsx` | Email/password form, social login, forgot password link |
| `SignupScreen` | `components/auth/SignupScreen.tsx` | Full name, email, password, confirm password, terms checkbox, strength meter |
| `ForgotPasswordScreen` | `components/auth/ForgotPasswordScreen.tsx` | Email input, send reset link, success state |
| `VerifyEmailScreen` | `components/auth/VerifyEmailScreen.tsx` | Post-signup verification prompt with resend countdown |
| `PasswordStrength` | `components/auth/PasswordStrength.tsx` | 4-bar visual strength indicator with color coding |

#### Search Components

| Component | File | Description |
|-----------|------|-------------|
| `SearchBar` | `components/search/SearchBar.tsx` | Expandable search input with clear button, cancel button |
| `SearchResults` | `components/search/SearchResults.tsx` | Grouped results by content type with section headers |
| `RecentSearches` | `components/search/RecentSearches.tsx` | Recent query list with clear all and individual remove |
| `HighlightText` | `components/search/HighlightText.tsx` | Text component that wraps matching query in highlighted `<mark>` |

#### Notification Components

| Component | File | Description |
|-----------|------|-------------|
| `NotificationCard` | `components/notifications/NotificationCard.tsx` | Notification item with type icon, title, body, timestamp, read/unread states |
| `NotificationPreferences` | `components/notifications/NotificationPreferences.tsx` | Toggle list for notification categories |
| `NotificationBadge` | `components/notifications/NotificationBadge.tsx` | Bell icon with pulsing red dot indicator |

---

## 4. Animation Implementation Plan

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| Section fade-in-up on scroll | Framer Motion + `ScrollReveal` | `useInView` hook from framer-motion, `motion.div` with `initial={{ opacity: 0, y: 30 }}` `animate={{ opacity: 1, y: 0 }}`, stagger via `transition.delay` | Low |
| Horizontal carousel snap scroll | CSS + Embla Carousel | `scroll-snap-type: x mandatory` as fallback; Embla Carousel for touch momentum, snap alignment, loop support | Low |
| Card hover lift + shadow | CSS/Tailwind | `hover:translate-y-[-4px] hover:shadow-lg transition-all duration-300` | Low |
| Tab switch cross-fade | Framer Motion `AnimatePresence` | `AnimatePresence` wrapping view content, `motion.div` with `exit={{ opacity: 0 }}` `initial={{ opacity: 0 }}` `animate={{ opacity: 1 }}`, 150–200ms duration | Low |
| Stack push (slide from right) | Framer Motion | `motion.div` with `initial={{ x: '100%' }}` `animate={{ x: 0 }}` `exit={{ x: '-20%', opacity: 0.7 }}`, 300ms ease-spring | Medium |
| Bottom sheet slide-up | Framer Motion + `BottomSheet` | `motion.div` with `initial={{ y: '100%' }}` `animate={{ y: 0 }}` using `cubic-bezier(0.175, 0.885, 0.32, 1.275)`, backdrop fade | Medium |
| Bottom sheet swipe-to-dismiss | Framer Motion `drag` | `drag="y"` with `dragConstraints`, `onDragEnd` velocity check to dismiss, snap back if not past threshold | Medium |
| Ripple click effect | Custom CSS/JS | `RippleEffect` component: create expanding circle from click coords, CSS `@keyframes` scale 0→2 + opacity fade, 400ms | Low |
| Skeleton shimmer | CSS `@keyframes` | `background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)` animated with `background-position` sweep, 1.5s linear infinite | Low |
| Toast slide-down + auto-dismiss | Sonner | Use `sonner` library with custom styling; emerald/success, red/error, gold/warning, blue/info variants | Low |
| Mini player slide up/down | Framer Motion | `motion.div` with `animate={{ y: isVisible ? 0 : 64 }}`, 300ms ease-spring | Low |
| Full audio player slide-up | Framer Motion | Bottom sheet pattern, 400ms ease-spring, backdrop `AnimatePresence` fade | Medium |
| Progress bar fill animation | CSS `transition` | `transition: width 500ms ease` on progress element, width bound to playback percentage state | Low |
| Hero entrance sequence | Framer Motion | Staggered `motion.div` children: Bismillah (0ms), greeting (200ms), reminder card (300ms), featured card (400ms), each with fade+slide | Medium |
| Category chip stagger entrance | Framer Motion | `staggerChildren: 0.05` on parent, each chip fades in with incremental delay | Low |
| Favorite heart bounce | Framer Motion | `scale: [1, 1.3, 1]` keyframe animation on toggle, 300ms, with red glow box-shadow pulse | Low |
| Donate button pulse glow | CSS `@keyframes` | `box-shadow` oscillation between normal and `0 0 20px rgba(245,158,11,0.4)`, 2s infinite | Low |
| Play button pulse (audio) | CSS `@keyframes` | Subtle `scale: [1, 1.02, 1]`, 2s infinite when playing | Low |
| Gallery lightbox shared element | Framer Motion `layoutId` | `layoutId` on image from grid to lightbox, framer handles the morph animation (400ms ease-spring) | High |
| Lightbox pinch-to-zoom | Framer Motion `drag` + CSS `transform` | `drag` disabled until scaled, `onPan` for panning when zoomed, double-tap toggles zoom level | High |
| Auth modal scale-in | Framer Motion | Backdrop fade (200ms), modal `scale: [0.95, 1]` + `opacity: [0, 1]` (300ms ease-spring) | Low |
| Screen cross-fade (auth) | Framer Motion `AnimatePresence` | `AnimatePresence mode="wait"` with opacity cross-fade between login/signup/forgot screens | Low |
| Reading progress bar | React state + scroll listener | `onScroll` handler calculates `scrollTop / (scrollHeight - clientHeight)`, updates width CSS variable | Low |
| Pull-to-refresh | Custom hook | Touch event listener tracking `touchmove` delta, rotate spinner based on pull distance, trigger refresh callback on release past threshold | Medium |
| Notification badge pulse | CSS `@keyframes` | `scale: [1, 1.2, 1]` on red dot, 2s infinite when new notification arrives | Low |
| Parallax hero background | CSS `transform` + scroll | `onScroll` listener applies `translateY(scrollY * 0.5)` to background element | Low |
| Mark-as-read border fade | CSS `transition` | `transition: border-color 200ms, opacity 200ms` on notification card | Low |
| Swipe-to-dismiss (notifications) | Framer Motion `drag` | `drag="x"` with `dragConstraints={{ left: 0, right: 0 }}`, `onDragEnd` check `offset.x` > 50% width to fade out | Medium |
| Long-press selection mode | Custom hook | `setTimeout` on `onPointerDown`, clear on `onPointerUp`/`onPointerLeave`, trigger after 500ms | Low |
| Password strength bar fill | CSS `transition` | Width and color transition 200ms based on strength score (0–4) | Low |
| Number count-up (admin stats) | Custom hook | `useCountUp(target, duration)` — `requestAnimationFrame` loop interpolating value over 800ms | Low |
| Chart draw-in animation | CSS/Charting lib | Use CSS `stroke-dasharray`/`stroke-dashoffset` animation for SVG charts, or chart library native animation | Medium |
| Image blur-up loading | CSS | `filter: blur(10px)` on tiny placeholder, swap to full image on load with `opacity` cross-fade (300ms) | Low |
| Theme dark/light transition | CSS `transition` | `transition: background-color 300ms, color 300ms` on themed CSS custom properties | Low |
| Quick action icon scale-in | Framer Motion | `staggerChildren: 0.1`, each icon `scale: [0.8, 1]` + `opacity: [0, 1]`, 300ms | Low |
| Campaign progress bar fill | CSS `transition` | `transition: width 800ms ease`, triggered when element enters viewport via IntersectionObserver | Low |
| Audio progress drag knob | Framer Motion | Knob scales to 1.5× on drag start, snaps back on release; time tooltip appears above while dragging | Low |
| Gallery image hover overlay | CSS `transition` | Overlay `opacity: 0 → 1` (200ms), action icons stagger in with 50ms delay each | Low |

---

## 5. State & Logic Plan

### 5.1 Global Store (Zustand)

**`useAuthStore`** — Authentication state
```typescript
interface AuthStore {
  user: User | null;           // Firebase user object
  isAdmin: boolean;            // Computed from custom claims
  isLoading: boolean;          // Auth initialization state
  isAuthModalOpen: boolean;    // Auth modal visibility
  authModalScreen: 'login' | 'signup' | 'forgot' | 'verify';
  openAuthModal: (screen?) => void;
  closeAuthModal: () => void;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}
```

**`useAudioStore`** — Audio player state (persistent mini player across views)
```typescript
interface AudioStore {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isMiniPlayerVisible: boolean;
  isFullPlayerOpen: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  isShuffle: boolean;
  isRepeat: boolean;
  queue: AudioTrack[];
  play: (track: AudioTrack) => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setSpeed: (speed: number) => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
  skipForward: () => void;
  skipBackward: () => void;
}
```

**`useThemeStore`** — Theme persistence
```typescript
interface ThemeStore {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark'; // Computed from system preference if 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}
```

**`useNotificationStore`** — In-app notification state
```typescript
interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;         // Computed
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notification: Notification) => void;
  preferences: NotificationPreferences;
  updatePreference: (key: string, value: boolean) => void;
}
```

**`useNavigationStore`** — SPA navigation state
```typescript
interface NavigationStore {
  activeTab: 'home' | 'videos' | 'audio' | 'donate' | 'profile';
  navigationStack: string[];   // For drill-down navigation with back button
  pushStack: (route: string) => void;
  popStack: () => void;
  setActiveTab: (tab: string) => void;
}
```

### 5.2 Server State (React Query)

All Firestore queries managed through React Query for caching, background refetching, and optimistic updates.

**Query Keys Structure:**
```
['videos', { category, sort, page }]
['video', id]
['audio', { category, sort, page }]
['audio', id]
['articles', { category, page }]
['article', id]
['gallery', { category, page }]
['campaigns']
['campaign', id]
['notifications']
['user', uid]
['userFavorites', uid, type]
['userDonations', uid]
['listeningHistory', uid]
['scholars']
['search', query, type]
['admin', 'users', { page, filter }]
['admin', 'analytics', metric]
```

### 5.3 React Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useAuth` | `hooks/useAuth.ts` | Auth state listener, login/signup/logout helpers, role checking |
| `useScrollReveal` | `hooks/useScrollReveal.ts` | IntersectionObserver wrapper for scroll-triggered animations |
| `usePullToRefresh` | `hooks/usePullToRefresh.ts` | Touch gesture handling for pull-to-refresh |
| `useSwipe` | `hooks/useSwipe.ts` | Generic swipe gesture detection (direction, velocity, distance) |
| `useLongPress` | `hooks/useLongPress.ts` | Long-press detection with configurable duration |
| `useLocalStorage` | `hooks/useLocalStorage.ts` | Persist state to localStorage with hydration safety |
| `useMediaQuery` | `hooks/useMediaQuery.ts` | Responsive breakpoint detection (mobile/tablet/desktop) |
| `useCountUp` | `hooks/useCountUp.ts` | Animated number counting from 0 to target |
| `useNetworkStatus` | `hooks/useNetworkStatus.ts` | Online/offline status detection |
| `useAudio` | `hooks/useAudio.ts` | HTML5 Audio API wrapper: play, pause, seek, speed, timeupdate events |
| `useYouTubePlayer` | `hooks/useYouTubePlayer.ts` | YouTube iframe API integration for video playback |
| `useFCM` | `hooks/useFCM.ts` | Firebase Cloud Messaging: token registration, message handling |
| `useFirestoreQuery` | `hooks/useFirestoreQuery.ts` | Generic Firestore query wrapper with React Query |
| `useFirestoreMutation` | `hooks/useFirestoreMutation.ts` | Generic Firestore CRUD mutations with optimistic updates |
| `useForm` | `hooks/useForm.ts` | react-hook-form setup with Zod validation |
| `useDebounce` | `hooks/useDebounce.ts` | Debounce search input and other rapid-fire events |
| `useTheme` | `hooks/useTheme.ts` | Theme resolution and CSS variable application |

---

## 6. Firebase Data Model

### 6.1 Authentication

**Firebase Authentication** — Email/password + Google + Apple sign-in providers.

**User Document** (`users/{uid}`):
```typescript
interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: 'user' | 'admin';      // Admin flag for dashboard access
  emailVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  favorites: {
    videos: string[];          // Array of video IDs
    audio: string[];
    articles: string[];
    gallery: string[];
  };
  listeningHistory: {
    audioId: string;
    progress: number;          // Seconds listened
    completedAt: Timestamp | null;
    lastPlayedAt: Timestamp;
  }[];
  donationTotal: number;       // Total amount donated (cents)
  settings: {
    theme: 'light' | 'dark' | 'system';
    textSize: 'small' | 'medium' | 'large';
    language: string;
    downloadQuality: 'low' | 'medium' | 'high';
    notifications: NotificationPreferences;
  };
}
```

### 6.2 Firestore Collections

**`videos/{id}`**:
```typescript
interface VideoDoc {
  id: string;
  title: string;
  description: string;
  youtubeId: string;           // YouTube video ID for embed
  thumbnailURL: string;
  scholarId: string;           // Reference to scholars collection
  scholarName: string;         // Denormalized for queries
  category: string;
  duration: number;            // Seconds
  viewCount: number;
  favoriteCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}
```

**`audio/{id}`**:
```typescript
interface AudioDoc {
  id: string;
  title: string;
  description: string;
  audioURL: string;            // Firebase Storage URL
  thumbnailURL: string;
  scholarId: string;
  scholarName: string;
  category: string;
  duration: number;            // Seconds
  playCount: number;
  favoriteCount: number;
  downloadCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}
```

**`articles/{id}`**:
```typescript
interface ArticleDoc {
  id: string;
  title: string;
  excerpt: string;
  content: string;             // HTML/markdown content
  featuredImageURL: string;
  authorId: string;
  authorName: string;
  category: string;
  readingTime: number;         // Minutes
  bookmarkCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  relatedArticleIds: string[];
}
```

**`gallery/{id}`**:
```typescript
interface GalleryDoc {
  id: string;
  imageURL: string;            // Firebase Storage URL
  thumbnailURL: string;        // Compressed version
  caption: string;
  category: string;
  favoriteCount: number;
  downloadCount: number;
  allowDownload: boolean;
  createdAt: Timestamp;
  uploadedBy: string;          // Admin UID
}
```

**`categories/{id}`**:
```typescript
interface CategoryDoc {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'article' | 'gallery' | 'all';
  icon: string;                // Lucide icon name
  sortOrder: number;
  isActive: boolean;
}
```

**`scholars/{id}`**:
```typescript
interface ScholarDoc {
  id: string;
  name: string;
  bio: string;
  photoURL: string;
  specialty: string;
  lectureCount: number;
  createdAt: Timestamp;
  isActive: boolean;
}
```

**`campaigns/{id}`**:
```typescript
interface CampaignDoc {
  id: string;
  title: string;
  description: string;
  imageURL: string;
  targetAmount: number;        // Cents
  raisedAmount: number;        // Cents
  donorCount: number;
  isFeatured: boolean;
  isUrgent: boolean;
  status: 'active' | 'completed' | 'draft';
  startDate: Timestamp;
  endDate: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**`donations/{id}`**:
```typescript
interface DonationDoc {
  id: string;
  userId: string;
  campaignId: string;
  campaignName: string;        // Denormalized
  amount: number;              // Cents
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;       // Placeholder for future integration
  createdAt: Timestamp;
}
```

**`notifications/{userId}/{notificationId}`**:
```typescript
interface NotificationDoc {
  id: string;
  userId: string;
  type: 'lecture' | 'article' | 'donation' | 'reminder' | 'announcement';
  title: string;
  body: string;
  imageURL: string | null;
  data: {                      // Navigation payload
    contentType?: string;
    contentId?: string;
  };
  isRead: boolean;
  createdAt: Timestamp;
}
```

**`dailyContent/{id}`**:
```typescript
interface DailyContentDoc {
  id: string;
  date: string;                // YYYY-MM-DD
  type: 'verse' | 'reminder' | 'hadith';
  arabicText: string;
  transliteration: string;
  translation: string;
  source: string;              // Surah reference or source
}
```

### 6.3 Firebase Storage Structure

```
audio/
  {audioId}.mp3
  {audioId}_preview.mp3

gallery/
  {imageId}_original.jpg
  {imageId}_thumb.jpg
  {imageId}_compressed.jpg

articles/
  {articleId}_featured.jpg

thumbnails/
  default-video.jpg
  default-audio.jpg

profilePictures/
  {userId}.jpg
```

### 6.4 Firebase Cloud Messaging

- Token stored per user in `users/{uid}/fcmToken`
- Topics: `all_users`, `friday_reminders`, `ramadan_alerts`
- Admin notification sender via Firebase Admin SDK (Cloud Functions or client-side with admin check)

### 6.5 Security Rules Strategy

**Firestore Rules:**
- Authenticated users can read all active content (videos, audio, articles, gallery, campaigns, scholars, categories)
- Users can only read/write their own `users/{uid}`, `notifications/{uid}`, `donations` (own records)
- Admin role check (`request.auth.token.admin == true`) for write access to all content collections
- `donations` collection: users can create (their own), read (their own), admin can read all

**Storage Rules:**
- Public read access for audio, gallery, thumbnails, articles
- `profilePictures/{uid}`: write access limited to owner
- Admin-only write for `audio/`, `gallery/`, `articles/` folders

---

## 7. Routing Plan

### 7.1 Public Routes

| Route | View | Auth Required |
|-------|------|---------------|
| `/` | Home | No |
| `/videos` | Video Lectures | No |
| `/videos/:id` | Video Player (modal) | No |
| `/audio` | Audio Lectures | No |
| `/articles` | Articles Feed | No |
| `/articles/:id` | Article Reader | No |
| `/gallery` | Gallery | No |
| `/donate` | Donation | No |
| `/search` | Search | No |

### 7.2 Protected Routes (Auth Required)

| Route | View | Auth Required |
|-------|------|---------------|
| `/profile` | User Profile | Yes |
| `/profile/saved-videos` | Saved Videos | Yes |
| `/profile/saved-articles` | Saved Articles | Yes |
| `/profile/saved-audio` | Saved Audio | Yes |
| `/profile/donation-history` | Donation History | Yes |
| `/notifications` | Notifications | Yes |

### 7.3 Admin Routes (Admin Role Required)

| Route | View | Route Guard |
|-------|------|-------------|
| `/admin` | Dashboard Overview | Admin only |
| `/admin/videos` | Video Management | Admin only |
| `/admin/audio` | Audio Management | Admin only |
| `/admin/articles` | Article Management | Admin only |
| `/admin/gallery` | Gallery Management | Admin only |
| `/admin/categories` | Category Management | Admin only |
| `/admin/scholars` | Scholar Management | Admin only |
| `/admin/donations` | Donation Management | Admin only |
| `/admin/users` | User Management | Admin only |
| `/admin/notifications` | Send Notifications | Admin only |
| `/admin/analytics` | Analytics Dashboard | Admin only |
| `/admin/settings` | Platform Settings | Admin only |

### 7.4 Navigation Behavior

- **Bottom tabs**: Navigate between `/`, `/videos`, `/audio`, `/donate`, `/profile` — tab switch cross-fade
- **Stack push**: `/articles/:id`, `/videos/:id` (as modal), `/profile/*` sub-routes — slide from right
- **Modal overlay**: Auth modal (preserves current route), search overlay, audio full player, video player
- **Admin sidebar**: Client-side navigation within `/admin/*` routes, content area updates with fade
- **Auth guard**: Redirect unauthenticated users from protected routes to Home + open auth modal
- **Admin guard**: Redirect non-admin users from `/admin/*` to Home + "Access denied" toast

---

## 8. PWA Implementation Plan

### 8.1 vite-plugin-pwa Configuration

- **Manifest**: `manifest.json` generated with app name, icons (192×192, 512×512), theme color (#10B981), background color (#F9FAFB), display mode (standalone), orientation (portrait-primary)
- **Service Worker**: Workbox-generated SW with precaching for shell assets, runtime caching for Firebase Storage images/audio, Firestore data, and YouTube thumbnails
- **Caching Strategy**:
  - App shell (HTML, JS, CSS): Cache-first, precached at build
  - Images/Thumbnails: Stale-while-revalidate, 30-day expiration
  - Audio files: Cache-first, 7-day expiration
  - API/Firestore: Network-first with cache fallback
- **Install Prompt**: Custom "Add to Home Screen" banner triggered by `beforeinstallprompt` event
- **Splash Screen**: Generated from manifest theme/background colors and icon

### 8.2 PWA Requirements Checklist

| Requirement | Implementation |
|-------------|---------------|
| Web App Manifest | vite-plugin-pwa auto-generates |
| Service Worker | Workbox via vite-plugin-pwa |
| Offline support | Cached app shell + runtime caching strategies |
| Install prompt | Custom A2HS banner component |
| App icons | Generated assets at 192×192, 512×512 |
| Splash screen | Auto-generated from manifest |
| Responsive layout | Tailwind responsive breakpoints |
| Caching strategy | Workbox strategies per asset type |
| Fast loading | Code splitting, lazy loading, image optimization |
| Lighthouse >90 | Optimized via above + tree-shaking + minification |

---

## 9. Performance Strategy

### 9.1 Code Splitting

| Chunk | Route | Content |
|-------|-------|---------|
| `main` | All | App shell, shared components, Zustand stores |
| `home` | `/` | Hero, categories, carousels, dashboard sections |
| `videos` | `/videos` | Video grid, player, filters |
| `audio` | `/audio` | Audio grid/list, mini player, full player |
| `articles` | `/articles` | Article feed, reader |
| `gallery` | `/gallery` | Masonry grid, lightbox |
| `donation` | `/donate` | Campaign cards, donation flow |
| `profile` | `/profile` | Profile header, menu, sub-views |
| `search` | `/search` | Search interface, results |
| `notifications` | `/notifications` | Notification list, preferences |
| `auth` | Modal | Login, signup, forgot password screens |
| `admin` | `/admin/*` | Full admin dashboard (largest chunk, admin-only) |

Implementation: React.lazy() + Suspense for all route-level components.

### 9.2 Image Optimization

- Lazy loading via `loading="lazy"` on all images
- Blur-up placeholder technique: tiny base64-encoded image displayed while full image loads
- Responsive images with `srcset` for different viewport sizes
- Firebase Storage images served with appropriate resize parameters
- Gallery images: thumbnail version loaded first, original on lightbox open

### 9.3 Animation Performance

- All animations use `transform` and `opacity` only (GPU-composited properties)
- No layout-triggering animations (avoid width, height, top, left changes)
- `will-change` applied sparingly to elements with complex animations
- IntersectionObserver for scroll-triggered animations (avoids scroll event listeners)
- `requestAnimationFrame` only for custom animation hooks (count-up, progress)

### 9.4 Firestore Query Optimization

- Pagination for all list queries (limit 20 per page, cursor-based)
- Composite indexes for common query patterns (category + createdAt, userId + createdAt)
- Denormalized fields for frequently displayed data (scholarName, campaignName)
- React Query caching with appropriate stale times (content: 5min, user data: 1min)

---

## 10. Project File Structure

```
├── public/
│   ├── icons/                     # PWA icons (192x192, 512x512)
│   ├── images/                    # Static images (logo, patterns, empty states)
│   └── manifest.json              # Auto-generated by vite-plugin-pwa
├── src/
│   ├── main.tsx                   # Entry point, React root
│   ├── App.tsx                    # Root component: Router, providers, app shell
│   ├── index.css                  # Global styles, Tailwind directives, CSS variables, font imports
│   ├── vite-env.d.ts              # Vite environment type declarations
│   │
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components (auto-installed)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── label.tsx
│   │   │
│   │   ├── layout/                # Layout components
│   │   │   ├── AppShell.tsx
│   │   │   ├── AppHeader.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MobileDrawer.tsx
│   │   │   ├── AuthModal.tsx
│   │   │   └── BottomSheet.tsx
│   │   │
│   │   ├── ui-custom/             # Custom reusable UI components
│   │   │   ├── GlassCard.tsx
│   │   │   ├── CategoryChip.tsx
│   │   │   ├── ActionButton.tsx
│   │   │   ├── IconButton.tsx
│   │   │   ├── SkeletonLoader.tsx
│   │   │   ├── ContentBadge.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── FloatingActionButton.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── LoadingOverlay.tsx
│   │   │   ├── OfflineBanner.tsx
│   │   │   ├── RippleEffect.tsx
│   │   │   ├── IslamicDivider.tsx
│   │   │   ├── ToggleSwitch.tsx
│   │   │   ├── ScrollReveal.tsx
│   │   │   ├── HorizontalCarousel.tsx
│   │   │   └── MasonryGrid.tsx
│   │   │
│   │   ├── audio/                 # Audio player components
│   │   │   ├── MiniPlayer.tsx
│   │   │   ├── FullAudioPlayer.tsx
│   │   │   ├── PlaybackControls.tsx
│   │   │   ├── AudioProgressBar.tsx
│   │   │   └── PlaybackSpeed.tsx
│   │   │
│   │   ├── video/                 # Video components
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── VideoCard.tsx
│   │   │   └── VideoGrid.tsx
│   │   │
│   │   ├── cards/                 # Content card components
│   │   │   ├── AudioCard.tsx
│   │   │   ├── AudioListItem.tsx
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── ArticleCompactCard.tsx
│   │   │   ├── CampaignCard.tsx
│   │   │   ├── CampaignListCard.tsx
│   │   │   ├── GalleryImageCard.tsx
│   │   │   ├── ContinueListeningCard.tsx
│   │   │   ├── TrendingCard.tsx
│   │   │   ├── ScholarCard.tsx
│   │   │   └── QuickActionButton.tsx
│   │   │
│   │   ├── auth/                  # Auth flow components
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   ├── VerifyEmailScreen.tsx
│   │   │   └── PasswordStrength.tsx
│   │   │
│   │   ├── search/                # Search components
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   ├── RecentSearches.tsx
│   │   │   └── HighlightText.tsx
│   │   │
│   │   └── notifications/         # Notification components
│   │       ├── NotificationCard.tsx
│   │       ├── NotificationPreferences.tsx
│   │       └── NotificationBadge.tsx
│   │
│   ├── views/                     # Route-level page components
│   │   ├── HomeView.tsx
│   │   ├── VideosView.tsx
│   │   ├── AudioView.tsx
│   │   ├── ArticlesView.tsx
│   │   ├── ArticleReaderView.tsx
│   │   ├── GalleryView.tsx
│   │   ├── DonationView.tsx
│   │   ├── ProfileView.tsx
│   │   ├── SavedVideosView.tsx
│   │   ├── SavedArticlesView.tsx
│   │   ├── SavedAudioView.tsx
│   │   ├── DonationHistoryView.tsx
│   │   ├── SearchView.tsx
│   │   ├── NotificationsView.tsx
│   │   └── NotFoundView.tsx
│   │
│   ├── admin/                     # Admin dashboard (lazy-loaded)
│   │   ├── AdminLayout.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── VideoManagement.tsx
│   │   ├── AudioManagement.tsx
│   │   ├── ArticleManagement.tsx
│   │   ├── GalleryManagement.tsx
│   │   ├── CategoryManagement.tsx
│   │   ├── ScholarManagement.tsx
│   │   ├── DonationManagement.tsx
│   │   ├── UserManagement.tsx
│   │   ├── NotificationSender.tsx
│   │   ├── AnalyticsDashboard.tsx
│   │   └── AdminSettings.tsx
│   │
│   ├── sections/                  # Page section components (large reusable sections)
│   │   ├── home/
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── Categories.tsx
│   │   │   ├── ContinueListening.tsx
│   │   │   ├── LatestLectures.tsx
│   │   │   ├── TrendingLectures.tsx
│   │   │   ├── RecentAudio.tsx
│   │   │   ├── FundraisingCampaign.tsx
│   │   │   ├── FeaturedArticles.tsx
│   │   │   ├── GalleryPreview.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── DailyVerse.tsx
│   │   └── donation/
│   │       ├── CampaignHero.tsx
│   │       ├── CampaignList.tsx
│   │       ├── QuickDonate.tsx
│   │       ├── DonationHistory.tsx
│   │       ├── DonationModal.tsx
│   │       └── ThankYouScreen.tsx
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useScrollReveal.ts
│   │   ├── usePullToRefresh.ts
│   │   ├── useSwipe.ts
│   │   ├── useLongPress.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useCountUp.ts
│   │   ├── useNetworkStatus.ts
│   │   ├── useAudio.ts
│   │   ├── useYouTubePlayer.ts
│   │   ├── useFCM.ts
│   │   ├── useFirestoreQuery.ts
│   │   ├── useFirestoreMutation.ts
│   │   ├── useForm.ts
│   │   ├── useDebounce.ts
│   │   └── useTheme.ts
│   │
│   ├── stores/                    # Zustand global stores
│   │   ├── authStore.ts
│   │   ├── audioStore.ts
│   │   ├── themeStore.ts
│   │   ├── notificationStore.ts
│   │   └── navigationStore.ts
│   │
│   ├── lib/                       # Utilities and configuration
│   │   ├── firebase.ts            # Firebase app initialization, auth, firestore, storage, messaging instances
│   │   ├── firebase-config.ts     # Firebase project configuration (API keys, project ID)
│   │   ├── constants.ts           # App constants (colors, breakpoints, durations, categories)
│   │   ├── utils.ts               # Helper functions (cn, formatDuration, formatViews, formatCurrency, formatDate)
│   │   └── validators.ts          # Zod schemas for form validation
│   │
│   ├── types/                     # TypeScript type definitions
│   │   ├── index.ts               # Common types (User, Timestamp, etc.)
│   │   ├── video.ts
│   │   ├── audio.ts
│   │   ├── article.ts
│   │   ├── gallery.ts
│   │   ├── campaign.ts
│   │   ├── donation.ts
│   │   ├── notification.ts
│   │   ├── scholar.ts
│   │   └── category.ts
│   │
│   ├── services/                  # Firebase data access layer
│   │   ├── authService.ts         # Login, signup, logout, password reset, email verification
│   │   ├── videoService.ts        # Video CRUD, queries, pagination
│   │   ├── audioService.ts        # Audio CRUD, queries, pagination
│   │   ├── articleService.ts      # Article CRUD, queries
│   │   ├── galleryService.ts      # Gallery CRUD, image upload
│   │   ├── campaignService.ts     # Campaign CRUD, donation recording
│   │   ├── donationService.ts     # Donation history, recording
│   │   ├── userService.ts         # User profile, favorites, listening history
│   │   ├── scholarService.ts      # Scholar CRUD
│   │   ├── categoryService.ts     # Category CRUD
│   │   ├── notificationService.ts # Notification CRUD, marking read, preferences
│   │   ├── searchService.ts       # Cross-collection search with highlighting
│   │   ├── adminService.ts        # Admin-only: user management, analytics, bulk operations
│   │   └── storageService.ts      # Firebase Storage upload/download helpers
│   │
│   ├── context/                   # React contexts (if needed beyond Zustand)
│   │   └── QueryProvider.tsx      # React Query client provider wrapper
│   │
│   └── assets/                    # Static assets imported by components
│       ├── images/
│       │   ├── logo.svg
│       │   ├── app-icon.png
│       │   ├── islamic-pattern-bg.jpg
│       │   ├── default-thumbnail.jpg
│       │   ├── empty-state.png
│       │   ├── bismillah-calligraphy.png
│       │   ├── default-avatar.png
│       │   └── ...
│       └── svg/
│           ├── islamic-frame.svg
│           ├── divider-pattern.svg
│           ├── modal-decoration.svg
│           └── loading-spinner.svg
│
├── index.html                     # HTML entry point, viewport meta, font links
├── vite.config.ts                 # Vite config with PWA plugin, build options
├── tailwind.config.js             # Tailwind theme: custom colors, fonts, breakpoints, animations
├── postcss.config.js              # PostCSS with Tailwind and autoprefixer
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.app.json              # App-specific TS config
├── tsconfig.node.json             # Node/Vite TS config
├── eslint.config.js               # ESLint configuration
└── package.json
```

---

## 11. Font Loading Strategy

Google Fonts loaded via `<link>` in `index.html` with `display=swap`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
```

Tailwind config extends `fontFamily`:
```javascript
fontFamily: {
  heading: ['Poppins', 'system-ui', 'sans-serif'],
  body: ['Inter', 'system-ui', 'sans-serif'],
  arabic: ['Amiri', 'serif'],
}
```

---

## 12. Responsive Breakpoints (Tailwind)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Tablet small
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Wide desktop
    },
  },
}
```

---

## 13. CSS Custom Properties (Theme)

Global CSS variables in `index.css` with `data-theme` attribute switching:

```css
:root {
  /* Light mode (default) */
  --bg-primary: #F9FAFB;
  --bg-secondary: #FFFFFF;
  --bg-card: rgba(255, 255, 255, 0.7);
  --bg-glass: rgba(255, 255, 255, 0.65);
  --text-primary: #111827;
  --text-secondary: #374151;
  --text-muted: #6B7280;
  --border-color: rgba(229, 231, 235, 0.6);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
  --shadow-glow: 0 0 20px rgba(16, 185, 129, 0.15);
}

[data-theme="dark"] {
  --bg-primary: #0F172A;
  --bg-secondary: #1E293B;
  --bg-card: rgba(30, 41, 59, 0.7);
  --bg-glass: rgba(15, 23, 42, 0.75);
  --text-primary: #F9FAFB;
  --text-secondary: #E5E7EB;
  --text-muted: #9CA3AF;
  --border-color: rgba(255, 255, 255, 0.08);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.2);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.3);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.4);
  --shadow-glow: 0 0 20px rgba(16, 185, 129, 0.2);
}
```

Theme switching applied via `data-theme` attribute on `<html>` element. Transition between themes: `transition: background-color 300ms, color 300ms`.
