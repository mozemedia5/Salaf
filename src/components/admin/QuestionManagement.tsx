import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Send, CheckCircle, User, MapPin, Mail } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserQuestion } from '@/types';

export function QuestionManagement() {
  const { questions, setQuestions } = useAdminStore();
  const { adminProfile } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'answered'>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<UserQuestion | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'questions'));
    const unsub = onSnapshot(q, (snap) => {
      setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserQuestion)));
    });
    return () => unsub();
  }, []);

  const filtered = questions.filter(q => {
    const matchesSearch = q.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.userName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAnswer = async () => {
    if (!selectedQuestion || !answerText.trim() || !adminProfile) return;
    setSending(true);
    try {
      await updateDoc(doc(db, 'questions', selectedQuestion.id), {
        answer: answerText.trim(),
        answeredBy: adminProfile.id,
        answeredByName: adminProfile.displayName || 'Admin',
        status: 'answered',
        answeredAt: serverTimestamp(),
      });
      setSelectedQuestion(null);
      setAnswerText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    await deleteDoc(doc(db, 'questions', id));
  };

  const pendingCount = questions.filter(q => q.status === 'pending').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Q&A Management</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {questions.length} questions &middot; <span className="text-amber-500">{pendingCount} pending</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search questions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
        </div>
        {(['all', 'pending', 'answered'] as const).map((status) => (
          <button key={status} onClick={() => setStatusFilter(status)}
            className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${statusFilter === status ? 'gradient-emerald text-white' : 'border'}`}
            style={statusFilter !== status ? { borderColor: 'var(--border-color)', color: 'var(--text-muted)' } : {}}>
            {status} {status === 'pending' && pendingCount > 0 && `(${pendingCount})`}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filtered.map((q, i) => (
          <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-emerald-500">{q.userName?.[0] || '?'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{q.userName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${q.status === 'answered' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {q.status}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(q.id)} className="p-1 text-red-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}><Mail className="w-3 h-3" />{q.userEmail}</span>
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}><MapPin className="w-3 h-3" />{q.userResidence}</span>
                </div>
                <p className="text-sm mt-2" style={{ color: 'var(--text-primary)' }}>{q.question}</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{new Date(q.createdAt).toLocaleDateString()}</p>

                {q.status === 'answered' && q.answer && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-medium text-emerald-600">Answered by {q.answeredByName}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{q.answer}</p>
                  </div>
                )}

                {q.status === 'pending' && (
                  <button onClick={() => { setSelectedQuestion(q); setAnswerText(''); }}
                    className="mt-3 flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-600 font-medium">
                    <Send className="w-3.5 h-3.5" /> Answer this question
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Answer Modal */}
      {selectedQuestion && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedQuestion(null)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[500px] rounded-3xl p-6" style={{ background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold" style={{ color: 'var(--text-primary)' }}>Answer Question</h3>
              <button onClick={() => setSelectedQuestion(null)} className="p-1"><X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /></button>
            </div>
            <div className="p-3 rounded-xl mb-4" style={{ background: 'var(--bg-primary)' }}>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{selectedQuestion.userName}</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedQuestion.question}</p>
            </div>
            <textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="Write your answer..." rows={6}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-emerald-500 resize-none"
              style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
            <button onClick={handleAnswer} disabled={sending || !answerText.trim()}
              className="w-full mt-3 h-12 rounded-xl gradient-emerald text-white font-semibold shadow-glow disabled:opacity-50 flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Answer'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
