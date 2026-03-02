'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useDeposit } from '@/context/DepositContext';
import { useWithdrawal } from '@/context/WithdrawalContext';
import { useAuth } from '@/context/AuthContext';
import { walletService } from '@/lib/services/wallet.service';
import {
  FaWallet, FaArrowDown, FaArrowUp, FaHistory,
  FaCheckCircle, FaClock, FaTimesCircle, FaSpinner
} from 'react-icons/fa';

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  description?: string;
}

export default function WalletPage() {
  const { user } = useAuth();
  const { availableBalance, lockedFunds, bonus } = useWallet();
  const { openDepositModal } = useDeposit();
  const { openWithdrawalModal } = useWithdrawal();

  // Transaction history state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txFilter, setTxFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'bet'>('all');

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user, txFilter]);

  const fetchTransactions = async () => {
    setTxLoading(true);
    try {
      const params: any = { limit: 50 };
      if (txFilter !== 'all') params.type = txFilter;
      const res: any = await walletService.getTransactions(params);
      setTransactions(res.data?.transactions || res.data || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setTxLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': case 'success': return <FaCheckCircle className="text-green-500" />;
      case 'pending': case 'processing': return <FaClock className="text-yellow-500" />;
      case 'failed': case 'cancelled': case 'rejected': return <FaTimesCircle className="text-red-500" />;
      default: return <FaClock className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'success': return '#22c55e';
      case 'pending': case 'processing': return '#eab308';
      case 'failed': case 'cancelled': case 'rejected': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center', color: '#fff' }}>
        <FaWallet style={{ fontSize: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
        <p style={{ fontSize: '18px', fontWeight: 600 }}>Please login to access your wallet</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      {/* Balance Card */}
      <div style={{
        background: 'linear-gradient(135deg, #005DAC, #1A79D3)',
        borderRadius: '16px',
        padding: '24px',
        color: '#fff',
        marginBottom: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        <p style={{ fontSize: '13px', opacity: 0.8, marginBottom: '4px' }}>Available Balance</p>
        <p style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>₹{availableBalance.toFixed(2)}</p>
        <div style={{ display: 'flex', gap: '20px', fontSize: '12px', opacity: 0.85 }}>
          <span>🔒 In Bets: ₹{lockedFunds.toFixed(0)}</span>
          <span>🎁 Bonus: ₹{bonus.toFixed(0)}</span>
        </div>
        {/* Deposit & Withdraw Quick Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button
            onClick={openDepositModal}
            style={{
              flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
              backgroundColor: '#22c55e', color: '#fff', fontWeight: 700, fontSize: '15px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <FaArrowDown /> Deposit
          </button>
          <button
            onClick={openWithdrawalModal}
            style={{
              flex: 1, padding: '12px', borderRadius: '10px', border: '2px solid rgba(255,255,255,0.4)',
              backgroundColor: 'transparent', color: '#fff', fontWeight: 700, fontSize: '15px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <FaArrowUp /> Withdraw
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div style={{ backgroundColor: '#1f2937', borderRadius: '12px', padding: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
          Transaction History
        </h2>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {(['all', 'deposit', 'withdrawal', 'bet'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTxFilter(f)}
              style={{
                padding: '6px 16px', borderRadius: '20px', border: '1px solid #374151',
                backgroundColor: txFilter === f ? '#005DAC' : 'transparent',
                color: txFilter === f ? '#fff' : '#9ca3af',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {txLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
            <FaSpinner className="animate-spin" style={{ fontSize: '24px', margin: '0 auto 8px' }} />
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
            <FaHistory style={{ fontSize: '32px', margin: '0 auto 8px', opacity: 0.5 }} />
            <p>No transactions found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {transactions.map((tx) => (
              <div
                key={tx._id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  backgroundColor: '#111827', borderRadius: '10px', padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {getStatusIcon(tx.status)}
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', textTransform: 'capitalize' }}>
                      {tx.type}
                    </p>
                    <p style={{ fontSize: '11px', color: '#6b7280' }}>
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    fontSize: '14px', fontWeight: 700,
                    color: tx.type === 'deposit' || tx.type === 'win' ? '#22c55e' : '#ef4444',
                  }}>
                    {tx.type === 'deposit' || tx.type === 'win' ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                  </p>
                  <p style={{
                    fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
                    color: getStatusColor(tx.status),
                  }}>
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
