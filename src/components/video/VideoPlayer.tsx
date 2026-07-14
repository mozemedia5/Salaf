import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, MessageCircle, Share2, Bookmark, ThumbsUp } from 'lucide-react';
import { useVideoStore } from '@/stores/videoStore';
import { useAuth } from '@/hooks/useAuth';
import { useNavigationStore } from '@/stores/navigationStore';
import { useActivityStore } from '@/stores/activityStore';
import { collection, query, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import type { Video, VideoReview } from '@/types';

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
}

export function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const { user } = useAuth();
  const { navigateTo } = useNavigationStore();
  const { incrementViews, toggleLike, saveVideo, removeSavedVideo, isVideoSaved } = useVideoStore();
  const { logVideoWatched } = useActivityStore();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [reviews, setReviews] = useState<VideoReview[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes || 0);
  const viewLogged = useRef(false);

  // Check if liked
  useEffect(() => {
    if (!user) return;
    const checkLike = async () => {
      const likeDoc = await getDoc(doc(db, 'video_likes', `${video.id}_${user.uid}`));
      setIsLiked(likeDoc.exists());
    };
    checkLike();
    setIsSaved(isVideoSaved(video.id));
  }, [user, video.id]);

  // Fetch reviews
  useEffect(() => {
    const q = query(collection(db, 'video_reviews'));
    const unsub = onSnapshot(q, (snap) => {
      const allReviews = snap.docs.map(d => ({ id: d.id, ...d.data() } as VideoReview));
      setReviews(allReviews.filter(r => r.videoId === video.id));
    });
    return () => unsub();
  }, [video.id]);

  // Log view
  useEffect(() => {
    if (!viewLogged.current) {
      incrementViews(video.id);
      viewLogged.current = true;
      if (user) {
        logVideoWatched(user.uid, video.id, video.title);
      }
    }
  }, [video.id]);

  const handleLike = async () => {
    if (!user) {
      navigateTo('profile');
      return;
    }
    const liked = await toggleLike(video.id, user.uid);
    setIsLiked(liked);
    setLikeCount(prev => liked ? prev + 1 : prev - 1);
  };

  const handleSave = async () => {
    if (!user) {
      navigateTo('profile');
      return;
    }
    if (isSaved) {
      await removeSavedVideo(user.uid, video.id);
      setIsSaved(false);
    } else {
      await saveVideo(user.uid, video);
      setIsSaved(true);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !reviewText.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'video_reviews'), {
        videoId: video.id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhotoURL: user.photoURL || '',
        rating: reviewRating,
        comment: reviewText.trim(),
        createdAt: serverTimestamp(),
      });
      setReviewText('');
      setReviewRating(5);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: video.title,
        text: `Watch "${video.title}" by ${video.scholarName}`,
      });
    }
  };

  const getEmbedUrl = () => {
    if (video.videoType === 'youtube' && video.youtubeId) {
      return `https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1`;
    }
    if (video.videoType === 'tiktok' && video.tiktokId) {
      return `https://www.tiktok.com/embed/${video.tiktokId}`;
    }
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex flex-col"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 glass-header">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
          <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
        </button>
        <h2 className="font-semibold text-sm truncate flex-1 mx-4" style={{ color: 'var(--text-primary)' }}>{video.title}</h2>
        <div className="w-8" />
      </div>

      {/* Video Player */}
      <div className="w-full aspect-video bg-black flex-shrink-0">
        {getEmbedUrl() ? (
          <iframe
            src={getEmbedUrl()}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-white/60 text-sm">Video unavailable</p>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h1 className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{video.title}</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{video.scholarName} &middot; {video.category} &middot; {video.duration}</p>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleLike}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                isLiked ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              )}
            >
              <Heart className={cn('w-4 h-4', isLiked && 'fill-red-500')} />
              {likeCount}
            </button>
            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              <MessageCircle className="w-4 h-4" />
              {reviews.length}
            </button>
            <button
              onClick={handleSave}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                isSaved ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              )}
            >
              <Bookmark className={cn('w-4 h-4', isSaved && 'fill-emerald-500')} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          {video.description && (
            <p className="text-sm mt-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{video.description}</p>
          )}

          {/* Reviews Section */}
          <div className="mt-6">
            <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Reviews ({reviews.length})</h3>

            {/* Add Review */}
            {user && (
              <div className="p-3 rounded-xl mb-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setReviewRating(star)}>
                      <ThumbsUp className={cn('w-4 h-4', star <= reviewRating ? 'text-amber-500' : 'text-gray-300')} />
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Write a review..."
                    className="flex-1 h-9 px-3 rounded-lg border text-sm outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitReview()}
                  />
                  <button
                    onClick={handleSubmitReview}
                    disabled={submitting || !reviewText.trim()}
                    className="px-3 py-1 rounded-lg gradient-emerald text-white text-sm font-medium disabled:opacity-50"
                  >
                    {submitting ? '...' : 'Post'}
                  </button>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-emerald-500">{review.userName[0]}</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{review.userName}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <ThumbsUp key={i} className="w-3 h-3 text-amber-500" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>{review.comment}</p>
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
