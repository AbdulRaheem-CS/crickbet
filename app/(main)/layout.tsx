'use client';

import { AuthProvider } from '@/context/AuthContext';
import { WalletProvider } from '@/context/WalletContext';
import { DepositProvider } from '@/context/DepositContext';
import { BetSlipProvider } from '@/context/BetSlipContext';
import { SocketProvider } from '@/context/SocketContext';
import { WinnerBoardProvider } from '@/context/WinnerBoardContext';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import BetSlip from '@/components/betting/BetSlip';
import LuckySpin from '@/components/layout/LuckySpin';
import WinnerBoardModal from '@/components/layout/WinnerBoardModal';
import AuthModal from '@/components/layout/AuthModal';
import DepositModal from '@/components/layout/DepositModal';
import { useState } from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [betSlipOpen, setBetSlipOpen] = useState(false);

  return (
    <AuthProvider>
      <WalletProvider>
        <DepositProvider>
          <BetSlipProvider>
            <SocketProvider>
              <WinnerBoardProvider>
                <div className="min-h-screen bg-[#F6F6F6]">
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
                    <main className="flex-1 bg-[#F6F6F6] overflow-auto">
                      {children}
                    </main>
                  </div>
                  
                  <BetSlip isOpen={betSlipOpen} onClose={() => setBetSlipOpen(false)} />
                  <LuckySpin />
                  <WinnerBoardModal />
                  <AuthModal />
                  <DepositModal />
                </div>
              </WinnerBoardProvider>
            </SocketProvider>
          </BetSlipProvider>
        </DepositProvider>
      </WalletProvider>
    </AuthProvider>
  );
}
