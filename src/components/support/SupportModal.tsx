import { useState } from 'react';
import { Mail, MessageCircle, X } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORT_EMAIL = 'infoliverton@gmail.com';
const WHATSAPP_NUMBER = '25691756647';

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('Salaf Help & Support');

  if (!isOpen) return null;

  const encodedMessage = encodeURIComponent(message.trim());
  const encodedSubject = encodeURIComponent(subject.trim() || 'Salaf Help & Support');

  const sendEmail = () => {
    if (!message.trim()) return;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodedSubject}&body=${encodedMessage}`;
  };

  const sendWhatsApp = () => {
    if (!message.trim()) return;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-dialog-title"
        className="w-full max-w-md rounded-3xl p-6 shadow-2xl"
        style={{ background: 'var(--bg-secondary)' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 id="support-dialog-title" className="font-heading text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Help & Support</h2>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Write your message and choose how to send it.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close support dialog" className="rounded-full p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
            <X className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <label className="mt-5 block text-xs font-semibold" style={{ color: 'var(--text-primary)' }} htmlFor="support-subject">Subject</label>
        <input id="support-subject" value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-emerald-500" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />

        <label className="mt-4 block text-xs font-semibold" style={{ color: 'var(--text-primary)' }} htmlFor="support-message">Message</label>
        <textarea id="support-message" value={message} onChange={(event) => setMessage(event.target.value)} rows={5} placeholder="Tell us how we can help..." className="mt-1 w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-emerald-500" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />

        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="button" disabled={!message.trim()} onClick={sendEmail} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
            <Mail className="h-4 w-4" /> Send by Email
          </button>
          <button type="button" disabled={!message.trim()} onClick={sendWhatsApp} className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
            <MessageCircle className="h-4 w-4" /> Send by WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
