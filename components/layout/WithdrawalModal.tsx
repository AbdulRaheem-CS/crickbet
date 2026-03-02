'use client';

/**
 * Global Withdrawal Modal Component
 * Full-screen popup for requesting withdrawals
 */

import { useState, useEffect } from 'react';
import { useWithdrawal } from '@/context/WithdrawalContext';
import { useWallet } from '@/context/WalletContext';
import { walletService } from '@/lib/services/wallet.service';
import {
  FaTimes, FaSpinner, FaArrowUp, FaCheckCircle, FaTimesCircle,
} from 'react-icons/fa';

const paymentMethods = [
  { id: 'easypaisa', name: 'EasyPaisa', icon: '📱', color: '#4CAF50' },
  { id: 'jazzcash', name: 'JazzCash', icon: '📲', color: '#E4002B' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦', color: '#1565C0' },
];

export default function WithdrawalModal() {
  const { showWithdrawalModal, closeWithdrawalModal } = useWithdrawal();
  const { availableBalance, refreshBalance } = useWallet();

  const [selectedMethod, setSelectedMethod] = useState('easypaisa');
  const [amount, setAmount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [confirmMobileNumber, setConfirmMobileNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset form when modal closes
  useEffect(() => {
    if (!showWithdrawalModal) {
      setSelectedMethod('easypaisa');
      setAmount('');
      setAccountName('');
      setMobileNumber('');
      setConfirmMobileNumber('');
      setAccountNumber('');
      setError('');
      setSuccess('');
    }
  }, [showWithdrawalModal]);

  const quickAmounts = [500, 1000, 2000, 5000, 10000, 25000];

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (withdrawAmount > availableBalance) {
      setError('Insufficient balance');
      return;
    }
    if (withdrawAmount < 500) {
      setError('Minimum withdrawal is ₹500');
      return;
    }
    if (!accountName.trim()) {
      setError('Please enter account holder name');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }
    if (mobileNumber !== confirmMobileNumber) {
      setError('Mobile numbers do not match');
      return;
    }
    if (!accountNumber.trim() || accountNumber.length < 8) {
      setError('Please enter a valid account number');
      return;
    }

    setLoading(true);
    try {
      await walletService.withdraw(withdrawAmount, selectedMethod, {
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        mobileNumber: mobileNumber.trim(),
      });
      setSuccess(`Withdrawal of ₹${withdrawAmount.toFixed(2)} via ${paymentMethods.find(m => m.id === selectedMethod)?.name} submitted!`);
      setAmount('');
      setAccountName('');
      setMobileNumber('');
      setConfirmMobileNumber('');
      setAccountNumber('');
      await refreshBalance();
      setTimeout(() => closeWithdrawalModal(), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!showWithdrawalModal) return null;

  return (
    <div
      onClick={closeWithdrawalModal}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)', padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '460px',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div style={{
          backgroundColor: '#015DAC', color: '#fff', padding: '12px 16px',
          borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '16px', fontWeight: 600 }}>Withdraw Funds</span>
          <button onClick={closeWithdrawalModal} style={{
            background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px',
          }}><FaTimes /></button>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {/* Balance */}
          <div style={{
            background: 'linear-gradient(135deg, #005DAC, #1A79D3)', borderRadius: '10px',
            padding: '10px 14px', color: '#fff', marginBottom: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>Available Balance</span>
            <span style={{ fontSize: '20px', fontWeight: 800 }}>₹{availableBalance.toFixed(2)}</span>
          </div>

          {/* Messages */}
          {success && (
            <div style={{
              backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px',
              padding: '10px', marginBottom: '10px', fontSize: '13px', color: '#16a34a',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}><FaCheckCircle /> {success}</div>
          )}
          {error && (
            <div style={{
              backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
              padding: '10px', marginBottom: '10px', fontSize: '13px', color: '#dc2626',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}><FaTimesCircle /> {error}</div>
          )}

          {/* Payment Method */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Withdraw Via
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethod(m.id)}
                  style={{
                    flex: 1, padding: '10px 6px', borderRadius: '10px', cursor: 'pointer',
                    border: selectedMethod === m.id ? `2px solid ${m.color}` : '2px solid #e5e7eb',
                    backgroundColor: selectedMethod === m.id ? `${m.color}10` : '#fff',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{m.icon}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: selectedMethod === m.id ? m.color : '#6b7280' }}>{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Amount
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontWeight: 600 }}>₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Min ₹500"
                min={500}
                step="1"
                required
                style={{
                  width: '100%', padding: '10px 12px 10px 28px', border: '1px solid #d1d5db',
                  borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Quick Amounts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '12px' }}>
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(String(amt))}
                style={{
                  padding: '6px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                  border: amount === String(amt) ? '1.5px solid #015DAC' : '1.5px solid #e5e7eb',
                  backgroundColor: amount === String(amt) ? '#eff6ff' : '#fff',
                  color: amount === String(amt) ? '#015DAC' : '#6b7280',
                }}
              >
                ₹{amt.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Account Holder Name */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Account Holder Name
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Full name as on account"
              required
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Mobile Number */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Mobile Number
            </label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="e.g. 03001234567"
              required
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Confirm Mobile Number */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Confirm Mobile Number
            </label>
            <input
              type="text"
              value={confirmMobileNumber}
              onChange={(e) => setConfirmMobileNumber(e.target.value)}
              placeholder="Re-enter mobile number"
              required
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Account Number */}
          <div style={{ marginBottom: '4px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Account Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
              required
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Fixed Bottom — always visible */}
        <div style={{
          padding: '12px 16px 16px', borderTop: '1px solid #f3f4f6',
          borderRadius: '0 0 16px 16px', backgroundColor: '#fff',
        }}>
          <button
            onClick={handleWithdraw}
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
              backgroundColor: loading ? '#9ca3af' : '#015DAC', color: '#fff',
              fontWeight: 700, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {loading ? <><FaSpinner className="animate-spin" /> Processing...</> : <><FaArrowUp /> Withdraw Now</>}
          </button>
          <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '6px' }}>
            Processed within 24 hours · Min ₹500
          </p>
        </div>
      </div>
    </div>
  );
}
