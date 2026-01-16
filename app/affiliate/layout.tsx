'use client';

import { useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { WalletProvider } from '@/context/WalletContext';
import AffiliateSidebar from '../../components/affiliate/AffiliateSidebar';
import AffiliateHeader from '../../components/affiliate/AffiliateHeader';

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AuthProvider>
      <WalletProvider>
        <div className="min-h-screen bg-gray-100">
          {/* Affiliate Header */}
          <AffiliateHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          <div className="flex">
            {/* Affiliate Sidebar */}
            <AffiliateSidebar isOpen={sidebarOpen} />

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-0' : ''}`}>
              {children}
            </div>
          </div>
        </div>
      </WalletProvider>
    </AuthProvider>
  );
}
