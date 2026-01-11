'use client';

import { AuthProvider } from '@/context/AuthContext';
import { WalletProvider } from '@/context/WalletContext';
import { BetSlipProvider } from '@/context/BetSlipContext';
import { SocketProvider } from '@/context/SocketContext';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WalletProvider>
        <BetSlipProvider>
          <SocketProvider>{children}</SocketProvider>
        </BetSlipProvider>
      </WalletProvider>
    </AuthProvider>
  );
}
