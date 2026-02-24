"use client";
import Image from "next/image";
import { useState } from "react";

export default function ReferralPage() {
  const steps = [
    {
      number: "01",
      title: "Click on My Account",
      image: "/referral/Step1-1.webp",
    },
    {
      number: "02",
      title: "Click on Refer Bonus",
      image: "/referral/Step2-2.webp",
    },
    {
      number: "03",
      title: "Click on Share Button",
      image: "/referral/Step3-1.webp",
    },
    {
      number: "04",
      title: "Share With Friends",
      image: "/referral/step4-1.webp",
    },
  ];

  const section_two = [
    {
        title: "left image",
        image: "/referral/commision_level.webp",
    },
    {
        title: "right image",
        image: "/referral/person_img.webp",
    }
  ]

  return (
    <div className="m-0 p-0">
      {/* Hero Banner Image */}
      <img
        src="/referral/ENG.webp"
        alt="Unlimited Referral Programs"
        className="w-full block"
      />

      {/* Steps to Refer Section */}
      <div className="px-4 sm:px-8 md:px-18 lg:px-18 py-6 sm:py-8 md:py-10">
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: "#07356C",
            border: "4px solid #3E97FF",
          }}
        >
          {/* "Steps to refer" heading bar */}
          <div className="relative mb-4 sm:mb-6">
            <div
              className="inline-block px-5 sm:px-8 py-2 sm:py-2.5 text-white font-bold text-sm sm:text-base tracking-wide"
              style={{
                background:
                  "linear-gradient(90deg, #4abe2b 0%, #3aa822 60%, #2d8f1a 100%)",
                clipPath: "polygon(0 0, 100% 0, 92% 100%, 0% 100%)",
                paddingRight: "2.5rem",
              }}
            >
              Steps to refer
            </div>
          </div>

          {/* Sub-heading */}
          <p className="text-white/90 text-xs sm:text-sm md:text-base font-medium px-5 sm:px-8 mb-5 sm:mb-8">
            How to refer your friends in Crickex?
          </p>

          {/* Steps Grid */}
          <div className="px-3 sm:px-6 md:px-8 pb-5 sm:pb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  {/* Step number header */}
                  <div className="flex items-baseline justify-center gap-1 sm:gap-1.5 mb-2 sm:mb-3">
                    <span
                      className="text-sm sm:text-base md:text-lg font-bold"
                      style={{
                        background:
                          "linear-gradient(180deg, #ffd700 0%, #ffaa00 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Step
                    </span>
                    <span
                      className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-none"
                      style={{
                        background:
                          "linear-gradient(180deg, #ffd700 0%, #ff8c00 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        textShadow: "0 2px 8px rgba(255, 170, 0, 0.3)",
                      }}
                    >
                      {step.number}
                    </span>
                  </div>

                  {/* Step card */}
                  <div
                    className="w-full rounded-lg overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(180deg, #2a6bc4 0%, #1e5aad 50%, #1a4f99 100%)",
                      border: "1px solid rgba(100, 170, 255, 0.25)",
                    }}
                  >
                    {/* Title bar */}
                    <div
                      className="text-center py-1.5 sm:py-2 px-2 text-white font-semibold text-[10px] sm:text-xs md:text-sm"
                      style={{
                        background:
                          "linear-gradient(180deg, #3578d1 0%, #2a65b8 100%)",
                        borderBottom: "1px solid rgba(100, 170, 255, 0.2)",
                      }}
                    >
                      {step.title}
                    </div>

                    {/* Step image */}
                    <div className="p-2 sm:p-3 flex justify-center">
                      <Image
                        src={step.image}
                        alt={`Step ${step.number} - ${step.title}`}
                        width={280}
                        height={400}
                        className="w-full h-auto rounded"
                        style={{ maxWidth: "100%" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom text */}
          <div className="px-5 sm:px-8 pb-5 sm:pb-8">
            <p className="text-white/85 text-[10px] sm:text-xs md:text-sm leading-relaxed">
              One link or one code or one QR that&apos;s all it takes to bring
              your friends on board! Start Referring and Earn Unlimited.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2 — How To Get Daily Unlimited Rebate? */}
      <div className="px-4 sm:px-8 md:px-18 lg:px-18 py-6 sm:py-8 md:py-10">
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: "#07356C",
            border: "4px solid #3E97FF",
          }}
        >
          {/* "How To Get Daily Unlimited Rebate?" heading bar */}
          <div className="relative mb-4 sm:mb-5">
            <div
              className="inline-block px-5 sm:px-8 py-2 sm:py-2.5 text-white font-bold text-sm sm:text-base tracking-wide"
              style={{
                background:
                  "linear-gradient(90deg, #4abe2b 0%, #3aa822 40%, #b8d435 70%, #e8d820 100%)",
                clipPath: "polygon(0 0, 100% 0, 96% 100%, 0% 100%)",
                paddingRight: "3rem",
                minWidth: "340px",
              }}
            >
              How To Get Daily Unlimited Rebate?
            </div>
          </div>

          {/* Description text */}
          <div className="px-5 sm:px-8 mb-5 sm:mb-6">
            <p className="text-white/90 text-xs sm:text-sm md:text-base leading-relaxed">
              Our 3-tier referral program lets you earn beyond just your friends.
              Get rebates from your friend, their friends, and even their
              friends&apos; friends. More connections, More rewards!
            </p>
          </div>

          {/* "Commission Structure" heading bar */}
          <div className="relative mb-4 sm:mb-5">
            <div
              className="inline-block px-5 sm:px-8 py-2 sm:py-2.5 text-white font-bold text-sm sm:text-base tracking-wide"
              style={{
                background:
                  "linear-gradient(90deg, #4abe2b 0%, #3aa822 60%, #2d8f1a 100%)",
                clipPath: "polygon(0 0, 100% 0, 92% 100%, 0% 100%)",
                paddingRight: "2.5rem",
              }}
            >
              Commission Structure
            </div>
          </div>

          {/* "Your Earning Tree:" label */}
          <div className="px-5 sm:px-8 mb-3 sm:mb-4">
            <p
              className="text-base sm:text-lg md:text-xl font-bold"
              style={{
                background:
                  "linear-gradient(180deg, #ffd700 0%, #ffaa00 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Your Earning Tree:
            </p>
          </div>

          {/* Two-column layout: Commission tree + Person image */}
          <div className="px-3 sm:px-6 md:px-8 pb-5 sm:pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
              {/* Left — Commission level tree diagram */}
              <div className="flex justify-center justify-items-start">
                <Image
                  src={section_two[0].image}
                  alt="Commission Level Tree"
                  width={460}
                  height={420}
                  className="w-[50%] h-auto object-contain"
                />
              </div>

              {/* Right — Person image */}
              <div className="flex justify-center">
                <Image
                  src={section_two[1].image}
                  alt="Referral Person"
                  width={280}
                  height={300}
                  className="w-[50%] h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3 — How Rebates get Calculate? */}
      <div className="px-4 sm:px-8 md:px-18 lg:px-18 pb-6 sm:pb-8 md:pb-10">
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: "#07356C",
            border: "4px solid #3E97FF",
            marginBottom: "1rem",
          }}
        >
          {/* Heading bar */}
          <div className="relative mb-4 sm:mb-5">
            <div
              className="inline-block px-5 sm:px-8 py-2 sm:py-2.5 text-white font-bold text-sm sm:text-base tracking-wide"
              style={{
                background:
                  "linear-gradient(90deg, #4abe2b 0%, #3aa822 40%, #b8d435 70%, #e8d820 100%)",
                clipPath: "polygon(0 0, 100% 0, 96% 100%, 0% 100%)",
                paddingRight: "3rem",
                minWidth: "320px",
              }}
            >
              How Rebates get Calculate?
            </div>
          </div>

          {/* Description text */}
          <div className="px-5 sm:px-8 mb-5 sm:mb-6">
            <p className="text-white/90 text-xs sm:text-sm md:text-base leading-relaxed">
              If Player A has a turnover of 80,000, you will get 160; if Player B
              has a turnover of 80,000, you will get 72; and if Player C has a
              turnover of 80,000, you will get 32.
            </p>
          </div>

          {/* Rebates Table */}
          <div className="px-5 sm:px-8 pb-6 sm:pb-8 mb-2">
            <div className="overflow-x-auto rounded-lg" style={{ border: "2px solid #3E97FF" }}>
              <table className="w-full text-center text-white text-xs sm:text-sm md:text-base">
                {/* Header row — green */}
                <thead>
                  <tr style={{ background: "linear-gradient(90deg, #4abe2b 0%, #5cd43a 50%, #4abe2b 100%)" }}>
                    <th className="py-2.5 sm:py-3 px-3 font-bold text-white uppercase tracking-wider">Player</th>
                    <th className="py-2.5 sm:py-3 px-3 font-bold text-white uppercase tracking-wider">Turnover</th>
                    <th className="py-2.5 sm:py-3 px-3 font-bold text-white uppercase tracking-wider">Tier</th>
                    <th className="py-2.5 sm:py-3 px-3 font-bold text-white uppercase tracking-wider">Rebate%</th>
                    <th className="py-2.5 sm:py-3 px-3 font-bold text-white uppercase tracking-wider">Rebate Earned(RS)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Row A — dark blue */}
                  <tr style={{ background: "#0a3d7a" }}>
                    <td className="py-2.5 sm:py-3 px-3 font-semibold">A</td>
                    <td className="py-2.5 sm:py-3 px-3 font-semibold">50,000</td>
                    <td className="py-2.5 sm:py-3 px-3">Tier 1</td>
                    <td className="py-2.5 sm:py-3 px-3">0.20%</td>
                    <td className="py-2.5 sm:py-3 px-3 font-semibold">100</td>
                  </tr>
                  {/* Row B — slightly lighter blue */}
                  <tr style={{ background: "#0c4a8f" }}>
                    <td className="py-2.5 sm:py-3 px-3 font-semibold">B</td>
                    <td className="py-2.5 sm:py-3 px-3 font-semibold">50,000</td>
                    <td className="py-2.5 sm:py-3 px-3">Tier 2</td>
                    <td className="py-2.5 sm:py-3 px-3">0.09 %</td>
                    <td className="py-2.5 sm:py-3 px-3 font-semibold">45</td>
                  </tr>
                  {/* Row C — cyan/teal highlight */}
                  <tr style={{ background: "linear-gradient(90deg, #2dd4bf 0%, #06b6d4 50%, #2dd4bf 100%)" }}>
                    <td className="py-2.5 sm:py-3 px-3 font-bold text-[#07356C]">C</td>
                    <td className="py-2.5 sm:py-3 px-3 font-bold text-[#07356C]">50,000</td>
                    <td className="py-2.5 sm:py-3 px-3 font-bold text-[#07356C]">Tier 3</td>
                    <td className="py-2.5 sm:py-3 px-3 font-bold text-[#07356C]">0.04 %</td>
                    <td className="py-2.5 sm:py-3 px-3 font-bold text-[#07356C]">20</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4 — Referral Earning Ratio + Cash Rebate Calculator */}
      <div className="px-4 sm:px-8 md:px-18 lg:px-18 pb-6 sm:pb-8 md:pb-10">
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: "#07356C",
            border: "4px solid #3E97FF",
            marginBottom: "1rem",

          }}
        >
          {/* Heading bar */}
          <div className="relative mb-4 sm:mb-5">
            <div
              className="inline-block px-5 sm:px-8 py-2 sm:py-2.5 text-white font-bold text-sm sm:text-base tracking-wide"
              style={{
                background:
                  "linear-gradient(90deg, #4abe2b 0%, #3aa822 40%, #b8d435 70%, #e8d820 100%)",
                clipPath: "polygon(0 0, 100% 0, 96% 100%, 0% 100%)",
                paddingRight: "3rem",
                minWidth: "300px",
                            marginBottom: "1rem",

              }}
            >
              Referral Earning Ratio
            </div>
          </div>

          {/* Earning Ratio Table */}
          <div className="px-5 sm:px-8 pb-6 sm:pb-8 mb-4">
            <div className="overflow-x-auto rounded-lg" style={{ border: "2px solid #3E97FF" }}>
              <table className="w-full text-center text-white text-xs sm:text-sm md:text-base">
                {/* Header row — green */}
                <thead>
                  <tr style={{ background: "linear-gradient(90deg, #4abe2b 0%, #5cd43a 50%, #4abe2b 100%)" }}>
                    <th className="py-2.5 sm:py-3 px-3 font-bold text-white uppercase tracking-wider">Turnover</th>
                    <th className="py-2.5 sm:py-3 px-3 font-bold text-white uppercase tracking-wider">Tier 1</th>
                    <th className="py-2.5 sm:py-3 px-3 font-bold text-white uppercase tracking-wider">Tier 2</th>
                    <th className="py-2.5 sm:py-3 px-3 font-bold text-white uppercase tracking-wider">Tier 3</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: "#0a3d7a" }}>
                    <td className="py-2.5 sm:py-3 px-3 font-semibold">Rs 100 – Rs 10,000</td>
                    <td className="py-2.5 sm:py-3 px-3">0.10%</td>
                    <td className="py-2.5 sm:py-3 px-3">0.06%</td>
                    <td className="py-2.5 sm:py-3 px-3">0.02%</td>
                  </tr>
                  <tr style={{ background: "#0c4a8f" }}>
                    <td className="py-2.5 sm:py-3 px-3 font-semibold">Rs 10001 – Rs 30,000</td>
                    <td className="py-2.5 sm:py-3 px-3">0.15%</td>
                    <td className="py-2.5 sm:py-3 px-3">0.07%</td>
                    <td className="py-2.5 sm:py-3 px-3">0.03%</td>
                  </tr>
                  <tr style={{ background: "#0a3d7a" }}>
                    <td className="py-2.5 sm:py-3 px-3 font-semibold">Rs 30,001</td>
                    <td className="py-2.5 sm:py-3 px-3">0.20%</td>
                    <td className="py-2.5 sm:py-3 px-3">0.09%</td>
                    <td className="py-2.5 sm:py-3 px-3">0.04%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Cash Rebate Calculator heading bar */}
          <div className="relative mb-5 sm:mb-6">
            <div
              className="inline-block px-5 sm:px-8 py-2 sm:py-2.5 text-white font-bold text-sm sm:text-base tracking-wide"
              style={{
                background:
                  "linear-gradient(90deg, #4abe2b 0%, #3aa822 40%, #b8d435 70%, #e8d820 100%)",
                clipPath: "polygon(0 0, 100% 0, 96% 100%, 0% 100%)",
                paddingRight: "3rem",
                minWidth: "300px",
              }}
            >
              Cash Rebate Calculator
            </div>
          </div>

          {/* Calculator */}
          <div className="px-5 sm:px-8 pb-8 sm:pb-10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
              {/* Turnover input */}
              <div className="flex flex-col items-center gap-1.5">
                <label className="text-[#4abe2b] font-bold text-xs sm:text-sm">
                  Enter Turnover*
                </label>
                <input
                  type="text"
                  id="turnoverInput"
                  placeholder="00,00.00"
                  className="w-36 sm:w-44 px-4 py-2.5 rounded-md text-white text-sm font-medium outline-none focus:ring-2 focus:ring-[#4abe2b]"
                  style={{
                    background: "#0c4a8f",
                    border: "2px solid #3E97FF",
                  }}
                />
              </div>

              {/* Tier select */}
              <div className="flex flex-col items-center gap-1.5">
                <label className="text-[#4abe2b] font-bold text-xs sm:text-sm">
                  Select Tier*
                </label>
                <select
                  id="tierSelect"
                  defaultValue="tier1"
                  className="w-36 sm:w-44 px-4 py-2.5 rounded-md text-white text-sm font-medium outline-none cursor-pointer focus:ring-2 focus:ring-[#4abe2b] appearance-none"
                  style={{
                    background: "#0c4a8f",
                    border: "2px solid #3E97FF",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                  }}
                >
                  <option value="tier1">Tier 1</option>
                  <option value="tier2">Tier 2</option>
                  <option value="tier3">Tier 3</option>
                </select>
              </div>

              {/* Equals sign */}
              <span className="text-white text-xl sm:text-2xl font-bold mt-5 sm:mt-5">=</span>

              {/* Result */}
              <div className="flex flex-col items-center gap-1.5">
                <label className="text-transparent text-xs sm:text-sm select-none">Result</label>
                <div
                  className="w-36 sm:w-44 px-4 py-2.5 rounded-md text-sm font-medium"
                  id="resultDisplay"
                  style={{
                    background: "linear-gradient(90deg, #2dd4bf 0%, #06d6a0 100%)",
                    border: "2px solid #2dd4bf",
                    color: "#07356C",
                  }}
                >
                  ৳ 00,00.00
                </div>
              </div>
            </div>

            {/* Calculate button */}
            <div className="flex justify-center mt-6">
              <button
                className="px-8 sm:px-12 py-2.5 sm:py-3 rounded-md text-white font-bold text-sm sm:text-base tracking-wide cursor-pointer hover:opacity-90 transition-opacity"
                style={{
                  background: "linear-gradient(180deg, #4abe2b 0%, #3aa822 100%)",
                  border: "2px solid #5cd43a",
                }}
                onClick={() => {
                  const turnover = parseFloat(document.getElementById("turnoverInput").value.replace(/,/g, "")) || 0;
                  const tier = document.getElementById("tierSelect").value;
                  const rates = { tier1: [0.0010, 0.0015, 0.0020], tier2: [0.0006, 0.0007, 0.0009], tier3: [0.0002, 0.0003, 0.0004] };
                  const tierRates = rates[tier];
                  let rate = tierRates[0];
                  if (turnover > 30000) rate = tierRates[2];
                  else if (turnover > 10000) rate = tierRates[1];
                  const result = (turnover * rate).toFixed(2);
                  document.getElementById("resultDisplay").textContent = `৳ ${Number(result).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
                }}
              >
                Calculate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}