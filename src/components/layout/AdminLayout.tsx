"use client";

import { ReactNode } from "react";

interface AdminLayoutProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function AdminLayout({
  title,
  children,
  className = "",
}: AdminLayoutProps) {
  return (
    <div
      className={`bg-white border border-black/10 rounded-lg shadow-sm p-6 ${className}`}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-wide leading-9">
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}
