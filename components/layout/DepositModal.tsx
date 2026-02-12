'use client';

/**
 * Global Deposit Modal Component
 * Renders deposit modal that can be triggered from anywhere
 */

import { useState, useEffect } from 'react';
import { useDeposit } from '@/context/DepositContext';
import { walletService } from '@/lib/services/wallet.service';
import { useWallet } from '@/context/WalletContext';
import { FaTimes, FaSpinner, FaCreditCard, FaMoneyBillWave, FaUniversity, FaWallet } from 'react-icons/fa';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  minAmount: number;
  maxAmount: number;
}

export default function DepositModal() {
  const { showDepositModal, closeDepositModal } = useDeposit();
  const { refreshBalance } = useWallet();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingMethods, setFetchingMethods] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch payment methods when modal opens
  useEffect(() => {
    if (showDepositModal) {
      fetchPaymentMethods();
    } else {
      // Reset form when modal closes
      setSelectedMethod(null);
      setAmount('');
      setError('');
      setSuccess('');
    }
  }, [showDepositModal]);

  const fetchPaymentMethods = async () => {
    setFetchingMethods(true);
    try {
      const response: any = await walletService.getPaymentMethods();
      if (response.success && response.data) {
        // Filter only active methods
        const activeMethods = response.data.filter((m: PaymentMethod) => m.enabled);
        setPaymentMethods(activeMethods);
        // Auto-select first method if available
        if (activeMethods.length > 0) {
          setSelectedMethod(activeMethods[0]);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch payment methods:', err);
      setError('Failed to load payment methods. Please try again.');
    } finally {
      setFetchingMethods(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    const depositAmount = parseFloat(amount);
    if (!depositAmount || depositAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (depositAmount < selectedMethod.minAmount) {
      setError(`Minimum deposit amount is ₹${selectedMethod.minAmount}`);
      return;
    }

    if (depositAmount > selectedMethod.maxAmount) {
      setError(`Maximum deposit amount is ₹${selectedMethod.maxAmount}`);
      return;
    }

    setLoading(true);
    try {
      const response: any = await walletService.deposit(depositAmount, selectedMethod.id);
      if (response.success) {
        setSuccess(`Deposit request submitted successfully! ${response.message || ''}`);
        setAmount('');
        // Refresh wallet balance
        await refreshBalance();
        
        // If there's a payment URL, redirect to it
        if (response.data?.paymentUrl) {
          window.location.href = response.data.paymentUrl;
        } else {
          // Close modal after 2 seconds
          setTimeout(() => {
            closeDepositModal();
          }, 2000);
        }
      } else {
        setError(response.message || 'Deposit failed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'card':
      case 'credit_card':
      case 'debit_card':
        return <FaCreditCard className="text-2xl" />;
      case 'upi':
        return <FaMoneyBillWave className="text-2xl" />;
      case 'jazzcash':
      case 'easypaisa':
      case 'wallet':
        return <FaWallet className="text-2xl" />;
      case 'bank':
      case 'net_banking':
        return <FaUniversity className="text-2xl" />;
      default:
        return <FaMoneyBillWave className="text-2xl" />;
    }
  };

  // Don't render if not visible
  if (!showDepositModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-130">
        {/* Header */}
        <div className="bg-[#015DAC] text-white py-3 px-4 rounded-t-2xl flex items-center justify-between">
          <div className="text-lg font-semibold">Deposit Funds</div>
          <button 
            onClick={closeDepositModal} 
            aria-label="Close" 
            className="text-white/90 hover:text-white transition"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* Loading payment methods */}
          {fetchingMethods ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-[#015DAC] text-2xl mr-2" />
              <span className="text-gray-600">Loading payment methods...</span>
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No payment methods available at the moment.</p>
            </div>
          ) : (
            <form onSubmit={handleDeposit}>
              {/* Payment Methods */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method)}
                      className={`p-4 border-2 rounded-lg transition flex items-center gap-3 ${
                        selectedMethod?.id === method.id
                          ? 'border-[#015DAC] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`${selectedMethod?.id === method.id ? 'text-[#015DAC]' : 'text-gray-500'}`}>
                        {getMethodIcon(method.icon)}
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium text-gray-800 text-sm">{method.name}</div>
                        <div className="text-xs text-gray-500">₹{method.minAmount} - ₹{method.maxAmount}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              {selectedMethod && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Deposit Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#015DAC] focus:border-transparent"
                        min={selectedMethod.minAmount}
                        max={selectedMethod.maxAmount}
                        step="0.01"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Min: ₹{selectedMethod.minAmount} | Max: ₹{selectedMethod.maxAmount}
                    </p>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quick Select
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[500, 1000, 2000, 5000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmount(amt.toString())}
                          className="py-2 px-3 border border-gray-300 rounded-lg hover:border-[#015DAC] hover:bg-blue-50 transition text-sm font-medium"
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !selectedMethod || !amount}
                className="w-full py-3 bg-[#015DAC] text-white font-semibold rounded-lg hover:bg-[#014a8a] transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Deposit Now'
                )}
              </button>
            </form>
          )}

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              All transactions are secure and encrypted. Deposits are usually processed instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
