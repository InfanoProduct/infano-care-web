"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Loader2, AlertCircle, FileText } from "lucide-react";
import { LibraryService, BookReaderData } from "@/services/library.service";
import { useAuthStore } from "@/store/auth-store";

// Dynamically import 3D Flipbook Reader with SSR disabled
const PdfFlipbookReader = dynamic(
  () => import("@/components/reader/PdfFlipbookReader"),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-[#2d3035] flex flex-col items-center justify-center text-white space-y-4 z-50">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
        <p className="text-sm font-medium text-slate-300">Opening 3D Interactive Flipbook Engine...</p>
      </div>
    ),
  }
);

export default function BookReaderPage() {
  const params = useParams();
  const { user } = useAuthStore();
  const bookIdOrSlug = (params?.bookId as string) || "gigi-the-book";

  const [bookData, setBookData] = useState<BookReaderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keyboard DRM shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P")) e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch Book Details
  useEffect(() => {
    const fetchMetadata = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await LibraryService.getBookDetails(bookIdOrSlug);
        setBookData(data);
      } catch (err: any) {
        console.error("Failed to load reader metadata", err);
        setError(err.response?.data?.message || err.message || "Failed to load book reader.");
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [bookIdOrSlug]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#2d3035] flex flex-col items-center justify-center text-white space-y-4 z-50">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
        <p className="text-sm font-medium text-slate-300">Loading 3D Flipbook...</p>
      </div>
    );
  }

  if (error || !bookData) {
    return (
      <div className="fixed inset-0 bg-[#2d3035] flex flex-col items-center justify-center p-6 text-white space-y-6 z-50">
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-3 max-w-md shadow-2xl">
          <AlertCircle className="w-6 h-6 shrink-0 text-rose-400" />
          <p className="text-sm">{error || "Unable to access book."}</p>
        </div>
        <Link
          href="/dashboard/library"
          className="px-6 py-3 rounded-2xl bg-rose-600 text-white font-bold text-sm shadow-xl hover:bg-rose-700 transition active:scale-95"
        >
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen overflow-hidden bg-[#383b40] flex flex-col">
      <PdfFlipbookReader
        bookId={bookData.book.slug || bookData.book.id}
        pdfUrl={bookData.book.pdfUrl || undefined}
        title={bookData.book.title}
        author={bookData.book.author}
        totalPages={bookData.book.totalPages}
        userIdentifier={user?.phone || user?.email || `Reader #${bookData.book.id.substring(0, 6)}`}
      />
    </div>
  );
}
