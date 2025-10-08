import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trade } from './types/api';
import { tradeApi } from './services/api';
import { useAppContext } from './context/AppContext';

// Reusable Styles
const styles = {
  contentAnchor: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
    fontSize: '16px',
    color: '#1E3F66'
  },
  mainNumber: {
    fontFamily: 'Inter Tight, sans-serif',
    fontWeight: '900',
    fontSize: '45px',
    color: '#1E3F66',
    lineHeight: '1.2'
  },
  mainNumberSmall: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '900',
    fontSize: '18px',
    color: '#000000',
    lineHeight: '1.2'
  },
  percentage: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '400',
    fontSize: '14px',
    color: '#1E3F66',
    lineHeight: '1.2'
  },
  section4Label: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '500',
    fontSize: '14px',
    color: '#9CA3AF'
  },
  textPrimary: {
    fontFamily: 'Inter Tight, sans-serif',
    fontWeight: 500,
    fontSize: '14px',
    color: '#1E3F66',
    lineHeight: '1.2'
  },
  textPrimaryBold: {
    fontFamily: 'Inter Tight, sans-serif',
    fontWeight: 600,
    fontSize: '18px',
    color: '#1E3F66',
    lineHeight: '1.2'
  },
  textSecondary: {
    fontFamily: 'Inter Tight, sans-serif',
    fontWeight: 400,
    fontSize: '12px',
    color: '#1E3F66',
    opacity: 0.5,
    lineHeight: '1.2',
    marginTop: '8px'
  }
};

import { useTrades, useCalculatedMetrics } from './hooks/useTrades';
import { useInstrumentManager } from './hooks/useMarket';

// Compact number formatter for Indian numbering system
function formatCompactNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  
  if (isNaN(num)) return '0';
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  // >= 1 Crore (10,000,000)
  if (absNum >= 10000000) {
    return `${sign}${(absNum / 10000000).toFixed(2)} Cr`;
  }
  // >= 1 Lakh (100,000)
  else if (absNum >= 100000) {
    return `${sign}${(absNum / 100000).toFixed(2)} L`;
  }
  // >= 1 Thousand (1,000)
  else if (absNum >= 1000) {
    return `${sign}${(absNum / 1000).toFixed(2)} K`;
  }
  // < 1 Thousand - use regular format
  else {
    return `${sign}${absNum.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }
}

function App() {
  
  // Get total capital from context
  const { totalCapital } = useAppContext();
  
  // API hooks for data fetching
  const { trades, loading: tradesLoading, error: tradesError, refetch: refetchTrades } = useTrades();
  
  // Debug logging
  console.log('🔄 App: Trades data', { 
    trades, 
    tradesLength: trades.length, 
    tradesLoading, 
    tradesError,
    totalCapital
  });
  const { 
    indices, 
    stocks, 
    searchedIndices, 
    searchedStocks,
    loading: instrumentsLoading,
    search: searchInstruments,
    clearResults: clearSearchResults
  } = useInstrumentManager();
  
  // Debug instrument data
  console.log('🔄 Instrument data:', { 
    indices: indices.length, 
    stocks: stocks.length, 
    searchedIndices: searchedIndices.length, 
    searchedStocks: searchedStocks.length,
    instrumentsLoading 
  });
  
  // State for dropdown menus
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // State for trade tabs
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');
  
  // State for Add New Trade form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // State for Close Trade form
  const [isCloseTradeOpen, setIsCloseTradeOpen] = useState(false);
  const [selectedTradeToClose, setSelectedTradeToClose] = useState<Trade | null>(null);
  
  // State for Modify Trade form
  const [isModifyTradeOpen, setIsModifyTradeOpen] = useState(false);
  const [selectedTradeToModify, setSelectedTradeToModify] = useState<Trade | null>(null);
  const [showModifySuccess, setShowModifySuccess] = useState(false);
  
  // State for form dropdowns and inputs
  const [isIndicesDropdownOpen, setIsIndicesDropdownOpen] = useState(false);
  const [isIndicesHovered, setIsIndicesHovered] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState('');
  const [indicesSearchQuery, setIndicesSearchQuery] = useState('');
  const [selectedBias, setSelectedBias] = useState<'bullish' | 'bearish' | 'neutral' | ''>('');
  const [formData, setFormData] = useState({
    setup: '',
    strategy: '',
    capital: '' as string | number,
    notes: '',
    daysToExpiry: '',
  });
  
  // Error state for field validation
  const [fieldErrors, setFieldErrors] = useState({
    indices: false,
    bias: false,
    setup: false,
    strategy: false,
    capital: false,
    strikeDetails: false
  });

  // Strike data state
  const [strikeData, setStrikeData] = useState({
    buyStrike: '' as string | number,
    sellStrike: '' as string | number,
    buyOptionType: 'PE' as 'CE' | 'PE',
    sellOptionType: 'PE' as 'CE' | 'PE',
    buyLots: '' as string | number,
    sellLots: '' as string | number,
    expiryDate: new Date().toISOString().split('T')[0],
    buyLtp: '' as string | number,
    sellLtp: '' as string | number
  });
  
  // Additional form states
  const [setupDropdownOpen, setSetupDropdownOpen] = useState(false);
  const [strategyDropdownOpen, setStrategyDropdownOpen] = useState(false);
  
  // Close Trade form data
  const [closeTradeData, setCloseTradeData] = useState({
    actualPnL: 0,
    closingDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Update close trade data when a trade is selected
  useEffect(() => {
    if (selectedTradeToClose) {
      setCloseTradeData({
        actualPnL: selectedTradeToClose.actualPnL || 0,
        closingDate: selectedTradeToClose.closingDate || new Date().toISOString().split('T')[0],
        notes: selectedTradeToClose.notes || '',
      });
    }
  }, [selectedTradeToClose]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
      
      if (isIndicesDropdownOpen && !target.closest('[data-dropdown="indices"]')) {
          setIsIndicesDropdownOpen(false);
        }
      
      if (setupDropdownOpen && !target.closest('[data-dropdown="setup"]')) {
        setSetupDropdownOpen(false);
      }
      
      if (strategyDropdownOpen && !target.closest('[data-dropdown="strategy"]')) {
        setStrategyDropdownOpen(false);
      }
      
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isIndicesDropdownOpen, setupDropdownOpen, strategyDropdownOpen]);
  
  // Handle instrument search
  useEffect(() => {
    if (indicesSearchQuery.trim()) {
      searchInstruments(indicesSearchQuery);
    } else {
      clearSearchResults();
    }
  }, [indicesSearchQuery, searchInstruments, clearSearchResults]);
  
  // Get filtered instruments based on search
  const filteredIndices = indicesSearchQuery.trim() ? searchedIndices : indices;
  const filteredStocks = indicesSearchQuery.trim() ? searchedStocks : stocks;
  
  // Filter trades based on active tab
  const filteredTrades = trades.filter(trade => {
    if (activeTab === 'active') {
      return trade.status === 'active';
    } else {
      return trade.status === 'closed';
    }
  });
  
  // Debug closed trades
  console.log('🔍 Debug closed trades:', {
    activeTab,
    totalTrades: trades.length,
    filteredTrades: filteredTrades.length,
    closedTrades: trades.filter(t => t.status === 'closed'),
    closedTradesWithPnL: trades.filter(t => t.status === 'closed' && t.actualPnL !== undefined),
    allTradeStatuses: trades.map(t => ({ id: t.id, status: t.status, actualPnL: t.actualPnL }))
  });
  
  // Calculate metrics from filtered trade data (based on active tab)
  const metrics = useCalculatedMetrics(filteredTrades);
  
  const toggleMenu = (menuId: string) => {
    setOpenMenuId(openMenuId === menuId ? null : menuId);
  };

  // Check if strike fields should be shown
  const shouldShowStrikes = () => {
    return formData.strategy === 'Bull put spread' || formData.strategy === 'Bear call spread';
  };
  
  const handleOpenCloseTrade = (trade: Trade) => {
    setSelectedTradeToClose(trade);
    setCloseTradeData({
      actualPnL: 0,
      closingDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsCloseTradeOpen(true);
    setOpenMenuId(null); // Close the dropdown menu
  };

  const handleModifyTrade = (trade: Trade) => {
    setSelectedTradeToModify(trade);
    console.log('🔍 Modifying trade:', trade);
    
    // Pre-populate form with existing trade data
    setSelectedIndices(trade.instrument.name);
    setSelectedBias(trade.bias);
    setFormData({
      setup: trade.setup.type,
      strategy: trade.setup.name,
      capital: parseFloat(trade.capital.value.replace(/,/g, '')) || 0,
      notes: trade.notes || '',
      daysToExpiry: trade.createdAt ? new Date(trade.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    
    // Pre-populate strike data if available
    if (trade.strikes && trade.strikes.length > 0) {
      const buyStrike = trade.strikes.find(s => s.position === 'BUY');
      const sellStrike = trade.strikes.find(s => s.position === 'SELL');
      
      if (buyStrike && sellStrike) {
        setStrikeData({
          buyStrike: parseFloat(buyStrike.strike_price) || 0,
          sellStrike: parseFloat(sellStrike.strike_price) || 0,
          buyOptionType: buyStrike.option_type === 'CE' ? 'CE' : 'PE',
          sellOptionType: sellStrike.option_type === 'CE' ? 'CE' : 'PE',
          buyLots: buyStrike.lots || 0,
          sellLots: sellStrike.lots || 0,
          expiryDate: buyStrike.expiry_date || new Date().toISOString().split('T')[0],
          buyLtp: parseFloat(buyStrike.ltp) || 0,
          sellLtp: parseFloat(sellStrike.ltp) || 0
        });
      }
    } else {
      // Reset strike data if no strikes available
      setStrikeData({
        buyStrike: 0,
        sellStrike: 0,
        buyOptionType: 'PE',
        sellOptionType: 'PE',
        buyLots: 0,
        sellLots: 0,
        expiryDate: new Date().toISOString().split('T')[0],
        buyLtp: 0,
        sellLtp: 0
      });
    }
    
    setIsModifyTradeOpen(true);
    setOpenMenuId(null); // Close the dropdown menu
  };

  const handleModifyTradeSubmit = async () => {
    if (!selectedTradeToModify) return;
    
    // Validate required fields
    if (!selectedIndices || !selectedBias) {
      alert('Please fill in all required fields: Indices and Bias');
      return;
    }

    if (!formData.setup || !formData.strategy) {
      alert('Please fill in all required fields: Setup and Strategy');
      return;
    }

    if (!formData.capital || formData.capital === '') {
      alert('Please enter Capital amount');
      return;
    }

    // Validate strike data if strategy requires it
    if (shouldShowStrikes()) {
      if (!strikeData.buyStrike || strikeData.buyStrike === '' ||
          !strikeData.sellStrike || strikeData.sellStrike === '' ||
          !strikeData.buyLots || strikeData.buyLots === '' ||
          !strikeData.sellLots || strikeData.sellLots === '' ||
          !strikeData.buyLtp || strikeData.buyLtp === '' ||
          !strikeData.sellLtp || strikeData.sellLtp === '') {
        alert('Please fill in all Strike Details fields');
        return;
      }
    }

    try {
      // Always create strikes data - include all strike information regardless of strategy
      let strikes: any[] = [];
      
      // If we have strike data, use it
      if (strikeData.buyStrike && strikeData.sellStrike) {
        strikes = [
          {
            strike_price: typeof strikeData.buyStrike === 'string' ? parseFloat(strikeData.buyStrike) || 0 : strikeData.buyStrike,
            option_type: strikeData.buyOptionType,
            position: 'BUY',
            lots: typeof strikeData.buyLots === 'string' ? parseInt(strikeData.buyLots) || 0 : strikeData.buyLots,
            expiry_date: strikeData.expiryDate,
            ltp: typeof strikeData.buyLtp === 'string' ? parseFloat(strikeData.buyLtp) || 0 : strikeData.buyLtp
          },
          {
            strike_price: typeof strikeData.sellStrike === 'string' ? parseFloat(strikeData.sellStrike) || 0 : strikeData.sellStrike,
            option_type: strikeData.sellOptionType,
            position: 'SELL',
            lots: typeof strikeData.sellLots === 'string' ? parseInt(strikeData.sellLots) || 0 : strikeData.sellLots,
            expiry_date: strikeData.expiryDate,
            ltp: typeof strikeData.sellLtp === 'string' ? parseFloat(strikeData.sellLtp) || 0 : strikeData.sellLtp
          }
        ];
      } else if (selectedTradeToModify.strikes && selectedTradeToModify.strikes.length > 0) {
        // If no strike data in form but trade has strikes, preserve existing strikes
        strikes = selectedTradeToModify.strikes.map((strike: any) => ({
          strike_price: parseFloat(strike.strike_price) || 0,
          option_type: strike.option_type || 'PE',
          position: strike.position === 'BUY' ? 'BUY' : 'SELL',
          lots: strike.lots || 0,
          expiry_date: strike.expiry_date || new Date().toISOString().split('T')[0],
          ltp: parseFloat(strike.ltp) || 0
        }));
      }

      // Create data in the format expected by UpdateTradeRequest
      const tradeRequestData = {
        instrument: selectedIndices,
        instrumentType: 'index' as const,
        bias: selectedBias as 'bullish' | 'bearish' | 'neutral',
        setup: formData.setup || 'NA',
        strategy: formData.strategy || 'NA',
        daysToExpiry: formData.daysToExpiry || new Date().toISOString().split('T')[0],
        mainLots: 0,
        pricePerUnit: 0,
        hedgeLots: 0,
        pricePerHedgeUnit: 0,
        maxProfit: 0, // Will be calculated by backend
        maxLoss: 0, // Will be calculated by backend
        capital: typeof formData.capital === 'string' ? parseFloat(formData.capital) || 0 : formData.capital,
        notes: formData.notes || '',
        strikes: strikes
      };

      console.log('Updating trade with data:', tradeRequestData);
      console.log('Trade ID being updated:', selectedTradeToModify.id);
      console.log('Trade ID type:', typeof selectedTradeToModify.id);
      
      const response = await tradeApi.updateTrade(selectedTradeToModify.id.toString(), tradeRequestData);
      
      console.log('Update trade response:', response);
      console.log('Response success:', response.success);
      console.log('Response message:', response.message);
      
      if (response.success) {
        console.log('Trade updated successfully:', response.data);
        
        // Show success state
        setShowModifySuccess(true);
        
        // Refetch trades to update the list
        refetchTrades();
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          setShowModifySuccess(false);
          setIsModifyTradeOpen(false);
          setSelectedTradeToModify(null);
          
          // Reset form
          setSelectedIndices('');
          setSelectedBias('');
          setFormData({
            setup: '',
            strategy: '',
            capital: '',
            notes: '',
            daysToExpiry: '',
          });
          setStrikeData({
            buyStrike: '',
            sellStrike: '',
            buyOptionType: 'PE',
            sellOptionType: 'PE',
            buyLots: '',
            sellLots: '',
            expiryDate: new Date().toISOString().split('T')[0],
            buyLtp: '',
            sellLtp: ''
          });
        }, 2000);
      } else {
        console.error('Failed to update trade:', response.message);
        alert(`Failed to update trade: ${response.message}`);
      }
    } catch (error) {
      console.error('Error updating trade:', error);
      alert(`Failed to update trade: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteTrade = async (trade: Trade) => {
    if (window.confirm(`Are you sure you want to delete trade ${trade.id}?`)) {
      try {
        console.log('🗑️ Deleting trade:', trade.id);
        console.log('🔍 Trade object:', trade);
        console.log('🔍 Trade ID type:', typeof trade.id);
        console.log('🔍 Trade ID value:', JSON.stringify(trade.id));
        
        // Check if trade.id is a valid format
        if (!trade.id || typeof trade.id !== 'string') {
          throw new Error(`Invalid trade ID: ${trade.id}`);
        }
        
        // Clean the ID to ensure it's a valid string
        const cleanId = trade.id.toString().trim();
        console.log('🔍 Cleaned ID:', cleanId);
        
        // First test if the backend is reachable
        console.log('🔍 Testing backend connectivity...');
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://trader-em8b.onrender.com/api';
        console.log('🔍 Base URL:', baseUrl);
        
        try {
          const testResponse = await fetch(`${baseUrl}/trades/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          console.log('🔍 Backend connectivity test status:', testResponse.status);
          console.log('🔍 Backend connectivity test ok:', testResponse.ok);
        } catch (testError) {
          console.error('❌ Backend connectivity test failed:', testError);
        }
        
        // Now try direct fetch for delete
        console.log('🔍 Trying direct fetch for delete...');
        const directUrl = `${baseUrl}/trades/${cleanId}/`;
        console.log('🔍 Direct URL:', directUrl);
        
        try {
          const directResponse = await fetch(directUrl, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          console.log('🔍 Direct fetch response status:', directResponse.status);
          console.log('🔍 Direct fetch response ok:', directResponse.ok);
          
          if (directResponse.ok) {
            console.log('✅ Direct fetch succeeded');
            await refetchTrades();
            setOpenMenuId(null);
            alert('Trade deleted successfully!');
            return;
          } else {
            const errorText = await directResponse.text();
            console.error('❌ Direct fetch failed:', errorText);
            throw new Error(`Direct fetch failed: ${directResponse.status} - ${errorText}`);
          }
        } catch (directError) {
          console.error('❌ Direct fetch error:', directError);
          console.log('🔄 Falling back to tradeApi service...');
        }
        
        // Use the tradeApi service as fallback
        const response = await tradeApi.deleteTrade(cleanId);
        console.log('🔍 Delete response:', response);
        
        if (!response.success) {
          throw new Error(response.message || 'Delete failed');
        }
        
        console.log('✅ Trade deleted successfully');
        await refetchTrades();
        setOpenMenuId(null); // Close the dropdown menu
        alert('Trade deleted successfully!');
      } catch (error) {
        console.error('❌ Failed to delete trade:', error);
        console.error('❌ Error details:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          tradeId: trade.id,
          tradeIdType: typeof trade.id
        });
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(`Failed to delete trade: ${errorMessage}`);
      }
    }
  };
  
  
  // Handle form submission
  const handleCreateTrade = async () => {
    // Reset errors
    const errors = {
      indices: false,
      bias: false,
      setup: false,
      strategy: false,
      capital: false,
      strikeDetails: false
    };

    // Validate required fields
    if (!selectedIndices) errors.indices = true;
    if (!selectedBias) errors.bias = true;
    if (!formData.setup) errors.setup = true;
    if (!formData.strategy) errors.strategy = true;
    if (!formData.capital || formData.capital === '') errors.capital = true;

    // Validate strike data if strategy requires it
    if (shouldShowStrikes()) {
      if (!strikeData.buyStrike || strikeData.buyStrike === '' ||
          !strikeData.sellStrike || strikeData.sellStrike === '' ||
          !strikeData.buyLots || strikeData.buyLots === '' ||
          !strikeData.sellLots || strikeData.sellLots === '' ||
          !strikeData.buyLtp || strikeData.buyLtp === '' ||
          !strikeData.sellLtp || strikeData.sellLtp === '') {
        errors.strikeDetails = true;
      }
    }

    // Update error state
    setFieldErrors(errors);

    // If there are any errors, don't submit
    if (Object.values(errors).some(error => error)) {
      return;
    }

    console.log('🔄 Creating trade with data:', {
      selectedIndices,
      selectedBias,
      formData
    });

    // Create strikes data if strategy requires it
    let strikes: any[] = [];
    if (shouldShowStrikes()) {
      strikes = [
        {
          strike_price: typeof strikeData.buyStrike === 'string' ? parseFloat(strikeData.buyStrike) || 0 : strikeData.buyStrike,
          option_type: strikeData.buyOptionType,
          position: 'BUY',
          lots: typeof strikeData.buyLots === 'string' ? parseInt(strikeData.buyLots) || 0 : strikeData.buyLots,
          expiry_date: strikeData.expiryDate,
          ltp: typeof strikeData.buyLtp === 'string' ? parseFloat(strikeData.buyLtp) || 0 : strikeData.buyLtp
        },
        {
          strike_price: typeof strikeData.sellStrike === 'string' ? parseFloat(strikeData.sellStrike) || 0 : strikeData.sellStrike,
          option_type: strikeData.sellOptionType,
          position: 'SELL',
          lots: typeof strikeData.sellLots === 'string' ? parseInt(strikeData.sellLots) || 0 : strikeData.sellLots,
          expiry_date: strikeData.expiryDate,
          ltp: typeof strikeData.sellLtp === 'string' ? parseFloat(strikeData.sellLtp) || 0 : strikeData.sellLtp
        }
      ];
    }

    // Create data in the format expected by CreateTradeRequest
    const tradeRequestData = {
      instrument: selectedIndices,
      instrumentType: 'index' as const, // Assuming indices for now
      bias: selectedBias as 'bullish' | 'bearish' | 'neutral',
      setup: formData.setup || 'NA',
      strategy: formData.strategy || 'NA',
      daysToExpiry: new Date().toISOString().split('T')[0], // Default to today's date
      mainLots: 0, // Default value since field was removed
      pricePerUnit: 0, // Default value since field was removed
      hedgeLots: 0, // Default value since field was removed
      pricePerHedgeUnit: 0, // Default value since field was removed
      maxProfit: 0, // Default values since we removed these fields from the form
      maxLoss: 0,
      capital: typeof formData.capital === 'string' ? parseFloat(formData.capital) || 0 : formData.capital,
      strikes: strikes
    };

    try {
      console.log('📤 Sending to backend:', tradeRequestData);
      
      // Use the tradeApi service with fallback
      const response = await tradeApi.createTrade(tradeRequestData);
      
      if (!response.success) {
        console.error('❌ Create trade failed:', response.message);
        throw new Error(response.message);
      }

      console.log('✅ Trade created successfully:', response.data);

      // Show success state
      setShowSuccess(true);
      
      // Refetch trades to update the list
      refetchTrades();
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setIsFormOpen(false);
        
        // Reset form
        setSelectedIndices('');
        setSelectedBias('');
        setFormData({
          setup: '',
          strategy: '',
          capital: '',
          notes: '',
          daysToExpiry: '',
        });
        setStrikeData({
          buyStrike: '',
          sellStrike: '',
          buyOptionType: 'PE' as 'CE' | 'PE',
          sellOptionType: 'PE' as 'CE' | 'PE',
          buyLots: '',
          sellLots: '',
          expiryDate: new Date().toISOString().split('T')[0],
          buyLtp: '',
          sellLtp: ''
        });
      }, 2000);
    } catch (error) {
      console.error('❌ Failed to create trade:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to create trade: ${errorMessage}`);
    }
  };
  
  // Handle close trade submission
  const handleCloseTrade = async () => {
    if (!selectedTradeToClose) {
      alert('No trade selected to close');
      return;
    }

    console.log('🔄 Closing trade with data:', {
      tradeId: selectedTradeToClose.id,
      closeTradeData
    });

    // Create close trade data in your backend format
    // Store actual P&L in max_profit field as requested
    const closeData = {
      max_profit: closeTradeData.actualPnL.toString(),
      closing_date: closeTradeData.closingDate,
      notes: closeTradeData.notes,
      status: 'CLOSED'
    };

    try {
      console.log('📤 Sending close trade data to backend:', closeData);
      
      // Only use local server
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://trader-em8b.onrender.com/api'}/trades/${selectedTradeToClose.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(closeData),
      });

      console.log('📡 Close trade response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Close trade error response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const closedTrade = await response.json();
      console.log('✅ Trade closed successfully:', closedTrade);

      // Reset form and close modal
      setIsCloseTradeOpen(false);
      setSelectedTradeToClose(null);
      setCloseTradeData({
        actualPnL: 0,
        closingDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      
      // Refetch trades to update the list
      console.log('🔄 Refetching trades after closing trade');
      await refetchTrades();
      
      alert('Trade closed successfully!');
    } catch (error) {
      console.error('❌ Failed to close trade:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to close trade: ${errorMessage}`);
    }
  };
  
  // Helper function to render bias icon
  const renderBiasIcon = (bias: 'bullish' | 'bearish' | 'neutral') => {
    if (bias === 'bullish') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="7" y1="17" x2="17" y2="7"></line>
          <polyline points="7 7 17 7 17 17"></polyline>
        </svg>
      );
    } else if (bias === 'bearish') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="7" y1="7" x2="17" y2="17"></line>
          <polyline points="17 7 17 17 7 17"></polyline>
        </svg>
      );
    } else {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      );
    }
  };
  
  // Helper function to get bias cell background color
  const getBiasCellColor = (bias: 'bullish' | 'bearish' | 'neutral') => {
    if (bias === 'bullish') return '#D1FAE5';
    if (bias === 'bearish') return '#FEE2E2';
    return '#F3F4F6';
  };
  
  // Helper function to get bias cell class
  const getBiasCellClass = (bias: 'bullish' | 'bearish' | 'neutral') => {
    if (bias === 'bullish') return 'bias-cell-bullish';
    if (bias === 'bearish') return 'bias-cell-bearish';
    return 'bias-cell-neutral';
  };
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside the menu
      if (openMenuId && !target.closest('.dropdown-menu') && !target.closest('.menu-trigger')) {
        setOpenMenuId(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);
  
  return (
    <div className="min-h-screen bg-white relative">
      {/* Main Content Container - Max Width 1280px with Vertical Grid Lines */}
      <div className="relative z-10 max-w-[1280px] mx-auto bg-white min-h-screen" style={{
        backgroundImage: `
          repeating-linear-gradient(to right, rgba(217, 217, 217, 0.5) 0px, rgba(217, 217, 217, 0.5) 1px, transparent 1px, transparent calc(100% / 16)),
          linear-gradient(to right, rgba(217, 217, 217, 0.5) 0px, rgba(217, 217, 217, 0.5) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 1px 100%',
        backgroundPosition: 'left top, right top',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Branding Image - Edge to Edge */}
        <div className="w-full">
          <img 
            src="/branding.png" 
            alt="in the zone trader" 
            className="w-full h-auto block"
          />
        </div>

        {/* Header - 24px from branding */}
        <header className="mt-6">
          <div className="flex items-center justify-between relative">
            {/* Green Line: from left edge to 1st vertical line - Absolute positioned */}
            <div 
              className="absolute left-0" 
              style={{
                width: 'calc(100% / 16)',
                height: '4px',
                backgroundColor: '#02D196',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />
            
            {/* Left: Name Section */}
            <div className="flex items-center gap-6 ml-[calc(100%/16+24px)]">
              {/* Name: yugendran */}
              <span 
                className="font-normal italic"
                style={{
                  color: '#1E3F66',
                  fontSize: '45px',
                  fontFamily: 'Freehand, cursive',
                  lineHeight: '1'
                }}
              >
                yugendran
              </span>
            </div>

            {/* Right: Navigation - Width from left edge to 6th vertical line */}
            <nav className="flex items-center justify-around bg-white" style={{
              width: 'calc(100% / 16 * 6 - 2px)',
              height: '53px',
              marginLeft: '1px',
              marginRight: '1px',
              borderTop: '1px dashed #DEE2E8',
              borderBottom: '1px dashed #DEE2E8'
            }}>
              <button style={{
                color: '#8E9FB2',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '400',
                fontSize: '16px'
              }}>Analyse</button>
              <Link to="/transfers" style={{
                color: '#8E9FB2',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '400',
                fontSize: '16px',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}>Transfers</Link>
              <button style={{
                color: '#8E9FB2',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '400',
                fontSize: '16px'
              }}>Strategy</button>
              <button style={{
                color: '#8E9FB2',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '400',
                fontSize: '16px'
              }}>Setup</button>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main style={{ marginTop: '80px' }}>
          {/* Market Indices Section */}
          <section style={{ 
            borderTop: '1px solid rgba(217, 217, 217, 0.5)',
            borderBottom: '1px solid rgba(217, 217, 217, 0.5)',
            borderLeft: '1px solid rgba(217, 217, 217, 0.5)',
            borderRight: '1px solid rgba(217, 217, 217, 0.5)',
            marginBottom: '40px'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '1px',
              height: '72px'
            }}>
              {/* NIFTY 50 */}
              <div style={{
                width: 'calc((100% - 4px) / 16 * 4)',
                backgroundColor: 'white',
                boxSizing: 'border-box',
                overflow: 'hidden',
                padding: '16px 20px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#D1FAE5',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(45deg)' }}>
                  <path d="M10 4L10 16M10 4L6 8M10 4L14 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '400', color: '#1E3F66', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>NIFTY 50</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: 'Inter, sans-serif' }}>25,199.45</div>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#10B981', fontFamily: 'Inter, sans-serif' }}>+121.80</div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#10B981', fontFamily: 'Inter, sans-serif' }}>+0.49%</div>
                </div>
              </div>
            </div>

            {/* SENSEX */}
            <div style={{
              width: 'calc((100% - 4px) / 16 * 4)',
              backgroundColor: 'white',
              boxSizing: 'border-box',
              overflow: 'hidden',
              padding: '16px 20px',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              borderLeft: '1px solid rgba(217, 217, 217, 0.5)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#D1FAE5',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(45deg)' }}>
                  <path d="M10 4L10 16M10 4L6 8M10 4L14 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '400', color: '#1E3F66', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>SENSEX</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: 'Inter, sans-serif' }}>82,245.65</div>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#10B981', fontFamily: 'Inter, sans-serif' }}>+455.53</div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#10B981', fontFamily: 'Inter, sans-serif' }}>+0.56%</div>
                </div>
              </div>
            </div>

            {/* Nifty Bank */}
            <div style={{
              width: 'calc((100% - 4px) / 16 * 4)',
              backgroundColor: 'white',
              boxSizing: 'border-box',
              overflow: 'hidden',
              padding: '16px 20px',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              borderLeft: '1px solid rgba(217, 217, 217, 0.5)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#D1FAE5',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(45deg)' }}>
                  <path d="M10 4L10 16M10 4L6 8M10 4L14 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '400', color: '#1E3F66', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>Nifty Bank</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: 'Inter, sans-serif' }}>56,417.75</div>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#10B981', fontFamily: 'Inter, sans-serif' }}>+312.90</div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#10B981', fontFamily: 'Inter, sans-serif' }}>+0.56%</div>
                </div>
              </div>
            </div>

            {/* India VIX */}
            <div style={{
              width: 'calc((100% - 4px) / 16 * 2)',
              backgroundColor: 'white',
              boxSizing: 'border-box',
              overflow: 'hidden',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderLeft: '1px solid rgba(217, 217, 217, 0.5)'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '400', color: '#1E3F66', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>India VIX</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827', fontFamily: 'Inter, sans-serif' }}>13.85</div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#EF4444', fontFamily: 'Inter, sans-serif' }}>-2.15%</div>
              </div>
            </div>

            {/* IVP */}
            <div style={{
              width: 'calc((100% - 4px) / 16 * 2)',
              backgroundColor: 'white',
              boxSizing: 'border-box',
              overflow: 'hidden',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderLeft: '1px solid rgba(217, 217, 217, 0.5)'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '400', color: '#1E3F66', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>IVP</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827', fontFamily: 'Inter, sans-serif' }}>48.2</div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#10B981', fontFamily: 'Inter, sans-serif' }}>+1.5%</div>
              </div>
            </div>
          </div>
          </section>

          {/* Trades Tabs */}
          {!tradesLoading && !tradesError && (
            <div style={{ 
              marginBottom: '40px',
              borderTop: '1px dashed #DEE2E8',
              borderLeft: '1px solid rgba(217, 217, 217, 0.5)',
              borderRight: '1px solid rgba(217, 217, 217, 0.5)',
              display: 'flex',
              backgroundColor: '#F9FAFB'
            }}>
              <div style={{ display: 'flex', gap: '0', width: '50%' }}>
                <button
                  onClick={() => setActiveTab('active')}
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'Inter, sans-serif',
                    color: activeTab === 'active' ? '#1E3F66' : '#6B7280',
                    backgroundColor: activeTab === 'active' ? 'white' : '#F9FAFB',
                    border: 'none',
                    borderRight: activeTab === 'active' ? '1px solid rgba(217, 217, 217, 0.5)' : 'none',
                    borderBottom: activeTab === 'active' ? 'none' : '1px dashed #DEE2E8',
                    cursor: 'pointer',
                    textTransform: 'none',
                    letterSpacing: '0px',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'active') {
                      e.currentTarget.style.color = '#374151';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'active') {
                      e.currentTarget.style.color = '#6B7280';
                    }
                  }}
                >
                  Active Trades
                  <span style={{
                    marginLeft: '8px',
                    backgroundColor: activeTab === 'active' ? '#02D196' : '#9CA3AF',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '4px 8px',
                    borderRadius: '100px',
                    minWidth: '32px',
                    textAlign: 'center',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {trades.filter(t => t.status === 'active').length}
                  </span>
                </button>
                
                <button
                  onClick={() => setActiveTab('closed')}
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'Inter, sans-serif',
                    color: activeTab === 'closed' ? '#1E3F66' : '#6B7280',
                    backgroundColor: activeTab === 'closed' ? 'white' : '#F9FAFB',
                    border: 'none',
                    borderLeft: activeTab === 'closed' ? '1px solid rgba(217, 217, 217, 0.5)' : 'none',
                    borderRight: activeTab === 'closed' ? '1px solid rgba(217, 217, 217, 0.5)' : 'none',
                    borderBottom: activeTab === 'closed' ? 'none' : '1px dashed #DEE2E8',
                    cursor: 'pointer',
                    textTransform: 'none',
                    letterSpacing: '0px',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'closed') {
                      e.currentTarget.style.color = '#374151';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'closed') {
                      e.currentTarget.style.color = '#6B7280';
                    }
                  }}
                >
                  Closed Trades
                  <span style={{
                    marginLeft: '8px',
                    backgroundColor: activeTab === 'closed' ? '#02D196' : '#9CA3AF',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '4px 8px',
                    borderRadius: '100px',
                    minWidth: '32px',
                    textAlign: 'center',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {trades.filter(t => t.status === 'closed').length}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Capital Growth Chart Section - Only for Closed Trades */}
          {activeTab === 'closed' && (
          <section style={{
            borderLeft: '1px solid rgba(217, 217, 217, 0.5)',
            borderRight: '1px solid rgba(217, 217, 217, 0.5)',
            borderBottom: '1px solid rgba(217, 217, 217, 0.5)',
            backgroundColor: 'transparent',
            padding: '32px 40px 32px 40px',
            marginBottom: '40px'
          }}>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>
                Account Value
              </div>
              {(() => {
                // Use the same calculation as Total Profit/Loss section (closed trades only)
                const closedTrades = trades.filter(t => t.status === 'closed');
                const closedPnL = closedTrades.reduce((sum, t) => {
                  const value = parseFloat(t.profitLoss.value.replace(/[₹,+-]/g, ''));
                  return sum + (t.profitLoss.isProfit ? value : -value);
                }, 0);
                const totalCapitalWithPnL = totalCapital + closedPnL;
                
                // Calculate deployed capital for closed trades
                const closedDeployedCapital = closedTrades.reduce((sum, t) => {
                  return sum + parseFloat(t.capital.value.replace(/[₹,]/g, ''));
                }, 0);
                
                const percentageReturn = closedDeployedCapital > 0 ? ((closedPnL / closedDeployedCapital) * 100) : 0;
                
                return (
                  <>
                    <div style={{ fontSize: '40px', fontWeight: '700', color: '#111827', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>
                      ₹{formatCompactNumber(totalCapitalWithPnL.toLocaleString('en-IN'))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', color: closedPnL >= 0 ? '#10B981' : '#EF4444' }}>{closedPnL >= 0 ? '▲' : '▼'}</span>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: closedPnL >= 0 ? '#10B981' : '#EF4444', fontFamily: 'Inter, sans-serif' }}>
                        ₹{formatCompactNumber(Math.abs(closedPnL).toLocaleString('en-IN'))} ({Math.abs(percentageReturn).toFixed(2)}%)
                      </span>
                      <span style={{ fontSize: '14px', color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>All Time</span>
                    </div>
                  </>
                );
              })()}
            </div>
            
            {/* Simple Line Chart */}
            <div style={{ position: 'relative', height: '280px', width: 'calc(100% + 80px)', marginLeft: '-40px', marginRight: '-40px', marginBottom: '16px' }}>
              <svg width="100%" height="100%" viewBox="0 0 1000 280" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                
                {/* Growth line - Based on actual trade dates and values */}
                {(() => {
                  const startingCapital = totalCapital;
                  const startDate = new Date(2025, 9, 1); // Oct 1, 2025
                  const endDate = new Date(2026, 2, 31); // March 31, 2026
                  const timeRange = endDate.getTime() - startDate.getTime();
                  
                  // Get only closed trades
                  const closedTrades = trades.filter(t => t.status === 'closed');
                  
                  // Build data points with actual dates and running capital
                  let runningCapital = startingCapital;
                  const dataPoints = [{ x: 0, y: startingCapital }];
                  
                  if (closedTrades.length > 0) {
                    // Spread trades between Oct 1 and Oct 7 (today)
                    const tradingDays = 6; // Oct 1 to Oct 7
                    const daysPerTrade = tradingDays / closedTrades.length;
                    
                    closedTrades.forEach((trade, index) => {
                      const tradePnL = parseFloat(trade.profitLoss.value.replace(/[₹,+-]/g, '')) * (trade.profitLoss.isProfit ? 1 : -1);
                      runningCapital += tradePnL;
                      
                      // Place trade between Oct 1 and Oct 7
                      const daysFromStart = (index + 1) * daysPerTrade;
                      const tradeDate = new Date(startDate.getTime() + daysFromStart * 24 * 60 * 60 * 1000);
                      const xPosition = (tradeDate.getTime() - startDate.getTime()) / timeRange;
                      
                      dataPoints.push({ x: xPosition, y: runningCapital });
                    });
                  } else {
                    // If no closed trades, just show flat line at start
                    dataPoints.push({ x: 0.01, y: startingCapital });
                  }
                  
                  const minY = Math.min(...dataPoints.map(p => p.y));
                  const maxY = Math.max(...dataPoints.map(p => p.y));
                  const range = maxY - minY || 1;
                  
                  // Calculate baseline Y position (starting capital)
                  const baselineY = 280 - ((startingCapital - minY) / range) * 260 - 10;
                  
                  const pathData = dataPoints.map((point, i) => {
                    const x = point.x * 1000;
                    const y = 280 - ((point.y - minY) / range) * 260 - 10;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ');
                  
                  // Create area fill path with baseline
                  const lastPoint = dataPoints[dataPoints.length - 1];
                  const lastX = lastPoint.x * 1000;
                  const areaPath = `${pathData} L ${lastX} ${baselineY} L 0 ${baselineY} Z`;
                  
                  return (
                    <>
                      <defs>
                        {/* Positive gradient (green) */}
                        <linearGradient id="positiveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 0.3 }} />
                          <stop offset="100%" style={{ stopColor: '#10B981', stopOpacity: 0.05 }} />
                        </linearGradient>
                        {/* Negative gradient (red) */}
                        <linearGradient id="negativeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#EF4444', stopOpacity: 0.05 }} />
                          <stop offset="100%" style={{ stopColor: '#EF4444', stopOpacity: 0.3 }} />
                        </linearGradient>
                        
                        {/* Clip path for positive area (above baseline) */}
                        <clipPath id="positiveClip">
                          <rect x="0" y="0" width="1000" height={baselineY} />
                        </clipPath>
                        
                        {/* Clip path for negative area (below baseline) */}
                        <clipPath id="negativeClip">
                          <rect x="0" y={baselineY} width="1000" height={280 - baselineY} />
                        </clipPath>
                      </defs>
                      
                      {/* Positive area fill (above baseline) */}
                      <path 
                        d={areaPath} 
                        fill="url(#positiveGradient)" 
                        clipPath="url(#positiveClip)"
                      />
                      
                      {/* Negative area fill (below baseline) */}
                      <path 
                        d={areaPath} 
                        fill="url(#negativeGradient)" 
                        clipPath="url(#negativeClip)"
                      />
                      
                      {/* Baseline (starting capital) - subtle line */}
                      <line 
                        x1="0" 
                        y1={baselineY} 
                        x2={lastX} 
                        y2={baselineY} 
                        stroke="#D1D5DB" 
                        strokeWidth="1" 
                        strokeDasharray="4 4"
                        opacity="0.5"
                      />
                      
                      {/* Line stroke - green above baseline */}
                      <path 
                        d={pathData} 
                        stroke="#10B981" 
                        strokeWidth="2" 
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        clipPath="url(#positiveClip)"
                      />
                      
                      {/* Line stroke - red below baseline */}
                      <path 
                        d={pathData} 
                        stroke="#EF4444" 
                        strokeWidth="2" 
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        clipPath="url(#negativeClip)"
                      />
                    </>
                  );
                })()}
              </svg>
              
              {/* Time Scale - Oct 2025 to March 2026 across 16 columns */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', marginBottom: '8px', marginLeft: '0', marginRight: '0' }}>
                {(() => {
                  const startDate = new Date(2025, 9, 1); // Oct 1, 2025
                  const endDate = new Date(2026, 2, 31); // March 31, 2026
                  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                  const timestamps = [];
                  
                  for (let i = 0; i < 16; i++) {
                    const daysOffset = (totalDays / 15) * i; // 15 intervals for 16 points
                    const date = new Date(startDate.getTime() + daysOffset * 24 * 60 * 60 * 1000);
                    const month = date.toLocaleDateString('en-US', { month: 'short' });
                    const day = date.getDate();
                    
                    timestamps.push(
                      <div key={i} style={{ flex: '1 1 0', fontSize: '10px', color: '#1E3F66', opacity: 0.25, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
                        {month} {day}
                      </div>
                    );
                  }
                  
                  return timestamps;
                })()}
              </div>
            </div>
          </section>
          )}

          {/* Running Trades Section */}
          <section style={{
            borderTop: '1px dashed #DEE2E8',
            borderBottom: '1px dashed #DEE2E8',
            borderLeft: '1px solid rgba(217, 217, 217, 0.5)',
            borderRight: '1px solid rgba(217, 217, 217, 0.5)',
            marginBottom: '40px'
          }}>
            {/* 4 Subsections - Aligned with vertical lines, no visible gaps */}
            <div className="flex" style={{ height: '270px', gap: '1px' }}>
                {/* Subsection 1 - Dynamic Background Color */}
                <div style={{ width: `calc((100% - ${activeTab === 'active' ? '2px' : '3px'}) / 4)`, backgroundColor: metrics.backgroundColor, boxSizing: 'border-box', overflow: 'hidden' }}>
                  <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    {/* Title */}
                    <div style={styles.contentAnchor}>
                      {activeTab === 'active' ? 'Running Profit / Loss' : 'Total Profit / Loss'}
                    </div>
                    
                    {/* Main Data - Aligned to Bottom */}
                    <div>
                      {/* Actual Number */}
                      <div style={styles.mainNumber}>
                        {formatCompactNumber(metrics.totalPnLFormatted)}
                      </div>
                      {/* Percentage */}
                      <div style={{ ...styles.percentage, marginTop: '12px', color: parseFloat(metrics.percentageReturn) >= 0 ? '#10B981' : '#EF4444' }}>
                        {Math.abs(parseFloat(metrics.percentageReturn)).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Subsection 2 - Max Profit (active: combined with Max Loss, closed: separate) */}
                {activeTab === 'active' ? (
                <div style={{ width: 'calc((100% - 2px) / 2)', backgroundColor: 'white', boxSizing: 'border-box', overflow: 'hidden' }}>
                  <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    {/* Title */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={styles.contentAnchor}>Max Profit</div>
                      <div style={styles.contentAnchor}>Max Loss</div>
                    </div>
                    
                    {/* Slider Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                      {/* Max Profit - Left */}
                      <div style={{ flex: '0 0 auto', textAlign: 'left' }}>
                        <div style={styles.mainNumber}>
                          {formatCompactNumber(metrics.totalMaxProfit)}
                        </div>
                        <div style={{ ...styles.percentage, marginTop: '12px' }}>
                          {((parseFloat(metrics.totalMaxProfit.replace(/,/g, '')) / parseFloat(metrics.totalCapital.replace(/,/g, ''))) * 100).toFixed(1)}%
                        </div>
                      </div>
                      
                      {/* Slider - Center */}
                      <div style={{ flex: '1 1 auto', position: 'relative', display: 'flex', alignItems: 'center', paddingTop: '18px' }}>
                        <div style={{ width: '100%', display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                          {(() => {
                            const maxProfit = parseFloat(metrics.totalMaxProfit.replace(/,/g, ''));
                            const maxLoss = parseFloat(metrics.totalMaxLoss.replace(/,/g, ''));
                            const totalRange = maxProfit + maxLoss;
                            const profitRatio = totalRange > 0 ? maxProfit / totalRange : 0.5;
                            return (
                              <>
                                <div style={{ width: `${profitRatio * 100}%`, backgroundColor: '#10B981' }}></div>
                                <div style={{ width: `${(1 - profitRatio) * 100}%`, backgroundColor: '#EF4444' }}></div>
                              </>
                            );
                          })()}
                        </div>
                        <div style={{ position: 'absolute', left: '50%', top: 'calc(18px + 4px)', transform: 'translate(-50%, -50%)', width: '4px', height: '20px', backgroundColor: '#1E3F66', borderRadius: '2px' }}></div>
                      </div>
                      
                      {/* Max Loss - Right */}
                      <div style={{ flex: '0 0 auto', textAlign: 'right' }}>
                        <div style={styles.mainNumber}>
                          {formatCompactNumber(metrics.totalMaxLoss)}
                        </div>
                        <div style={{ ...styles.percentage, marginTop: '12px' }}>
                          {((parseFloat(metrics.totalMaxLoss.replace(/,/g, '')) / parseFloat(metrics.totalCapital.replace(/,/g, ''))) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                ) : (
                <>
                  {/* Subsection 2 - Max Profit (closed tab) */}
                  <div style={{ width: 'calc((100% - 3px) / 4)', backgroundColor: 'white', boxSizing: 'border-box', overflow: 'hidden', borderLeft: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                      <div style={styles.contentAnchor}>Max Profit</div>
                      <div>
                        {(() => {
                          const closedTrades = trades.filter(t => t.status === 'closed' && t.profitLoss.isProfit);
                          if (closedTrades.length === 0) return (
                            <>
                              <div style={styles.mainNumber}>0%</div>
                              <div style={{ ...styles.percentage, marginTop: '12px' }}>₹0</div>
                            </>
                          );
                          // Find the trade with max profit percentage
                          const maxProfitTrade = closedTrades.reduce((max, t) => {
                            const profitValue = parseFloat(t.profitLoss.value.replace(/[₹,+]/g, ''));
                            const capital = parseFloat(t.capital.value.replace(/[₹,]/g, ''));
                            const percentage = capital > 0 ? (profitValue / capital) * 100 : 0;
                            
                            const maxProfitValue = parseFloat(max.profitLoss.value.replace(/[₹,+]/g, ''));
                            const maxCapital = parseFloat(max.capital.value.replace(/[₹,]/g, ''));
                            const maxPercentage = maxCapital > 0 ? (maxProfitValue / maxCapital) * 100 : 0;
                            
                            return percentage > maxPercentage ? t : max;
                          });
                          
                          const profitValue = parseFloat(maxProfitTrade.profitLoss.value.replace(/[₹,+]/g, ''));
                          const capital = parseFloat(maxProfitTrade.capital.value.replace(/[₹,]/g, ''));
                          const percentage = capital > 0 ? ((profitValue / capital) * 100).toFixed(1) : '0.0';
                          
                          return (
                            <>
                              <div style={{ ...styles.mainNumber, color: '#10B981' }}>{percentage}%</div>
                              <div style={{ ...styles.percentage, marginTop: '12px' }}>{formatCompactNumber(profitValue.toLocaleString('en-IN'))}</div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Subsection 3 - Max Loss (closed tab) */}
                  <div style={{ width: 'calc((100% - 3px) / 4)', backgroundColor: 'white', boxSizing: 'border-box', overflow: 'hidden', borderLeft: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                      <div style={styles.contentAnchor}>Max Loss</div>
                      <div>
                        {(() => {
                          const closedTrades = trades.filter(t => t.status === 'closed' && !t.profitLoss.isProfit);
                          if (closedTrades.length === 0) return (
                            <>
                              <div style={styles.mainNumber}>0%</div>
                              <div style={{ ...styles.percentage, marginTop: '12px' }}>₹0</div>
                            </>
                          );
                          // Find the trade with max loss percentage
                          const maxLossTrade = closedTrades.reduce((max, t) => {
                            const lossValue = Math.abs(parseFloat(t.profitLoss.value.replace(/[₹,+-]/g, '')));
                            const capital = parseFloat(t.capital.value.replace(/[₹,]/g, ''));
                            const percentage = capital > 0 ? (lossValue / capital) * 100 : 0;
                            
                            const maxLossValue = Math.abs(parseFloat(max.profitLoss.value.replace(/[₹,+-]/g, '')));
                            const maxCapital = parseFloat(max.capital.value.replace(/[₹,]/g, ''));
                            const maxPercentage = maxCapital > 0 ? (maxLossValue / maxCapital) * 100 : 0;
                            
                            return percentage > maxPercentage ? t : max;
                          });
                          
                          const lossValue = parseFloat(maxLossTrade.profitLoss.value.replace(/[₹,+-]/g, ''));
                          const capital = parseFloat(maxLossTrade.capital.value.replace(/[₹,]/g, ''));
                          const percentage = capital > 0 ? ((Math.abs(lossValue) / capital) * 100).toFixed(1) : '0.0';
                          
                          return (
                            <>
                              <div style={{ ...styles.mainNumber, color: '#EF4444' }}>{percentage}%</div>
                              <div style={{ ...styles.percentage, marginTop: '12px' }}>{maxLossTrade.profitLoss.value}</div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </>
                )}
                
                {/* Subsection 4 */}
                <div style={{ width: `calc((100% - ${activeTab === 'active' ? '2px' : '3px'}) / 4)`, backgroundColor: 'white', boxSizing: 'border-box', overflow: 'hidden', borderLeft: '1px solid rgba(217, 217, 217, 0.5)' }}>
                  <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    
                    {/* Row 1: Total Capital or Total Trades */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={styles.section4Label}>{activeTab === 'active' ? 'Total Capital' : 'Total Trades'}</div>
                      <div style={styles.mainNumberSmall}>
                        {activeTab === 'active' ? (() => {
                          // Total Capital = Transfer Capital + Closed Trades P&L
                          const closedTrades = trades.filter(t => t.status === 'closed');
                          const closedPnL = closedTrades.reduce((sum, t) => {
                            const value = parseFloat(t.profitLoss.value.replace(/[₹,+-]/g, ''));
                            return sum + (t.profitLoss.isProfit ? value : -value);
                          }, 0);
                          return formatCompactNumber((totalCapital + closedPnL).toLocaleString('en-IN'));
                        })() : metrics.totalTrades}
                      </div>
                    </div>
                    
                    {/* Dotted Divider */}
                    <div style={{ borderBottom: '1px dotted #D1D5DB', margin: '16px 0' }}></div>
                    
                    {/* Row 2: Deployed or Total Wins */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={styles.section4Label}>{activeTab === 'active' ? 'Deployed' : 'Total Wins'}</div>
                      {activeTab === 'active' ? (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={styles.mainNumberSmall}>{formatCompactNumber(metrics.totalCapital)}</span>
                          <span style={{ ...styles.percentage, color: '#6B7280' }}>
                            {(() => {
                              // Calculate deployed as % of total capital (including closed P&L)
                              const closedTrades = trades.filter(t => t.status === 'closed');
                              const closedPnL = closedTrades.reduce((sum, t) => {
                                const value = parseFloat(t.profitLoss.value.replace(/[₹,+-]/g, ''));
                                return sum + (t.profitLoss.isProfit ? value : -value);
                              }, 0);
                              const totalCapitalWithPnL = totalCapital + closedPnL;
                              const deployedPercentage = totalCapitalWithPnL > 0 ? ((parseFloat(metrics.totalCapital.replace(/,/g, '')) / totalCapitalWithPnL) * 100).toFixed(1) : '0.0';
                              return `(${deployedPercentage}%)`;
                            })()}
                          </span>
                        </div>
                      ) : (
                        <div style={styles.mainNumberSmall}>{trades.filter(t => t.status === 'closed' && t.profitLoss.isProfit).length}</div>
                      )}
                    </div>
                    
                    {/* Dotted Divider */}
                    <div style={{ borderBottom: '1px dotted #D1D5DB', margin: '16px 0' }}></div>
                    
                    {/* Row 3: @ Risk or Total Loss */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={styles.section4Label}>{activeTab === 'active' ? '@ Risk' : 'Total Loss'}</div>
                      <div style={styles.mainNumberSmall}>
                        {activeTab === 'active' ? `${metrics.totalRisk}%` : trades.filter(t => t.status === 'closed' && !t.profitLoss.isProfit).length}
                      </div>
                    </div>
                    
                    {/* Dotted Divider */}
                    <div style={{ borderBottom: '1px dotted #D1D5DB', margin: '16px 0' }}></div>
                    
                    {/* Row 4: Buying Power or Win% */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={styles.section4Label}>{activeTab === 'active' ? 'Buying Power' : 'Win%'}</div>
                      {activeTab === 'active' ? (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={styles.mainNumberSmall}>{formatCompactNumber(metrics.buyingPowerUsed)}</span>
                          <span style={{ ...styles.percentage, color: '#6B7280' }}>({metrics.buyingPowerPercentage}%)</span>
                        </div>
                      ) : (
                        <div style={styles.mainNumberSmall}>
                          {(() => {
                            const closedTrades = trades.filter(t => t.status === 'closed');
                            const wins = closedTrades.filter(t => t.profitLoss.isProfit).length;
                            const winPercentage = closedTrades.length > 0 ? ((wins / closedTrades.length) * 100).toFixed(1) : '0.0';
                            return `${winPercentage}%`;
                          })()}
                        </div>
                      )}
                    </div>
                    
                  </div>
                </div>
              </div>
          </section>

          {/* Active Trades Table Section */}
          <section style={{ borderLeft: '1px solid rgba(217, 217, 217, 0.5)', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
            {/* Loading State */}
            {tradesLoading && (
              <div style={{ 
                padding: '60px', 
                textAlign: 'center', 
                backgroundColor: 'white',
                borderTop: '1px dashed #DEE2E8',
                borderBottom: '1px dashed #DEE2E8'
              }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontFamily: 'Inter, sans-serif', 
                  color: '#6B7280',
                  marginBottom: '12px'
                }}>
                  Loading trades...
                </div>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #E5E7EB',
                  borderTop: '3px solid #10B981',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }} />
              </div>
            )}

            {/* Error State */}
            {tradesError && !tradesLoading && (
              <div style={{ 
                padding: '60px', 
                textAlign: 'center', 
                backgroundColor: '#FEE2E2',
                borderTop: '1px dashed #DEE2E8',
                borderBottom: '1px dashed #DEE2E8'
              }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontFamily: 'Inter, sans-serif', 
                  color: '#DC2626',
                  marginBottom: '12px'
                }}>
                  Failed to load trades
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontFamily: 'Inter, sans-serif', 
                  color: '#7F1D1D',
                  marginBottom: '16px'
                }}>
                  {tradesError}
                </div>
                <button
                  onClick={() => refetchTrades()}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#DC2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer'
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Table - only show when not loading and no error */}
            {!tradesLoading && !tradesError && (
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', backgroundColor: 'transparent' }}>
              <colgroup>
                <col style={{ width: 'calc(100% / 16 * 1)' }} /> {/* 1. Date */}
                <col style={{ width: 'calc(100% / 16 * 2)' }} /> {/* 2-3. Inst */}
                <col style={{ width: 'calc(100% / 16 * 1)' }} /> {/* 4. Bias */}
                <col style={{ width: 'calc(100% / 16 * 2)' }} /> {/* 5-6. Setup/Strategy */}
                <col style={{ width: 'calc(100% / 16 * 1)' }} /> {/* 7. Lots */}
                <col style={{ width: 'calc(100% / 16 * 2)' }} /> {/* 8-9. Profit/Loss */}
                {activeTab === 'active' && <col style={{ width: 'calc(100% / 16 * 4)' }} />} {/* 10-13. Max Profit & Max Loss combined */}
                {activeTab === 'closed' && <col style={{ width: 'calc(100% / 16 * 4)' }} />} {/* Notes */}
                <col style={{ width: 'calc(100% / 16 * 1)' }} /> {/* 14. Capital */}
                <col style={{ width: 'calc(100% / 16 * 1)' }} /> {/* 15. @Risk */}
                <col style={{ width: 'calc(100% / 16 * 1)' }} /> {/* 16. Action + More combined */}
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: 'white', borderTop: '1px dashed #DEE2E8' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)', fontFamily: 'Inter, sans-serif' }}>Date</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Inst</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Bias</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Setup/Strategy</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Lots</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Profit / Loss</th>
                  {activeTab === 'active' && (
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '8px' }}>
                      <span>Max Profit</span>
                      <span style={{ paddingLeft: '24px' }}>Max Loss</span>
                    </div>
                  </th>
                  )}
                  {activeTab === 'closed' && (
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Max Profit</span>
                        <span>Max Loss</span>
                      </div>
                    </th>
                  )}
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Capital</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>@Risk</th>
                  <th style={{ padding: '16px', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8' }}></th> {/* Action + More combined */}
                </tr>
              </thead>
              <tbody>
                {/* Debug: Show trade count */}
                {(() => {
                  console.log('🔄 Rendering filtered trades in table:', filteredTrades.length, 'of', trades.length, 'total trades');
                  return null;
                })()}
                
                {/* Render filtered trades from API */}
                {filteredTrades.map((trade) => (
                <tr key={trade.id} className="table-row">
                  <td style={{ padding: '18px 24px', fontSize: '14px', color: '#1F2937', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', border: '3px solid #1E3F66', overflow: 'hidden', width: '31px', height: '36px' }}>
                      <div style={{ backgroundColor: '#1E3F66', color: 'white', textAlign: 'center', fontSize: '8px', fontWeight: '700', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>{trade.date.month}</div>
                      <div style={{ backgroundColor: 'white', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24px', fontSize: '10px', fontWeight: '700', fontFamily: 'Inter, sans-serif' }}>{trade.date.day}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={styles.textPrimary}>{trade.instrument.name}</div>
                    <div style={styles.textSecondary}>{trade.instrument.type}</div>
                  </td>
                  <td className={getBiasCellClass(trade.bias)} style={{ padding: '16px', backgroundColor: getBiasCellColor(trade.bias), borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      {renderBiasIcon(trade.bias)}
                    </div>
                  </td>
                  <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={styles.textPrimary}>{trade.setup.type}</div>
                    <div style={styles.textSecondary}>{trade.setup.name}</div>
                  </td>
                  <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={styles.textPrimary}>{trade.lots.value}</div>
                    <div style={styles.textSecondary}>{trade.lots.type}</div>
                  </td>
                  <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={{ ...styles.textPrimaryBold, color: trade.profitLoss.isProfit ? '#10B981' : '#EF4444' }}>{trade.profitLoss.value}</div>
                    <div style={styles.textSecondary}>{trade.profitLoss.percentage}</div>
                  </td>
                  {activeTab === 'active' && (
                  <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: '0 0 70px', minWidth: '70px' }}>
                          {trade.calculatedMaxProfit ? (
                            <>
                              <div style={styles.textPrimary}>
                                ₹{formatCompactNumber(trade.calculatedMaxProfit.value)}
                              </div>
                              <div style={styles.textSecondary}>
                                {(() => {
                                  const calculatedProfit = parseFloat(trade.calculatedMaxProfit.value.replace(/,/g, ''));
                                  const capital = parseFloat(trade.capital.value.replace(/,/g, ''));
                                  const percentage = capital > 0 ? ((calculatedProfit / capital) * 100).toFixed(1) : '0.0';
                                  return `${percentage}%`;
                                })()}
                              </div>
                            </>
                          ) : (
                            <div style={{ ...styles.textSecondary, fontSize: '12px', color: '#9CA3AF' }}>
                              No strike data
                            </div>
                          )}
                      </div>
                      <div style={{ flex: '1 1 auto', position: 'relative' }}>
                        <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                            {(() => {
                              if (trade.calculatedMaxProfit && trade.calculatedMaxLoss) {
                                const calculatedProfit = parseFloat(trade.calculatedMaxProfit.value.replace(/,/g, ''));
                                const calculatedLoss = parseFloat(trade.calculatedMaxLoss.value.replace(/,/g, ''));
                                const totalRange = calculatedProfit + calculatedLoss;
                                const profitRatio = totalRange > 0 ? calculatedProfit / totalRange : 0.5;
                                return (
                                  <>
                                    <div style={{ width: `${profitRatio * 100}%`, backgroundColor: '#10B981' }}></div>
                                    <div style={{ width: `${(1 - profitRatio) * 100}%`, backgroundColor: '#EF4444' }}></div>
                                  </>
                                );
                              } else if (trade.calculatedMaxProfit) {
                                const calculatedProfit = parseFloat(trade.calculatedMaxProfit.value.replace(/,/g, ''));
                                const maxLoss = parseFloat(trade.maxLoss.value.replace(/,/g, ''));
                                const totalRange = calculatedProfit + maxLoss;
                                const profitRatio = totalRange > 0 ? calculatedProfit / totalRange : 0.5;
                                return (
                                  <>
                                    <div style={{ width: `${profitRatio * 100}%`, backgroundColor: '#10B981' }}></div>
                                    <div style={{ width: `${(1 - profitRatio) * 100}%`, backgroundColor: '#EF4444' }}></div>
                                  </>
                                );
                              } else {
                                // Show empty bar when no strike data
                                return (
                                  <div style={{ width: '100%', backgroundColor: '#E5E7EB' }}></div>
                                );
                              }
                            })()}
                        </div>
                          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '3px', height: '14px', backgroundColor: '#1E3F66', borderRadius: '2px' }}></div>
                      </div>
                      <div style={{ flex: '0 0 70px', minWidth: '70px', textAlign: 'right' }}>
                          {trade.calculatedMaxLoss ? (
                            <>
                              <div style={styles.textPrimary}>
                                ₹{formatCompactNumber(trade.calculatedMaxLoss.value)}
                              </div>
                              <div style={styles.textSecondary}>
                                {(() => {
                                  const calculatedLoss = parseFloat(trade.calculatedMaxLoss.value.replace(/,/g, ''));
                                  const capital = parseFloat(trade.capital.value.replace(/,/g, ''));
                                  const percentage = capital > 0 ? ((calculatedLoss / capital) * 100).toFixed(1) : '0.0';
                                  return `${percentage}%`;
                                })()}
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={styles.textPrimary}>{formatCompactNumber(trade.maxLoss.value)}</div>
                              <div style={styles.textSecondary}>{trade.maxLoss.percentage}</div>
                            </>
                          )}
                      </div>
                    </div>
                  </td>
                  )}
                  {activeTab === 'closed' && (
                  <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: '0 0 70px', minWidth: '70px' }}>
                          {trade.calculatedMaxProfit ? (
                            <>
                              <div style={styles.textPrimary}>
                                ₹{formatCompactNumber(trade.calculatedMaxProfit.value)}
                              </div>
                              <div style={styles.textSecondary}>
                                {(() => {
                                  const calculatedProfit = parseFloat(trade.calculatedMaxProfit.value.replace(/,/g, ''));
                                  const capital = parseFloat(trade.capital.value.replace(/,/g, ''));
                                  const percentage = capital > 0 ? ((calculatedProfit / capital) * 100).toFixed(1) : '0.0';
                                  return `${percentage}%`;
                                })()}
                              </div>
                            </>
                          ) : (
                            <div style={{ ...styles.textSecondary, fontSize: '12px', color: '#9CA3AF' }}>
                              No strike data
                            </div>
                          )}
                      </div>
                      <div style={{ flex: '1 1 auto', position: 'relative' }}>
                        <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                            {(() => {
                              if (trade.calculatedMaxProfit && trade.calculatedMaxLoss) {
                                const calculatedProfit = parseFloat(trade.calculatedMaxProfit.value.replace(/,/g, ''));
                                const calculatedLoss = parseFloat(trade.calculatedMaxLoss.value.replace(/,/g, ''));
                                const totalRange = calculatedProfit + calculatedLoss;
                                const profitRatio = totalRange > 0 ? calculatedProfit / totalRange : 0.5;
                                return (
                                  <>
                                    <div style={{ width: `${profitRatio * 100}%`, backgroundColor: '#10B981' }}></div>
                                    <div style={{ width: `${(1 - profitRatio) * 100}%`, backgroundColor: '#EF4444' }}></div>
                                  </>
                                );
                              } else if (trade.calculatedMaxProfit) {
                                const calculatedProfit = parseFloat(trade.calculatedMaxProfit.value.replace(/,/g, ''));
                                const maxLoss = parseFloat(trade.maxLoss.value.replace(/,/g, ''));
                                const totalRange = calculatedProfit + maxLoss;
                                const profitRatio = totalRange > 0 ? calculatedProfit / totalRange : 0.5;
                                return (
                                  <>
                                    <div style={{ width: `${profitRatio * 100}%`, backgroundColor: '#10B981' }}></div>
                                    <div style={{ width: `${(1 - profitRatio) * 100}%`, backgroundColor: '#EF4444' }}></div>
                                  </>
                                );
                              } else {
                                // Show empty bar when no strike data
                                return (
                                  <div style={{ width: '100%', backgroundColor: '#E5E7EB' }}></div>
                                );
                              }
                            })()}
                        </div>
                        {/* Slider position based on actual P&L */}
                        <div style={{ 
                          position: 'absolute', 
                          left: (() => {
                            // Calculate slider position based on actual P&L
                            if (trade.calculatedMaxProfit && trade.calculatedMaxLoss) {
                              const calculatedProfit = parseFloat(trade.calculatedMaxProfit.value.replace(/,/g, ''));
                              const calculatedLoss = parseFloat(trade.calculatedMaxLoss.value.replace(/,/g, ''));
                              const actualPnL = parseFloat(trade.profitLoss.value.replace(/[₹,+]/g, ''));
                              const totalRange = calculatedProfit + calculatedLoss;
                              
                              // Position slider based on where actual P&L falls
                              // If actualPnL = maxProfit, position at 100% profit side (left)
                              // If actualPnL = -maxLoss, position at 0% (right)
                              const position = totalRange > 0 ? ((actualPnL + calculatedLoss) / totalRange) * 100 : 50;
                              return `${Math.max(0, Math.min(100, position))}%`;
                            }
                            return '50%';
                          })(), 
                          top: '50%', 
                          transform: 'translate(-50%, -50%)', 
                          width: '3px', 
                          height: '14px', 
                          backgroundColor: '#1E3F66', 
                          borderRadius: '2px' 
                        }}></div>
                      </div>
                      <div style={{ flex: '0 0 70px', minWidth: '70px', textAlign: 'right' }}>
                          {trade.calculatedMaxLoss ? (
                            <>
                              <div style={styles.textPrimary}>
                                ₹{formatCompactNumber(trade.calculatedMaxLoss.value)}
                              </div>
                              <div style={styles.textSecondary}>
                                {(() => {
                                  const calculatedLoss = parseFloat(trade.calculatedMaxLoss.value.replace(/,/g, ''));
                                  const capital = parseFloat(trade.capital.value.replace(/,/g, ''));
                                  const percentage = capital > 0 ? ((calculatedLoss / capital) * 100).toFixed(1) : '0.0';
                                  return `${percentage}%`;
                                })()}
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={styles.textPrimary}>{formatCompactNumber(trade.maxLoss.value)}</div>
                              <div style={styles.textSecondary}>{trade.maxLoss.percentage}</div>
                            </>
                          )}
                      </div>
                    </div>
                  </td>
                  )}
                  <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={styles.textPrimary}>{formatCompactNumber(trade.capital.value)}</div>
                    <div style={styles.textSecondary}>{totalCapital > 0 ? ((parseFloat(trade.capital.value.replace(/,/g, '')) / totalCapital) * 100).toFixed(1) + '%' : '0.0%'}</div>
                  </td>
                  <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={styles.textPrimary}>
                      {totalCapital > 0 ? ((parseFloat(trade.maxLoss.value.replace(/[₹,]/g, '')) / totalCapital) * 100).toFixed(2) + '%' : '0.0%'}
                    </div>
                    <div style={styles.textSecondary}>{formatCompactNumber(trade.maxLoss.value)}</div>
                  </td>
                  <td style={{ padding: '0', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', position: 'relative' }}>
                    <div style={{ display: 'flex', height: '100%' }}>
                      {activeTab === 'active' && (
                        <>
                          <div 
                            style={{ 
                              flex: 1, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              padding: '16px', 
                              cursor: trade.status === 'active' ? 'pointer' : 'not-allowed',
                              opacity: trade.status === 'active' ? 1 : 0.3
                            }}
                            onClick={trade.status === 'active' ? () => handleOpenCloseTrade(trade) : undefined}
                            title={trade.status === 'active' ? "Close Trade" : "Trade already closed"}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
                              <path d="M5 11.001H3C2.73478 11.001 2.48043 10.8956 2.29289 10.7081C2.10536 10.5205 2 10.2662 2 10.001V3.00098C2 2.73576 2.10536 2.48141 2.29289 2.29387C2.48043 2.10633 2.73478 2.00098 3 2.00098H5M8.5 9.00098L11 6.50098M11 6.50098L8.5 4.00098M11 6.50098H5" stroke="#FF2929" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div style={{ width: '1px' }}></div>
                        </>
                      )}
                      <div className="menu-trigger" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', cursor: 'pointer' }} onClick={() => toggleMenu(`row${trade.id}`)}>
                        <span style={{ fontSize: '14px', color: '#6B7280' }}>⋮</span>
                      </div>
                    </div>
                    {openMenuId === `row${trade.id}` && (
                      <div className="dropdown-menu" style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50px',
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        zIndex: 1000,
                        minWidth: '140px'
                      }}>
                        <div 
                          style={{ padding: '12px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#1E3F66', borderBottom: '1px solid #F3F4F6' }} 
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} 
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          onClick={() => handleModifyTrade(trade)}
                        >
                          Modify
                        </div>
                        <div 
                          style={{ padding: '12px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#1E3F66', borderBottom: '1px solid #F3F4F6' }} 
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} 
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          onClick={() => handleDeleteTrade(trade)}
                        >
                          Delete
                        </div>
                        <div style={{ padding: '12px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#1E3F66' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>Analyse</div>
                      </div>
                    )}
                  </td>
                </tr>
                ))}
                
                {/* Show message if no filtered trades */}
                {filteredTrades.length === 0 && !tradesLoading && (
                <tr>
                  <td colSpan={10} style={{ padding: '40px', textAlign: 'center', fontSize: '16px', color: '#6B7280' }}>
                    {activeTab === 'active' ? 'No active trades found' : 'No closed trades found'}
                  </td>
                </tr>
                )}
              </tbody>
            </table>
            )}
            
            {/* Add New Trade Button - only show for active trades */}
            {activeTab === 'active' && (
            <div style={{ borderLeft: '1px solid rgba(217, 217, 217, 0.5)', borderRight: '1px solid rgba(217, 217, 217, 0.5)', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setIsFormOpen(true)}
                disabled={tradesLoading}
                style={{
                  width: 'calc(100% / 16 * 3)',
                  height: '40px',
                  backgroundColor: tradesLoading ? '#9CA3AF' : '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  cursor: tradesLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                  opacity: tradesLoading ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!tradesLoading) {
                    e.currentTarget.style.backgroundColor = '#059669';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!tradesLoading) {
                    e.currentTarget.style.backgroundColor = '#10B981';
                  }
                }}
              >
                {tradesLoading ? 'Loading...' : 'Add New Trade'}
              </button>
            </div>
            )}
          </section>
        </main>
      </div>

      {/* Add New Trade Form - Full Screen */}
      {isFormOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(249, 250, 251, 0.5)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px'
          }}
        >
          {/* Form Content Container with max-width */}
          <div 
            style={{
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
              position: 'relative'
            }}
          >
            {/* Close Button - Inside popup (hide when showing success) */}
            {!showSuccess && (
            <button
              onClick={() => setIsFormOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'transparent',
                border: 'none',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: '50%',
                color: '#9CA3AF',
                transition: 'all 0.2s',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6';
                e.currentTarget.style.color = '#1F2937';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9CA3AF';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            )}
            {showSuccess ? (
              // Success State
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                padding: '40px'
              }}>
                <div className="success-checkmark" style={{
                  width: '100px',
                  height: '100px',
                  marginBottom: '24px'
                }}>
                  <svg viewBox="0 0 52 52" style={{ width: '100%', height: '100%' }}>
                    <circle
                      className="success-checkmark-circle"
                      cx="26"
                      cy="26"
                      r="25"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                    />
                    <path
                      className="success-checkmark-check"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      d="M14 27l8 8 16-16"
                    />
                  </svg>
                </div>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  color: '#10B981',
                  margin: 0,
                  textAlign: 'center'
                }}>Trade Added!</h2>
              </div>
            ) : (
              <>
            {/* Form Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
                color: '#000',
                margin: 0
              }}>Add Trade</h2>
            </div>

            {/* Form Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0',
              backgroundColor: '#F9FAFB'
            }}>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '0', margin: '24px', borderRadius: '12px', overflow: 'visible' }}>
                
                {/* Indices / Stock */}
                <div 
                  data-dropdown="indices"
                  style={{ 
                    backgroundColor: isIndicesHovered ? '#F9FAFB' : 'white',
                    minHeight: '60px',
                    borderBottom: fieldErrors.indices ? '2px solid #EF4444' : '1px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 20px',
                    transition: 'background-color 0.2s ease',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsIndicesDropdownOpen(!isIndicesDropdownOpen);
                  }}
                  onMouseEnter={() => setIsIndicesHovered(true)}
                  onMouseLeave={() => setIsIndicesHovered(false)}
                >
                  <label style={{ fontSize: '14px', fontWeight: '400', fontFamily: 'Inter, sans-serif', color: '#9CA3AF' }}>
                    Indices / Stock
                  </label>
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Button clicked, current state:', isIndicesDropdownOpen);
                      setIsIndicesDropdownOpen(!isIndicesDropdownOpen);
                    }}
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: 'Inter, sans-serif',
                      color: '#000',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ color: selectedIndices ? '#000' : '#9CA3AF' }}>{selectedIndices || 'Choose'}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isIndicesDropdownOpen && (
                    <div 
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: '20px',
                        width: '300px',
                        maxHeight: '400px',
                        backgroundColor: 'white',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        zIndex: 10000,
                        overflow: 'hidden',
                        marginTop: '4px'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Search Bar */}
                      <div style={{ padding: '12px', borderBottom: '1px solid #E5E7EB' }}>
                        <input
                          type="text"
                          placeholder="Search..."
                          value={indicesSearchQuery}
                          onChange={(e) => setIndicesSearchQuery(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #D1D5DB',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: 'Inter, sans-serif',
                            outline: 'none'
                          }}
                        />
                      </div>
                      
                      {/* Dropdown Content */}
                      <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                        {/* Indices Section */}
                        {filteredIndices.length > 0 && (
                          <>
                            <div style={{ 
                              padding: '8px 16px', 
                              fontSize: '12px', 
                              fontWeight: '600', 
                              fontFamily: 'Inter, sans-serif',
                              color: '#6B7280',
                              backgroundColor: '#F9FAFB'
                            }}>
                              INDICES
                            </div>
                            {filteredIndices.map((instrument) => (
                              <div
                                key={instrument.symbol}
                                onClick={() => {
                                  setSelectedIndices(instrument.symbol);
                                  setIsIndicesDropdownOpen(false);
                                  setIndicesSearchQuery('');
                                }}
                                style={{
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  fontFamily: 'Inter, sans-serif',
                                  color: instrument.isActive ? '#1F2937' : '#9CA3AF',
                                  cursor: instrument.isActive ? 'pointer' : 'not-allowed',
                                  transition: 'background-color 0.2s ease',
                                  opacity: instrument.isActive ? 1 : 0.6
                                }}
                                onMouseEnter={(e) => {
                                  if (instrument.isActive) {
                                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                                  }
                                }}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                              >
                                {instrument.symbol} - {instrument.name}
                              </div>
                            ))}
                          </>
                        )}
                        
                        {/* Stocks Section */}
                        {filteredStocks.length > 0 && (
                          <>
                            <div style={{ 
                              padding: '8px 16px', 
                              fontSize: '12px', 
                              fontWeight: '600', 
                              fontFamily: 'Inter, sans-serif',
                              color: '#6B7280',
                              backgroundColor: '#F9FAFB',
                              marginTop: filteredIndices.length > 0 ? '8px' : '0'
                            }}>
                              STOCKS
                            </div>
                            {filteredStocks.map((instrument) => (
                              <div
                                key={instrument.symbol}
                                onClick={() => {
                                  setSelectedIndices(instrument.symbol);
                                  setIsIndicesDropdownOpen(false);
                                  setIndicesSearchQuery('');
                                }}
                                style={{
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  fontFamily: 'Inter, sans-serif',
                                  color: instrument.isActive ? '#1F2937' : '#9CA3AF',
                                  cursor: instrument.isActive ? 'pointer' : 'not-allowed',
                                  transition: 'background-color 0.2s ease',
                                  opacity: instrument.isActive ? 1 : 0.6
                                }}
                                onMouseEnter={(e) => {
                                  if (instrument.isActive) {
                                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                                  }
                                }}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                              >
                                {instrument.symbol} - {instrument.name}
                              </div>
                            ))}
                          </>
                        )}
                        
                        {/* No Results */}
                        {filteredIndices.length === 0 && filteredStocks.length === 0 && (
                          <div style={{
                            padding: '20px',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontFamily: 'Inter, sans-serif',
                            color: '#9CA3AF'
                          }}>
                            No results found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bias */}
                <div 
                  style={{ 
                    backgroundColor: 'white',
                    minHeight: '60px',
                    borderBottom: fieldErrors.bias ? '2px solid #EF4444' : '1px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 20px',
                    transition: 'background-color 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <label style={{ fontSize: '14px', fontWeight: '400', fontFamily: 'Inter, sans-serif', color: '#9CA3AF' }}>
                    Bias
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      type="button" 
                      onClick={() => setSelectedBias('bearish')}
                      style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                        backgroundColor: selectedBias === 'bearish' ? '#EF4444' : '#E5E7EB',
                        border: selectedBias === 'bearish' ? '2px solid #DC2626' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                        color: selectedBias === 'bearish' ? 'white' : '#6B7280',
                      fontSize: '20px'
                      }}
                    >↙</button>
                    <button 
                      type="button" 
                      onClick={() => setSelectedBias('neutral')}
                      style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                        backgroundColor: selectedBias === 'neutral' ? '#6B7280' : '#E5E7EB',
                        border: selectedBias === 'neutral' ? '2px solid #4B5563' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                        color: selectedBias === 'neutral' ? 'white' : '#6B7280',
                      fontSize: '20px'
                      }}
                    >—</button>
                    <button 
                      type="button" 
                      onClick={() => setSelectedBias('bullish')}
                      style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                        backgroundColor: selectedBias === 'bullish' ? '#10B981' : '#E5E7EB',
                        border: selectedBias === 'bullish' ? '2px solid #059669' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                        color: selectedBias === 'bullish' ? 'white' : '#6B7280',
                      fontSize: '20px'
                      }}
                    >↗</button>
                  </div>
                </div>

                {/* Setup */}
                <div 
                  data-dropdown="setup"
                  style={{ 
                    backgroundColor: 'white',
                    minHeight: '60px',
                    borderBottom: fieldErrors.setup ? '2px solid #EF4444' : '1px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 20px',
                    transition: 'background-color 0.2s ease',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => setSetupDropdownOpen(!setupDropdownOpen)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <label style={{ fontSize: '14px', fontWeight: '400', fontFamily: 'Inter, sans-serif', color: '#9CA3AF' }}>
                    Setup
                  </label>
                  <button type="button" style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'Inter, sans-serif',
                    color: '#000',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ color: formData.setup ? '#000' : '#9CA3AF' }}>{formData.setup || 'Choose'}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  
                  {/* Setup Dropdown */}
                  {setupDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: '20px',
                      width: '200px',
                      backgroundColor: 'white',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      zIndex: 10000,
                      overflow: 'hidden',
                      marginTop: '4px'
                    }}>
                      {['STFR'].map((setup) => (
                        <div
                          key={setup}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({ ...prev, setup }));
                            setSetupDropdownOpen(false);
                          }}
                          style={{
                            padding: '12px 16px',
                            fontSize: '14px',
                            fontFamily: 'Inter, sans-serif',
                            color: '#1F2937',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          {setup}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Strategy */}
                <div 
                  data-dropdown="strategy"
                  style={{ 
                    backgroundColor: 'white',
                    minHeight: '60px',
                    borderBottom: fieldErrors.strategy ? '2px solid #EF4444' : '1px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 20px',
                    transition: 'background-color 0.2s ease',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => setStrategyDropdownOpen(!strategyDropdownOpen)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <label style={{ fontSize: '14px', fontWeight: '400', fontFamily: 'Inter, sans-serif', color: '#9CA3AF' }}>
                    Strategy
                  </label>
                  <button type="button" style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'Inter, sans-serif',
                    color: '#000',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ color: formData.strategy ? '#000' : '#9CA3AF' }}>{formData.strategy || 'Choose'}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  
                  {/* Strategy Dropdown */}
                  {strategyDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: '20px',
                      width: '200px',
                      backgroundColor: 'white',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      zIndex: 10000,
                      overflow: 'hidden',
                      marginTop: '4px'
                    }}>
                      {['Bull put spread', 'Bear call spread'].map((strategy) => (
                        <div
                          key={strategy}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({ ...prev, strategy }));
                            setStrategyDropdownOpen(false);
                          }}
                          style={{
                            padding: '12px 16px',
                            fontSize: '14px',
                            fontFamily: 'Inter, sans-serif',
                            color: '#1F2937',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          {strategy}
                        </div>
                      ))}
                    </div>
                  )}
                </div>


                {/* Strike Fields - Only show for Bull put spread and Bear call spread */}
                {shouldShowStrikes() && (
                  <>
                    {/* Strike Section Header */}
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      minHeight: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 20px',
                      borderBottom: '1px solid #E2E8F0',
                      borderTop: '1px solid #E2E8F0'
                    }}>
                      <label style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        fontFamily: 'Inter, sans-serif',
                        color: '#1F2937'
                      }}>
                        Strike Details
                      </label>
                    </div>

                    {/* Buy Strike */}
                    <div style={{
                      backgroundColor: 'white',
                      minHeight: '60px',
                      borderBottom: '1px solid #E5E7EB',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0 20px'
                    }}>
                      <label style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        fontFamily: 'Inter, sans-serif',
                        color: '#374151',
                        width: '30%'
                      }}>
                        Buy Strike . <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div style={{ display: 'flex', gap: '6px', width: '70%' }}>
                        <input
                          type="number"
                          step="0.05"
                          value={strikeData.buyStrike}
                          onChange={(e) => setStrikeData(prev => ({ ...prev, buyStrike: e.target.value === '' ? '' : parseFloat(e.target.value) }))}
                          placeholder="Strike"
                          style={{
                            flex: 1.3,
                            fontSize: '13px',
                            fontWeight: '600',
                            fontFamily: 'Inter, sans-serif',
                            color: '#000',
                            backgroundColor: 'white',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            padding: '10px 10px',
                            outline: 'none',
                            minWidth: 0
                          }}
                        />
                        <select
                          value={strikeData.buyOptionType}
                          onChange={(e) => setStrikeData(prev => ({ ...prev, buyOptionType: e.target.value as 'CE' | 'PE' }))}
                          style={{
                            flex: 0.7,
                            fontSize: '13px',
                            fontWeight: '600',
                            fontFamily: 'Inter, sans-serif',
                            color: '#000',
                            backgroundColor: 'white',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            padding: '10px 6px',
                            outline: 'none',
                            minWidth: 0
                          }}
                        >
                          <option value="">Type</option>
                          <option value="CE">CE</option>
                          <option value="PE">PE</option>
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          value={strikeData.buyLtp}
                          onChange={(e) => setStrikeData(prev => ({ ...prev, buyLtp: e.target.value === '' ? '' : parseFloat(e.target.value) }))}
                          placeholder="LTP"
                          style={{
                            flex: 1.3,
                            fontSize: '13px',
                            fontWeight: '600',
                            fontFamily: 'Inter, sans-serif',
                            color: '#000',
                            backgroundColor: 'white',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            padding: '10px 10px',
                            outline: 'none',
                            minWidth: 0
                          }}
                        />
                        <input
                          type="number"
                          step="1"
                          value={strikeData.buyLots}
                          onChange={(e) => setStrikeData(prev => ({ ...prev, buyLots: e.target.value === '' ? '' : parseInt(e.target.value) }))}
                          placeholder="Lots"
                          style={{
                            flex: 0.9,
                            fontSize: '13px',
                            fontWeight: '600',
                            fontFamily: 'Inter, sans-serif',
                            color: '#000',
                            backgroundColor: 'white',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            padding: '10px 10px',
                            outline: 'none',
                            minWidth: 0
                          }}
                        />
                      </div>
                    </div>

                    {/* Sell Strike */}
                    <div style={{
                      backgroundColor: 'white',
                      minHeight: '60px',
                      borderBottom: '1px solid #E5E7EB',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0 20px'
                    }}>
                      <label style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        fontFamily: 'Inter, sans-serif',
                        color: '#374151',
                        width: '30%'
                      }}>
                        Sell Strike . <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div style={{ display: 'flex', gap: '6px', width: '70%' }}>
                        <input
                          type="number"
                          step="0.05"
                          value={strikeData.sellStrike}
                          onChange={(e) => setStrikeData(prev => ({ ...prev, sellStrike: e.target.value === '' ? '' : parseFloat(e.target.value) }))}
                          placeholder="Strike"
                          style={{
                            flex: 1.3,
                            fontSize: '13px',
                            fontWeight: '600',
                            fontFamily: 'Inter, sans-serif',
                            color: '#000',
                            backgroundColor: 'white',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            padding: '10px 10px',
                            outline: 'none',
                            minWidth: 0
                          }}
                        />
                        <select
                          value={strikeData.sellOptionType}
                          onChange={(e) => setStrikeData(prev => ({ ...prev, sellOptionType: e.target.value as 'CE' | 'PE' }))}
                          style={{
                            flex: 0.7,
                            fontSize: '13px',
                            fontWeight: '600',
                            fontFamily: 'Inter, sans-serif',
                            color: '#000',
                            backgroundColor: 'white',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            padding: '10px 6px',
                            outline: 'none',
                            minWidth: 0
                          }}
                        >
                          <option value="">Type</option>
                          <option value="CE">CE</option>
                          <option value="PE">PE</option>
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          value={strikeData.sellLtp}
                          onChange={(e) => setStrikeData(prev => ({ ...prev, sellLtp: e.target.value === '' ? '' : parseFloat(e.target.value) }))}
                          placeholder="LTP"
                          style={{
                            flex: 1.3,
                            fontSize: '13px',
                            fontWeight: '600',
                            fontFamily: 'Inter, sans-serif',
                            color: '#000',
                            backgroundColor: 'white',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            padding: '10px 10px',
                            outline: 'none',
                            minWidth: 0
                          }}
                        />
                        <input
                          type="number"
                          step="1"
                          value={strikeData.sellLots}
                          onChange={(e) => setStrikeData(prev => ({ ...prev, sellLots: e.target.value === '' ? '' : parseInt(e.target.value) }))}
                          placeholder="Lots"
                          style={{
                            flex: 0.9,
                            fontSize: '13px',
                            fontWeight: '600',
                            fontFamily: 'Inter, sans-serif',
                            color: '#000',
                            backgroundColor: 'white',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            padding: '10px 10px',
                            outline: 'none',
                            minWidth: 0
                          }}
                        />
                      </div>
                    </div>

                    {/* Expiry Date */}
                    <div style={{
                      backgroundColor: 'white',
                      minHeight: '60px',
                      borderBottom: '1px solid #E5E7EB',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0 20px'
                    }}>
                      <label style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        fontFamily: 'Inter, sans-serif',
                        color: '#374151',
                        width: '30%'
                      }}>
                        Expiry Date . <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="date"
                        value={strikeData.expiryDate}
                        onChange={(e) => setStrikeData(prev => ({ ...prev, expiryDate: e.target.value }))}
                        style={{
                          width: '70%',
                          fontSize: '14px',
                          fontWeight: '600',
                          fontFamily: 'Inter, sans-serif',
                          color: '#000',
                          backgroundColor: 'white',
                          border: '1px solid #D1D5DB',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </>
                )}




                {/* Capital */}
                <div 
                  style={{ 
                    backgroundColor: 'white',
                    minHeight: '60px',
                    borderBottom: fieldErrors.capital ? '2px solid #EF4444' : '1px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'stretch',
                    padding: '0',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <label style={{ 
                    fontSize: '14px', 
                    fontWeight: '400', 
                    fontFamily: 'Inter, sans-serif', 
                    color: '#9CA3AF',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '20px',
                    width: '50%',
                    backgroundColor: 'transparent'
                  }}>
                    Capital
                  </label>
                  <div style={{
                    width: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '20px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: 'Inter, sans-serif',
                      color: '#6B7280',
                      marginRight: '2px'
                    }}>₹</span>
                    <input
                      type="text"
                      value={formData.capital === '' || formData.capital === 0 ? '' : 
                        typeof formData.capital === 'number' ? 
                        formData.capital.toLocaleString('en-IN') : 
                        formData.capital}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        if (value === '' || !isNaN(Number(value))) {
                          setFormData(prev => ({ ...prev, capital: value === '' ? '' : parseFloat(value) }));
                        }
                      }}
                      placeholder="0"
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        fontFamily: 'Inter, sans-serif',
                        color: '#000',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'right',
                        outline: 'none',
                        width: '120px',
                        padding: '0'
                      }}
                      onFocus={(e) => {
                        const parent = e.currentTarget.parentElement?.parentElement;
                        if (parent) parent.style.backgroundColor = '#EFF6FF';
                      }}
                      onBlur={(e) => {
                        const parent = e.currentTarget.parentElement?.parentElement;
                        if (parent) parent.style.backgroundColor = 'white';
                      }}
                    />
                  </div>
                </div>

              </form>
            </div>

            {/* Form Footer */}
            <div style={{
              padding: '24px'
            }}>
              <button
                onClick={handleCreateTrade}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#10B981',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '700',
                  fontFamily: 'Inter, sans-serif',
                  color: 'white',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                CREATE / SAVE
              </button>
            </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Close Trade Form - Full Screen */}
      {isCloseTradeOpen && selectedTradeToClose && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
                <div 
                  style={{ 
                    backgroundColor: 'white',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Header */}
            <div style={{ 
              padding: '24px 32px', 
                    borderBottom: '1px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '600', 
                color: '#1F2937', 
                margin: 0,
                fontFamily: 'Inter, sans-serif'
              }}>
                Close Trade
              </h2>
              <button
                onClick={() => setIsCloseTradeOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6B7280',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            {/* Trade Info */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>Instrument</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>
                    {selectedTradeToClose.instrument.name}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>Bias</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}>
                    {selectedTradeToClose.bias}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>Setup</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>
                    {selectedTradeToClose.setup.name}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>Capital</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>
                    ₹{selectedTradeToClose.capital.value}
                  </div>
                </div>
              </div>
              
              {/* Trade Notes */}
              {selectedTradeToClose.notes && selectedTradeToClose.notes !== '0' && (
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>Original Notes</div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#1F2937', 
                    fontFamily: 'Inter, sans-serif', 
                    backgroundColor: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    fontStyle: selectedTradeToClose.notes === '0' ? 'italic' : 'normal',
                    opacity: selectedTradeToClose.notes === '0' ? 0.6 : 1
                  }}>
                    {selectedTradeToClose.notes === '0' ? 'No notes available' : selectedTradeToClose.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div style={{ padding: '32px' }}>
              
              <div style={{ display: 'grid', gap: '24px' }}>
                

                {/* Actual P&L */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  padding: '16px 20px',
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}>
                  <label style={{ 
                    fontSize: '14px', 
                    fontWeight: '500',
                    fontFamily: 'Inter, sans-serif', 
                    color: '#374151',
                    width: '50%'
                  }}>
                    Actual P&L . <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={closeTradeData.actualPnL}
                    onChange={(e) => setCloseTradeData(prev => ({ ...prev, actualPnL: parseFloat(e.target.value) || 0 }))}
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: 'Inter, sans-serif',
                      color: closeTradeData.actualPnL >= 0 ? '#10B981' : '#EF4444',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'right',
                      width: '50%',
                      padding: '0 20px'
                    }}
                    onFocus={(e) => {
                      const parent = e.currentTarget.parentElement;
                      if (parent) parent.style.backgroundColor = '#EFF6FF';
                    }}
                    onBlur={(e) => {
                      const parent = e.currentTarget.parentElement;
                      if (parent) parent.style.backgroundColor = 'white';
                    }}
                  />
                </div>

                {/* Closing Date */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  padding: '16px 20px',
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}>
                  <label style={{ 
                    fontSize: '14px', 
                    fontWeight: '500',
                    fontFamily: 'Inter, sans-serif', 
                    color: '#374151',
                    width: '50%'
                  }}>
                    Closing Date . <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={closeTradeData.closingDate}
                    onChange={(e) => setCloseTradeData(prev => ({ ...prev, closingDate: e.target.value }))}
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: 'Inter, sans-serif',
                      color: '#000',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'right',
                      width: '50%',
                      padding: '0 20px'
                    }}
                    onFocus={(e) => {
                      const parent = e.currentTarget.parentElement;
                      if (parent) parent.style.backgroundColor = '#EFF6FF';
                    }}
                    onBlur={(e) => {
                      const parent = e.currentTarget.parentElement;
                      if (parent) parent.style.backgroundColor = 'white';
                    }}
                  />
                </div>

                {/* Notes */}
                <div style={{
                  padding: '16px 20px',
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    fontFamily: 'Inter, sans-serif',
                    color: '#374151',
                    display: 'block',
                    marginBottom: '12px'
                  }}>
                    Closing Notes
                  </label>
                  <textarea
                    value={closeTradeData.notes}
                    onChange={(e) => setCloseTradeData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes about closing this trade..."
                    rows={4}
                    style={{
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif',
                      color: '#000',
                      background: 'transparent',
                      border: 'none',
                      width: '100%',
                      resize: 'vertical',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      const parent = e.currentTarget.parentElement;
                      if (parent) parent.style.backgroundColor = '#EFF6FF';
                    }}
                    onBlur={(e) => {
                      const parent = e.currentTarget.parentElement;
                      if (parent) parent.style.backgroundColor = 'white';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '24px 32px', 
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <button
                onClick={() => setIsCloseTradeOpen(false)}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  color: '#6B7280',
                  backgroundColor: 'white',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                CANCEL
              </button>
              <button
                onClick={handleCloseTrade}
                disabled={!closeTradeData.closingDate}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  color: 'white',
                  backgroundColor: !closeTradeData.closingDate ? '#9CA3AF' : '#DC2626',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !closeTradeData.closingDate ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                CLOSE TRADE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modify Trade Form - Full Screen (Same as Add New Trade) */}
      {isModifyTradeOpen && selectedTradeToModify && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(249, 250, 251, 0.5)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px'
          }}
        >
          {/* Form Content Container with max-width */}
          <div 
            style={{
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
              position: 'relative'
            }}
          >
            {/* Close Button - Inside popup (hide when showing success) */}
            {!showModifySuccess && (
            <button
              onClick={() => setIsModifyTradeOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'transparent',
                border: 'none',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: '50%',
                color: '#9CA3AF',
                transition: 'all 0.2s',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6';
                e.currentTarget.style.color = '#1F2937';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9CA3AF';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            )}
            {showModifySuccess ? (
              // Success State
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                padding: '40px'
              }}>
                <div className="success-checkmark" style={{
                  width: '100px',
                  height: '100px',
                  marginBottom: '24px'
                }}>
                  <svg viewBox="0 0 52 52" style={{ width: '100%', height: '100%' }}>
                    <circle
                      className="success-checkmark-circle"
                      cx="26"
                      cy="26"
                      r="25"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                    />
                    <path
                      className="success-checkmark-check"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      d="M14 27l8 8 16-16"
                    />
                  </svg>
                </div>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  color: '#10B981',
                  margin: 0,
                  textAlign: 'center'
                }}>Trade Updated!</h2>
              </div>
            ) : (
              <>
            {/* Form Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
                color: '#000',
                margin: 0
              }}>Modify Trade</h2>
            </div>

            {/* Form Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0',
              backgroundColor: '#F9FAFB'
            }}>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '0', margin: '24px', borderRadius: '12px', overflow: 'visible' }}>
                {/* Indices / Stock */}
                <div 
                  data-dropdown="indices"
                  style={{ 
                    backgroundColor: isIndicesHovered ? '#F9FAFB' : 'white',
                    minHeight: '60px',
                    borderBottom: '1px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 20px',
                    transition: 'background-color 0.2s ease',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsIndicesDropdownOpen(!isIndicesDropdownOpen);
                  }}
                  onMouseEnter={() => setIsIndicesHovered(true)}
                  onMouseLeave={() => setIsIndicesHovered(false)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>Indices / Stock</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#000', fontFamily: 'Inter, sans-serif' }}>
                      {selectedIndices || 'Select instrument'}
                    </div>
                  </div>
                  <div style={{ color: '#6B7280' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                  </div>
                  
                  {/* Dropdown Menu */}
                  {isIndicesDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderTop: 'none',
                      borderRadius: '0 0 8px 8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      zIndex: 1000,
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {/* Search Input */}
                      <div style={{ padding: '8px', borderBottom: '1px solid #E5E7EB' }}>
                        <input
                          type="text"
                          placeholder="Search instruments..."
                          value={indicesSearchQuery}
                          onChange={(e) => setIndicesSearchQuery(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '14px',
                            border: '1px solid #D1D5DB',
                            borderRadius: '4px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      
                      {/* Indices Options */}
                      <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                        {filteredIndices.map((instrument) => (
                          <div
                            key={instrument.symbol}
                            style={{
                              padding: '12px 16px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontFamily: 'Inter, sans-serif',
                              color: '#374151',
                              borderBottom: '1px solid #F3F4F6'
                            }}
                            onClick={() => {
                              setSelectedIndices(instrument.name);
                              setIsIndicesDropdownOpen(false);
                              setIndicesSearchQuery('');
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            {instrument.name}
                          </div>
                        ))}
                      </div>
                      
                      {/* Stocks Options */}
                      <div style={{ maxHeight: '120px', overflowY: 'auto', borderTop: '1px solid #E5E7EB' }}>
                        {filteredStocks.map((instrument) => (
                          <div
                            key={instrument.symbol}
                            style={{
                              padding: '12px 16px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontFamily: 'Inter, sans-serif',
                              color: '#374151',
                              borderBottom: '1px solid #F3F4F6'
                            }}
                            onClick={() => {
                              setSelectedIndices(instrument.name);
                              setIsIndicesDropdownOpen(false);
                              setIndicesSearchQuery('');
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            {instrument.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              {/* Bias */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  fontFamily: 'Inter, sans-serif',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Bias . <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={selectedBias}
                  onChange={(e) => setSelectedBias(e.target.value as 'bullish' | 'bearish' | 'neutral' | '')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    color: '#000',
                    backgroundColor: 'white',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                >
                  <option value="">Select bias</option>
                  <option value="bullish">Bullish</option>
                  <option value="bearish">Bearish</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>

              {/* Setup */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  fontFamily: 'Inter, sans-serif',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Setup
                </label>
                <input
                  type="text"
                  value={formData.setup}
                  onChange={(e) => setFormData(prev => ({ ...prev, setup: e.target.value }))}
                  placeholder="Enter setup"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    color: '#000',
                    backgroundColor: 'white',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Strategy */}
              <div 
                data-dropdown="strategy"
                style={{ 
                  backgroundColor: 'white',
                  minHeight: '60px',
                  borderBottom: '1px solid #E5E7EB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0 20px',
                  transition: 'background-color 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => setStrategyDropdownOpen(!strategyDropdownOpen)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <label style={{ fontSize: '14px', fontWeight: '400', fontFamily: 'Inter, sans-serif', color: '#9CA3AF' }}>
                  Strategy . <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <button type="button" style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  color: '#000',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: formData.strategy ? '#000' : '#9CA3AF' }}>{formData.strategy || 'Choose'}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                
                {/* Strategy Dropdown */}
                {strategyDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: '20px',
                    width: '200px',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    zIndex: 10000,
                    overflow: 'hidden',
                    marginTop: '4px'
                  }}>
                    {['Bull put spread', 'Bear call spread'].map((strategy) => (
                      <div
                        key={strategy}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, strategy }));
                          setStrategyDropdownOpen(false);
                        }}
                        style={{
                          padding: '12px 16px',
                          fontSize: '14px',
                          fontFamily: 'Inter, sans-serif',
                          color: '#1F2937',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        {strategy}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Capital */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  fontFamily: 'Inter, sans-serif',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Capital
                </label>
                <input
                  type="number"
                  value={formData.capital}
                  onChange={(e) => setFormData(prev => ({ ...prev, capital: e.target.value === '' ? '' : parseFloat(e.target.value) }))}
                  placeholder="Enter capital amount"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    color: '#000',
                    backgroundColor: 'white',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Strike Fields - Only show for Bull put spread and Bear call spread */}
              {shouldShowStrikes() && (
                <>
                  {/* Strike Section Header */}
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    minHeight: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 20px',
                    borderBottom: '1px solid #E2E8F0',
                    borderTop: '1px solid #E2E8F0'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      fontFamily: 'Inter, sans-serif',
                      color: '#1F2937',
                      margin: 0
                    }}>
                      Strike Details
                    </h3>
                  </div>

                  {/* Buy Strike Section */}
                  <div style={{
                    backgroundColor: '#F0FDF4',
                    padding: '20px',
                    borderBottom: '1px solid #E2E8F0'
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: 'Inter, sans-serif',
                      color: '#059669',
                      margin: '0 0 16px 0'
                    }}>
                      BUY STRIKE
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr 1fr',
                      gap: '16px'
                    }}>
                      <div>
                        <label style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          fontFamily: 'Inter, sans-serif',
                          color: '#6B7280',
                          marginBottom: '4px',
                          textAlign: 'center'
                        }}>Strike</label>
                        <input
                          type="number"
                          step="0.05"
                          value={strikeData.buyStrike}
                          onChange={(e) => setStrikeData(prev => ({ ...prev, buyStrike: parseFloat(e.target.value) || 0 }))}
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            fontFamily: 'Inter, sans-serif',
                            color: '#000',
                            background: 'transparent',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px',
                            textAlign: 'center',
                            padding: '8px',
                            width: '100%'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          fontFamily: 'Inter, sans-serif',
                          color: '#6B7280',
                          marginBottom: '4px',
                          textAlign: 'center'
                        }}>Type</label>
                        <select
                          value={strikeData.buyOptionType}
                          onChange={(e) => setStrikeData(prev => ({ ...prev, buyOptionType: e.target.value as 'CE' | 'PE' }))}
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            fontFamily: 'Inter, sans-serif',
                            color: '#000',
                            background: 'transparent',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px',
                            padding: '8px',
                            width: '100%'
                          }}
                        >
                          <option value="CE">CE</option>
                          <option value="PE">PE</option>
                        </select>
                      </div>
                      <div>
                        <label style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          fontFamily: 'Inter, sans-serif',
                          color: '#6B7280',
                          marginBottom: '4px',
                          textAlign: 'center'
                        }}>LTP</label>
                        <input
                          type="number"
                          step="0.01"
                          value={strikeData.buyLtp}
                          onChange={(e) => setStrikeData(prev => ({ ...prev, buyLtp: parseFloat(e.target.value) || 0 }))}
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            fontFamily: 'Inter, sans-serif',
                            color: '#000',
                            background: 'transparent',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px',
                            textAlign: 'center',
                            padding: '8px',
                            width: '100%'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          fontFamily: 'Inter, sans-serif',
                          color: '#6B7280',
                          marginBottom: '4px',
                          textAlign: 'center'
                        }}>Lots</label>
                        <input
                          type="number"
                          step="1"
                          value={strikeData.buyLots}
                          onChange={(e) => setStrikeData(prev => ({ ...prev, buyLots: parseInt(e.target.value) || 0 }))}
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            fontFamily: 'Inter, sans-serif',
                            color: '#000',
                            background: 'transparent',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px',
                            textAlign: 'center',
                            padding: '8px',
                            width: '100%'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sell Strike Section */}
                  <div style={{
                    backgroundColor: '#FEF2F2',
                    padding: '20px',
                    borderBottom: '1px solid #E2E8F0'
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: 'Inter, sans-serif',
                      color: '#DC2626',
                      margin: '0 0 16px 0'
                    }}>
                      SELL STRIKE
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr 1fr',
                      gap: '16px'
                    }}>
                      <div>
                        <label style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          fontFamily: 'Inter, sans-serif',
                          color: '#6B7280',
                          marginBottom: '4px',
                          textAlign: 'center'
                        }}>Strike</label>
                        <input
                          type="number"
                          step="0.05"
                          value={strikeData.sellStrike}
                          onChange={(e) => setStrikeData(prev => ({ ...prev, sellStrike: parseFloat(e.target.value) || 0 }))}
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            fontFamily: 'Inter, sans-serif',
                            color: '#000',
                            background: 'transparent',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px',
                            textAlign: 'center',
                            padding: '8px',
                            width: '100%'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          fontFamily: 'Inter, sans-serif',
                          color: '#6B7280',
                          marginBottom: '4px',
                          textAlign: 'center'
                        }}>Type</label>
                        <select
                          value={strikeData.sellOptionType}
                          onChange={(e) => setStrikeData(prev => ({ ...prev, sellOptionType: e.target.value as 'CE' | 'PE' }))}
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            fontFamily: 'Inter, sans-serif',
                            color: '#000',
                            background: 'transparent',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px',
                            padding: '8px',
                            width: '100%'
                          }}
                        >
                          <option value="CE">CE</option>
                          <option value="PE">PE</option>
                        </select>
                      </div>
                      <div>
                        <label style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          fontFamily: 'Inter, sans-serif',
                          color: '#6B7280',
                          marginBottom: '4px',
                          textAlign: 'center'
                        }}>LTP</label>
                        <input
                          type="number"
                          step="0.01"
                          value={strikeData.sellLtp}
                          onChange={(e) => setStrikeData(prev => ({ ...prev, sellLtp: parseFloat(e.target.value) || 0 }))}
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            fontFamily: 'Inter, sans-serif',
                            color: '#000',
                            background: 'transparent',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px',
                            textAlign: 'center',
                            padding: '8px',
                            width: '100%'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          fontFamily: 'Inter, sans-serif',
                          color: '#6B7280',
                          marginBottom: '4px',
                          textAlign: 'center'
                        }}>Lots</label>
                        <input
                          type="number"
                          step="1"
                          value={strikeData.sellLots}
                          onChange={(e) => setStrikeData(prev => ({ ...prev, sellLots: parseInt(e.target.value) || 0 }))}
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            fontFamily: 'Inter, sans-serif',
                            color: '#000',
                            background: 'transparent',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px',
                            textAlign: 'center',
                            padding: '8px',
                            width: '100%'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderBottom: '1px solid #E2E8F0'
                  }}>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      fontFamily: 'Inter, sans-serif',
                      color: '#374151',
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={strikeData.expiryDate}
                      onChange={(e) => setStrikeData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontFamily: 'Inter, sans-serif',
                        color: '#000',
                        backgroundColor: 'white',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </>
              )}

              {/* Notes Field */}
              <div style={{
                backgroundColor: 'white',
                minHeight: '80px',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                flexDirection: 'column',
                padding: '20px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  fontFamily: 'Inter, sans-serif',
                  color: '#374151',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this trade..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    color: '#000',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '60px'
                  }}
                />
              </div>
              </form>
            </div>

            {/* Footer */}
            <div style={{
              padding: '24px', 
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <button
                onClick={() => setIsModifyTradeOpen(false)}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  color: '#6B7280',
                  backgroundColor: 'white',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                CANCEL
              </button>
              <button
                onClick={handleModifyTradeSubmit}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  color: 'white',
                  backgroundColor: '#3B82F6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                UPDATE TRADE
              </button>
            </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
