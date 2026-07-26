import { useState, useRef, useEffect } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface ImageUploadFieldProps {
  folder: string;
  uploadPreset: string;
  label?: string;
  onUploaded: (url: string) => void;
  accept?: string;
  currentImageUrl?: string;
  onUploadStateChange?: (isUploading: boolean) => void;
}

export function ImageUploadField({
  folder,
  uploadPreset,
  label,
  onUploaded,
  accept = 'image/*',
  currentImageUrl = '',
  onUploadStateChange,
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string>(currentImageUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with currentImageUrl when editing/loading an existing record
  useEffect(() => {
    if (currentImageUrl) {
      setPreview(currentImageUrl);
    }
  }, [currentImageUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    // Validate file size (e.g., 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large. Maximum size is 10MB.');
      return;
    }

    setError(null);
    setLoading(true);
    onUploadStateChange?.(true);

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'manhaji-salaf';
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', folder);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || 'Upload failed. Please check preset and cloud name.');
      }

      const data = await response.json();
      if (data.secure_url) {
        setPreview(data.secure_url);
        onUploaded(data.secure_url);
      } else {
        throw new Error('No secure URL returned from Cloudinary.');
      }
    } catch (err: any) {
      console.error('Cloudinary upload error:', err);
      // Clean up local preview URL
      if (localUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localUrl);
      }
      setPreview(currentImageUrl || '');
      setError(err.message || 'Network error or upload failed. Please try again.');
    } finally {
      setLoading(false);
      onUploadStateChange?.(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleBoxClick = () => {
    if (!loading) {
      fileInputRef.current?.click();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview('');
    setError(null);
    onUploaded('');
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-semibold block" style={{ color: 'var(--text-muted)' }}>
          {label}
        </label>
      )}

      <div
        onClick={handleBoxClick}
        className={`relative h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group ${
          preview ? 'border-emerald-500 bg-black/10' : 'border-gray-300 dark:border-gray-700 hover:border-emerald-500 bg-var(--bg-primary)'
        }`}
        style={{ background: 'var(--bg-primary)' }}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
          disabled={loading}
        />

        {preview ? (
          <>
            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                Change Image
              </span>
            </div>
            {!loading && (
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        ) : (
          <div className="text-center p-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              Click to upload image
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              PNG, JPG, GIF or WEBP up to 10MB
            </p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center text-white gap-2">
            <Spinner className="w-6 h-6 text-white animate-spin" />
            <span className="text-[10px] font-semibold tracking-wider uppercase">Uploading...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
