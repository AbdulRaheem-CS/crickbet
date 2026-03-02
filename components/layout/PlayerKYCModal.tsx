'use client';

/**
 * Player KYC Modal Component
 * Shows KYC verification requirements before allowing withdrawal.
 * Matches the "Funds" modal design with Deposit/Withdrawal tabs.
 * KYC = Full Name + Phone OTP Verification
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { userService } from '@/lib/services/user.service';
import {
  FaTimes, FaInfoCircle, FaUser, FaPhone, FaEnvelope, FaBirthdayCake,
  FaSpinner, FaCheckCircle, FaArrowLeft, FaExclamationTriangle,
  FaShieldAlt,
} from 'react-icons/fa';

interface KYCStatus {
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  dateOfBirth: string | null;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  kycStatus: string;
  username: string;
  createdAt: string;
  isKYCComplete: boolean;
}

interface PlayerKYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKYCComplete: () => void; // Called when KYC is done → open withdrawal modal
}

type ModalView = 'kyc-check' | 'personal-info';

export default function PlayerKYCModal({ isOpen, onClose, onKYCComplete }: PlayerKYCModalProps) {
  const { user, refreshUser } = useAuth();
  const { availableBalance } = useWallet();

  const [view, setView] = useState<ModalView>('kyc-check');
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Personal Info form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState('');

  // Phone OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [devOtp, setDevOtp] = useState('');

  const fetchKYCStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await userService.getKYCStatus();
      setKycStatus(res.data);
      if (res.data.firstName) setFirstName(res.data.firstName);
      if (res.data.lastName) setLastName(res.data.lastName);
    } catch (err: any) {
      setError('Failed to load KYC status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchKYCStatus();
      setView('kyc-check');
      setError('');
      setNameSuccess('');
      setOtpError('');
      setOtpMessage('');
      setOtpSent(false);
      setOtp('');
      setDevOtp('');
    }
  }, [isOpen, fetchKYCStatus]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // If KYC is already complete, auto-proceed to withdrawal
  useEffect(() => {
    if (isOpen && kycStatus?.isKYCComplete && !loading) {
      onKYCComplete();
    }
  }, [isOpen, kycStatus, loading, onKYCComplete]);

  const handleSaveName = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter both first name and last name');
      return;
    }
    setSavingName(true);
    setError('');
    setNameSuccess('');
    try {
      const res: any = await userService.updateFullName(firstName.trim(), lastName.trim());
      setNameSuccess('Full name saved successfully!');
      await fetchKYCStatus();
      await refreshUser();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save name');
    } finally {
      setSavingName(false);
    }
  };

  const handleSendOTP = async () => {
    setSendingOTP(true);
    setOtpError('');
    setOtpMessage('');
    setDevOtp('');
    try {
      const res: any = await userService.sendPhoneOTP();
      setOtpSent(true);
      setOtpMessage(res.message || 'OTP sent successfully');
      setCountdown(60);
      if (res.data?._devOtp) setDevOtp(res.data._devOtp);
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || err?.message || 'Failed to send OTP');
    } finally {
      setSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }
    setVerifyingOTP(true);
    setOtpError('');
    try {
      await userService.verifyPhoneOTP(otp);
      setOtpMessage('Phone verified successfully!');
      await fetchKYCStatus();
      await refreshUser();
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || err?.message || 'Verification failed');
    } finally {
      setVerifyingOTP(false);
    }
  };

  if (!isOpen) return null;

  const hasFullName = !!(kycStatus?.fullName);
  const isPhoneVerified = kycStatus?.isPhoneVerified || false;
  const registeredDate = kycStatus?.createdAt
    ? new Date(kycStatus.createdAt).toLocaleDateString('en-CA') // YYYY/MM/DD
    : '';

  // ==============================
  // Render: Personal Info View
  // ==============================
  if (view === 'personal-info') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)', padding: '16px',
      }}>
        <div style={{
          backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '460px',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#015DAC', color: '#fff', padding: '12px 16px',
            borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => setView('kyc-check')} style={{
                background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px',
              }}><FaArrowLeft /></button>
              <span style={{ fontSize: '16px', fontWeight: 600 }}>Personal Info</span>
            </div>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px',
            }}><FaTimes /></button>
          </div>

          {/* Scrollable Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {/* Profile Card */}
            <div style={{
              background: 'linear-gradient(135deg, #f0f7ff 0%, #e0efff 100%)',
              borderRadius: '12px', padding: '20px', marginBottom: '16px',
              textAlign: 'center', position: 'relative',
            }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                backgroundColor: '#d1d5db', margin: '0 auto 10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>
                <FaUser style={{ fontSize: '28px', color: '#9ca3af' }} />
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937' }}>
                {kycStatus?.phone || kycStatus?.username}
              </div>
              <span style={{
                display: 'inline-block', marginTop: '4px', padding: '2px 10px',
                borderRadius: '10px', fontSize: '11px', fontWeight: 600,
                backgroundColor: '#015DAC', color: '#fff',
              }}>Bronze</span>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Date Registered : {registeredDate}
              </div>
            </div>

            {/* VIP Section */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderRadius: '10px', border: '1px solid #e5e7eb',
              marginBottom: '16px',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>VIP Points (VP)</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#015DAC' }}>0</span>
              <span style={{ fontSize: '12px', color: '#015DAC', fontWeight: 600, cursor: 'pointer' }}>My VIP ≫</span>
            </div>

            {/* Info Required Boxes */}
            <div style={{
              border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                <FaInfoCircle style={{ color: '#015DAC', marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#374151', lineHeight: 1.4 }}>
                  Below info are required to proceed deposit request.
                </span>
              </div>
              <div style={{ marginLeft: '10px' }}>
                <div style={{
                  borderLeft: '3px solid #22c55e', paddingLeft: '10px', marginBottom: '6px',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#22c55e' }}>Contact Info</span>
                </div>
                <span style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
                  fontSize: '11px', fontWeight: 600,
                  backgroundColor: isPhoneVerified ? '#dcfce7' : '#dbeafe',
                  color: isPhoneVerified ? '#16a34a' : '#015DAC',
                }}>Phone Number</span>
              </div>
            </div>

            <div style={{
              border: '1px solid #e5e7eb', borderRadius: '12px', padding: '14px',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                <FaInfoCircle style={{ color: '#015DAC', marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#374151', lineHeight: 1.4 }}>
                  Please complete the verification below before you proceed with the withdrawal request.
                </span>
              </div>
              <div style={{ marginLeft: '10px' }}>
                <div style={{
                  borderLeft: '3px solid #22c55e', paddingLeft: '10px', marginBottom: '6px',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#22c55e' }}>Personal Info</span>
                </div>
                <span style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
                  fontSize: '11px', fontWeight: 600, marginBottom: '8px',
                  backgroundColor: hasFullName ? '#dcfce7' : '#dbeafe',
                  color: hasFullName ? '#16a34a' : '#015DAC',
                }}>Full Name</span>

                <div style={{
                  borderLeft: '3px solid #22c55e', paddingLeft: '10px', marginTop: '8px', marginBottom: '6px',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#22c55e' }}>Contact Info</span>
                </div>
                <span style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
                  fontSize: '11px', fontWeight: 600,
                  backgroundColor: isPhoneVerified ? '#dcfce7' : '#dbeafe',
                  color: isPhoneVerified ? '#16a34a' : '#015DAC',
                }}>Phone Number</span>
              </div>
            </div>

            {/* ======================== */}
            {/* KYC ACTION ITEMS         */}
            {/* ======================== */}

            {/* Full Name */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderBottom: '1px solid #f3f4f6',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaUser style={{ color: '#6b7280', fontSize: '16px' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>Full Name</div>
                  {hasFullName && (
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{kycStatus?.fullName}</div>
                  )}
                </div>
              </div>
              {hasFullName ? (
                <FaCheckCircle style={{ color: '#22c55e', fontSize: '18px' }} />
              ) : (
                <div>
                  {/* Inline name entry */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First"
                      style={{
                        width: '80px', padding: '6px 8px', border: '1px solid #d1d5db',
                        borderRadius: '6px', fontSize: '12px', outline: 'none',
                      }}
                    />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last"
                      style={{
                        width: '80px', padding: '6px 8px', border: '1px solid #d1d5db',
                        borderRadius: '6px', fontSize: '12px', outline: 'none',
                      }}
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={savingName}
                      style={{
                        padding: '6px 12px', borderRadius: '6px', border: 'none',
                        backgroundColor: '#22c55e', color: '#fff', fontSize: '11px',
                        fontWeight: 600, cursor: savingName ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {savingName ? '...' : 'Add'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Birthday (display only — not required for KYC) */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderBottom: '1px solid #f3f4f6',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaBirthdayCake style={{ color: '#6b7280', fontSize: '16px' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>Birthday</div>
                  {kycStatus?.dateOfBirth && (
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {new Date(kycStatus.dateOfBirth).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              {kycStatus?.dateOfBirth ? (
                <FaCheckCircle style={{ color: '#22c55e', fontSize: '18px' }} />
              ) : (
                <span style={{
                  padding: '4px 14px', borderRadius: '6px', border: 'none',
                  backgroundColor: '#e5e7eb', color: '#9ca3af', fontSize: '12px',
                  fontWeight: 600,
                }}>Optional</span>
              )}
            </div>

            {/* Phone Number */}
            <div style={{
              padding: '14px 16px', borderBottom: '1px solid #f3f4f6',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaPhone style={{ color: '#6b7280', fontSize: '16px' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>Phone Number</div>
                    {kycStatus?.phone && (
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{kycStatus.phone}</div>
                    )}
                  </div>
                </div>
                {isPhoneVerified ? (
                  <FaCheckCircle style={{ color: '#22c55e', fontSize: '18px' }} />
                ) : (
                  <button
                    onClick={handleSendOTP}
                    disabled={sendingOTP || countdown > 0}
                    style={{
                      padding: '4px 14px', borderRadius: '6px', border: 'none',
                      backgroundColor: countdown > 0 ? '#fef2f2' : '#fef2f2',
                      color: '#ef4444', fontSize: '12px', fontWeight: 600,
                      cursor: (sendingOTP || countdown > 0) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {sendingOTP ? 'Sending...' : countdown > 0 ? `Resend (${countdown}s)` : 'Not Verified'}
                  </button>
                )}
              </div>

              {/* OTP Input (shown after send) */}
              {otpSent && !isPhoneVerified && (
                <div style={{ marginTop: '10px', marginLeft: '26px' }}>
                  {otpMessage && (
                    <div style={{ fontSize: '12px', color: '#16a34a', marginBottom: '6px' }}>
                      {otpMessage}
                    </div>
                  )}
                  {devOtp && (
                    <div style={{ fontSize: '11px', color: '#f59e0b', marginBottom: '6px', fontFamily: 'monospace' }}>
                      [Dev] OTP: {devOtp}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      style={{
                        width: '140px', padding: '8px 10px', border: '1px solid #d1d5db',
                        borderRadius: '6px', fontSize: '14px', outline: 'none',
                        letterSpacing: '4px', textAlign: 'center', fontWeight: 600,
                      }}
                    />
                    <button
                      onClick={handleVerifyOTP}
                      disabled={verifyingOTP || otp.length < 6}
                      style={{
                        padding: '8px 16px', borderRadius: '6px', border: 'none',
                        backgroundColor: '#22c55e', color: '#fff', fontSize: '12px',
                        fontWeight: 600, cursor: (verifyingOTP || otp.length < 6) ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {verifyingOTP ? <FaSpinner className="animate-spin" /> : 'Verify'}
                    </button>
                  </div>
                  {otpError && (
                    <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                      {otpError}
                    </div>
                  )}
                  {countdown > 0 && (
                    <button
                      onClick={handleSendOTP}
                      disabled={countdown > 0}
                      style={{
                        marginTop: '6px', background: 'none', border: 'none',
                        color: countdown > 0 ? '#9ca3af' : '#015DAC',
                        fontSize: '12px', cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Resend OTP {countdown > 0 ? `(${countdown}s)` : ''}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Email */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderBottom: '1px solid #f3f4f6',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaEnvelope style={{ color: '#6b7280', fontSize: '16px' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>Email</div>
                  {kycStatus?.email && (
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{kycStatus.email}</div>
                  )}
                </div>
              </div>
              {kycStatus?.isEmailVerified ? (
                <FaCheckCircle style={{ color: '#22c55e', fontSize: '18px' }} />
              ) : (
                <span style={{
                  padding: '4px 14px', borderRadius: '6px', border: 'none',
                  backgroundColor: '#e5e7eb', color: '#9ca3af', fontSize: '12px',
                  fontWeight: 600,
                }}>Optional</span>
              )}
            </div>

            {/* Error/Success messages */}
            {error && (
              <div style={{
                backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
                padding: '10px', marginTop: '12px', fontSize: '13px', color: '#dc2626',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}><FaExclamationTriangle /> {error}</div>
            )}
            {nameSuccess && (
              <div style={{
                backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px',
                padding: '10px', marginTop: '12px', fontSize: '13px', color: '#16a34a',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}><FaCheckCircle /> {nameSuccess}</div>
            )}

            {/* Privacy Note */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '16px',
              padding: '10px', backgroundColor: '#fafafa', borderRadius: '8px',
            }}>
              <FaShieldAlt style={{ color: '#9ca3af', marginTop: '2px', flexShrink: 0, fontSize: '12px' }} />
              <span style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.4 }}>
                For privacy and security, Information can&apos;t be modified after confirmation. Please{' '}
                <span style={{ color: '#015DAC', cursor: 'pointer' }}>contact customer service</span>.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // Render: KYC Check View (Funds style with tabs)
  // ==============================
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)', padding: '16px',
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '460px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header — Funds */}
        <div style={{
          backgroundColor: '#015DAC', color: '#fff', padding: '12px 16px',
          borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '16px', fontWeight: 600 }}>Funds</span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px',
          }}><FaTimes /></button>
        </div>

        {/* Deposit / Withdrawal Tabs */}
        <div style={{
          display: 'flex', padding: '8px 12px', gap: '6px',
          borderBottom: '1px solid #f3f4f6',
        }}>
          <button style={{
            flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
            backgroundColor: '#e5e7eb', color: '#6b7280',
            fontWeight: 600, fontSize: '13px', cursor: 'default',
          }}>
            Deposit
          </button>
          <button style={{
            flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
            backgroundColor: '#015DAC', color: '#fff',
            fontWeight: 600, fontSize: '13px', cursor: 'default',
          }}>
            Withdrawal
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
              <FaSpinner className="animate-spin" style={{ fontSize: '24px', color: '#015DAC' }} />
            </div>
          ) : (
            <>
              {/* Balance Card */}
              <div style={{
                background: 'linear-gradient(135deg, #005DAC, #1A79D3)', borderRadius: '10px',
                padding: '10px 14px', color: '#fff', marginBottom: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>Main Wallet 💰</span>
                <span style={{ fontSize: '24px', fontWeight: 800 }}>{availableBalance.toFixed(0)}</span>
              </div>

              {/* KYC Requirements Box */}
              <div style={{
                border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
                  <FaInfoCircle style={{ color: '#015DAC', marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>
                    Please complete the verification below before you proceed with the withdrawal request.
                  </span>
                </div>

                {/* Personal Info */}
                <div style={{ marginLeft: '10px', marginBottom: '10px' }}>
                  <div style={{
                    borderLeft: '3px solid #22c55e', paddingLeft: '10px', marginBottom: '6px',
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#22c55e' }}>Personal Info</span>
                  </div>
                  <span
                    onClick={() => setView('personal-info')}
                    style={{
                      display: 'inline-block', padding: '4px 12px', borderRadius: '12px',
                      fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      backgroundColor: hasFullName ? '#dcfce7' : '#dbeafe',
                      color: hasFullName ? '#16a34a' : '#015DAC',
                    }}
                  >
                    Full Name {hasFullName ? '✓' : ''}
                  </span>
                </div>

                {/* Contact Info */}
                <div style={{ marginLeft: '10px' }}>
                  <div style={{
                    borderLeft: '3px solid #22c55e', paddingLeft: '10px', marginBottom: '6px',
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#22c55e' }}>Contact Info</span>
                  </div>
                  <span
                    onClick={() => setView('personal-info')}
                    style={{
                      display: 'inline-block', padding: '4px 12px', borderRadius: '12px',
                      fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      backgroundColor: isPhoneVerified ? '#dcfce7' : '#dbeafe',
                      color: isPhoneVerified ? '#16a34a' : '#015DAC',
                    }}
                  >
                    Phone Number {isPhoneVerified ? '✓' : ''}
                  </span>
                </div>
              </div>

              {/* Payment Methods (greyed out) */}
              <div style={{
                borderRadius: '12px', padding: '16px', position: 'relative',
                backgroundColor: '#f9fafb', border: '1px solid #e5e7eb',
              }}>
                <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
                  <div style={{
                    borderLeft: '3px solid #f59e0b', paddingLeft: '10px', marginBottom: '12px',
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#f59e0b' }}>Payment Method</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {['EasyPaisa', 'JazzCash', 'Bank', 'bKash', 'Nagad', 'Rocket'].map((m) => (
                      <div key={m} style={{
                        padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb',
                        backgroundColor: '#fff', textAlign: 'center', fontSize: '11px',
                        fontWeight: 600, color: '#6b7280',
                      }}>
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Overlay message */}
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', borderRadius: '12px',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    backgroundColor: 'rgba(255,255,255,0.95)', padding: '8px 16px',
                    borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}>
                    <FaExclamationTriangle style={{ color: '#f59e0b', fontSize: '14px' }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                      Please complete the verification.
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Submit (disabled) */}
        <div style={{
          padding: '12px 16px 16px', borderTop: '1px solid #f3f4f6',
          borderRadius: '0 0 16px 16px', backgroundColor: '#fff',
        }}>
          <button
            disabled
            style={{
              width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
              backgroundColor: '#9ca3af', color: '#fff',
              fontWeight: 700, fontSize: '15px', cursor: 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
