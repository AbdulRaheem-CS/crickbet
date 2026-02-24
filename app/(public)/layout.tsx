'use client';

import type { ReactNode } from 'react';
import PublicHeader from '../../components/public/PublicHeader';
import PublicFooter from '../../components/public/PublicFooter';

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
  <div className="min-h-screen flex flex-col bg-[#1E549C] text-white">
      {/* Public Header */}
      <PublicHeader />
      
      {/* Main Content */}
      <main className="flex-1 m-0 p-0">
        {children}
      </main>
      
      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}
