'use client';

import { useState, useEffect } from 'react';

/**
 * Affiliate KYC Page
 * KYC verification for affiliate account
 */

interface KYCData {
  status: string;
  identity: {
    documentType: string | null;
    documentNumber: string | null;
    expiryDate: string | null;
    frontImage: string | null;
    backImage: string | null;
    selfieImage: string | null;
    verified: boolean;
  };
  address: {
    documentType: string | null;
    documentNumber: string | null;
    expiryDate: string | null;
    frontImage: string | null;
    backImage: string | null;
    verified: boolean;
  };
}

export default function AffiliateKYCPage() {
  const [activeTab, setActiveTab] = useState<'identity' | 'address'>('identity');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [kycData, setKycData] = useState<KYCData | null>(null);

  // Identity form state
  const [identityForm, setIdentityForm] = useState({
    documentType: '',
    documentNumber: '',
    expiryDate: '',
    frontImage: null as File | null,
    backImage: null as File | null,
    selfieImage: null as File | null,
  });

  // Address form state
  const [addressForm, setAddressForm] = useState({
    documentType: '',
    documentNumber: '',
    expiryDate: '',
    frontImage: null as File | null,
    backImage: null as File | null,
  });

  // Preview URLs
  const [identityPreviews, setIdentityPreviews] = useState({
    front: '',
    back: '',
    selfie: '',
  });

  const [addressPreviews, setAddressPreviews] = useState({
    front: '',
    back: '',
  });

  useEffect(() => {
    fetchKYCData();
  }, []);

  const fetchKYCData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/affiliate/kyc', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setKycData(data.data.kyc);
      }
    } catch (err) {
      console.error('Error fetching KYC data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIdentityFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'frontImage' | 'backImage' | 'selfieImage') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 8MB)
      if (file.size > 8 * 1024 * 1024) {
        setError('File size must not exceed 8MB');
        return;
      }

      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setError('Only jpg, jpeg, and png files are allowed');
        return;
      }

      setIdentityForm(prev => ({ ...prev, [field]: file }));

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewField = field === 'frontImage' ? 'front' : field === 'backImage' ? 'back' : 'selfie';
        setIdentityPreviews(prev => ({ ...prev, [previewField]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddressFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'frontImage' | 'backImage') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 8MB)
      if (file.size > 8 * 1024 * 1024) {
        setError('File size must not exceed 8MB');
        return;
      }

      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setError('Only jpg, jpeg, and png files are allowed');
        return;
      }

      setAddressForm(prev => ({ ...prev, [field]: file }));

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewField = field === 'frontImage' ? 'front' : 'back';
        setAddressPreviews(prev => ({ ...prev, [previewField]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // Validate required fields
      if (!identityForm.documentType || !identityForm.documentNumber || !identityForm.expiryDate || 
          !identityForm.frontImage || !identityForm.selfieImage) {
        setError('Please fill all required fields');
        setSubmitting(false);
        return;
      }

      // Convert images to base64
      const frontImageBase64 = await convertToBase64(identityForm.frontImage);
      const backImageBase64 = identityForm.backImage ? await convertToBase64(identityForm.backImage) : null;
      const selfieImageBase64 = await convertToBase64(identityForm.selfieImage);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/affiliate/kyc/identity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentType: identityForm.documentType,
          documentNumber: identityForm.documentNumber,
          expiryDate: identityForm.expiryDate,
          frontImage: frontImageBase64,
          backImage: backImageBase64,
          selfieImage: selfieImageBase64,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Identity KYC submitted successfully!');
        fetchKYCData();
        // Reset form
        setIdentityForm({
          documentType: '',
          documentNumber: '',
          expiryDate: '',
          frontImage: null,
          backImage: null,
          selfieImage: null,
        });
        setIdentityPreviews({ front: '', back: '', selfie: '' });
      } else {
        setError(data.message || 'Failed to submit KYC');
      }
    } catch (err) {
      setError('Error submitting KYC. Please try again.');
      console.error('Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // Validate required fields
      if (!addressForm.documentType || !addressForm.documentNumber || !addressForm.expiryDate || 
          !addressForm.frontImage) {
        setError('Please fill all required fields');
        setSubmitting(false);
        return;
      }

      // Convert images to base64
      const frontImageBase64 = await convertToBase64(addressForm.frontImage);
      const backImageBase64 = addressForm.backImage ? await convertToBase64(addressForm.backImage) : null;

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/affiliate/kyc/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentType: addressForm.documentType,
          documentNumber: addressForm.documentNumber,
          expiryDate: addressForm.expiryDate,
          frontImage: frontImageBase64,
          backImage: backImageBase64,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Address KYC submitted successfully!');
        fetchKYCData();
        // Reset form
        setAddressForm({
          documentType: '',
          documentNumber: '',
          expiryDate: '',
          frontImage: null,
          backImage: null,
        });
        setAddressPreviews({ front: '', back: '' });
      } else {
        setError(data.message || 'Failed to submit KYC');
      }
    } catch (err) {
      setError('Error submitting KYC. Please try again.');
      console.error('Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-gray-600">Loading KYC data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Affiliate KYC</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('identity')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'identity'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Identity
            </button>
            <button
              onClick={() => setActiveTab('address')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'address'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Address
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Identity Tab */}
        {activeTab === 'identity' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleIdentitySubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <select
                    value={identityForm.documentType}
                    onChange={(e) => setIdentityForm(prev => ({ ...prev, documentType: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose document type</option>
                    <option value="passport">Passport</option>
                    <option value="driving_license">Driving License</option>
                    <option value="national_id">National ID Card</option>
                    <option value="voter_id">Voter ID</option>
                    <option value="aadhaar">Aadhaar Card</option>
                  </select>
                </div>

                {/* Document Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document No *
                  </label>
                  <input
                    type="text"
                    value={identityForm.documentNumber}
                    onChange={(e) => setIdentityForm(prev => ({ ...prev, documentNumber: e.target.value }))}
                    placeholder="Type ID No here"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={identityForm.expiryDate}
                  onChange={(e) => setIdentityForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Front Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Document Photo (Front side) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                    {identityPreviews.front ? (
                      <div className="space-y-4">
                        <img src={identityPreviews.front} alt="Front preview" className="mx-auto max-h-40 rounded" />
                        <button
                          type="button"
                          onClick={() => {
                            setIdentityForm(prev => ({ ...prev, frontImage: null }));
                            setIdentityPreviews(prev => ({ ...prev, front: '' }));
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <label htmlFor="identity-front" className="mt-4 inline-block px-4 py-2 bg-teal-600 text-white rounded-lg cursor-pointer hover:bg-teal-700">
                          choose Image
                        </label>
                        <input
                          id="identity-front"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={(e) => handleIdentityFileChange(e, 'frontImage')}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 bg-blue-50 p-3 rounded">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p>1. Upload jpg, jpeg or png file.</p>
                        <p>2. Not over 8MB.</p>
                        <p>3. Document must contains the date of issue and the name of the person. (the document must be not older than 3 months)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Document Photo (Back side)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                    {identityPreviews.back ? (
                      <div className="space-y-4">
                        <img src={identityPreviews.back} alt="Back preview" className="mx-auto max-h-40 rounded" />
                        <button
                          type="button"
                          onClick={() => {
                            setIdentityForm(prev => ({ ...prev, backImage: null }));
                            setIdentityPreviews(prev => ({ ...prev, back: '' }));
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <label htmlFor="identity-back" className="mt-4 inline-block px-4 py-2 bg-teal-600 text-white rounded-lg cursor-pointer hover:bg-teal-700">
                          choose Image
                        </label>
                        <input
                          id="identity-back"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={(e) => handleIdentityFileChange(e, 'backImage')}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 bg-blue-50 p-3 rounded">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p>1. Upload jpg, jpeg or png file.</p>
                        <p>2. Not over 8MB.</p>
                        <p>3. Document must contains the date of issue and the name of the person. (the document must be not older than 3 months)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selfie Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Handheld KYC Document Photo (Selfie)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  {identityPreviews.selfie ? (
                    <div className="space-y-4">
                      <img src={identityPreviews.selfie} alt="Selfie preview" className="mx-auto max-h-40 rounded" />
                      <button
                        type="button"
                        onClick={() => {
                          setIdentityForm(prev => ({ ...prev, selfieImage: null }));
                          setIdentityPreviews(prev => ({ ...prev, selfie: '' }));
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <label htmlFor="identity-selfie" className="mt-4 inline-block px-4 py-2 bg-teal-600 text-white rounded-lg cursor-pointer hover:bg-teal-700">
                        choose Image
                      </label>
                      <input
                        id="identity-selfie"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={(e) => handleIdentityFileChange(e, 'selfieImage')}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500 bg-blue-50 p-3 rounded">
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p>1. Upload jpg, jpeg or png file.</p>
                      <p>2. Not over 8MB.</p>
                      <p>3. Document must contains the date of issue and the name of the person. (the document must be not older than 3 months)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address Tab */}
        {activeTab === 'address' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleAddressSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <select
                    value={addressForm.documentType}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, documentType: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose document type</option>
                    <option value="utility_bill">Utility Bill</option>
                    <option value="bank_statement">Bank Statement</option>
                    <option value="rental_agreement">Rental Agreement</option>
                    <option value="property_tax">Property Tax Receipt</option>
                  </select>
                </div>

                {/* Document Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document No *
                  </label>
                  <input
                    type="text"
                    value={addressForm.documentNumber}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, documentNumber: e.target.value }))}
                    placeholder="Type ID No here"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={addressForm.expiryDate}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Front Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Document Photo (Front side) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                    {addressPreviews.front ? (
                      <div className="space-y-4">
                        <img src={addressPreviews.front} alt="Front preview" className="mx-auto max-h-40 rounded" />
                        <button
                          type="button"
                          onClick={() => {
                            setAddressForm(prev => ({ ...prev, frontImage: null }));
                            setAddressPreviews(prev => ({ ...prev, front: '' }));
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <label htmlFor="address-front" className="mt-4 inline-block px-4 py-2 bg-teal-600 text-white rounded-lg cursor-pointer hover:bg-teal-700">
                          choose Image
                        </label>
                        <input
                          id="address-front"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={(e) => handleAddressFileChange(e, 'frontImage')}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 bg-blue-50 p-3 rounded">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p>1. Upload jpg, jpeg or png file.</p>
                        <p>2. Not over 8MB.</p>
                        <p>3. Document must contains the date of issue and the name of the person. (the document must be not older than 3 months)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Document Photo (Back side)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                    {addressPreviews.back ? (
                      <div className="space-y-4">
                        <img src={addressPreviews.back} alt="Back preview" className="mx-auto max-h-40 rounded" />
                        <button
                          type="button"
                          onClick={() => {
                            setAddressForm(prev => ({ ...prev, backImage: null }));
                            setAddressPreviews(prev => ({ ...prev, back: '' }));
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <label htmlFor="address-back" className="mt-4 inline-block px-4 py-2 bg-teal-600 text-white rounded-lg cursor-pointer hover:bg-teal-700">
                          choose Image
                        </label>
                        <input
                          id="address-back"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={(e) => handleAddressFileChange(e, 'backImage')}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 bg-blue-50 p-3 rounded">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p>1. Upload jpg, jpeg or png file.</p>
                        <p>2. Not over 8MB.</p>
                        <p>3. Document must contains the date of issue and the name of the person. (the document must be not older than 3 months)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
