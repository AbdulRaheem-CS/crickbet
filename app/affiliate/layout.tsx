'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import { WalletProvider } from '@/context/WalletContext';
import AffiliateAuthGuard from '../../components/affiliate/AffiliateAuthGuard';
import AffiliateSidebar from '../../components/affiliate/AffiliateSidebar';
import AffiliateHeader from '../../components/affiliate/AffiliateHeader';

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Check if current page is login or register
  const isAuthPage = pathname === '/affiliate/login' || pathname === '/affiliate/register';

  return (
    <AuthProvider>
      <WalletProvider>
        <AffiliateAuthGuard>
          {isAuthPage ? (
            // Show login/register pages without sidebar/header
            <div className="min-h-screen bg-gray-100">
              {children}
            </div>
          ) : (
            // Show full affiliate dashboard layout
            <div className="min-h-screen bg-gray-100 flex flex-col">
              {/* Affiliate Header */}
              <AffiliateHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

              <div className="flex flex-1">
                {/* Affiliate Sidebar */}
                <AffiliateSidebar isOpen={sidebarOpen} />

                {/* Main Content */}
                <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-0' : ''}`}>
                  {children}
                </div>
              </div>
            </div>
          )}
        </AffiliateAuthGuard>
      </WalletProvider>
    </AuthProvider>
  );
}
