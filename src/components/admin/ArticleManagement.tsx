import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, X, Tag, Link2, BookOpen } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { collection, query, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Article } from '@/types';

const CATEGORIES = ['Quran', 'Hadith', 'Fiqh', 'Seerah', 'Aqeedah', 'Dua', 'Ramadan', 'Youth', 'Sisters'];

export function ArticleManagement() {
  const { articles, setArticles } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [formData, setFormData] = useState({
    title: '', excerpt: '', content: '', featuredImageURL: '', authorName: '', category: 'Quran', readingTime: '', tags: [] as string[], evidences: [] as string[], links: [] as { title: string; url: string }[], isActive: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'articles'));
    const unsub = onSnapshot(q, (snap) => {
      setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() } as Article)));
    });
    return () => unsub();
  }, []);

  const filtered = articles.filter(a =>
    a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async () => {
    if (!formData.title || !formData.content) return;
    setSaving(true);
    try {
      const data = { ...formData, updatedAt: serverTimestamp(), createdAt: editingArticle ? undefined : serverTimestamp() };
      if (editingArticle) {
        await updateDoc(doc(db, 'articles', editingArticle.id), data);
      } else {
        await addDoc(collection(db, 'articles'), data);
      }
      setShowModal(false);
      setEditingArticle(null);
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    await deleteDoc(doc(db, 'articles', id));
  };

  const resetForm = () => {
    setFormData({ title: '', excerpt: '', content: '', featuredImageURL: '', authorName: '', category: 'Quran', readingTime: '', tags: [], evidences: [], links: [], isActive: true });
    setTagInput('');
    setLinkTitle('');
    setLinkUrl('');
  };

  const openEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title || '', excerpt: article.excerpt || '', content: article.content || '',
      featuredImageURL: article.featuredImageURL || '', authorName: article.authorName || '',
      category: article.category || 'Quran', readingTime: article.readingTime || '',
      tags: article.tags || [], evidences: article.evidences || [], links: article.links || [],
      isActive: article.isActive !== false,
    });
    setShowModal(true);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const addLink = () => {
    if (linkTitle.trim() && linkUrl.trim()) {
      setFormData({ ...formData, links: [...formData.links, { title: linkTitle.trim(), url: linkUrl.trim() }] });
      setLinkTitle('');
      setLinkUrl('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Article Management</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{filtered.length} articles</p>
        </div>
        <button onClick={() => { setEditingArticle(null); resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-emerald text-white text-sm font-semibold shadow-glow">
          <Plus className="w-4 h-4" /> Add Article
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search articles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
      </div>

      <div className="space-y-3">
        {filtered.map((article, i) => (
          <motion.div key={article.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{article.title}</h3>
                </div>
                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{article.excerpt}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 font-medium">{article.category}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{article.authorName}</span>
                  {article.tags?.map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 font-medium flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />{t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(article)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"><Pencil className="w-3.5 h-3.5 text-emerald-500" /></button>
                <button onClick={() => handleDelete(article.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl p-6" style={{ background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{editingArticle ? 'Edit Article' : 'Add Article'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1"><X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /></button>
            </div>
            <div className="space-y-4">
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Article title *"
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} placeholder="Short excerpt" rows={2}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-emerald-500 resize-none"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Article content (HTML supported) *" rows={8}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-emerald-500 resize-none font-mono"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={formData.authorName} onChange={(e) => setFormData({ ...formData, authorName: e.target.value })} placeholder="Author name"
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={formData.readingTime} onChange={(e) => setFormData({ ...formData, readingTime: e.target.value })} placeholder="Reading time (e.g., 5 min)"
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <input type="text" value={formData.featuredImageURL} onChange={(e) => setFormData({ ...formData, featuredImageURL: e.target.value })} placeholder="Featured image URL"
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Tags</label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {formData.tags.map((t) => (
                    <span key={t} className="text-xs px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center gap-1">
                      {t} <button onClick={() => setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== t) })}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add tag..."
                    className="flex-1 h-9 px-3 rounded-lg border text-sm outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                  <button onClick={addTag} className="px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 text-sm font-medium">Add</button>
                </div>
              </div>

              {/* Links */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Reference Links</label>
                <div className="space-y-2 mb-2">
                  {formData.links.map((l, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Link2 className="w-3 h-3 text-emerald-500" />
                      <span className="flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{l.title}</span>
                      <button onClick={() => setFormData({ ...formData, links: formData.links.filter((_, idx) => idx !== i) })}><X className="w-3 h-3 text-red-500" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} placeholder="Link title"
                    className="flex-1 h-9 px-3 rounded-lg border text-sm outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                  <input type="text" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="URL"
                    className="flex-1 h-9 px-3 rounded-lg border text-sm outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                  <button onClick={addLink} className="px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 text-sm font-medium">Add</button>
                </div>
              </div>

              <button onClick={handleSave} disabled={saving || !formData.title || !formData.content}
                className="w-full h-12 rounded-xl gradient-emerald text-white font-semibold shadow-glow disabled:opacity-50">
                {saving ? 'Saving...' : editingArticle ? 'Update Article' : 'Add Article'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
