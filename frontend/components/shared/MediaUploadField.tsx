'use client';

/**
 * MediaUploadField — reusable upload + URL input component
 *
 * Features:
 *  - Two tabs: "Upload File" | "Paste URL"
 *  - File tab: drag-and-drop or click to pick; calls POST /upload/media
 *  - URL tab: text input + Add button
 *  - Supports images (jpg, png, gif, webp, avif), videos (mp4, webm, mov),
 *    and audio (mp3, ogg, wav, aac, flac)
 *  - Shows thumbnail preview grid with remove buttons
 *  - Reports back an array of URL strings via onChange
 */

import React, { useCallback, useRef, useState } from 'react';
import { Upload, Link2, X, Film, Music, ImageIcon, Loader2, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadedMedia {
  url: string;
  type: 'image' | 'video' | 'audio' | 'unknown';
}

interface Props {
  /** Current array of URLs */
  value: string[];
  /** Called whenever the array changes */
  onChange: (urls: string[]) => void;
  /** Max files total (default 10) */
  maxFiles?: number;
  /** Whether to allow multiple files (default true) */
  multiple?: boolean;
  /** Label shown above the field */
  label?: string;
  /** Optional hint text */
  hint?: string;
  /** Extra class on the wrapper */
  className?: string;
  /** Passed as entityType to the upload API */
  entityType?: string;
  /** Passed as entityId to the upload API */
  entityId?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMAGE_EXT  = /\.(jpe?g|png|gif|webp|avif|bmp|svg)(\?.*)?$/i;
const VIDEO_EXT  = /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i;
const AUDIO_EXT  = /\.(mp3|ogg|wav|aac|flac|m4a)(\?.*)?$/i;

function detectType(url: string): UploadedMedia['type'] {
  if (IMAGE_EXT.test(url)) return 'image';
  if (VIDEO_EXT.test(url)) return 'video';
  if (AUDIO_EXT.test(url)) return 'audio';
  return 'unknown';
}

const ACCEPT = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/aac', 'audio/flac',
].join(',');

// ─── Thumbnail ────────────────────────────────────────────────────────────────

function Thumbnail({ url, onRemove }: { url: string; onRemove: () => void }) {
  const type = detectType(url);
  return (
    <div className="relative group w-24 h-24 rounded-lg overflow-hidden border bg-gray-50 flex-shrink-0">
      {type === 'image' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : type === 'video' ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1">
          <Film className="h-7 w-7" />
          <span className="text-[10px] text-center px-1 leading-tight truncate w-full text-center">
            {url.split('/').pop()?.slice(0, 16)}
          </span>
        </div>
      ) : type === 'audio' ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1">
          <Music className="h-7 w-7" />
          <span className="text-[10px] text-center px-1 leading-tight truncate w-full text-center">
            {url.split('/').pop()?.slice(0, 16)}
          </span>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1">
          <ImageIcon className="h-7 w-7" />
          <span className="text-[10px] px-1 truncate w-full text-center">
            {url.split('/').pop()?.slice(0, 16)}
          </span>
        </div>
      )}

      {/* remove button */}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove media"
        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5
                   opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MediaUploadField({
  value,
  onChange,
  maxFiles = 10,
  multiple = true,
  label,
  hint,
  className,
  entityType,
  entityId,
}: Props) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab]           = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [urlInput, setUrlInput]   = useState('');
  const [dragOver, setDragOver]   = useState(false);

  // ── Upload files via POST /upload/media ──────────────────────────────────────
  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const remaining = maxFiles - value.length;
      if (remaining <= 0) {
        toast({ title: `Maximum ${maxFiles} files reached`, variant: 'destructive' });
        return;
      }

      const toUpload = Array.from(files).slice(0, remaining);
      if (!toUpload.length) return;

      setUploading(true);
      setProgress(0);

      try {
        const formData = new FormData();
        toUpload.forEach((f) => formData.append('files', f));
        if (entityType) formData.append('entityType', entityType);
        if (entityId)   formData.append('entityId',   entityId);

        const { data } = await api.post<{
          success: boolean;
          data: { files: Array<{ url: string; type: string }> };
        }>('/upload/media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
          },
        });

        const newUrls = (data.data?.files ?? []).map((f) => f.url);
        onChange([...value, ...newUrls]);
        toast({ title: `${newUrls.length} file${newUrls.length !== 1 ? 's' : ''} uploaded` });
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Upload failed';
        toast({ title: msg, variant: 'destructive' });
      } finally {
        setUploading(false);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [value, onChange, maxFiles, entityType, entityId, toast],
  );

  // ── Drag and drop ────────────────────────────────────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles],
  );

  // ── Add URL ──────────────────────────────────────────────────────────────────
  function addUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) {
      toast({ title: 'URL already added', variant: 'destructive' });
      return;
    }
    if (value.length >= maxFiles) {
      toast({ title: `Maximum ${maxFiles} files reached`, variant: 'destructive' });
      return;
    }
    onChange([...value, trimmed]);
    setUrlInput('');
  }

  // ── Remove ───────────────────────────────────────────────────────────────────
  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}

      {/* Tab bar */}
      <div className="flex border rounded-t-lg overflow-hidden text-sm">
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 transition-colors font-medium',
            tab === 'upload'
              ? 'bg-artic-teal text-black'
              : 'bg-gray-50 text-gray-500 hover:bg-gray-100',
          )}
        >
          <Upload className="h-4 w-4" /> Upload File
        </button>
        <button
          type="button"
          onClick={() => setTab('url')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 transition-colors font-medium border-l',
            tab === 'url'
              ? 'bg-artic-teal text-black'
              : 'bg-gray-50 text-gray-500 hover:bg-gray-100',
          )}
        >
          <Link2 className="h-4 w-4" /> Paste URL
        </button>
      </div>

      {/* Tab content */}
      <div className="border border-t-0 rounded-b-lg p-3">
        {tab === 'upload' ? (
          <>
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              aria-label="Click or drag to upload files"
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors select-none',
                dragOver
                  ? 'border-artic-teal bg-artic-teal/5'
                  : 'border-gray-200 hover:border-artic-teal hover:bg-gray-50',
                uploading && 'opacity-60 cursor-not-allowed',
              )}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 text-artic-teal animate-spin" />
                  <p className="text-sm text-gray-500">Uploading… {progress}%</p>
                  <div className="w-full max-w-xs h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-artic-teal transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload className="h-8 w-8" />
                  <p className="text-sm font-medium text-gray-600">
                    Click or drag &amp; drop files here
                  </p>
                  <p className="text-xs">
                    Images (JPG, PNG, GIF, WebP) · Videos (MP4, WebM, MOV) · Audio (MP3, WAV, AAC)
                  </p>
                  {multiple && (
                    <p className="text-xs text-gray-400">
                      Up to {maxFiles} files · {maxFiles - value.length} remaining
                    </p>
                  )}
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              multiple={multiple}
              className="hidden"
              onChange={(e) => e.target.files && uploadFiles(e.target.files)}
              aria-label="File picker"
            />
          </>
        ) : (
          /* URL tab */
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
              placeholder="https://example.com/image.jpg"
              className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-teal"
              aria-label="Media URL"
            />
            <button
              type="button"
              onClick={addUrl}
              disabled={!urlInput.trim()}
              className="px-3 py-2 bg-artic-teal text-black rounded-md text-sm font-medium
                         hover:bg-artic-teal/80 disabled:opacity-40 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        )}
      </div>

      {hint && <p className="text-xs text-gray-400">{hint}</p>}

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map((url, idx) => (
            <Thumbnail key={`${url}-${idx}`} url={url} onRemove={() => remove(idx)} />
          ))}
        </div>
      )}
    </div>
  );
}
