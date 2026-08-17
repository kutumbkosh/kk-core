"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Shield,
  Send,
  Paperclip,
  X,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

const SUBJECT_OPTIONS = [
  "General Enquiry",
  "Billing & Subscription",
  "Bug Report",
  "Feature Request",
  "Privacy & Data",
  "Other",
];

const MAX_IMAGES = 3;
const MAX_SIZE_MB = 2;
const MAX_MESSAGE = 2000;

interface AttachmentPreview {
  filename: string;
  content: string; // base64
  previewUrl: string;
  sizeKb: number;
}

export default function ContactPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ name: "", email: "", subject: "General Enquiry", message: "" });
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fileError, setFileError] = useState("");

  // Auto-fill email if logged in
  useState(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (user?.email) setForm((f) => ({ ...f, email: user.email ?? "" }));
      })
      .catch(() => {});
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setFileError("");

    const remaining = MAX_IMAGES - attachments.length;
    if (remaining <= 0) {
      setFileError(`You can attach up to ${MAX_IMAGES} images.`);
      return;
    }

    const toAdd = Array.from(files).slice(0, remaining);
    const readers: Promise<AttachmentPreview | null>[] = toAdd.map(
      (file) =>
        new Promise((resolve) => {
          if (!file.type.startsWith("image/")) {
            setFileError("Only image files (JPG, PNG, GIF, WebP) are supported.");
            resolve(null);
            return;
          }
          if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setFileError(`"${file.name}" exceeds the ${MAX_SIZE_MB} MB limit.`);
            resolve(null);
            return;
          }
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            // Strip the data:image/...;base64, prefix for Resend
            const base64 = dataUrl.split(",")[1];
            resolve({
              filename: file.name,
              content: base64,
              previewUrl: dataUrl,
              sizeKb: Math.round(file.size / 1024),
            });
          };
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then((results) => {
      const valid = results.filter(Boolean) as AttachmentPreview[];
      setAttachments((prev) => [...prev, ...valid]);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setFileError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in your name, email, and message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (form.message.length > MAX_MESSAGE) {
      setError(`Message must be under ${MAX_MESSAGE} characters.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject,
          message: form.message.trim(),
          attachments: attachments.map(({ filename, content }) => ({ filename, content })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Message sent!</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            We&apos;ve received your message and will reply within 48 hours.
            Check your inbox for a confirmation copy.
          </p>
          <button
            onClick={() => router.back()}
            className="btn-primary"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const charsLeft = MAX_MESSAGE - form.message.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">KutumbKosh</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Contact us</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Have a question, found a bug, or just want to share feedback? We read every message
            and reply within 48 hours.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Rajesh Kumar"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="input-field"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="label">Category</label>
              <select
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                className="input-field bg-white"
              >
                {SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="label">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Tell us what's on your mind..."
                rows={6}
                maxLength={MAX_MESSAGE}
                className="input-field resize-none"
              />
              <p className={`text-xs mt-1 text-right ${charsLeft < 100 ? "text-amber-500" : "text-gray-400"}`}>
                {charsLeft} characters remaining
              </p>
            </div>

            {/* Image attachments */}
            <div>
              <label className="label">Attachments (optional)</label>
              <p className="text-xs text-gray-400 mb-3">
                Up to {MAX_IMAGES} images, {MAX_SIZE_MB} MB each. Helpful for sharing screenshots of bugs.
              </p>

              {/* Previews */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {attachments.map((att, i) => (
                    <div key={i} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={att.previewUrl}
                        alt={att.filename}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttachment(i)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                      <p className="text-xs text-gray-400 mt-1 text-center w-20 truncate">{att.sizeKb} KB</p>
                    </div>
                  ))}
                </div>
              )}

              {attachments.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                  Add image
                  <span className="text-xs text-gray-400">({attachments.length}/{MAX_IMAGES})</span>
                </button>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />

              {fileError && (
                <div className="flex items-start gap-2 mt-2">
                  <ImageIcon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-600">{fileError}</p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</>
              ) : (
                <><Send className="w-4 h-4 mr-2" />Send message</>
              )}
            </button>
          </form>
        </div>

        {/* Direct email option */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Prefer email?{" "}
          <a href="mailto:care@kutumbkosh.com" className="text-blue-600 hover:underline font-medium">
            care@kutumbkosh.com
          </a>
        </p>

        {/* Footer links */}
        <div className="border-t border-gray-100 mt-10 pt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
          <a href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</a>
          <a href="/security" className="hover:text-gray-600 transition-colors">Security</a>
        </div>
      </main>
    </div>
  );
}
