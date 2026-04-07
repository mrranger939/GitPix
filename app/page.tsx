"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";

export default function ImageUploader() {
  const [password, setPassword] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [dragging, setDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null | undefined) => {
    if (!f) return;
    setFile(f);
    setUploadedUrl(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (typeof e.target?.result === "string") {
        setPreview(e.target.result);
      }
    };
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0] ?? null;
    handleFile(f);
  }, []);

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);

  const handleUpload = async () => {
    if (!file || !password) return;
    setUploading(true);
    setError(null);
    setUploadedUrl(null);

    try {
      await new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e: ProgressEvent<FileReader>) => {
          try {
            const result = e.target?.result;
            if (typeof result !== "string") throw new Error("File read error");
            const base64 = result.split(",")[1];
            const res = await fetch("/api/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imageBase64: base64,
                fileName: file.name,
                password,
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");
            setUploadedUrl(data.url as string);
            resolve();
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error("File read error"));
        reader.readAsDataURL(file);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setTimeout(() => setUploading(false), 600);
    }
  };

  const copyUrl = () => {
    if (!uploadedUrl) return;
    navigator.clipboard.writeText(uploadedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setUploadedUrl(null);
    setError(null);
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 overflow-hidden relative">
      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute rounded-full"
          style={{
            width: 500,
            height: 500,
            top: "-120px",
            left: "-100px",
            background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 400,
            height: 400,
            bottom: "-80px",
            right: "-80px",
            background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            top: "55%",
            left: "40%",
            background: "radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md rounded-3xl p-8"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 8px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.7), rgba(59,130,246,0.7))",
                boxShadow: "0 0 20px rgba(139,92,246,0.4)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight" style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}>
              GitPix
            </span>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Sora', sans-serif" }}>
            Secure image hosting via GitHub
          </p>
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="block text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Sora', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Access Key
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.25)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </span>
            <input
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-xl pl-9 pr-4 py-3 text-sm text-white outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                fontFamily: "'Sora', sans-serif",
                caretColor: "#8b5cf6",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid rgba(139,92,246,0.5)";
                e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.10)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgba(255,255,255,0.09)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Drop Zone */}
        <div className="mb-5">
          <label className="block text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Sora', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Image
          </label>
          <div
            onClick={() => { if (!preview) fileInputRef.current?.click(); }}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className="relative rounded-2xl overflow-hidden transition-all cursor-pointer"
            style={{
              minHeight: 160,
              border: dragging
                ? "1.5px dashed rgba(139,92,246,0.8)"
                : "1.5px dashed rgba(255,255,255,0.10)",
              background: dragging
                ? "rgba(139,92,246,0.07)"
                : "rgba(255,255,255,0.02)",
              boxShadow: dragging ? "0 0 0 3px rgba(139,92,246,0.10)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                  style={{ maxHeight: 220, borderRadius: "14px" }}
                />
                <div
                  className="absolute inset-0 flex items-end justify-between p-3"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }}
                >
                  <span className="text-xs truncate max-w-[70%]" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Sora', sans-serif" }}>
                    {file?.name}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                    className="rounded-lg px-2 py-1 text-xs transition-all"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.7)",
                      fontFamily: "'Sora', sans-serif",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    Change
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Sora', sans-serif" }}>
                    Drop image here or{" "}
                    <span style={{ color: "rgba(139,92,246,0.9)" }}>browse</span>
                  </p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'Sora', sans-serif" }}>
                    PNG · JPG · WEBP
                  </p>
                </div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-4 rounded-xl px-4 py-3 flex items-center gap-2 text-sm"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.18)",
              color: "rgba(252,165,165,0.9)",
              fontFamily: "'Sora', sans-serif",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Success URL */}
        {uploadedUrl && (
          <div
            className="mb-4 rounded-xl p-4"
            style={{
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.18)",
            }}
          >
            <p className="text-xs mb-2 font-medium" style={{ color: "rgba(134,239,172,0.7)", fontFamily: "'Sora', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              ✓ Uploaded successfully
            </p>
            <div
              className="flex items-center gap-2 rounded-lg p-2"
              style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span
                className="text-xs flex-1 truncate"
                style={{ color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}
              >
                {uploadedUrl}
              </span>
              <button
                onClick={copyUrl}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0"
                style={{
                  background: copied ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)",
                  border: copied ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.10)",
                  color: copied ? "rgba(134,239,172,0.9)" : "rgba(255,255,255,0.6)",
                  fontFamily: "'Sora', sans-serif",
                  transition: "all 0.2s ease",
                }}
              >
                {copied ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || !password || uploading}
          className="w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all relative overflow-hidden"
          style={{
            background:
              !file || !password
                ? "rgba(255,255,255,0.05)"
                : "linear-gradient(135deg, rgba(139,92,246,0.85), rgba(59,130,246,0.85))",
            color:
              !file || !password
                ? "rgba(255,255,255,0.2)"
                : "rgba(255,255,255,0.95)",
            border:
              !file || !password
                ? "1px solid rgba(255,255,255,0.07)"
                : "1px solid rgba(139,92,246,0.4)",
            cursor: !file || !password || uploading ? "not-allowed" : "pointer",
            fontFamily: "'Sora', sans-serif",
            boxShadow:
              !file || !password
                ? "none"
                : "0 4px 24px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
            transition: "all 0.25s ease",
          }}
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0110 10" />
              </svg>
              Uploading…
            </span>
          ) : (
            "Upload Image"
          )}
        </button>

        {/* Footer */}
        <p className="text-center text-xs mt-5" style={{ color: "rgba(255,255,255,0.15)", fontFamily: "'Sora', sans-serif" }}>
          Files stored on GitHub · Raw CDN delivery
        </p>
      </div>

      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');`}</style>
    </div>
  );
}