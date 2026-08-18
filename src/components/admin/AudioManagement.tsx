import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Headphones, Search, X, Link } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { ThumbnailPicker } from "@/components/ui-custom/ThumbnailPicker";
import { AudioUploadField } from "@/components/ui-custom/AudioUploadField";
import { collection, query, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AudioTrack } from "@/types";

const CATEGORIES = ["Quran", "Hadith", "Fiqh", "Khutbah", "Dua", "Nasheed", "Series"];

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const totalSeconds = Math.round(seconds);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const paddedSeconds = s.toString().padStart(2, "0");
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${paddedSeconds}`;
  return `${m}:${paddedSeconds}`;
}

export function AudioManagement() {
  const { isSuperAdmin, user: currentUser } = useAdminAuth();
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState<AudioTrack | null>(null);
  const [audioUrlInput, setAudioUrlInput] = useState("");

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    audioURL: string;
    audioUrl: string;
    audioDurationSeconds: number;
    thumbnailURL: string;
    scholarName: string;
    category: string;
    duration: string;
    isActive: boolean;
  }>({
    title: "",
    description: "",
    audioURL: "",
    audioUrl: "",
    audioDurationSeconds: 0,
    thumbnailURL: "",
    scholarName: "",
    category: "Quran",
    duration: "0:00",
    isActive: true,
  });

  const [saving, setSaving] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "audio"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AudioTrack));
      data.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setAudioTracks(data);
    }, (err) => {
      console.error("Firestore Audio listening error:", err);
    });
    return () => unsub();
  }, []);

  const visibleTracks = audioTracks.filter((track) => {
    if (isSuperAdmin) return true;
    return track.uploadedBy === currentUser?.uid || track.createdBy === currentUser?.uid;
  });

  const filteredTracks = visibleTracks.filter((track) =>
    track.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.scholarName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async () => {
    // Allow save if we have a title and any audio URL (uploaded or manually entered)
    const effectiveAudioUrl = formData.audioURL || audioUrlInput.trim();
    if (!formData.title || !effectiveAudioUrl) return;

    setSaving(true);
    try {
      const data: any = {
        ...formData,
        audioURL: effectiveAudioUrl,
        audioUrl: effectiveAudioUrl,
        playCount: editingTrack?.playCount || "0",
        scholarId: editingTrack?.scholarId || "s1",
        updatedAt: serverTimestamp(),
        uploadedBy: editingTrack?.uploadedBy || currentUser?.uid,
        createdBy: editingTrack?.createdBy || currentUser?.uid,
      };
      if (!editingTrack) {
        data.createdAt = serverTimestamp();
      }

      if (editingTrack) {
        await updateDoc(doc(db, "audio", editingTrack.id), data);
      } else {
        await addDoc(collection(db, "audio"), data);
      }

      setShowModal(false);
      setEditingTrack(null);
      resetForm();
    } catch (err) {
      console.error("Error saving audio track:", err);
      alert("Failed to save. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (track: AudioTrack) => {
    const allowed = isSuperAdmin || track.uploadedBy === currentUser?.uid || track.createdBy === currentUser?.uid;
    if (!allowed) {
      alert("You are not authorized to delete this track.");
      return;
    }
    if (!confirm("Are you sure you want to delete this audio track?")) return;
    await deleteDoc(doc(db, "audio", track.id));
  };

  const handleToggleActive = async (track: AudioTrack) => {
    await updateDoc(doc(db, "audio", track.id), {
      isActive: track.isActive === false,
      updatedAt: serverTimestamp(),
    });
  };

  const openEditModal = (track: AudioTrack) => {
    setEditingTrack(track);
    setFormData({
      title: track.title || "",
      description: track.description || "",
      audioURL: track.audioURL || track.audioUrl || "",
      audioUrl: track.audioUrl || track.audioURL || "",
      audioDurationSeconds: track.audioDurationSeconds || 0,
      thumbnailURL: track.thumbnailURL || "",
      scholarName: track.scholarName || "",
      category: track.category || "Quran",
      duration: track.duration || "0:00",
      isActive: track.isActive !== false,
    });
    setAudioUrlInput("");
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      audioURL: "",
      audioUrl: "",
      audioDurationSeconds: 0,
      thumbnailURL: "",
      scholarName: "",
      category: "Quran",
      duration: "0:00",
      isActive: true,
    });
    setAudioUrlInput("");
  };

  const hasAudio = !!(formData.audioURL || audioUrlInput.trim());

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: "var(--text-primary)" }}>Audio Management</h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {filteredTracks.length} tracks {isSuperAdmin ? "(Super Admin view)" : "(Own uploads only)"}
          </p>
        </div>
        <button
          onClick={() => { setEditingTrack(null); resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-emerald text-white text-sm font-semibold shadow-glow hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Audio Track
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          placeholder="Search audio tracks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
        />
      </div>

      {/* Audios List */}
      <div className="space-y-3">
        {filteredTracks.map((track, i) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-4 rounded-2xl flex items-start gap-4"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
          >
            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {track.thumbnailURL ? (
                <img src={track.thumbnailURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <Headphones className="w-6 h-6 text-emerald-500" />
              )}
              <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[8px] px-1 rounded">
                {track.duration}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{track.title}</h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{track.scholarName} &middot; {track.category}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEditModal(track)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                    <Pencil className="w-3.5 h-3.5 text-emerald-500" />
                  </button>
                  <button onClick={() => handleDelete(track)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Plays: {track.playCount || 0}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  track.isActive !== false ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                }`}>
                  {track.isActive !== false ? "Active" : "Inactive"}
                </span>
                <button onClick={() => handleToggleActive(track)} className="text-[10px] text-emerald-500 hover:text-emerald-600 font-medium ml-auto">
                  {track.isActive !== false ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredTracks.length === 0 && (
          <div className="text-center py-10" style={{ color: "var(--text-muted)" }}>
            No audio tracks found. Click "Add Audio Track" to add one!
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-3xl p-6"
            style={{ background: "var(--bg-secondary)", boxShadow: "var(--shadow-lg)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                {editingTrack ? "Edit Audio Track" : "Add New Audio Track"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1">
                <X className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Audio track title"
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: "var(--bg-primary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the audio content"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-emerald-500 resize-none"
                  style={{ background: "var(--bg-primary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>Scholar Name</label>
                  <input
                    type="text"
                    value={formData.scholarName}
                    onChange={(e) => setFormData({ ...formData, scholarName: e.target.value })}
                    placeholder="Scholar or Speaker"
                    className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                    style={{ background: "var(--bg-primary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                    style={{ background: "var(--bg-primary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Thumbnail picker — 30+ Islamic images */}
              <ThumbnailPicker
                value={formData.thumbnailURL}
                onChange={(url) => setFormData({ ...formData, thumbnailURL: url })}
                label="Display Photo (Thumbnail)"
                type="audio"
              />

              {/* Audio Upload */}
              <div>
                <AudioUploadField
                  folder="salaf/audio"
                  uploadPreset={import.meta.env.VITE_CLOUDINARY_AUDIO_UPLOAD_PRESET || "salaf_audio"}
                  accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a"
                  label="Upload Audio Lecture (.mp3, .wav, .m4a) *"
                  currentAudioUrl={formData.audioURL}
                  onUploaded={(url, durationSeconds) => {
                    setFormData({
                      ...formData,
                      audioURL: url,
                      audioUrl: url,
                      audioDurationSeconds: durationSeconds,
                      duration: formatDuration(durationSeconds)
                    });
                    setAudioUrlInput("");
                  }}
                  onUploadStateChange={setUploadingAudio}
                />
              </div>

              {/* Fallback: paste audio URL directly */}
              {!formData.audioURL && (
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-muted)" }}>
                    — or paste audio URL directly *
                  </label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                    <input
                      type="text"
                      value={audioUrlInput}
                      onChange={(e) => setAudioUrlInput(e.target.value)}
                      placeholder="https://... (CDN or direct audio URL)"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                      style={{ background: "var(--bg-primary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded accent-emerald-500"
                />
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>Active & visible on Audio tab</span>
              </div>

              <button
                onClick={handleSave}
                disabled={saving || uploadingAudio || !formData.title || !hasAudio}
                className="w-full h-12 rounded-xl gradient-emerald text-white font-semibold shadow-glow disabled:opacity-50 transition-all"
              >
                {saving ? "Saving..." : editingTrack ? "Update Audio Track" : "Add Audio Track"}
              </button>

              {!hasAudio && formData.title && (
                <p className="text-center text-xs text-amber-500">
                  ⚠ Upload an audio file or paste a URL above to enable saving.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
