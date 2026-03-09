"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import HeroSlider from '@/components/public/HeroSlider';

export default function PublicHomePage() {
  const banners = [
    '/public-sliders/slider1.webp',
    '/public-sliders/slider2.webp',
    '/public-sliders/slider3.webp',
  ];

  const [index, setIndex] = useState(0);
  const len = banners.length;

  useEffect(() => {
    // ensure index stays in bounds
    if (index < 0) setIndex(len - 1);
    if (index >= len) setIndex(0);
  }, [index, len]);

  const prev = () => setIndex((i) => (i - 1 + len) % len);
  const next = () => setIndex((i) => (i + 1) % len);

  return (
    <div className="m-0 p-0">
      {/* Hero Banner Section - full width slider with overlayed buttons */}
      {/* Slider: fixed responsive height to avoid layout shift and empty area */}

  {/* Hero slider (reusable component) */}
  <HeroSlider banners={banners} className="h-50 md:h-105" />
  {/* Header box */}
  <section className="py-12">
    <div className="max-w-xl mx-auto flex items-center justify-center">
      <div className="w-full sm:w-2/3 lg:w-2/2 border-1 border-[#7FFF00] rounded-xl px-8 md:px-12 py-4 md:py-6 text-center shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Rules and Regulations</h1>
      </div>
    </div>
  </section>

  {/* Rules content */}
  <section className="py-12">
    <div className="max-w-7xl mx-auto px-6 text-white">
      <div className="space-y-6 text-lg leading-relaxed">
        <h2 className="text-2xl font-semibold">PART A – INTRODUCTION</h2>
        <h3 className="font-semibold">1. Use and Interpretation</h3>
        <p>General Rules apply to all bets, except where Specific Sports Rules state otherwise.</p>
        <p>Market Information supersedes General Rules or Specific Sports Rules if there is any inconsistency.</p>
        <p>If Specific Sports Rules don’t cover certain markets, General Rules and Market Information apply.</p>

        <h3 className="font-semibold">2. Market Information</h3>
        <p>Market Information guides market management and settlement. KingBaji may suspend any market at its discretion to protect users.</p>

        <h3 className="font-semibold">3. User Responsibility</h3>
        <p>Users must read and understand the Rules and Regulations of markets they bet on. Market Information may not include all rules, so users should be aware.</p>

        <h3 className="font-semibold">4. Suspicious Activity Rules</h3>
        <p>KingBaji may void bets and suspend or close accounts in case of suspicious activity. Suspicious activities include VPN use, multiple accounts, and unfair betting practices. Decisions made by KingBaji in such cases are final.</p>

        <h3 className="font-semibold">5. User Betting Disputes</h3>
        <p>Users with disputes regarding bet settlements should contact KingBaji immediately. Users must provide details of their complaints for resolution.</p>

        <h2 className="text-2xl font-semibold">Part B – General Rules</h2>
        <h3 className="font-semibold">1. Managing markets In-Play</h3>
        <p>KingBaji aims to suspend in-play markets at the start and end of events but does not guarantee the timing. Users are responsible for managing their in-play bets. Live transmissions may have delays; users should be aware.</p>

        <h3 className="font-semibold">2. Results and market settlement</h3>
        <p><strong>General</strong></p>
        <p>Markets are settled based on Market Information or Specific Sports Rules. If official results are unavailable, KingBaji uses independent sources. KingBaji reserves the right to suspend settlement during uncertainties.</p>
        <p><strong>Resettlements</strong></p>
        <p>Markets may be settled immediately or after official outcomes are declared. KingBaji may change market settlement in case of errors or void markets. Settlement reversals may affect customer balances.</p>
        <p><strong>Non-runners, withdrawals, and disqualifications</strong></p>
        <p>Bets stand even if a team or competitor doesn’t participate, except when stated otherwise. If a team or competitor is disqualified or withdraws, bets are void unless an official result is recorded.</p>
        <p><strong>Winner with [named selection] markets</strong></p>
        <p>Markets dependent on specific competitors will be void if the named competitor doesn’t participate. Competitors are deemed to have participated if they have an official result or classification.</p>

        <h3 className="font-semibold">3. Abandonments, Cancellations, Postponements</h3>
        <p>In cricket betting for KingBaji, if a match isn’t completed within three days of its scheduled date, bets on that match will be invalid, unless outcomes are already determined.</p>
        <p>For tournaments, if an event isn’t finished within three days of its scheduled end, bets will be resolved based on the official decision of the governing body. If no decision is made within 90 days of the scheduled end, bets will be invalid, except for those on markets with determined outcomes.</p>

        <h3 className="font-semibold">4. Change of venue</h3>
        <p>For team sports, if the venue changes to the home ground of the originally away team, all bets will be void. For other sports, bets will stand if the venue changes. If the playing surface changes, bets will stand.</p>

        <h3 className="font-semibold">5. Periods of time</h3>
        <p>If an event’s duration changes after bets are placed but before the event starts, all bets will be void. For markets based on time periods (e.g., first goal), any event happening in stoppage or injury time will be considered to have occurred at the end of regular time. All bets apply to the regular time period, including stoppage time. Extra time and penalty shoot-outs are not included.</p>

        <h3 className="font-semibold">6. Match Bets</h3>
        <p>Match bets in cricket are decided based on the best score, time, or finishing position. If no competitor completes the event, bets are void, except when specified otherwise. For competitions with several heats or rounds, the bet is decided based on the competitor reaching the furthest round or having the best score, time, or position. If competitors fail to advance in the same round but different heats, dead-heat rules apply. If a team or competitor does not participate, all match bets will be void. In case of an abandoned or shortened event, bets will be void unless competitors refuse to complete for reasons other than withdrawal or disqualification.</p>

        <h3 className="font-semibold">7. “To Qualify” Markets</h3>
        <p>Any qualifying market will be decided based on the criteria in the Market Information, regardless of whether the competitor competes in the next round.</p>

        <h3 className="font-semibold">8. Dead Heats</h3>
        <p>If there are more winners than predicted in a market, the winnings are divided among the real winners. Winnings are calculated by dividing the stake by the number of real winners, then multiplying by the traded price.</p>

        <h3 className="font-semibold">9. Exchange Multiples</h3>
        <p>Exchange Multiples are subject to Exchange Rules. Customers bet against each other. A multiple bet consists of several legs, each representing a selection in an individual market. Customers can place back, lay, or mix bets. The odds for multiple selections within a leg will be dutched. Not all markets are available for Exchange Multiples. If any leg is void, the multiple bet will be adjusted accordingly.</p>

        <h3 className="font-semibold">10. Rules for Starting Price</h3>
        <p>SP bets are a form of Exchange bet. SP is determined by balancing all SP bets and other Exchange bets. SP is calculated to six decimal places, rounded up or down. SP reconciliation includes all available details. If the platform is unavailable, SP will be calculated based on available information. SP bets cannot be revoked once set. SP bets can be placed by selecting the SP option. If a non-runner is added, SP bets will be adjusted.</p>

        <h3 className="font-semibold">1. ‘Keep’ bets option</h3>
        <p>If you want to keep your bet active even after the market goes live, choose the ‘In-play: Keep’ option. This ensures that your unmatched bet stays active when other unmatched bets are canceled at the start of the event.</p>
        <p>If there’s a non-runner in a horse racing market, we’ll cancel unmatched lay offers for other horses if the non-runner has a reduction factor of 2.5% or more for winning markets, or 4% or more for place markets. However, bets placed with the ‘At In-Play: Keep’ option won’t be canceled. Instead, the lay odds offered in place markets will adjust according to the reduction factors of any non-runner(s). If there’s a late withdrawal, we may cancel all lay ‘keep’ bets before turning the market in-play, depending on whether we can determine the withdrawn horse in time.</p>

        <h3 className="font-semibold">2. Tote betting rules</h3>
        <p>When you place a Tote bet, you’re betting against us. We’ll place your corresponding bet into the appropriate Tote pool. If there’s any discrepancy in rules, the rules on the Tote website or the corresponding host racetrack’s rules prevail.</p>

        <h3 className="font-semibold">3. Miscellaneous</h3>
        <p>All Exchange Rules’ time references apply to the event’s time zone. We strive for accuracy but can’t be held responsible for errors. We reserve the right to correct errors and ensure fair market administration. If there’s an error in a market, we may suspend it and void all bets matched on that market. You’re responsible for ensuring you bet on the right selection. For example, ensure you’re betting on the right competitor. We can suspend or void bets at our discretion to ensure fairness. On market settlement, winnings/losses and commission charges are rounded to the nearest two decimal places. Winnings/losses will be rounded down for BSP bets.</p>

        <h2 className="text-2xl font-semibold">Part C: Specific Sports Rules</h2>
        <h3 className="font-semibold">1. Cricket</h3>
        <p><strong>General</strong></p>
        <p>If a competition, series, or match doesn’t start, all bets are void, except those on unconditionally determined markets. If weather shortens a match, we settle bets based on the official result, including the Duckworth Lewis method. If a match is settled by a bowl-off or coin toss, all bets are void, except for those on unconditionally determined markets.</p>
        <p><strong>Test Matches</strong></p>
        <p>If a match starts but is later abandoned for reasons other than weather, we may cancel all bets, even on unconditionally determined markets. If a match isn’t expected to finish within five days after its initial completion date, all bets on that event are void, except for certain unconditionally determined markets.</p>
        <p><strong>Limited Over Matches</strong></p>
        <p>If a match is declared “No Result,” all bets on that event are void, except those on unconditionally determined markets. If a new toss takes place on a designated reserve day, bets made after 30 minutes before the initial scheduled start will be void, except for bets on unconditionally determined markets.</p>
        <p><strong>Super Over Rule</strong></p>
        <p>Bets on the team to win the Super Over are suspended until the Super Over is confirmed. The market is settled based on the number of runs scored by each team in the Super Over. If scores are tied after both innings, the market is settled as a Dead Heat.</p>

        <h3 className="font-semibold">2. Soccer</h3>
        <p><strong>Rules</strong></p>
        <p>If a Material Event occurs and we don’t postpone the market in time, we reserve the right to void bets. If a match hasn’t started by 23:59 (local time) on its scheduled date, all bets are void unless the match is rescheduled within three days. If a match is abandoned or postponed and won’t be finished by 23:59 (local time) on its scheduled date, all markets, except certain unconditionally determined markets, are void unless the match is rescheduled within three days.</p>
        <p><strong>Specific Scenarios</strong></p>
        <p>If a team is relegated, bets on the relegated team are settled as winning bets. For ‘Shirt Numbers’ and ‘Time of First Goal’ bets, specific rules apply, including how time ranges are calculated. Only goals scored in the specified league or competition count for ‘Top Goal Scorers’ markets.</p>

        <h3 className="font-semibold">3. Tennis Rules</h3>
        <p>If a player retires or is disqualified before one set is completed, bets on that match are void. Bets on the number of occurrences during a tournament are void if the tournament is shortened, postponed, or canceled. If a match’s scheduled duration changes, bets are void, except for those on unconditionally determined markets. Retirement or disqualification during a game or set voids bets on that game or set.</p>
      </div>
    </div>
  </section>
    </div>
  );
}