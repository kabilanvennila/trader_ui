import React from 'react';
import Header from './Header';
import StrategyTable from './StrategyTable';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-white relative">
      {/* Grid Background - Centered 1280px container, then extend outward */}
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 0
      }}>
        {/* Center 1280px grid (16 columns) */}
        <div style={{
          width: '1280px',
          height: '100%',
          backgroundImage: `repeating-linear-gradient(to right, rgba(217, 217, 217, 0.5) 0px, rgba(217, 217, 217, 0.5) 1px, transparent 1px, transparent 80px)`,
          backgroundSize: '1280px 100%',
          backgroundPosition: 'left top',
          backgroundRepeat: 'no-repeat'
        }} />
        
        {/* Left extension - start from 80px before center grid */}
        <div style={{
          position: 'absolute',
          right: 'calc(50% + 640px)',
          width: '50vw',
          height: '100%',
          backgroundImage: `repeating-linear-gradient(to right, rgba(217, 217, 217, 0.5) 0px, rgba(217, 217, 217, 0.5) 1px, transparent 1px, transparent 80px)`,
          backgroundPosition: 'right top'
        }} />
        
        {/* Right extension */}
        <div style={{
          position: 'absolute',
          left: 'calc(50% + 640px)',
          width: '50vw',
          height: '100%',
          backgroundImage: `repeating-linear-gradient(to right, rgba(217, 217, 217, 0.5) 0px, rgba(217, 217, 217, 0.5) 1px, transparent 1px, transparent 80px)`
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Header />
        
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          {/* Metrics Section */}
          <div className="grid grid-cols-12 gap-4 mb-6">
            {/* Running P&L Card */}
            <div className="col-span-3">
              <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-md p-5 text-white">
                <div className="text-xs font-normal mb-2 opacity-90">
                  Running Profit / Loss
                </div>
                <div className="text-3xl font-bold mb-0.5">1,27,278</div>
                <div className="text-xs font-normal">11.2%</div>
              </div>
            </div>

            {/* Max Profit */}
            <div className="col-span-2">
              <div className="bg-white rounded-md p-5 h-full flex flex-col justify-between">
                <div className="text-xs text-gray-500 mb-2 font-normal">
                  Max Profit
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">
                    3,28,890
                  </div>
                  <div className="text-xs text-gray-500 font-normal">11.2%</div>
                </div>
              </div>
            </div>

            {/* Max Loss */}
            <div className="col-span-2">
              <div className="bg-white rounded-md p-5 h-full flex flex-col justify-between">
                <div className="text-xs text-gray-500 mb-2 font-normal">
                  Max Loss
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">
                    12,72,289
                  </div>
                  <div className="text-xs text-gray-500 font-normal">11.2%</div>
                </div>
              </div>
            </div>

            {/* Right Side Metrics */}
            <div className="col-span-5 grid grid-rows-3 gap-3">
              {/* Deployed */}
              <div className="bg-white rounded-md px-4 py-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-normal">Deployed</span>
                  <div className="text-right">
                    <span className="text-base font-bold text-gray-900 mr-1">
                      12,29,234
                    </span>
                    <span className="text-xs text-gray-400">(89.2%)</span>
                  </div>
                </div>
              </div>

              {/* Risk */}
              <div className="bg-white rounded-md px-4 py-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-normal">Risk</span>
                  <div className="text-base font-bold text-gray-900">11.23%</div>
                </div>
              </div>

              {/* Buying Power */}
              <div className="bg-white rounded-md px-4 py-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-normal">Buying Power</span>
                  <div className="text-right">
                    <span className="text-base font-bold text-gray-900 mr-1">
                      1,89,290
                    </span>
                    <span className="text-xs text-gray-400">(11.8%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Strategy Table */}
          <StrategyTable />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
