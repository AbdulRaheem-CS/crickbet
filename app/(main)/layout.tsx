'use client';

import { AuthProvider, useAuth } from '@/context/AuthContext';
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
  const { user } = useAuth();
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
        <main className={`flex-1 bg-[#F6F6F6] overflow-auto ${!user ? 'pb-16 md:pb-0' : ''}`}>
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
                <MobileBottomBarInline />
              </WinnerBoardProvider>
            </SocketProvider>
          </BetSlipProvider>
        </DepositProvider>
      </WalletProvider>
    </AuthProvider>
  );
}

/** Inline bottom bar — lives at the absolute top of the React tree, no parent transforms */
function MobileBottomBarInline() {
  const { user, openAuthModal } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (user || !isMobile) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      }}
    >
      {/* Currency & Language */}
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0 12px',
          height: '100%',
          borderRight: '1px solid #e5e7eb',
          flexShrink: 0,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: '18px' }}>🇮🇳</span>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, textAlign: 'left' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#1f2937' }}>INR</span>
          <span style={{ fontSize: '10px', color: '#6b7280' }}>English</span>
        </div>
      </button>

      {/* Sign up */}
      <button
        onClick={() => openAuthModal('register')}
        style={{
          flex: 1,
          height: '100%',
          background: '#fff',
          color: '#1f2937',
          fontWeight: 700,
          fontSize: '14px',
          border: 'none',
          borderRight: '1px solid #e5e7eb',
          cursor: 'pointer',
        }}
      >
        Sign up
      </button>

      {/* Login */}
      <button
        onClick={() => openAuthModal('login')}
        style={{
          flex: 1,
          height: '100%',
          background: '#005DAC',
          color: '#fff',
          fontWeight: 700,
          fontSize: '14px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Login
      </button>
    </div>
  );
}


