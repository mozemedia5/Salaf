import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, CheckCircle, Clock, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuestionStore } from '@/stores/questionStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { AskQuestionModal } from '@/components/questions/AskQuestionModal';

export function UserQuestionsView() {
  const { user } = useAuth();
  const { goBack } = useNavigationStore();
  const { userQuestions, fetchUserQuestions, cleanup } = useQuestionStore();
  const [showAskModal, setShowAskModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all');

  useEffect(() => {
    if (user) {
      fetchUserQuestions(user.uid);
    }
    return () => cleanup();
  }, [user]);

  const filtered = userQuestions.filter(q => {
    if (filter === 'pending') return q.status === 'pending';
    if (filter === 'answered') return q.status === 'answered';
    return true;
  });

  const pendingCount = userQuestions.filter(q => q.status === 'pending').length;
  const answeredCount = userQuestions.filter(q => q.status === 'answered').length;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="sticky top-14 z-[100] glass-header px-4 py-3 flex items-center gap-3">
        <button onClick={goBack} className="p-2 -ml-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
          <ChevronLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
        </button>
        <h1 className="font-heading font-semibold" style={{ color: 'var(--text-primary)' }}>My Questions</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Ask Button */}
        <button
          onClick={() => setShowAskModal(true)}
          className="w-full py-3 rounded-xl gradient-emerald text-white font-semibold flex items-center justify-center gap-2 shadow-glow"
        >
          <MessageCircle className="w-4 h-4" />
          Ask a New Question
        </button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => setFilter('all')} className={`p-3 rounded-xl text-center transition-all ${filter === 'all' ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200' : ''}`} style={{ background: filter !== 'all' ? 'var(--bg-secondary)' : undefined, border: filter !== 'all' ? '1px solid var(--border-color)' : undefined }}>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{userQuestions.length}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>All</p>
          </button>
          <button onClick={() => setFilter('pending')} className={`p-3 rounded-xl text-center transition-all ${filter === 'pending' ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200' : ''}`} style={{ background: filter !== 'pending' ? 'var(--bg-secondary)' : undefined, border: filter !== 'pending' ? '1px solid var(--border-color)' : undefined }}>
            <p className="text-lg font-bold text-amber-500">{pendingCount}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Pending</p>
          </button>
          <button onClick={() => setFilter('answered')} className={`p-3 rounded-xl text-center transition-all ${filter === 'answered' ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200' : ''}`} style={{ background: filter !== 'answered' ? 'var(--bg-secondary)' : undefined, border: filter !== 'answered' ? '1px solid var(--border-color)' : undefined }}>
            <p className="text-lg font-bold text-emerald-500">{answeredCount}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Answered</p>
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 mx-auto" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
                {filter === 'all' ? 'No questions yet. Ask your first!' : `No ${filter} questions.`}
              </p>
            </div>
          )}
          {filtered.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-2xl"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                  q.status === 'answered' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {q.status === 'answered' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {q.status}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{q.category}</span>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{q.question}</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Asked on {new Date(q.createdAt).toLocaleDateString()}
              </p>

              {q.status === 'answered' && q.answer && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10">
                  <p className="text-[10px] font-medium text-emerald-600 mb-1">Answer from {q.answeredByName || 'Scholar'}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{q.answer}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <AskQuestionModal isOpen={showAskModal} onClose={() => setShowAskModal(false)} />
    </div>
  );
}
