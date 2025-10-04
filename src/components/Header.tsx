import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white">
      <div className="max-w-[1400px] mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Logo with green accent */}
          <div className="flex items-center space-x-3">
            <div className="w-1 h-8 bg-green-500 rounded-full"></div>
            <span className="text-2xl font-bold text-blue-600 italic" style={{ fontFamily: 'cursive' }}>
              yugendran
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-10">
            <button className="text-sm text-gray-400 hover:text-gray-600 font-normal">
              Analyse
            </button>
            <button className="text-sm text-gray-400 hover:text-gray-600 font-normal">
              Transfers
            </button>
            <button className="text-sm text-gray-400 hover:text-gray-600 font-normal">
              Setup
            </button>
            <button className="text-sm text-gray-400 hover:text-gray-600 font-normal">
              Strategies
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
