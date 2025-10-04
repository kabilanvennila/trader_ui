import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface Strategy {
  id: string;
  date: string;
  time: string;
  index: string;
  indexType: string;
  strategy: string;
  strategyType: string;
  strike: number;
  strikePercent: string;
  entry: number;
  entryPercent: string;
  target: number;
  targetBar: {
    greenPercent: number;
    redPercent: number;
  };
  stopLoss: number;
  stopLossPercent: string;
  trail: string;
  trailPercent: string;
  pnl: string;
  pnlType: 'profit' | 'loss';
  more: boolean;
}

const StrategyTable: React.FC = () => {
  const strategies: Strategy[] = [
    {
      id: '1',
      date: 'SEP',
      time: '17',
      index: 'Nifty',
      indexType: 'Bank',
      strategy: 'STTR',
      strategyType: 'Side Target Range',
      strike: 45,
      strikePercent: '0%',
      entry: 89380,
      entryPercent: '0.2%',
      target: 12351,
      targetBar: {
        greenPercent: 38,
        redPercent: 62,
      },
      stopLoss: 26951,
      stopLossPercent: '56.7%',
      trail: '1.2%',
      trailPercent: '68.0%',
      pnl: 'Dr EVP',
      pnlType: 'loss',
      more: true,
    },
    {
      id: '2',
      date: 'SEP',
      time: '17',
      index: 'Nifty',
      indexType: 'Bank',
      strategy: 'STTR',
      strategyType: 'Side Target Range',
      strike: 45,
      strikePercent: '0%',
      entry: 89380,
      entryPercent: '0.2%',
      target: 12351,
      targetBar: {
        greenPercent: 55,
        redPercent: 45,
      },
      stopLoss: 26951,
      stopLossPercent: '56.7%',
      trail: '1.2%',
      trailPercent: '68.0%',
      pnl: 'Dr EVP',
      pnlType: 'loss',
      more: true,
    },
    {
      id: '3',
      date: 'SEP',
      time: '17',
      index: 'Nifty',
      indexType: 'Bank',
      strategy: 'STTR',
      strategyType: 'Side Target Range',
      strike: 45,
      strikePercent: '0%',
      entry: 89380,
      entryPercent: '0.2%',
      target: 12351,
      targetBar: {
        greenPercent: 38,
        redPercent: 62,
      },
      stopLoss: 26951,
      stopLossPercent: '56.7%',
      trail: '1.2%',
      trailPercent: '68.0%',
      pnl: 'Dr EVP',
      pnlType: 'loss',
      more: true,
    },
  ];

  return (
    <div className="bg-white rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                DATE
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                INDEX
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                INDEX
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                STRATEGY
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                STRIKE
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                ENTRY
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                TARGET
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                STOP LOSS
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                TRAIL
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                P&L
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {strategies.map((strategy) => (
              <tr key={strategy.id} className="hover:bg-gray-50/50 transition-colors">
                {/* Date */}
                <td className="px-3 py-3">
                  <div className="flex flex-col items-center justify-center w-10 h-10 bg-gray-800 text-white rounded-sm">
                    <div className="text-[9px] font-semibold uppercase leading-tight">
                      {strategy.date}
                    </div>
                    <div className="text-base font-bold leading-none">
                      {strategy.time}
                    </div>
                  </div>
                </td>

                {/* Index Name */}
                <td className="px-3 py-3">
                  <div className="text-sm font-normal text-gray-900">
                    {strategy.index}
                  </div>
                </td>

                {/* Index Type */}
                <td className="px-3 py-3">
                  <div className="text-sm font-normal text-gray-500">
                    {strategy.indexType}
                  </div>
                </td>

                {/* Strategy */}
                <td className="px-3 py-3">
                  <div className="text-sm font-semibold text-gray-900">
                    {strategy.strategy}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {strategy.strategyType}
                  </div>
                </td>

                {/* Strike */}
                <td className="px-3 py-3">
                  <div className="text-sm font-semibold text-gray-900">
                    {strategy.strike}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {strategy.strikePercent}
                  </div>
                </td>

                {/* Entry */}
                <td className="px-3 py-3">
                  <div className="inline-flex flex-col items-center px-2.5 py-1 bg-green-100 rounded-sm">
                    <div className="text-sm font-semibold text-gray-900">
                      {strategy.entry.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-gray-600">
                      {strategy.entryPercent}
                    </div>
                  </div>
                </td>

                {/* Target with Bar */}
                <td className="px-3 py-3">
                  <div className="flex flex-col space-y-1.5">
                    <div className="text-sm font-semibold text-gray-900">
                      {strategy.target.toLocaleString()}
                    </div>
                    <div className="flex h-1 w-20 rounded-sm overflow-hidden">
                      <div
                        className="bg-green-500"
                        style={{ width: `${strategy.targetBar.greenPercent}%` }}
                      />
                      <div
                        className="bg-red-500"
                        style={{ width: `${strategy.targetBar.redPercent}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Stop Loss */}
                <td className="px-3 py-3">
                  <div className="text-sm font-semibold text-gray-900">
                    {strategy.stopLoss.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {strategy.stopLossPercent}
                  </div>
                </td>

                {/* Trail */}
                <td className="px-3 py-3">
                  <div className="text-sm font-semibold text-gray-900">
                    {strategy.trail}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {strategy.trailPercent}
                  </div>
                </td>

                {/* P&L */}
                <td className="px-3 py-3">
                  <div
                    className={`text-sm font-semibold ${
                      strategy.pnlType === 'profit'
                        ? 'text-green-600'
                        : 'text-red-500'
                    }`}
                  >
                    {strategy.pnl}
                  </div>
                  <div className="text-[11px] text-gray-400">EVP</div>
                </td>

                {/* More */}
                <td className="px-3 py-3">
                  <button className="text-gray-300 hover:text-gray-500">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StrategyTable;
