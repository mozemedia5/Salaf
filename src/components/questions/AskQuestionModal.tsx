import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, User, MapPin, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuestionStore } from '@/stores/questionStore';
import { useActivityStore } from '@/stores/activityStore';
import { useNavigationStore } from '@/stores/navigationStore';

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = ['Aqeedah', 'Fiqh', 'Hadith', 'Quran', 'Seerah', 'Dua', 'General'];

export function AskQuestionModal({ isOpen, onClose }: AskQuestionModalProps) {
  const { user } = useAuth();
  const { askQuestion } = useQuestionStore();
  const { logQuestionAsked } = useActivityStore();
  const { openAuthModal } = useNavigationStore();
  const [formData, setFormData] = useState({
    userName: user?.displayName || '',
    userEmail: user?.email || '',
    userResidence: '',
    userPhone: '',
    question: '',
    category: 'General',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!formData.question.trim() || !formData.userName || !formData.userEmail || !formData.userResidence) return;
    if (!user) {
      openAuthModal('login');
      return;
    }
    setSubmitting(true);
    try {
      const questionData = {
        userId: user.uid,
        userName: formData.userName,
        userEmail: formData.userEmail,
        userResidence: formData.userResidence,
        userPhone: formData.userPhone,
        question: formData.question.trim(),
        category: formData.category,
        isPublic: true,
      };
      await askQuestion(questionData);
      await logQuestionAsked(user.uid, Date.now().toString(), formData.question.trim());
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6"
            style={{ background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-lg)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-bold" style={{ color: 'var(--text-primary)' }}>Ask a Question</h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Our scholars will answer</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto">
                  <Send className="w-8 h-8 text-emerald-500" />
                </div>
                <h4 className="font-heading font-bold text-lg mt-4" style={{ color: 'var(--text-primary)' }}>Question Submitted!</h4>
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                  Your question has been sent to our scholars. You'll be notified when it's answered.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 py-2.5 px-8 rounded-xl gradient-emerald text-white font-semibold text-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <User className="w-3 h-3" /> Your Name *
                  </label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    placeholder="Full name"
                    className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Mail className="w-3 h-3" /> Email *
                  </label>
                  <input
                    type="email"
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <MapPin className="w-3 h-3" /> Residence / Location *
                  </label>
                  <input
                    type="text"
                    value={formData.userResidence}
                    onChange={(e) => setFormData({ ...formData, userResidence: e.target.value })}
                    placeholder="City, Country"
                    className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Phone className="w-3 h-3" /> Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.userPhone}
                    onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
                    placeholder="Phone number"
                    className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <MessageCircle className="w-3 h-3" /> Your Question *
                  </label>
                  <textarea
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="Type your question here..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-emerald-500 resize-none"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !formData.question.trim() || !formData.userName || !formData.userEmail || !formData.userResidence}
                  className="w-full h-12 rounded-xl gradient-emerald text-white font-semibold shadow-glow disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Submitting...' : 'Submit Question'}
                </button>

                {!user && (
                  <p className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
                    You'll need to sign in before submitting.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
