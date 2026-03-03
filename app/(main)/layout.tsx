'use client';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { WalletProvider, useWallet } from '@/context/WalletContext';
import { DepositProvider, useDeposit } from '@/context/DepositContext';
import { WithdrawalProvider, useWithdrawal } from '@/context/WithdrawalContext';
import { BetSlipProvider } from '@/context/BetSlipContext';
import { SocketProvider } from '@/context/SocketContext';
import { WinnerBoardProvider, useWinnerBoard } from '@/context/WinnerBoardContext';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import BetSlip from '@/components/betting/BetSlip';
import LuckySpin from '@/components/layout/LuckySpin';
import WinnerBoardModal from '@/components/layout/WinnerBoardModal';
import AuthModal from '@/components/layout/AuthModal';
import DepositModal from '@/components/layout/DepositModal';
import WithdrawalModal from '@/components/layout/WithdrawalModal';
import PlayerKYCModal from '@/components/layout/PlayerKYCModal';
import ChangePasswordModal from '@/components/layout/ChangePasswordModal';
import { useState, useEffect, useRef } from 'react';

// Inner component so we can use useEffect with correct values
function MainContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showKYCModal, closeKYCModal, onKYCComplete, kycInitialView, kycDisableAutoComplete, showChangePasswordModal, closeChangePasswordModal } = useWithdrawal();
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
      <WithdrawalModal />
      <PlayerKYCModal
        isOpen={showKYCModal}
        onClose={closeKYCModal}
        onKYCComplete={onKYCComplete}
        initialView={kycInitialView}
        disableAutoComplete={kycDisableAutoComplete}
      />
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={closeChangePasswordModal}
      />
    </div>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WalletProvider>
        <DepositProvider>
          <WithdrawalProvider>
            <BetSlipProvider>
              <SocketProvider>
                <WinnerBoardProvider>
                  <MainContent>{children}</MainContent>
                  <MobileBottomBarInline />
                </WinnerBoardProvider>
              </SocketProvider>
            </BetSlipProvider>
          </WithdrawalProvider>
        </DepositProvider>
      </WalletProvider>
    </AuthProvider>
  );
}

/** Inline bottom bar — lives at the absolute top of the React tree, no parent transforms */
function MobileBottomBarInline() {
  const { user, logout, openAuthModal } = useAuth();
  const { openDepositModal } = useDeposit();
  const { openWithdrawalModal, openPersonalInfoModal, openChangePasswordModal } = useWithdrawal();
  const { openWinnerBoardModal } = useWinnerBoard();
  const { availableBalance } = useWallet();
  const [isMobile, setIsMobile] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (accountOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [accountOpen]);

  if (!isMobile) return null;

  // Logged-in bottom bar: Home | Promotions | Deposit | My Account
  if (user) {
    return (
      <>
        {/* Bottom Bar */}
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
            justifyContent: 'space-around',
            backgroundColor: '#1a1a1a',
            borderTop: '1px solid #333',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
          }}
        >
          <a href="/dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, height: '100%', textDecoration: 'none', color: '#fff', fontSize: '10px', fontWeight: 600, gap: '2px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Home</span>
          </a>

          <a href="/promotions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, height: '100%', textDecoration: 'none', color: '#fff', fontSize: '10px', fontWeight: 600, gap: '2px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            <span>Promotions</span>
          </a>

          <button onClick={openDepositModal} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, height: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '10px', fontWeight: 600, gap: '2px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            <span>Deposit</span>
          </button>

          <button onClick={() => setAccountOpen(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, height: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '10px', fontWeight: 600, gap: '2px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>My Account</span>
          </button>
        </div>

        {/* My Account Drawer — full screen overlay */}
        {accountOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }}>
            {/* Drawer — full screen */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#e8edf2',
                overflowY: 'auto',
                animation: 'slideUp 0.3s ease-out',
              }}
            >
              {/* Header with profile info */}
              <div style={{ backgroundColor: '#fff', padding: '20px 16px', display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
                {/* Close button */}
                <button
                  onClick={() => setAccountOpen(false)}
                  style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6b7280', lineHeight: 1 }}
                >
                  ✕
                </button>
                {/* Avatar */}
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>ID</span>
                    <span style={{ fontSize: '14px', color: '#f97316', fontWeight: 600 }}>{user?.username || user?.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>VIP Points (VP)</span>
                    <span style={{ fontSize: '13px', color: '#374151', fontWeight: 600 }}>0</span>
                    <span style={{ fontSize: '11px', color: '#fff', backgroundColor: '#005DAC', padding: '2px 10px', borderRadius: '4px', fontWeight: 600 }}>My VIP</span>
                  </div>
                </div>
              </div>

              {/* Wallet Section */}
              <div style={{ backgroundColor: '#fff', margin: '8px 12px', borderRadius: '10px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#005DAC', fontWeight: 600 }}>Main Wallet</span>
                    <span style={{ color: '#005DAC', fontSize: '14px' }}>↻ 👁</span>
                  </div>
                  <p style={{ fontSize: '16px', color: '#f97316', fontWeight: 700, marginTop: '4px' }}>৳ {availableBalance.toFixed(0)}</p>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#005DAC', fontWeight: 600 }}>Bonus Wallet</span>
                    <span style={{ color: '#005DAC', fontSize: '14px' }}>↻ ▭</span>
                  </div>
                  <p style={{ fontSize: '16px', color: '#f97316', fontWeight: 700, marginTop: '4px' }}>৳ 0</p>
                </div>
              </div>

              {/* Funds Section */}
              <AccountSection title="Funds" items={[
                { label: 'Deposit', href: '#', color: '#e11d48', icon: '💳', action: () => { setAccountOpen(false); openDepositModal(); } },
                { label: 'Withdrawal', href: '#', color: '#e11d48', icon: '🏧', action: () => { setAccountOpen(false); openWithdrawalModal(); } },
                { label: 'Bonus Wallet', href: '', color: '#f97316', icon: '🎁', disabled: true },
                { label: 'Free Spin', href: '', color: '#e11d48', icon: '🎰', disabled: true },
              ]} onClose={() => setAccountOpen(false)} />

              {/* My Promotion Section */}
              <AccountSection title="My Promotion" items={[
                { label: 'Real-Time Bonus', href: '', color: '#e11d48', icon: '💰', disabled: true },
                { label: 'Refer Bonus', href: '', color: '#22c55e', icon: '👥', disabled: true },
                { label: 'Winner Board', href: '#', color: '#e11d48', icon: '🏆', action: () => { setAccountOpen(false); openWinnerBoardModal(); } },
              ]} onClose={() => setAccountOpen(false)} />

              {/* History Section */}
              <AccountSection title="History" items={[
                { label: 'Betting Records', href: '', color: '#3b82f6', icon: '📋', disabled: true },
                { label: 'Turnover', href: '', color: '#3b82f6', icon: '📊', disabled: true },
                { label: 'Transaction Records', href: '', color: '#3b82f6', icon: '📑', disabled: true },
              ]} onClose={() => setAccountOpen(false)} />

              {/* Profile Section */}
              <AccountSection title="Profile" items={[
                { label: 'Personal Info', href: '', color: '#22c55e', icon: '👤', action: () => { setAccountOpen(false); openPersonalInfoModal(); } },
                { label: 'Change Password', href: '', color: '#22c55e', icon: '🔒', action: () => { setAccountOpen(false); openChangePasswordModal(); } },
                { label: 'Inbox', href: '', color: '#22c55e', icon: '✉️', disabled: true },
              ]} onClose={() => setAccountOpen(false)} />

              {/* Contact Us Section */}
              <AccountSection title="Contact Us" items={[
                { label: 'Live Chat', href: '#', color: '#8b5cf6', icon: '💬' },
                { label: 'Telegram Support', href: '#', color: '#3b82f6', icon: '✈️' },
                { label: 'Telegram Channel', href: '#', color: '#3b82f6', icon: '✈️' },
                { label: 'Facebook Messenger', href: '#', color: '#3b82f6', icon: '📘' },
                { label: 'Support Email', href: '#', color: '#e11d48', icon: '📧' },
              ]} onClose={() => setAccountOpen(false)} />

              {/* Log out */}
              <div style={{ margin: '8px 12px 20px', backgroundColor: '#fff', borderRadius: '10px' }}>
                <button
                  onClick={() => { setAccountOpen(false); logout(); }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#374151',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>↪</span> Log out
                </button>
              </div>
            </div>

            {/* Animation */}
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes slideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
              }
            `}} />
          </div>
        )}
      </>
    );
  }

  // Guest bottom bar: INR/English | Sign up | Login
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

/** Reusable section for My Account drawer */
function AccountSection({ title, items, onClose }: {
  title: string;
  items: { label: string; href: string; color: string; icon: string; badge?: number; disabled?: boolean; action?: () => void }[];
  onClose: () => void;
}) {
  // Determine grid columns: 3 for ≤3 items, else wrap in rows of 3-4
  const cols = items.length <= 4 ? items.length : 3;
  return (
    <div style={{ margin: '8px 12px', backgroundColor: '#fff', borderRadius: '10px', padding: '14px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <div style={{ width: '4px', height: '18px', backgroundColor: '#005DAC', borderRadius: '2px' }} />
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937' }}>{title}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '8px' }}>
        {items.map((item) => {
          const isDisabled = item.disabled;
          const handleClick = (e: React.MouseEvent) => {
            if (isDisabled) {
              e.preventDefault();
              return;
            }
            if (item.action) {
              e.preventDefault();
              item.action();
              return;
            }
            onClose();
          };

          return (
            <a
              key={item.label}
              href={isDisabled ? undefined : item.href}
              onClick={handleClick}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 4px',
                textDecoration: 'none',
                color: isDisabled ? '#9ca3af' : '#374151',
                fontSize: '12px',
                fontWeight: 500,
                textAlign: 'center',
                position: 'relative',
                opacity: isDisabled ? 0.5 : 1,
                cursor: isDisabled ? 'default' : 'pointer',
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: isDisabled
                  ? '#e5e7eb'
                  : `linear-gradient(135deg, ${item.color}22, ${item.color}44)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                position: 'relative',
              }}>
                {item.icon}
                {item.badge && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>{item.badge}</span>
                )}
              </div>
              <span style={{ fontSize: '11px', color: isDisabled ? '#9ca3af' : '#1f2937', fontWeight: 500, lineHeight: 1.2 }}>{item.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
