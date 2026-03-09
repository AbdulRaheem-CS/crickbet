"use client";
import Image from "next/image";
import { useState } from "react";

export default function VipPage() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: "Bronze",   image: "/vip/tab-1.webp" },
    { name: "Silver",   image: "/vip/tab-2.webp" },
    { name: "Gold",     image: "/vip/tab-3.webp" },
    { name: "Emerald",  image: "/vip/tab-4.webp" },
    { name: "Ruby",     image: "/vip/tab-5.webp" },
    { name: "Diamond",  image: "/vip/tab-6.webp" },
    { name: "Sapphire", image: "/vip/tab-7.webp" },
  ];

  /* ── Per-tab theming ── */
  const tabStyles = [
    { // Bronze
      tabBg: "linear-gradient(180deg, #c47a2a 0%, #a0611a 50%, #7a4410 100%)",
      rowA: "#b8723a", rowB: "#a86530", headerRow: "#8b4d1e",
      accent: "#fde68a", textColor: "#fff",
      dashColor: "#d4a574",
    },
    { // Silver
      tabBg: "linear-gradient(180deg, #b0bec5 0%, #78909c 50%, #546e7a 100%)",
      rowA: "#90a4ae", rowB: "#78909c", headerRow: "#607d8b",
      accent: "#e0e7ee", textColor: "#fff",
      dashColor: "#b0bec5",
    },
    { // Gold
      tabBg: "linear-gradient(180deg, #f5d060 0%, #d4a832 50%, #b8891a 100%)",
      rowA: "#d4a832", rowB: "#c49a28", headerRow: "#b08820",
      accent: "#fffbe6", textColor: "#fff",
      dashColor: "#e8cc66",
    },
    { // Emerald
      tabBg: "linear-gradient(180deg, #34d399 0%, #10b981 50%, #059669 100%)",
      rowA: "#10b981", rowB: "#059669", headerRow: "#047857",
      accent: "#d1fae5", textColor: "#fff",
      dashColor: "#6ee7b7",
    },
    { // Ruby
      tabBg: "linear-gradient(180deg, #fb7185 0%, #e11d48 50%, #be123c 100%)",
      rowA: "#e11d48", rowB: "#be123c", headerRow: "#9f1239",
      accent: "#ffe4e6", textColor: "#fff",
      dashColor: "#fda4af",
    },
    { // Diamond
      tabBg: "linear-gradient(180deg, #67e8f9 0%, #06b6d4 50%, #0891b2 100%)",
      rowA: "#06b6d4", rowB: "#0891b2", headerRow: "#0e7490",
      accent: "#cffafe", textColor: "#fff",
      dashColor: "#a5f3fc",
    },
    { // Sapphire
      tabBg: "linear-gradient(180deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)",
      rowA: "#6366f1", rowB: "#4f46e5", headerRow: "#4338ca",
      accent: "#e0e7ff", textColor: "#fff",
      dashColor: "#a5b4fc",
    },
  ];

  const silverData = [
    { label: "VIP Points",                  value: "10,000",      icon: "⭐" },
    { label: "VIP Points to Cash",          value: "1,100 ▶ 1",  icon: "🏆" },
    { label: "Slots Instant Rebate",        value: "0.80%",       icon: "�" },
    { label: "Live Casino Instant Rebate",  value: "0.45%",       icon: "�" },
    { label: "Sports Instant Rebate",       value: "0.30%",       icon: "�" },
    { label: "VIP Points Conversion",       value: "10 ▶ 1",     icon: "🪙" },
    { label: "VIP Point Maintenance",       value: "⭐ 5,000",    icon: "" },
    { label: "VIP Payment Solutions",       value: "Yes",         icon: "🤝" },
    { label: "VIP Instant Payments",        value: "—",           icon: "" },
    { label: "VIP Dedicated Manager",       value: "—",           icon: "" },
    { label: "VIP Birthday Bonus",          value: "—",           icon: "" },
    { label: "VIP Exclusive Rewards",       value: "—",           icon: "" },
  ];

  const tableData = [
    // Bronze
    [
      { label: "VIP Points to Cash",        value: "1,200 ▶ 1",  icon: "🏆" },
      { label: "Slots Instant Rebate",      value: "0.70%",       icon: "�" },
      { label: "Live Casino Instant Rebate", value: "0.35%",      icon: "�" },
      { label: "Sports Instant Rebate",     value: "0.20%",       icon: "�" },
      { label: "VIP Point Conversion",      value: "10 ▶ 1",     icon: "🪙" },
      { label: "VIP Point Maintenance",     value: "—",           icon: "" },
      { label: "VIP Payment Solutions",     value: "—",           icon: "" },
      { label: "VIP Instant Payments",      value: "—",           icon: "" },
      { label: "VIP Dedicated Manager",     value: "—",           icon: "" },
      { label: "VIP Birthday Bonus",        value: "—",           icon: "" },
      { label: "VIP Exclusive Rewards",     value: "—",           icon: "" },
      { label: "VIP Deluxe Gifts",          value: "—",           icon: "" },
    ],
    // Silver
    silverData,
    // Gold
    [
      { label: "VIP Points",                value: "50,000",      icon: "⭐" },
      { label: "VIP Points to Cash",        value: "1,000 ▶ 1",  icon: "🏆" },
      { label: "Slots Instant Rebate",      value: "0.90%",       icon: "�" },
      { label: "Live Casino Instant Rebate", value: "0.45%",      icon: "�" },
      { label: "Sports Instant Rebate",     value: "0.30%",       icon: "�" },
      { label: "VIP Points Conversion",     value: "8 ▶ 1",      icon: "🪙" },
      { label: "VIP Point Maintenance",     value: "⭐ 25,000",   icon: "" },
      { label: "VIP Payment Solutions",     value: "Yes",         icon: "🤝" },
      { label: "VIP Instant Payments",      value: "—",           icon: "" },
      { label: "VIP Dedicated Manager",     value: "—",           icon: "" },
      { label: "VIP Birthday Bonus",        value: "Yes",         icon: "🎂" },
      { label: "VIP Exclusive Rewards",     value: "—",           icon: "" },
    ],
    // Emerald
    [
      { label: "VIP Points",                value: "200,000",     icon: "⭐" },
      { label: "VIP Points to Cash",        value: "800 ▶ 1",    icon: "🏆" },
      { label: "Slots Instant Rebate",      value: "1.00%",       icon: "�" },
      { label: "Live Casino Instant Rebate", value: "0.50%",      icon: "�" },
      { label: "Sports Instant Rebate",     value: "0.35%",       icon: "�" },
      { label: "VIP Points Conversion",     value: "6 ▶ 1",      icon: "🪙" },
      { label: "VIP Point Maintenance",     value: "⭐ 100,000",  icon: "" },
      { label: "VIP Payment Solutions",     value: "Yes",         icon: "🤝" },
      { label: "VIP Instant Payments",      value: "Yes",         icon: "⚡" },
      { label: "VIP Dedicated Manager",     value: "—",           icon: "" },
      { label: "VIP Birthday Bonus",        value: "Yes",         icon: "🎂" },
      { label: "VIP Exclusive Rewards",     value: "Yes",         icon: "🎁" },
    ],
    // Ruby
    [
      { label: "VIP Points",                value: "800,000",     icon: "⭐" },
      { label: "VIP Points to Cash",        value: "600 ▶ 1",    icon: "🏆" },
      { label: "Slots Instant Rebate",      value: "1.10%",       icon: "�" },
      { label: "Live Casino Instant Rebate", value: "0.55%",      icon: "�" },
      { label: "Sports Instant Rebate",     value: "0.40%",       icon: "�" },
      { label: "VIP Points Conversion",     value: "5 ▶ 1",      icon: "🪙" },
      { label: "VIP Point Maintenance",     value: "⭐ 400,000",  icon: "" },
      { label: "VIP Payment Solutions",     value: "Yes",         icon: "🤝" },
      { label: "VIP Instant Payments",      value: "Yes",         icon: "⚡" },
      { label: "VIP Dedicated Manager",     value: "Yes",         icon: "👤" },
      { label: "VIP Birthday Bonus",        value: "Yes",         icon: "🎂" },
      { label: "VIP Exclusive Rewards",     value: "Yes",         icon: "🎁" },
    ],
    // Diamond
    [
      { label: "VIP Points",                value: "3,000,000",   icon: "⭐" },
      { label: "VIP Points to Cash",        value: "400 ▶ 1",    icon: "🏆" },
      { label: "Slots Instant Rebate",      value: "1.20%",       icon: "�" },
      { label: "Live Casino Instant Rebate", value: "0.60%",      icon: "�" },
      { label: "Sports Instant Rebate",     value: "0.45%",       icon: "�" },
      { label: "VIP Points Conversion",     value: "4 ▶ 1",      icon: "🪙" },
      { label: "VIP Point Maintenance",     value: "⭐ 1,500,000", icon: "" },
      { label: "VIP Payment Solutions",     value: "Yes",         icon: "🤝" },
      { label: "VIP Instant Payments",      value: "Yes",         icon: "⚡" },
      { label: "VIP Dedicated Manager",     value: "Yes",         icon: "👤" },
      { label: "VIP Birthday Bonus",        value: "Yes",         icon: "🎂" },
      { label: "VIP Exclusive Rewards",     value: "Yes",         icon: "🎁" },
    ],
    // Sapphire
    [
      { label: "VIP Points",                value: "10,000,000",  icon: "⭐" },
      { label: "VIP Points to Cash",        value: "200 ▶ 1",    icon: "🏆" },
      { label: "Slots Instant Rebate",      value: "1.50%",       icon: "�" },
      { label: "Live Casino Instant Rebate", value: "0.75%",      icon: "�" },
      { label: "Sports Instant Rebate",     value: "0.50%",       icon: "�" },
      { label: "VIP Points Conversion",     value: "2 ▶ 1",      icon: "🪙" },
      { label: "VIP Point Maintenance",     value: "⭐ 5,000,000", icon: "" },
      { label: "VIP Payment Solutions",     value: "Yes",         icon: "🤝" },
      { label: "VIP Instant Payments",      value: "Yes",         icon: "⚡" },
      { label: "VIP Dedicated Manager",     value: "Yes",         icon: "👤" },
      { label: "VIP Birthday Bonus",        value: "Yes",         icon: "🎂" },
      { label: "VIP Exclusive Rewards",     value: "Yes",         icon: "🎁" },
    ],
  ];

  const s = tabStyles[activeTab];
  const rows = tableData[activeTab];

  return (
    <div className="m-0 p-0" style={{ color: "#fff" }}>
      {/* Keyframes & utility classes */}
      <style>{`
        @keyframes shieldPulse {
          0%   { transform: scale(0.92) translateY(0px); filter: drop-shadow(0 0 6px #FFD700aa); opacity: 0.85; }
          50%  { transform: scale(1.12) translateY(-10px); filter: drop-shadow(0 0 22px #FFD700ff) drop-shadow(0 0 40px #FFD70066); opacity: 1; }
          100% { transform: scale(0.92) translateY(0px); filter: drop-shadow(0 0 6px #FFD700aa); opacity: 0.85; }
        }
        .shield-animate { animation: shieldPulse 2.4s ease-in-out infinite; }

  .tab-img-inactive { filter: grayscale(90%) brightness(0.55) opacity(0.7); }
  .tab-img-active   { filter: grayscale(0%) brightness(1.15) drop-shadow(0 4px 12px rgba(255,215,0,0.5)); }

  .vip-tab-btn { /* static - no transition */ }
  .vip-tab-btn:hover .tab-img-inactive { filter: grayscale(40%) brightness(0.8); }

  .vip-table-row { /* static - no transition */ }

        /* Subtle shimmer on the tab area background */
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .tab-area-shimmer {
          background-size: 200% 100%;
          animation: shimmer 8s linear infinite;
        }
      `}</style>

      {/* ── Hero / Why VIP Club ── */}
      <div className="max-w-4xl mx-auto mt-10 mb-6 px-4">
        <div className="rounded-xl overflow-hidden" style={{ background: "#07356C", border: "3px solid #FFD700" }}>
          <div className="flex flex-row">
            {/* Left 70% */}
            <div className="flex items-center p-6 sm:p-8" style={{ width: "70%" }}>
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                  WHY KingBaji <span style={{ color: "#FFD700" }}>VIP CLUB?</span>
                </h2>
                <p className="mt-4 text-sm sm:text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
                  The KingBaji VIP Club takes your gaming journey to the next level with priority
                  transactions, faster withdrawals, and a 24/7 personal VIP manager dedicated only
                  to KingBaji VIP members.
                </p>
                <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
                  Join the KingBaji VIP Club today and enjoy exclusive rewards, exciting offers, and
                  cash prizes designed just for you!
                </p>
              </div>
            </div>
            {/* Right 30% */}
            <div className="relative overflow-hidden flex items-center justify-center" style={{ width: "30%", minHeight: "180px" }}>
              <Image src="/vip/mob_BG.webp" alt="VIP Club Background" fill className="object-cover" style={{ position: "absolute", inset: 0 }} />
              <div className="relative z-10 flex items-center justify-center w-full h-full" style={{ minHeight: "180px" }}>
                <div className="shield-animate" style={{ width: "65%", maxWidth: "120px" }}>
                  <Image src="/vip/CX-shield.webp" alt="CX Shield" width={120} height={140} className="w-full h-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── VIP Tiers Section ── */}
      <div className="max-w-4xl mx-auto mb-10 px-4">
        {/* Constant outer border - always gold */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "3px solid #FFD700", background: "#07356C" }}
        >
          {/* ── Tab Area ── single box background behind ALL tabs ── */}
          <div className="p-3 pb-0" style={{ background: "#07356C" }}>
            {/* This rounded box is the single shared background for all tabs */}
            <div
              className="rounded-xl flex items-end justify-between overflow-hidden"
              style={{
                background: s.tabBg,
                padding: "14px 10px 0",
                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.25)",
              }}
            >
              {tabs.map((tab, idx) => {
                const isActive = activeTab === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className="vip-tab-btn flex flex-col items-center flex-1 focus:outline-none relative"
                    style={{
                      padding: "6px 4px 0",
                      background: isActive
                        ? "rgba(255,255,255,0.18)"
                        : "transparent",
                      borderRadius: "10px 10px 0 0",
                      borderBottom: isActive ? "3px solid rgba(255,255,255,0.5)" : "3px solid transparent",
                    }}
                  >
                    <div
                      className="relative"
                      style={{
                        width: "60px",
                        height: "60px",
                      }}
                    >
                      <Image
                        src={tab.image}
                        alt={tab.name}
                        fill
                        className={`object-contain ${isActive ? "tab-img-active" : "tab-img-inactive"}`}
                      />
                    </div>
                    <span
                      className="font-bold mt-1 pb-2"
                      style={{
                        color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                        fontSize: "11px",
                        textShadow: isActive ? "0 1px 4px rgba(0,0,0,0.5)" : "none",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {tab.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Table ── background color changes per tab */}
          <div
            className="overflow-x-auto"
            style={{
              background: s.tabBg,
            }}
          >
            <div className="w-full">
              <div className="space-y-3 px-3 sm:px-4 py-4">
                {rows.map((row, idx) => {
                  const isDash = row.value === "—";
                  return (
                    <div
                      key={idx}
                      className="rounded-lg"
                      style={{
                        background: "rgba(255,255,255,0.92)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 4px rgba(2,6,23,0.04)",
                        border: "1px solid rgba(0,0,0,0.06)",
                        padding: "8px 12px",
                      }}
                    >
                      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4">
                        <div className="font-semibold text-sm sm:text-base" style={{ color: "#0b3766" }}>
                          {row.label}
                        </div>
                        <div className="text-right font-bold text-sm sm:text-base whitespace-nowrap">
                          <span className="inline-flex items-center gap-2">
                            {row.icon && <span className="text-lg">{row.icon}</span>}
                            <span style={{ fontWeight: isDash ? 400 : 700, color: isDash ? "rgba(11,55,102,0.4)" : "#0b3766" }}>
                              {row.value}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── What is VIP Experience (VE) Point? ── */}
      <div className="max-w-4xl mx-auto mb-6 px-4 mt-2">
        <h2 className="text-2xl sm:text-2xl font-extrabold text-white mb-2">
          What is <span style={{ color: "#FFD700" }}>VIP Experience (VE) Point?</span>
        </h2>
        <p className="text-sm sm:text-md mb-5 leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
          VIP Experience (VE) Points are earned from your turnover and used to determine
          your VIP tier, but they cannot be converted into real cash.
        </p>

        {/* Card */}
        <div
          className="rounded-xl overflow-hidden mt-4"
          style={{ background: "#0d3d78", border: "2px solid #FFD700", position: "relative" }}
        >
          {/* Decorative illustration – top-right corner */}
          <div
            className="absolute right-0 top-0 w-28 h-28 sm:w-36 sm:h-36 pointer-events-none mt-2"
            style={{ zIndex: 1 }}
          >
            {/* Coin bag icon – CSS-only approximation */}
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-70" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}>
              <ellipse cx="62" cy="30" rx="18" ry="14" fill="#3a7bd5" />
              <ellipse cx="62" cy="30" rx="13" ry="9" fill="#4a9eed" />
              <ellipse cx="55" cy="62" rx="22" ry="26" fill="#2e6abf" />
              <ellipse cx="55" cy="62" rx="17" ry="21" fill="#3a7bd5" />
              <circle cx="55" cy="58" r="10" fill="#FFD700" opacity="0.9" />
              <text x="50" y="63" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#8B6914">$</text>
              <circle cx="72" cy="75" r="9" fill="#FFD700" />
              <text x="72" y="80" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#8B6914">$</text>
              <circle cx="38" cy="78" r="7" fill="#FFD700" opacity="0.8" />
            </svg>
          </div>

          {/* Header row */}
          <div className="relative z-10 px-5 py-3.5 mt-2" style={{ background: "#0d3d78" }}>
            <p className="text-white font-bold text-sm sm:text-base">
              VIP Experience (VE) Conversion:
            </p>
          </div>

          {/* Inner table */}
          <div className="relative z-10 mx-4 mb-4 rounded-xl overflow-hidden" style={{ background: "#0a3268" }}>
            {/* Column header */}
            <div
              className="flex items-center justify-between px-5 py-2.5"
              style={{ background: "#2563a8" }}
            >
              <span className="text-white font-semibold text-xs sm:text-sm">Product Type</span>
              <span className="text-white font-semibold text-xs sm:text-sm">Turnover | VE</span>
            </div>
            {/* Data row */}
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
                Bronze, Silver, Gold, Emerald, Ruby, Diamond
              </span>
              <span className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm whitespace-nowrap" style={{ color: "#fff" }}>
                <span className="text-base">🪙</span>
                <span>10</span>
                <span className="mx-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>=</span>
                <span className="text-base">⭐</span>
                <span>1 VE</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Game Conversion For VIP Experience & VIP Points ── */}
      <div className="max-w-4xl mx-auto mb-12 px-4 mt-2">
        <h2 className="text-2xl sm:text-2xl font-extrabold text-white mb-5">
          Game Conversion For{" "}
          <span style={{ color: "#FFD700" }}>VIP Experience &amp; VIP Points:</span>
        </h2>

        {/* Card */}
        <div
          className="rounded-xl overflow-hidden mt-2"
          style={{ background: "#0d3d78", border: "2px solid #FFD700" }}
        >
          {/* Inner table */}
          <div className="mx-4 my-4 rounded-xl overflow-hidden mt-2 mb-2" style={{ background: "#0a3268" }}>
            {/* Column header */}
            <div
              className="flex items-center justify-between px-5 py-2.5"
              style={{ background: "#2563a8" }}
            >
              <span className="text-white font-semibold text-xs sm:text-sm">Product Type</span>
              <span className="text-white font-semibold text-xs sm:text-sm">Conversion %</span>
            </div>

            {/* Row 1 */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>Slots, Lottery</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm whitespace-nowrap" style={{ color: "#fff" }}>
                <span className="text-base">🪙</span>
                <span>1</span>
                <span className="mx-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>=</span>
                <span className="text-base">⭐</span>
                <span style={{ color: "#fde047", fontWeight: 800 }}>100%</span>
              </span>
            </div>

            {/* Row 2 */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
                Sports, Casino, Fishing, Esports, Crash, CockFighting
              </span>
              <span className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm whitespace-nowrap" style={{ color: "#fff" }}>
                <span className="text-base">🪙</span>
                <span>1</span>
                <span className="mx-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>=</span>
                <span className="text-base">⭐</span>
                <span style={{ color: "#fde047", fontWeight: 800 }}>50%</span>
              </span>
            </div>

            {/* Row 3 */}
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>Card, Table, Arcade</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm whitespace-nowrap" style={{ color: "#fff" }}>
                <span className="text-base">🪙</span>
                <span>1</span>
                <span className="mx-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>=</span>
                <span className="text-base">⭐</span>
                <span style={{ color: "#fde047", fontWeight: 800 }}>25%</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Games Gallery Section with 3 Rows ── */}
      <div className="">
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marquee-reverse {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .marquee-row {
            display: flex;
            gap: 12px;
            animation: marquee 40s linear infinite;
          }
          .marquee-row-reverse {
            display: flex;
            gap: 12px;
            animation: marquee-reverse 40s linear infinite;
          }
          .marquee-container:hover .marquee-row,
          .marquee-container:hover .marquee-row-reverse {
            animation-play-state: paused;
          }
          .game-image-wrapper {
            flex-shrink: 0;
            width: 150px;
            height: 150px;
            border-radius: 12px;
            overflow: hidden;
            transition: transform 0.3s ease;
          }
          .game-image-wrapper:hover {
            transform: scale(1.05);
          }
          .game-image-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        `}</style>

        <div className=" overflow-hidden" style={{ background: "#07356C", borderTop: "3px solid #FFD700", borderBottom: "3px solid #FFD700", padding: "24px" }}>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-6">
            <span style={{ color: "#FFD700" }}>FEATURED</span> GAMES
          </h2>

          {/* Row 1 - Scroll Left to Right */}
          <div className="marquee-container overflow-hidden mb-4">
            <div className="marquee-row">
              {/* First set */}
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Pirate-Queen-2-JILI.png" alt="Pirate Queen 2" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Pirate-Queen-2-JILI.png" alt="Pirate Queen 2" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Wild-Ace-JILI.png" alt="Wild Ace" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Super-Rich-JILI.png" alt="Super Rich" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Super-Ace-Joker-JILI.png" alt="Super Ace Joker" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Pirate-Queen-2-JILI.png" alt="Pirate Queen 2" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Pirate-Queen-2-JILI.png" alt="Pirate Queen 2" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Money-Pot-JILI.png" alt="Money Pot" />
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Pirate-Queen-2-JILI.png" alt="Pirate Queen 2" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Pirate-Queen-2-JILI.png" alt="Pirate Queen 2" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Wild-Ace-JILI.png" alt="Wild Ace" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Super-Rich-JILI.png" alt="Super Rich" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Super-Ace-Joker-JILI.png" alt="Super Ace Joker" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Pirate-Queen-2-JILI.png" alt="Pirate Queen 2" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Pirate-Queen-2-JILI.png" alt="Pirate Queen 2" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Money-Pot-JILI.png" alt="Money Pot" />
              </div>
            </div>
          </div>

          {/* Row 2 - Scroll Right to Left */}
          <div className="marquee-container overflow-hidden mb-4">
            <div className="marquee-row-reverse">
              {/* First set */}
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Money-Coming-JILI.png" alt="Money Coming" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Mega-Ace-JILI.png" alt="Mega Ace" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Pirate-Queen-2-JILI.png" alt="Pirate Queen 2" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Lucky-Jaguar-JILI.png" alt="Lucky Jaguar" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Mega-Ace-JILI.png" alt="Mega Ace" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Mega-Ace-JILI.png" alt="Mega Ace" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Golden-Bank-JILI.png" alt="Golden Bank" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Mega-Ace-JILI.png" alt="Mega Ace" />
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Money-Coming-JILI.png" alt="Money Coming" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Mega-Ace-JILI.png" alt="Mega Ace" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Pirate-Queen-2-JILI.png" alt="Pirate Queen 2" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Lucky-Jaguar-JILI.png" alt="Lucky Jaguar" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Mega-Ace-JILI.png" alt="Mega Ace" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Mega-Ace-JILI.png" alt="Mega Ace" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Golden-Bank-JILI.png" alt="Golden Bank" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Amazing-Gems-3-JILI.png" alt="Amazing Gems 3" />
              </div>
            </div>
          </div>

          {/* Row 3 - Scroll Left to Right */}
          <div className="marquee-container overflow-hidden">
            <div className="marquee-row">
              {/* First set */}
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Mega-Ace-JILI.png" alt="Mega Ace" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Fortune-Coins-JILI.png" alt="Fortune Coins" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Diamond-Party-JILI.png" alt="Diamond Party" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Crystal-777-JILI.png" alt="Crystal 777" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Mega-Ace-JILI.png" alt="Mega Ace" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Charge-Buffalo-JILI.png" alt="Charge Buffalo" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Fortune-Gems-JILI.png" alt="Fortune Gems" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Fortune-Gems-2-JILI.png" alt="Fortune Gems 2" />
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Mega-Ace-JILI.png" alt="Mega Ace" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Fortune-Coins-JILI.png" alt="Fortune Coins" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Diamond-Party-JILI.png" alt="Diamond Party" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Crystal-777-JILI.png" alt="Crystal 777" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Mega-Ace-JILI.png" alt="Mega Ace" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Charge-Buffalo-JILI.png" alt="Charge Buffalo" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Fortune-Gems-JILI.png" alt="Fortune Gems" />
              </div>
              <div className="game-image-wrapper">
                <img src="https://KingBajiguide.com/wp-content/uploads/2025/10/Fortune-Gems-2-JILI.png" alt="Fortune Gems 2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}