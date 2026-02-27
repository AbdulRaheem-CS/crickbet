'use client';

/**
 * MobileBottomBar — Sticky bottom bar for non-logged-in users (mobile only)
 * Shows: [🇮🇳 INR / English] [Sign up] [Login]
 *
 * IMPORTANT: This component must be rendered OUTSIDE any parent that has
 * CSS transform/transition-all, otherwise `position: fixed` breaks.
 */

import { useAuth } from '@/context/AuthContext';

export default function MobileBottomBar() {
  const { user, openAuthModal } = useAuth();

  // Only show for guests on mobile
  if (user) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex items-center h-14">
      {/* Currency & Language */}
      <button className="flex items-center gap-2 px-3 h-full border-r border-gray-200 shrink-0">
        <span className="text-lg">🇮🇳</span>
        <div className="flex flex-col leading-none text-left">
          <span className="text-[11px] font-semibold text-gray-800">INR</span>
          <span className="text-[10px] text-gray-500">English</span>
        </div>
      </button>

      {/* Sign up */}
      <button
        onClick={() => openAuthModal('register')}
        className="flex-1 h-full bg-white text-gray-800 font-bold text-sm border-r border-gray-200 hover:bg-gray-50 transition"
      >
        Sign up
      </button>

      {/* Login */}
      <button
        onClick={() => openAuthModal('login')}
        className="flex-1 h-full bg-[#005DAC] text-white font-bold text-sm hover:bg-[#004a8a] transition"
      >
        Login
      </button>
    </div>
  );
}
