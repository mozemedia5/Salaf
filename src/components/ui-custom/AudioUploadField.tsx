import { useState, useRef, useEffect } from "react";
import { Upload, X, AlertCircle, Music } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface AudioUploadFieldProps {
  folder: string;
  uploadPreset: string;
  label?: string;
  onUploaded: (url: string, durationSeconds: number) => void;
  accept?: string;
  currentAudioUrl?: string;
  onUploadStateChange?: (isUploading: boolean) => void;
}

export function AudioUploadField({
  folder,
  uploadPreset,
  label,
  onUploaded,
  accept = "*",
  currentAudioUrl = "",
  onUploadStateChange,
}: AudioUploadFieldProps) {
  const [preview, setPreview] = useState<string>(currentAudioUrl);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeXhrRef = useRef<XMLHttpRequest | null>(null);

  // Sync with currentAudioUrl when editing/loading an existing record
  useEffect(() => {
    if (currentAudioUrl) {
      setPreview(currentAudioUrl);
    }
  }, [currentAudioUrl]);

  // Clean up active XHR requests on unmount
  useEffect(() => {
    return () => {
      if (activeXhrRef.current) {
        activeXhrRef.current.abort();
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Bypassed file type restrictions as requested to support any upload format
    setError(null);
    setLoading(true);
    setProgress(0);
    onUploadStateChange?.(true);

    // Show local preview immediately using blob url so admin can play it
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "manhaji-salaf";
      // Treat audio under the video resource type as Cloudinary requires
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", folder);

      const xhr = new XMLHttpRequest();
      activeXhrRef.current = xhr;

      xhr.open("POST", uploadUrl, true);

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        activeXhrRef.current = null;
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.secure_url) {
              setPreview(data.secure_url);
              // Save audio URL and duration
              onUploaded(data.secure_url, data.duration || 0);
              setError(null);
            } else {
              throw new Error("No secure URL returned from Cloudinary.");
            }
          } catch (err: any) {
            setError(err.message || "Malformed response from upload server.");
            setPreview(currentAudioUrl || "");
          } finally {
            setLoading(false);
            onUploadStateChange?.(false);
          }
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            setError(errData?.error?.message || "Upload failed. Please check preset and cloud name.");
          } catch {
            setError("Upload failed with status " + xhr.status);
          }
          setPreview(currentAudioUrl || "");
          setLoading(false);
          onUploadStateChange?.(false);
        }
      };

      xhr.onerror = () => {
        activeXhrRef.current = null;
        setError("Network error or server unreachable. Please try again.");
        setPreview(currentAudioUrl || "");
        setLoading(false);
        onUploadStateChange?.(false);
      };

      xhr.send(formData);
    } catch (err: any) {
      console.error("XHR Upload Setup Error:", err);
      setPreview(currentAudioUrl || "");
      setError(err.message || "Setup error. Please try again.");
      setLoading(false);
      onUploadStateChange?.(false);
    }
  };

  const handleBoxClick = () => {
    if (!loading) {
      fileInputRef.current?.click();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeXhrRef.current) {
      activeXhrRef.current.abort();
      activeXhrRef.current = null;
    }
    setPreview("");
    setError(null);
    setProgress(0);
    onUploaded("", 0);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-semibold block" style={{ color: "var(--text-muted)" }}>
          {label}
        </label>
      )}

      <div
        onClick={handleBoxClick}
        className={`relative rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group p-4 min-h-[140px] ${
          preview ? "border-emerald-500 bg-black/5" : "border-gray-300 dark:border-gray-700 hover:border-emerald-500"
        }`}
        style={{ background: "var(--bg-primary)" }}
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
          <div className="w-full flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm">
              <Music className="w-5 h-5 animate-pulse" />
              <span>Audio Selected</span>
            </div>

            <audio src={preview} controls className="w-full h-10 max-w-sm" />

            {!loading && (
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              Click to upload audio lecture
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              MP3, WAV or M4A formats are allowed
            </p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-white gap-2">
            <Spinner className="w-6 h-6 text-white animate-spin" />
            <span className="text-xs font-semibold tracking-wider uppercase">
              Uploading ({progress}%)
            </span>
            <div className="w-1/2 bg-white/20 h-1 rounded-full overflow-hidden mt-1">
              <div className="bg-emerald-500 h-full transition-all duration-150" style={{ width: `${progress}%` }} />
            </div>
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
