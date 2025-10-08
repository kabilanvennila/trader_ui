import { BackendTrade, Trade } from '../types/api';

// Calculate max profit based on strikes and instrument
function calculateMaxProfitFromStrikes(strikes: any[], instrument: string): number {
  if (!strikes || strikes.length < 2) return 0;
  
  // Find buy and sell strikes
  const buyStrike = strikes.find(s => s.position === 'BUY');
  const sellStrike = strikes.find(s => s.position === 'SELL');
  
  if (!buyStrike || !sellStrike) return 0;
  
  // Get multiplier based on instrument
  const getMultiplier = (instrument: string): number => {
    const upperInstrument = instrument.toUpperCase();
    if (upperInstrument.includes('NIFTY')) return 75;
    if (upperInstrument.includes('BANKNIFTY')) return 35;
    if (upperInstrument.includes('SENSEX')) return 20;
    return 1; // Default multiplier
  };
  
  // Calculate: (sell strike ltp - buy strike ltp) * lots * multiplier
  const buyLtp = parseFloat(buyStrike.ltp) || 0;
  const sellLtp = parseFloat(sellStrike.ltp) || 0;
  const lots = parseInt(buyStrike.lots) || 0;
  const multiplier = getMultiplier(instrument);
  
  const maxProfit = (sellLtp - buyLtp) * lots * multiplier;
  return maxProfit; // Return the actual calculated max profit (can be negative)
}

// Calculate max loss based on strikes and instrument
// Get first lot from strikes data
function calculateLotsFromStrikes(strikes: any[], fallbackLots: number): string {
  console.log('🔍 Getting first lot from strikes:', strikes);
  
  if (!strikes || strikes.length === 0) {
    console.log('🔍 No strikes found, using fallback lots:', fallbackLots);
    return fallbackLots.toString();
  }
  
  // Get the first strike's lots
  const firstStrike = strikes[0];
  const firstLot = firstStrike.lots || 0;
  
  console.log('🔍 First strike lots:', firstLot);
  
  // If first lot is 0, use fallback
  if (firstLot === 0) {
    console.log('🔍 First lot is 0, using fallback lots:', fallbackLots);
    return fallbackLots.toString();
  }
  
  return firstLot.toString();
}

// Calculate quantity from lots and multiplier
function calculateQuantityFromLots(strikes: any[], fallbackLots: number, instrument: string): string {
  const lots = parseInt(calculateLotsFromStrikes(strikes, fallbackLots));
  
  const getMultiplier = (instrument: string): number => {
    const upperInstrument = instrument.toUpperCase();
    if (upperInstrument.includes('NIFTY')) return 75;
    if (upperInstrument.includes('BANKNIFTY')) return 30;
    if (upperInstrument.includes('FINNIFTY')) return 40;
    if (upperInstrument.includes('SENSEX')) return 10;
    return 1;
  };
  
  const multiplier = getMultiplier(instrument);
  const quantity = lots * multiplier;
  
  return `${quantity} Qty`;
}

function calculateMaxLossFromStrikes(strikes: any[], instrument: string, strategy?: string): number {
  console.log('🔍 calculateMaxLossFromStrikes called with:', { strikes, instrument, strategy });
  
  if (!strikes || strikes.length < 2) {
    console.log('🔍 Not enough strikes, returning 0');
    return 0;
  }
  
  // Find buy and sell strikes
  const buyStrike = strikes.find(s => s.position === 'BUY');
  const sellStrike = strikes.find(s => s.position === 'SELL');
  
  console.log('🔍 Found strikes:', { buyStrike, sellStrike });
  
  if (!buyStrike || !sellStrike) {
    console.log('🔍 Missing buy or sell strike, returning 0');
    return 0;
  }
  
  // Get multiplier based on instrument
  const getMultiplier = (instrument: string): number => {
    const upperInstrument = instrument.toUpperCase();
    if (upperInstrument.includes('NIFTY')) return 75;
    if (upperInstrument.includes('BANKNIFTY')) return 35;
    if (upperInstrument.includes('SENSEX')) return 20;
    return 1; // Default multiplier
  };
  
  const buyStrikePrice = parseFloat(buyStrike.strike_price) || 0;
  const sellStrikePrice = parseFloat(sellStrike.strike_price) || 0;
  const buyLtp = parseFloat(buyStrike.ltp) || 0;
  const sellLtp = parseFloat(sellStrike.ltp) || 0;
  const lots = parseInt(buyStrike.lots) || 0;
  const multiplier = getMultiplier(instrument);
  const ltpDiff = sellLtp - buyLtp;
  
  let maxLoss: number;
  
  // Calculate based on strategy
  if (strategy === 'Bull put spread') {
    // Bull put spread: (sell strike - buy strike - ltp diff) * lots * 75
    const strikeDiff = sellStrikePrice - buyStrikePrice;
    maxLoss = (strikeDiff - ltpDiff) * lots * 75;
    
    console.log('🔍 Bull Put Spread Max Loss Calculation:', {
      buyStrikePrice,
      sellStrikePrice,
      buyLtp,
      sellLtp,
      lots,
      strikeDiff,
      ltpDiff,
      calculation: `${strikeDiff} - ${ltpDiff} = ${strikeDiff - ltpDiff}`,
      finalCalculation: `${strikeDiff - ltpDiff} * ${lots} * 75`,
      maxLoss
    });
  } else if (strategy === 'Bear call spread') {
    // Bear call spread: ((buy strike - sell strike) - (ltp diff)) * lots * multiplier
    const strikeDiff = buyStrikePrice - sellStrikePrice;
    maxLoss = (strikeDiff - ltpDiff) * lots * multiplier;
    
    console.log('🔍 Bear Call Spread Max Loss Calculation:', {
      buyStrikePrice,
      sellStrikePrice,
      buyLtp,
      sellLtp,
      lots,
      multiplier,
      strikeDiff,
      ltpDiff,
      maxLoss
    });
  } else {
    // Default calculation (backward compatibility)
    maxLoss = ((sellStrikePrice - buyStrikePrice) - ltpDiff) * lots * multiplier;
    
    console.log('🔍 Default Max Loss Calculation:', {
      buyStrikePrice,
      sellStrikePrice,
      buyLtp,
      sellLtp,
      lots,
      multiplier,
      strikeDifference: sellStrikePrice - buyStrikePrice,
      ltpDiff,
      baseCalculation: (sellStrikePrice - buyStrikePrice) - ltpDiff,
      maxLoss
    });
  }
  
  console.log('🔍 Max Loss final calculation:', {
    strategy,
    maxLoss,
    isNegative: maxLoss < 0
  });
  
  return maxLoss; // Return the actual calculated max loss (can be negative)
}

// Transform backend trade data to frontend format
export function transformBackendTrade(backendTrade: BackendTrade): Trade {
  console.log('🔄 Transforming backend trade:', backendTrade);
  
  // Transform strikes if they exist
  let transformedStrikes: any[] = [];
  if (backendTrade.strikes && Array.isArray(backendTrade.strikes)) {
    transformedStrikes = backendTrade.strikes.map((strike: any) => ({
      id: strike.id,
      strike_price: strike.strike_price,
      option_type: strike.option_type,
      position: strike.position === 'B' ? 'BUY' : 'SELL', // Convert B/S back to BUY/SELL for frontend
      lots: strike.lots,
      expiry_date: strike.expiry_date,
      ltp: strike.ltp
    }));
  }
  
  // Parse date from created_at
  const createdDate = new Date(backendTrade.created_at);
  const month = createdDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = createdDate.getDate().toString();

  // Determine instrument type (simple heuristic)
  const isIndex = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX'].includes(backendTrade.indices_stock.toUpperCase());
  
  // Convert bias to lowercase
  const bias = backendTrade.bias.toLowerCase() as 'bullish' | 'bearish' | 'neutral';
  
  // Format currency values
  const formatCurrency = (value: string) => {
    const num = parseFloat(value) || 0;
    return num.toLocaleString('en-IN');
  };
  
  // Calculate profit/loss - use calculated max profit and max loss if strikes are available
  let maxProfitNum = parseFloat(backendTrade.max_profit) || 0;
  let maxLossNum = parseFloat(backendTrade.max_loss) || 0;
  const capitalNum = parseFloat(backendTrade.capital) || 0;
  
  // If we have strikes, calculate max profit and max loss from strike data
  let calculatedMaxProfitDetails: any = undefined;
  let calculatedMaxLossDetails: any = undefined;
  if (transformedStrikes.length >= 2) {
    console.log('🔍 Calculating from strikes, count:', transformedStrikes.length);
    console.log('🔍 Transformed strikes:', transformedStrikes);
    
    const calculatedMaxProfit = calculateMaxProfitFromStrikes(transformedStrikes, backendTrade.indices_stock);
    const calculatedMaxLoss = calculateMaxLossFromStrikes(transformedStrikes, backendTrade.indices_stock, backendTrade.strategy);
    
    console.log('🔍 Calculated values:', {
      calculatedMaxProfit,
      calculatedMaxLoss,
      originalMaxProfit: maxProfitNum,
      originalMaxLoss: maxLossNum
    });
    
    maxProfitNum = calculatedMaxProfit;
    maxLossNum = calculatedMaxLoss;
    
    // Get multiplier for display
    const getMultiplier = (instrument: string): number => {
      const upperInstrument = instrument.toUpperCase();
      if (upperInstrument.includes('NIFTY')) return 75;
      if (upperInstrument.includes('BANKNIFTY')) return 35;
      if (upperInstrument.includes('SENSEX')) return 20;
      return 1;
    };
    
    const buyStrike = transformedStrikes.find(s => s.position === 'BUY');
    const sellStrike = transformedStrikes.find(s => s.position === 'SELL');
    
    if (buyStrike && sellStrike) {
      calculatedMaxProfitDetails = {
        value: formatCurrency(calculatedMaxProfit.toString()),
        buyStrike: buyStrike.strike_price.toString(),
        sellStrike: sellStrike.strike_price.toString(),
        buyLtp: buyStrike.ltp.toString(),
        sellLtp: sellStrike.ltp.toString(),
        lots: buyStrike.lots.toString(),
        multiplier: getMultiplier(backendTrade.indices_stock).toString(),
        instrument: backendTrade.indices_stock
      };
      
      calculatedMaxLossDetails = {
        value: formatCurrency(calculatedMaxLoss.toString()),
        buyStrike: buyStrike.strike_price.toString(),
        sellStrike: sellStrike.strike_price.toString(),
        buyLtp: buyStrike.ltp.toString(),
        sellLtp: sellStrike.ltp.toString(),
        lots: buyStrike.lots.toString(),
        multiplier: getMultiplier(backendTrade.indices_stock).toString(),
        instrument: backendTrade.indices_stock
      };
    }
    
    console.log('💰 Calculated max profit from strikes:', calculatedMaxProfit, 'for', backendTrade.indices_stock);
    console.log('💸 Calculated max loss from strikes:', calculatedMaxLoss, 'for', backendTrade.indices_stock);
    console.log('🔍 Max profit/loss values:', {
      originalMaxProfit: backendTrade.max_profit,
      originalMaxLoss: backendTrade.max_loss,
      calculatedMaxProfit,
      calculatedMaxLoss,
      finalMaxProfit: maxProfitNum,
      finalMaxLoss: maxLossNum
    });
  }
  
  // Calculate current P&L - use actual_pnl from backend if trade is closed, otherwise 0
  console.log('🔍 Debug P&L calculation for trade:', backendTrade.id, {
    status: backendTrade.status,
    actual_pnl: backendTrade.actual_pnl,
    actual_pnl_type: typeof backendTrade.actual_pnl,
    isClosed: backendTrade.status === 'CLOSED',
    hasActualPnL: !!backendTrade.actual_pnl,
    allFields: Object.keys(backendTrade)
  });
  
  // Check for P&L data - for closed trades, check multiple possible fields
  let actualPnLValue = backendTrade.actual_pnl;
  
  // For closed trades, check actual_pnl first, then fallback to max_profit (which contains entered P&L)
  if (backendTrade.status === 'CLOSED') {
    if (backendTrade.actual_pnl !== null && backendTrade.actual_pnl !== undefined && backendTrade.actual_pnl !== '0') {
      console.log(`🔍 Found actual P&L in actual_pnl field:`, backendTrade.actual_pnl);
      actualPnLValue = backendTrade.actual_pnl;
    } else if (backendTrade.max_profit) {
      // Fallback: The entered P&L might be stored in max_profit field
      console.log(`🔍 Using max_profit as actual P&L for closed trade:`, backendTrade.max_profit);
      actualPnLValue = backendTrade.max_profit;
    } else {
      console.warn(`⚠️ Closed trade ${backendTrade.id} missing P&L data`);
      actualPnLValue = '0';
    }
  }
  
  const currentPnL = backendTrade.status === 'CLOSED' && actualPnLValue 
    ? parseFloat(actualPnLValue.toString()) 
    : 0;
  const currentPnLPercentage = capitalNum > 0 ? ((currentPnL / capitalNum) * 100).toFixed(1) : '0.0';
  
  console.log('🔍 Calculated P&L:', {
    currentPnL,
    currentPnLPercentage,
    capitalNum,
    actualPnLValue,
    finalValue: currentPnL
  });
  
  // Calculate max profit/loss percentages
  const maxProfitPercentage = capitalNum > 0 ? ((maxProfitNum / capitalNum) * 100).toFixed(1) : '0.0';
  const maxLossPercentage = capitalNum > 0 ? ((maxLossNum / capitalNum) * 100).toFixed(1) : '0.0';
  
  // Calculate ratio for the progress bar
  const totalRange = maxProfitNum + maxLossNum;
  const maxProfitLossRatio = totalRange > 0 ? maxProfitNum / totalRange : 0.5;

  console.log('🔍 Transform: Backend trade ID:', backendTrade.id, 'type:', typeof backendTrade.id);
  
  return {
    id: backendTrade.id.toString(),
    date: { month, day },
    instrument: { 
      name: backendTrade.indices_stock, 
      type: isIndex ? 'Index' : 'Stock' 
    },
    bias,
    setup: { 
      name: backendTrade.strategy || 'Strategy', 
      type: backendTrade.setup || 'Setup' 
    },
    lots: { 
      value: calculateLotsFromStrikes(transformedStrikes, backendTrade.main_lots), 
      type: calculateQuantityFromLots(transformedStrikes, backendTrade.main_lots, backendTrade.indices_stock)
    },
    profitLoss: { 
      value: currentPnL >= 0 ? `+₹${formatCurrency(currentPnL.toString())}` : `-₹${formatCurrency(Math.abs(currentPnL).toString())}`,
      percentage: `${currentPnL >= 0 ? '+' : ''}${currentPnLPercentage}%`,
      isProfit: currentPnL >= 0
    },
    maxProfit: { 
      value: formatCurrency(maxProfitNum.toString()), 
      percentage: `${maxProfitPercentage}%` 
    },
    maxLoss: { 
      value: formatCurrency(maxLossNum.toString()), 
      percentage: `${maxLossPercentage}%` 
    },
    maxProfitLossRatio,
    capital: { 
      value: formatCurrency(backendTrade.capital), 
      label: 'Deployed' 
    },
    risk: { 
      value: '0.0%', // You'll need to calculate this based on your business logic
      label: 'Portfolio' 
    },
    status: backendTrade.status.toLowerCase() as 'active' | 'closed',
    notes: backendTrade.notes || undefined,
    actualPnL: backendTrade.status === 'CLOSED' 
      ? (backendTrade.actual_pnl && backendTrade.actual_pnl !== '0'
          ? parseFloat(backendTrade.actual_pnl.toString())
          : backendTrade.max_profit 
            ? parseFloat(backendTrade.max_profit.toString())
            : undefined)
      : undefined,
    closingDate: backendTrade.closing_date || undefined,
    createdAt: backendTrade.created_at,
    updatedAt: backendTrade.updated_at,
    strikes: transformedStrikes,
    calculatedMaxProfit: calculatedMaxProfitDetails,
    calculatedMaxLoss: calculatedMaxLossDetails
  };
}

// Transform array of backend trades
export function transformBackendTrades(backendTrades: BackendTrade[]): Trade[] {
  console.log('🔄 Transforming backend trades:', backendTrades);
  console.log('🔄 Backend trades type:', typeof backendTrades);
  console.log('🔄 Backend trades is array:', Array.isArray(backendTrades));
  
  if (!Array.isArray(backendTrades)) {
    console.error('❌ backendTrades is not an array:', backendTrades);
    throw new Error('Expected backendTrades to be an array');
  }
  
  return backendTrades.map(transformBackendTrade);
}

// Transform frontend trade data to backend format for API requests
export function transformToBackendTrade(frontendData: any): Partial<BackendTrade> {
  console.log('🔄 Transforming frontend data to backend format:', frontendData);

  // Transform strikes to match Django model
  let transformedStrikes: any[] = [];
  if (frontendData.strikes && Array.isArray(frontendData.strikes)) {
    transformedStrikes = frontendData.strikes.map((strike: any) => ({
      strike_price: strike.strike_price || 0,
      option_type: strike.option_type || 'PE',
      position: strike.position === 'BUY' ? 'B' : 'S', // Convert BUY/SELL to B/S
      lots: strike.lots || 1,
      expiry_date: strike.expiry_date || new Date().toISOString().split('T')[0],
      ltp: strike.ltp || 0
    }));
  }

  return {
    // Only include fields that should be updated, not readonly fields like id, created_at, updated_at
    indices_stock: frontendData.indices_stock || frontendData.instrument || '',
    bias: (frontendData.bias?.toUpperCase() || 'NEUTRAL') as 'BULLISH' | 'BEARISH' | 'NEUTRAL',
    setup: frontendData.setup || 'NA',
    strategy: frontendData.strategy || 'NA',
    days_to_expiry: frontendData.days_to_expiry || frontendData.daysToExpiry || new Date().toISOString().split('T')[0],
    main_lots: parseInt(frontendData.main_lots || frontendData.mainLots) || 0,
    price_per_unit: (frontendData.price_per_unit || frontendData.pricePerUnit)?.toString() || '0.00',
    hedge_lots: frontendData.hedge_lots || frontendData.hedgeLots ? parseInt(frontendData.hedge_lots || frontendData.hedgeLots) : null,
    price_per_hedge_unit: frontendData.price_per_hedge_unit || frontendData.pricePerHedgeUnit ? (frontendData.price_per_hedge_unit || frontendData.pricePerHedgeUnit)?.toString() : null,
    max_profit: (frontendData.max_profit || frontendData.maxProfit)?.toString() || '0.00',
    max_loss: (frontendData.max_loss || frontendData.maxLoss)?.toString() || '0.00',
    capital: (frontendData.capital)?.toString() || '0.00',
    notes: frontendData.notes || '',
    status: frontendData.status || 'ACTIVE',
    strikes: transformedStrikes
  };
}
