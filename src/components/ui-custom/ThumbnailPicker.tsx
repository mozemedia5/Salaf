import { useState } from 'react';
import { Upload, Check, ChevronDown, ChevronUp } from 'lucide-react';

// 32 stable Islamic-content images via Unsplash source (sig keeps them consistent)
const AUDIO_THUMBNAILS = [
  { url: 'https://source.unsplash.com/random/300x200/?quran&sig=1',       label: 'Quran 1' },
  { url: 'https://source.unsplash.com/random/300x200/?quran&sig=2',       label: 'Quran 2' },
  { url: 'https://source.unsplash.com/random/300x200/?quran&sig=3',       label: 'Quran 3' },
  { url: 'https://source.unsplash.com/random/300x200/?mosque&sig=4',      label: 'Mosque 1' },
  { url: 'https://source.unsplash.com/random/300x200/?mosque&sig=5',      label: 'Mosque 2' },
  { url: 'https://source.unsplash.com/random/300x200/?mosque&sig=6',      label: 'Mosque 3' },
  { url: 'https://source.unsplash.com/random/300x200/?mecca&sig=7',       label: 'Mecca 1' },
  { url: 'https://source.unsplash.com/random/300x200/?mecca&sig=8',       label: 'Mecca 2' },
  { url: 'https://source.unsplash.com/random/300x200/?madinah&sig=9',     label: 'Madinah 1' },
  { url: 'https://source.unsplash.com/random/300x200/?madinah&sig=10',    label: 'Madinah 2' },
  { url: 'https://source.unsplash.com/random/300x200/?calligraphy&sig=11', label: 'Calligraphy 1' },
  { url: 'https://source.unsplash.com/random/300x200/?calligraphy&sig=12', label: 'Calligraphy 2' },
  { url: 'https://source.unsplash.com/random/300x200/?calligraphy&sig=13', label: 'Calligraphy 3' },
  { url: 'https://source.unsplash.com/random/300x200/?arabic&sig=14',     label: 'Arabic Art 1' },
  { url: 'https://source.unsplash.com/random/300x200/?arabic&sig=15',     label: 'Arabic Art 2' },
  { url: 'https://source.unsplash.com/random/300x200/?prayer&sig=16',     label: 'Prayer 1' },
  { url: 'https://source.unsplash.com/random/300x200/?prayer&sig=17',     label: 'Prayer 2' },
  { url: 'https://source.unsplash.com/random/300x200/?prayer&sig=18',     label: 'Prayer 3' },
  { url: 'https://source.unsplash.com/random/300x200/?islamic&sig=19',    label: 'Islamic 1' },
  { url: 'https://source.unsplash.com/random/300x200/?islamic&sig=20',    label: 'Islamic 2' },
  { url: 'https://source.unsplash.com/random/300x200/?islamic,art&sig=21', label: 'Islamic Art 1' },
  { url: 'https://source.unsplash.com/random/300x200/?islamic,art&sig=22', label: 'Islamic Art 2' },
  { url: 'https://source.unsplash.com/random/300x200/?masjid&sig=23',     label: 'Masjid 1' },
  { url: 'https://source.unsplash.com/random/300x200/?masjid&sig=24',     label: 'Masjid 2' },
  { url: 'https://source.unsplash.com/random/300x200/?minaret&sig=25',    label: 'Minaret 1' },
  { url: 'https://source.unsplash.com/random/300x200/?minaret&sig=26',    label: 'Minaret 2' },
  { url: 'https://source.unsplash.com/random/300x200/?dome,mosque&sig=27', label: 'Dome 1' },
  { url: 'https://source.unsplash.com/random/300x200/?dome,mosque&sig=28', label: 'Dome 2' },
  { url: 'https://source.unsplash.com/random/300x200/?ramadan&sig=29',    label: 'Ramadan 1' },
  { url: 'https://source.unsplash.com/random/300x200/?ramadan&sig=30',    label: 'Ramadan 2' },
  { url: 'https://source.unsplash.com/random/300x200/?crescent&sig=31',   label: 'Crescent' },
  { url: 'https://source.unsplash.com/random/300x200/?scholar,book&sig=32', label: 'Scholar' },
];

const VIDEO_THUMBNAILS = [
  { url: 'https://source.unsplash.com/random/300x200/?mosque&sig=101',    label: 'Mosque 1' },
  { url: 'https://source.unsplash.com/random/300x200/?mosque&sig=102',    label: 'Mosque 2' },
  { url: 'https://source.unsplash.com/random/300x200/?mosque&sig=103',    label: 'Mosque 3' },
  { url: 'https://source.unsplash.com/random/300x200/?mosque&sig=104',    label: 'Mosque 4' },
  { url: 'https://source.unsplash.com/random/300x200/?mecca&sig=105',     label: 'Mecca 1' },
  { url: 'https://source.unsplash.com/random/300x200/?mecca&sig=106',     label: 'Mecca 2' },
  { url: 'https://source.unsplash.com/random/300x200/?kaaba&sig=107',     label: 'Kaaba 1' },
  { url: 'https://source.unsplash.com/random/300x200/?kaaba&sig=108',     label: 'Kaaba 2' },
  { url: 'https://source.unsplash.com/random/300x200/?madinah&sig=109',   label: 'Madinah 1' },
  { url: 'https://source.unsplash.com/random/300x200/?madinah&sig=110',   label: 'Madinah 2' },
  { url: 'https://source.unsplash.com/random/300x200/?quran&sig=111',     label: 'Quran 1' },
  { url: 'https://source.unsplash.com/random/300x200/?quran&sig=112',     label: 'Quran 2' },
  { url: 'https://source.unsplash.com/random/300x200/?calligraphy&sig=113', label: 'Calligraphy 1' },
  { url: 'https://source.unsplash.com/random/300x200/?calligraphy&sig=114', label: 'Calligraphy 2' },
  { url: 'https://source.unsplash.com/random/300x200/?calligraphy&sig=115', label: 'Calligraphy 3' },
  { url: 'https://source.unsplash.com/random/300x200/?prayer,islam&sig=116', label: 'Prayer 1' },
  { url: 'https://source.unsplash.com/random/300x200/?prayer,islam&sig=117', label: 'Prayer 2' },
  { url: 'https://source.unsplash.com/random/300x200/?prayer,islam&sig=118', label: 'Prayer 3' },
  { url: 'https://source.unsplash.com/random/300x200/?islamic,architecture&sig=119', label: 'Architecture 1' },
  { url: 'https://source.unsplash.com/random/300x200/?islamic,architecture&sig=120', label: 'Architecture 2' },
  { url: 'https://source.unsplash.com/random/300x200/?islamic,art&sig=121', label: 'Islamic Art 1' },
  { url: 'https://source.unsplash.com/random/300x200/?islamic,art&sig=122', label: 'Islamic Art 2' },
  { url: 'https://source.unsplash.com/random/300x200/?minaret&sig=123',   label: 'Minaret 1' },
  { url: 'https://source.unsplash.com/random/300x200/?minaret&sig=124',   label: 'Minaret 2' },
  { url: 'https://source.unsplash.com/random/300x200/?dome,islam&sig=125', label: 'Dome 1' },
  { url: 'https://source.unsplash.com/random/300x200/?dome,islam&sig=126', label: 'Dome 2' },
  { url: 'https://source.unsplash.com/random/300x200/?ramadan&sig=127',   label: 'Ramadan' },
  { url: 'https://source.unsplash.com/random/300x200/?crescent,moon&sig=128', label: 'Crescent' },
  { url: 'https://source.unsplash.com/random/300x200/?masjid&sig=129',    label: 'Masjid 1' },
  { url: 'https://source.unsplash.com/random/300x200/?masjid&sig=130',    label: 'Masjid 2' },
  { url: 'https://source.unsplash.com/random/300x200/?arabic,pattern&sig=131', label: 'Pattern 1' },
  { url: 'https://source.unsplash.com/random/300x200/?arabic,pattern&sig=132', label: 'Pattern 2' },
];

interface ThumbnailPickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  type?: 'audio' | 'video';
  onUploadStateChange?: (uploading: boolean) => void;
}

export function ThumbnailPicker({ value, onChange, label = 'Thumbnail', type = 'audio', onUploadStateChange }: ThumbnailPickerProps) {
  const [showGrid, setShowGrid] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const presets = type === 'video' ? VIDEO_THUMBNAILS : AUDIO_THUMBNAILS;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    onUploadStateChange?.(true);
    const local = URL.createObjectURL(file);
    onChange(local);
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'manhaji-salaf';
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', 'salaf_thumbnails');
      fd.append('folder', 'salaf/thumbnails');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data.secure_url) onChange(data.secure_url);
      }
    } catch {
      // keep local blob URL as fallback
    } finally {
      setUploading(false);
      onUploadStateChange?.(false);
    }
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold block" style={{ color: 'var(--text-muted)' }}>{label}</label>

      {/* Current selection preview */}
      {value ? (
        <div className="relative h-32 rounded-xl overflow-hidden border-2 border-emerald-500">
          <img src={value} alt="thumbnail" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
            <button type="button" onClick={() => { onChange(''); setShowGrid(true); }}
              className="px-3 py-1.5 rounded-lg bg-white/90 text-xs font-semibold text-gray-800">Change</button>
          </div>
          <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-0.5">
            <Check className="w-3 h-3 text-white" />
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setShowGrid(v => !v)}
          className="w-full h-20 rounded-xl border-2 border-dashed border-emerald-400/60 flex items-center justify-center gap-2 hover:border-emerald-500 transition-colors"
          style={{ background: 'var(--bg-primary)' }}>
          <Upload className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-600">Pick a thumbnail</span>
        </button>
      )}

      {/* Toggle grid */}
      <button type="button" onClick={() => setShowGrid(v => !v)}
        className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
        {showGrid ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {showGrid ? 'Hide' : 'Show'} Islamic image gallery ({presets.length} images)
      </button>

      {showGrid && (
        <div className="space-y-3 border rounded-2xl p-3" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
          {/* Grid of presets */}
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Islamic content library</p>
          <div className="grid grid-cols-4 gap-1.5 max-h-64 overflow-y-auto">
            {presets.map((img, i) => (
              <button key={i} type="button" onClick={() => { onChange(img.url); setShowGrid(false); }}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${value === img.url ? 'border-emerald-500 scale-95' : 'border-transparent hover:border-emerald-400'}`}>
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" loading="lazy" />
                {value === img.url && (
                  <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white drop-shadow" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Upload custom */}
          <div className="pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Or upload / paste URL</p>
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer">
                <div className="h-9 px-3 rounded-lg border border-dashed flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:border-emerald-500 transition-colors"
                  style={{ borderColor: 'var(--border-color)' }}>
                  <Upload className="w-3.5 h-3.5" />
                  {uploading ? 'Uploading...' : 'Upload file'}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
            <div className="flex gap-2 mt-2">
              <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Or paste image URL..."
                className="flex-1 h-9 px-3 rounded-lg border text-xs outline-none focus:border-emerald-500"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlApply()}
              />
              <button type="button" onClick={handleUrlApply} disabled={!urlInput.trim()}
                className="h-9 px-3 rounded-lg gradient-emerald text-white text-xs font-semibold disabled:opacity-40">Use</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
