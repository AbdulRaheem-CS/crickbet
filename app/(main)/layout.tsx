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
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [betSlipOpen, setBetSlipOpen] = useState(false);

  return (
    <AuthProvider>
      <WalletProvider>
        <BetSlipProvider>
          <SocketProvider>
            <div className="min-h-screen bg-white">
              {/* Sidebar - Always visible, fixed position */}
              <Sidebar 
                isMinimized={sidebarMinimized} 
                onToggleMinimize={() => setSidebarMinimized(!sidebarMinimized)} 
              />
              
              {/* Main Content Area - Adjusted for sidebar width */}
              <div 
                className={`flex flex-col transition-all duration-300 ${
                  sidebarMinimized ? 'ml-20' : 'ml-[17%]'
                }`}
                style={{ minHeight: '100vh' }}
              >
                <Navbar
                  isMinimized={sidebarMinimized}
                  onToggleMinimize={() => setSidebarMinimized(!sidebarMinimized)}
                />
                <main className="flex-1 bg-white overflow-auto">
                  {children}
                </main>
              </div>
              
              <BetSlip isOpen={betSlipOpen} onClose={() => setBetSlipOpen(false)} />
              <LuckySpin />
            </div>
          </SocketProvider>
        </BetSlipProvider>
      </WalletProvider>
    </AuthProvider>
  );
}
