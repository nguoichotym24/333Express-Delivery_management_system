"use client";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-lg text-center animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-background mb-6 shadow-md">
          <span className="text-2xl font-bold">404</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Không tìm thấy trang</h1>
        <p className="text-secondary mb-8">
          Đường dẫn bạn truy cập không tồn tại hoặc đã được di chuyển.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 bg-primary text-background hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </Link>
          <button
            onClick={() => (typeof window !== "undefined" ? window.history.back() : null)}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 border border-default hover:bg-surface transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
