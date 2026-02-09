'use client';

import { useWinnerBoard } from '@/context/WinnerBoardContext';
import { FaTimes } from 'react-icons/fa';
import { useEffect, useState } from 'react';

interface WinnerData {
  rank: number;
  username: string;
  amount: number;
  game: string;
  date: string;
}

export default function WinnerBoardModal() {
  const { showWinnerBoardModal, closeWinnerBoardModal, activeTab, setActiveTab } = useWinnerBoard();
  const [leaderBoardData, setLeaderBoardData] = useState<WinnerData[]>([]);
  const [firstToReachData, setFirstToReachData] = useState<WinnerData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showWinnerBoardModal) {
      fetchWinnerData();
    }
  }, [showWinnerBoardModal]);

  const fetchWinnerData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/winner-board');
      if (response.ok) {
        const data = await response.json();
        setLeaderBoardData(data.leaderBoard || []);
        setFirstToReachData(data.firstToReach || []);
      }
    } catch (error) {
      console.error('Error fetching winner data:', error);
      // For now, set empty data
      setLeaderBoardData([]);
      setFirstToReachData([]);
    } finally {
      setLoading(false);
    }
  };

  if (!showWinnerBoardModal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={closeWinnerBoardModal}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#015DAC] text-white p-6 relative">
          <button
            onClick={closeWinnerBoardModal}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition"
          >
            <FaTimes className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-center">Winner Board</h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('leader')}
            className={`flex-1 py-3 px-4 font-semibold transition ${
              activeTab === 'leader'
                ? 'text-yellow-500 border-b-2 border-yellow-500 bg-gray-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Leader Board
          </button>
          <button
            onClick={() => setActiveTab('first-to-reach')}
            className={`flex-1 py-3 px-4 font-semibold transition ${
              activeTab === 'first-to-reach'
                ? 'text-yellow-500 border-b-2 border-yellow-500 bg-gray-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            First To Reach
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#015DAC]"></div>
            </div>
          ) : (
            <>
              {activeTab === 'leader' && (
                <div>
                  {leaderBoardData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="text-gray-300 mb-4">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-lg">No Record</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leaderBoardData.map((winner) => (
                        <div key={winner.rank} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-[#015DAC] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                              {winner.rank}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{winner.username}</p>
                              <p className="text-sm text-gray-500">{winner.game}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">₹{winner.amount.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{winner.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'first-to-reach' && (
                <div>
                  {firstToReachData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="text-gray-300 mb-4">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-lg">No Record</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {firstToReachData.map((winner) => (
                        <div key={winner.rank} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                              {winner.rank}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{winner.username}</p>
                              <p className="text-sm text-gray-500">{winner.game}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">₹{winner.amount.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{winner.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
