'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  FaHome, 
  FaUser, 
  FaUniversity, 
  FaSitemap, 
  FaIdCard, 
  FaCog, 
  FaChartBar,
  FaSearch,
  FaUserPlus,
  FaChartLine,
  FaDollarSign,
  FaChevronDown,
  FaChevronRight,
  FaGift,
  FaLink
} from 'react-icons/fa';

interface AffiliateSidebarProps {
  isOpen: boolean;
}

export default function AffiliateSidebar({ isOpen }: AffiliateSidebarProps) {
  const pathname = usePathname();
  const [myAccountOpen, setMyAccountOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <aside
      className={`bg-[#6B7383] text-white min-h-screen overflow-y-auto transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-0 lg:w-16'
      }`}
    >
      <nav className="py-4">
        <h3 className="text-lg font-semibold pb-4 pl-4">Welcome</h3>
        {/* Dashboard */}
        <Link
          href="/affiliate"
          className={`flex items-center gap-3 px-4 py-3 hover:bg-[#5a6170] transition ${
            isActive('/affiliate') ? 'bg-[#4f5663] border-l-4 border-blue-500' : ''
          }`}
        >
          <FaHome className="text-lg flex-shrink-0" />
          {isOpen && <span className="text-sm">Dashboard</span>}
        </Link>

        {/* My Account Dropdown */}
        <div>
          <button
            onClick={() => setMyAccountOpen(!myAccountOpen)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#5a6170] transition"
          >
            <div className="flex items-center gap-3">
              <FaUser className="text-lg flex-shrink-0" />
              {isOpen && <span className="text-sm">My Account</span>}
            </div>
            {isOpen && (
              myAccountOpen ? <FaChevronDown className="text-sm" /> : <FaChevronRight className="text-sm" />
            )}
          </button>
          
          {isOpen && myAccountOpen && (
            <div className="bg-[#FFFFFF]">
              <Link
                href="/affiliate/profile"
                className={`flex items-center gap-3 pl-12 pr-4 py-2 hover:bg-gray-100 transition text-sm text-gray-800 ${
                  isActive('/affiliate/profile') ? 'bg-gray-200 border-l-4 border-blue-500' : ''
                }`}
              >
                Profile
              </Link>
              <Link
                href="/affiliate/bank"
                className={`flex items-center gap-3 pl-12 pr-4 py-2 hover:bg-gray-100 transition text-sm text-gray-800 ${
                  isActive('/affiliate/bank') ? 'bg-gray-200 border-l-4 border-blue-500' : ''
                }`}
              >
                Bank
              </Link>
              <Link
                href="/affiliate/hierarchy"
                className={`flex items-center gap-3 pl-12 pr-4 py-2 hover:bg-gray-100 transition text-sm text-gray-800 ${
                  isActive('/affiliate/hierarchy') ? 'bg-gray-200 border-l-4 border-blue-500' : ''
                }`}
              >
                Hierarchy
              </Link>
              <Link
                href="/affiliate/kyc"
                className={`flex items-center gap-3 pl-12 pr-4 py-2 hover:bg-gray-100 transition text-sm text-gray-800 ${
                  isActive('/affiliate/kyc') ? 'bg-gray-200 border-l-4 border-blue-500' : ''
                }`}
              >
                Affiliate KYC
              </Link>
              <Link
                href="/affiliate/commission-designation"
                className={`flex items-center gap-3 pl-12 pr-4 py-2 hover:bg-gray-100 transition text-sm text-gray-800 ${
                  isActive('/affiliate/commission-designation') ? 'bg-gray-200 border-l-4 border-blue-500' : ''
                }`}
              >
                Commission Designation
              </Link>
            </div>
          )}
        </div>

        {/* Material */}
        <Link
          href="/affiliate/material"
          className={`flex items-center gap-3 px-4 py-3 hover:bg-[#5a6170] transition ${
            isActive('/affiliate/material') ? 'bg-[#4f5663] border-l-4 border-blue-500' : ''
          }`}
        >
          <FaLink className="text-lg flex-shrink-0" />
          {isOpen && <span className="text-sm">Material</span>}
        </Link>

        {/* Report Dropdown */}
        <div>
          <button
            onClick={() => setReportOpen(!reportOpen)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#5a6170] transition"
          >
            <div className="flex items-center gap-3">
              <FaChartBar className="text-lg flex-shrink-0" />
              {isOpen && <span className="text-sm">Report</span>}
            </div>
            {isOpen && (
              reportOpen ? <FaChevronDown className="text-sm" /> : <FaChevronRight className="text-sm" />
            )}
          </button>
          
          {isOpen && reportOpen && (
            <div className="bg-[#FFFFFF]">
              <Link
                href="/affiliate/member-search"
                className={`flex items-center gap-3 pl-12 pr-4 py-2 hover:bg-gray-100 transition text-sm text-gray-800 ${
                  isActive('/affiliate/member-search') ? 'bg-gray-200 border-l-4 border-blue-500' : ''
                }`}
              >
                Member Search
              </Link>
              <Link
                href="/affiliate/registrations-ftds"
                className={`flex items-center gap-3 pl-12 pr-4 py-2 hover:bg-gray-100 transition text-sm text-gray-800 ${
                  isActive('/affiliate/registrations-ftds') ? 'bg-gray-200 border-l-4 border-blue-500' : ''
                }`}
              >
                Registrations & FTDs
              </Link>
              <Link
                href="/affiliate/performance"
                className={`flex items-center gap-3 pl-12 pr-4 py-2 hover:bg-gray-100 transition text-sm text-gray-800 ${
                  isActive('/affiliate/performance') ? 'bg-gray-200 border-l-4 border-blue-500' : ''
                }`}
              >
                Performance
              </Link>
              <Link
                href="/affiliate/commission"
                className={`flex items-center gap-3 pl-12 pr-4 py-2 hover:bg-gray-100 transition text-sm text-gray-800 ${
                  isActive('/affiliate/commission') ? 'bg-gray-200 border-l-4 border-blue-500' : ''
                }`}
              >
                Commission
              </Link>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
