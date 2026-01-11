'use client';

/**
 * BetSlip Component
 * Right sidebar bet slip
 */

import { useBetSlip } from '@/context/BetSlipContext';
import { bettingService } from '@/lib/services/betting.service';
import { useState } from 'react';

interface BetSlipProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BetSlip({ isOpen, onClose }: BetSlipProps) {
  const { selections, updateStake, removeSelection, clearBetSlip, totalStake, potentialWin } = useBetSlip();
  const [loading, setLoading] = useState(false);

  const handlePlaceBets = async () => {
    setLoading(true);
    try {
      // TODO: Place all bets
      for (const selection of selections) {
        await bettingService.placeBet({
          marketId: selection.marketId,
          runnerId: selection.runnerId,
          betType: selection.betType,
          odds: selection.odds,
          stake: selection.stake,
        });
      }
      clearBetSlip();
      alert('Bets placed successfully!');
    } catch (error: any) {
      alert('Failed to place bets: ' + error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && selections.length === 0) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* BetSlip Panel */}
      <aside
        className={`fixed lg:sticky top-15 right-0 h-[calc(100vh-60px)] bg-white border-l border-gray-200 overflow-y-auto z-40 transition-transform duration-300 ${
          isOpen || selections.length > 0 ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } w-80 shadow-lg`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Bet Slip</h2>
            <button onClick={onClose} className="lg:hidden text-gray-600 hover:text-gray-800">
              ✕
            </button>
          </div>

          {selections.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No selections</p>
          ) : (
            <div className="space-y-4">
              {selections.map((selection) => (
                <div key={`${selection.marketId}-${selection.runnerId}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-800 font-medium text-sm">{selection.runnerName}</p>
                      <p className="text-gray-500 text-xs">{selection.marketName}</p>
                    </div>
                    <button
                      onClick={() => removeSelection(selection.marketId, selection.runnerId)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selection.betType === 'back' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                    }`}>
                      {selection.betType.toUpperCase()}
                    </span>
                    <span className="text-gray-800 font-bold">{selection.odds}</span>
                  </div>

                  <input
                    type="number"
                    value={selection.stake}
                    onChange={(e) => updateStake(selection.marketId, selection.runnerId, parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-blue-500"
                    placeholder="Stake"
                    min="10"
                  />

                  <p className="text-gray-600 text-sm mt-2">
                    Potential Win: <span className="font-semibold text-green-600">₹{(selection.stake * (selection.odds - 1)).toFixed(2)}</span>
                  </p>
                </div>
              ))}

              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Total Stake:</span>
                  <span className="font-bold">₹{totalStake.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-800">
                  <span>Potential Win:</span>
                  <span className="font-bold text-green-600">₹{potentialWin.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceBets}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Placing Bets...' : 'Place Bets'}
              </button>

              <button
                onClick={clearBetSlip}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-lg transition"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
