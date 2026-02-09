'use client';

import Image from 'next/image';
import { FaClock } from 'react-icons/fa';

interface PromotionCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  badge?: string;
  offerType: string;
  isNew?: boolean;
  onRegister: () => void;
  onDetail: () => void;
}

export default function PromotionCard({
  title,
  description,
  image,
  badge,
  offerType,
  isNew = false,
  onRegister,
  onDetail,
}: PromotionCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
      {/* Image Section */}
      <div className="relative h-48 bg-linear-to-br from-blue-500 to-green-400 overflow-hidden">
        {isNew && (
          <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded z-10">
            NEW
          </div>
        )}
        {badge && (
          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 z-10">
            <span>CX</span>
          </div>
        )}
        
        {/* Promotion Image */}
        <Image
          src="/promo-banner.jpg"
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        <h3 className="text-gray-900 font-bold text-base line-clamp-2 min-h-12">
          {title}
        </h3>
        
        <p className="text-gray-600 text-sm line-clamp-2 min-h-10">
          {description}
        </p>

        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <FaClock className="w-3 h-3" />
          <span>{offerType}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onRegister}
            className="flex-1 bg-[#7ED321] hover:bg-[#6BC219] text-white font-semibold py-2.5 rounded transition"
          >
            Register Now
          </button>
          <button
            onClick={onDetail}
            className="flex-1 bg-[#015DAC] hover:bg-[#014A8A] text-white font-semibold py-2.5 rounded transition"
          >
            Detail
          </button>
        </div>
      </div>
    </div>
  );
}
