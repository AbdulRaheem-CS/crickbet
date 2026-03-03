'use client';

/**
 * Currency and Language Modal Component
 * Modal matching the Crickex design — rows with flag, currency, and language buttons
 * Uses country-flag-icons/react/1x1 for proper circular SVG flags
 */

import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import IN from 'country-flag-icons/react/1x1/IN';
import BD from 'country-flag-icons/react/1x1/BD';
import PK from 'country-flag-icons/react/1x1/PK';
import NP from 'country-flag-icons/react/1x1/NP';
import LK from 'country-flag-icons/react/1x1/LK';
import AE from 'country-flag-icons/react/1x1/AE';

type FlagComponent = (props: React.HTMLAttributes<HTMLElement & SVGElement>) => React.JSX.Element;

interface CurrencyOption {
  FlagIcon: FlagComponent | null; // null = use emoji fallback (USDT)
  flagEmoji?: string;
  symbol: string;
  code: string;
  languages: { label: string; value: string }[];
}

const currencyOptions: CurrencyOption[] = [
  {
    FlagIcon: IN,
    symbol: '₹',
    code: 'INR',
    languages: [
      { label: 'English', value: 'en' },
      { label: 'हिंदी', value: 'hi' },
    ],
  },
  {
    FlagIcon: BD,
    symbol: '৳',
    code: 'BDT',
    languages: [
      { label: 'বাংলা', value: 'bn' },
      { label: 'English', value: 'en' },
    ],
  },
  {
    FlagIcon: PK,
    symbol: 'Rs',
    code: 'PKR',
    languages: [{ label: 'English', value: 'en' }],
  },
  {
    FlagIcon: null,
    flagEmoji: '🪙',
    symbol: '$',
    code: 'USDT',
    languages: [{ label: 'English', value: 'en' }],
  },
  {
    FlagIcon: NP,
    symbol: 'Rs',
    code: 'NPR',
    languages: [
      { label: 'नेपाली', value: 'ne' },
      { label: 'English', value: 'en' },
    ],
  },
  {
    FlagIcon: LK,
    symbol: 'Rs',
    code: 'LKR',
    languages: [{ label: 'English', value: 'en' }],
  },
  {
    FlagIcon: AE,
    symbol: 'AED',
    code: 'AED',
    languages: [{ label: 'English', value: 'en' }],
  },
];

interface CurrencyLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CurrencyLanguageModal({ isOpen, onClose }: CurrencyLanguageModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState('BDT');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  if (!isOpen) return null;

  const handleSelect = (currencyCode: string, langValue: string) => {
    setSelectedCurrency(currencyCode);
    setSelectedLanguage(langValue);
    // TODO: persist to backend / localStorage
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-lg shadow-2xl w-95 max-w-[95vw] mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#1E5DAC] text-white px-5 py-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Currency and Language</h2>
            <button
              onClick={onClose}
              className="hover:bg-white/20 p-1.5 rounded transition"
              aria-label="Close"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {currencyOptions.map((opt) => (
              <div key={opt.code} className="flex items-center gap-3 px-5 py-3">
                {/* Flag (circular SVG) */}
                <span className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-gray-100">
                  {opt.FlagIcon
                    ? <opt.FlagIcon className="w-full h-full object-cover" />
                    : <span className="text-lg leading-none">{opt.flagEmoji}</span>
                  }
                </span>

                {/* Currency label */}
                <span className="text-sm text-gray-700 font-medium w-16 shrink-0 whitespace-nowrap">
                  {opt.symbol}&nbsp;&nbsp;{opt.code}
                </span>

                {/* Language buttons */}
                <div className="flex gap-2 ml-auto">
                  {opt.languages.map((lang) => {
                    const isActive =
                      selectedCurrency === opt.code && selectedLanguage === lang.value;
                    return (
                      <button
                        key={lang.value}
                        onClick={() => handleSelect(opt.code, lang.value)}
                        className={`px-4 py-1.5 rounded border text-sm font-medium transition whitespace-nowrap ${
                          isActive
                            ? 'border-[#005DAC] text-[#005DAC] bg-blue-50'
                            : 'border-gray-300 text-gray-600 hover:border-gray-400 bg-white'
                        }`}
                      >
                        {lang.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
