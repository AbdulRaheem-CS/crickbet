'use client';

import { AuthProvider } from '@/context/AuthContext';
import { WalletProvider } from '@/context/WalletContext';
import { BetSlipProvider } from '@/context/BetSlipContext';
import { SocketProvider } from '@/context/SocketContext';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import BetSlip from '@/components/betting/BetSlip';
import LuckySpin from '@/components/layout/LuckySpin';
import { useState } from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [betSlipOpen, setBetSlipOpen] = useState(false);

  return (
    <AuthProvider>
      <WalletProvider>
        <BetSlipProvider>
          <SocketProvider>
            <div className="min-h-screen bg-gray-100">
              <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
              <div className="flex relative">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <main className="flex-1 transition-all duration-300">
                  {children}
                </main>
                <BetSlip isOpen={betSlipOpen} onClose={() => setBetSlipOpen(false)} />
              </div>
              <LuckySpin />
            </div>
          </SocketProvider>
        </BetSlipProvider>
      </WalletProvider>
    </AuthProvider>
  );
}
