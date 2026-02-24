'use client';

import { AuthProvider } from '@/context/AuthContext';
import { WalletProvider } from '@/context/WalletContext';
import { DepositProvider } from '@/context/DepositContext';
import { BetSlipProvider } from '@/context/BetSlipContext';
import { SocketProvider } from '@/context/SocketContext';
import { WinnerBoardProvider } from '@/context/WinnerBoardContext';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import BetSlip from '@/components/betting/BetSlip';
import LuckySpin from '@/components/layout/LuckySpin';
import WinnerBoardModal from '@/components/layout/WinnerBoardModal';
import AuthModal from '@/components/layout/AuthModal';
import DepositModal from '@/components/layout/DepositModal';
import { useState, useEffect, useRef } from 'react';

// Inner component so we can use useEffect with correct values
function MainContent({ children }: { children: React.ReactNode }) {
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [betSlipOpen, setBetSlipOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Update margin whenever sidebar state or window width changes
  useEffect(() => {
    const applyMargin = () => {
      if (!contentRef.current) return;
      if (window.innerWidth >= 768) {
        contentRef.current.style.marginLeft = sidebarMinimized ? '80px' : '17%';
      } else {
        contentRef.current.style.marginLeft = '0px';
      }
    };
    applyMargin();
    window.addEventListener('resize', applyMargin);
    return () => window.removeEventListener('resize', applyMargin);
  }, [sidebarMinimized]);

  return (
    <div className="min-h-screen bg-[#F6F6F6]">

      {/* Desktop Sidebar — hidden on mobile via hidden md:block inside Sidebar */}
      <Sidebar
        isMinimized={sidebarMinimized}
        onToggleMinimize={() => setSidebarMinimized(v => !v)}
      />

      {/* Mobile drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Main content — margin applied via ref/useEffect, never purged by Tailwind */}
      <div
        ref={contentRef}
        className="flex flex-col transition-all duration-300"
        style={{ minHeight: '100vh' }}
      >
        <Navbar
          isMinimized={sidebarMinimized}
          onToggleMinimize={() => setSidebarMinimized(v => !v)}
          onMobileMenuOpen={() => setMobileNavOpen(true)}
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
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WalletProvider>
        <DepositProvider>
          <BetSlipProvider>
            <SocketProvider>
              <WinnerBoardProvider>
                <MainContent>{children}</MainContent>
              </WinnerBoardProvider>
            </SocketProvider>
          </BetSlipProvider>
        </DepositProvider>
      </WalletProvider>
    </AuthProvider>
  );
}


