import { useCallback } from 'react';
import { 
  Trade, 
  Transfer,
  CreateTradeRequest, 
  UpdateTradeRequest, 
  DashboardMetrics,
  TradeFilters,
  PaginationParams 
} from '../types/api';
import { tradeApi } from '../services/api';
import { useApi, useMutation, usePagination } from './useApi';

// Hook for fetching all trades with filters and pagination
export function useTrades(
  filters?: TradeFilters,
  initialPagination?: PaginationParams
) {
  const pagination = usePagination(
    initialPagination?.page || 1,
    initialPagination?.limit || 10
  );

  const apiCall = useCallback(() => {
    console.log('🔄 useTrades: Making API call');
    return tradeApi.getTrades(filters, {
      page: pagination.page,
      limit: pagination.limit,
      sortBy: initialPagination?.sortBy,
      sortOrder: initialPagination?.sortOrder,
    });
  }, [filters, pagination.page, pagination.limit, initialPagination?.sortBy, initialPagination?.sortOrder]);

  const { data, loading, error, success, refetch } = useApi(apiCall, [
    filters,
    pagination.page,
    pagination.limit,
  ]);

  console.log('🔄 useTrades: Hook state', { 
    data, 
    loading, 
    error, 
    success, 
    trades: data?.data || [],
    tradesLength: (data?.data || []).length 
  });

  return {
    trades: data?.data || [],
    pagination: {
      ...pagination,
      total: data?.pagination.total || 0,
      totalPages: data?.pagination.totalPages || 0,
    },
    loading,
    error,
    success,
    refetch,
  };
}

// Hook for fetching a single trade
export function useTrade(id: string) {
  const apiCall = useCallback(() => tradeApi.getTrade(id), [id]);
  
  return useApi(apiCall, [id]);
}

// Hook for creating a new trade
export function useCreateTrade() {
  return useMutation<Trade, CreateTradeRequest>(tradeApi.createTrade);
}

// Hook for updating a trade
export function useUpdateTrade() {
  return useMutation<Trade, { id: string; data: Partial<UpdateTradeRequest> }>(
    ({ id, data }) => tradeApi.updateTrade(id, data)
  );
}

// Hook for deleting a trade
export function useDeleteTrade() {
  return useMutation<void, string>(tradeApi.deleteTrade);
}

// Hook for fetching dashboard metrics
export function useDashboardMetrics() {
  const apiCall = useCallback(() => tradeApi.getDashboardMetrics(), []);
  
  return useApi(apiCall);
}

// Combined hook for trade management with optimistic updates
export function useTradeManagement(filters?: TradeFilters) {
  const {
    trades,
    pagination,
    loading: tradesLoading,
    error: tradesError,
    refetch: refetchTrades,
  } = useTrades(filters);

  const {
    mutate: createTrade,
    loading: createLoading,
    error: createError,
  } = useCreateTrade();

  const {
    mutate: updateTrade,
    loading: updateLoading,
    error: updateError,
  } = useUpdateTrade();

  const {
    mutate: deleteTrade,
    loading: deleteLoading,
    error: deleteError,
  } = useDeleteTrade();

  // Enhanced create trade with refetch
  const handleCreateTrade = useCallback(async (tradeData: CreateTradeRequest) => {
    try {
      const newTrade = await createTrade(tradeData);
      await refetchTrades(); // Refetch to get updated data
      return newTrade;
    } catch (error) {
      throw error;
    }
  }, [createTrade, refetchTrades]);

  // Enhanced update trade with refetch
  const handleUpdateTrade = useCallback(async (id: string, tradeData: Partial<UpdateTradeRequest>) => {
    try {
      const updatedTrade = await updateTrade({ id, data: tradeData });
      await refetchTrades(); // Refetch to get updated data
      return updatedTrade;
    } catch (error) {
      throw error;
    }
  }, [updateTrade, refetchTrades]);

  // Enhanced delete trade with refetch
  const handleDeleteTrade = useCallback(async (id: string) => {
    try {
      await deleteTrade(id);
      await refetchTrades(); // Refetch to get updated data
    } catch (error) {
      throw error;
    }
  }, [deleteTrade, refetchTrades]);

  return {
    // Data
    trades,
    pagination,
    
    // Loading states
    loading: tradesLoading || createLoading || updateLoading || deleteLoading,
    tradesLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    
    // Error states
    error: tradesError || createError || updateError || deleteError,
    tradesError,
    createError,
    updateError,
    deleteError,
    
    // Actions
    createTrade: handleCreateTrade,
    updateTrade: handleUpdateTrade,
    deleteTrade: handleDeleteTrade,
    refetchTrades,
  };
}

// Hook for calculating metrics from trade data (client-side fallback)
export function useCalculatedMetrics(trades: Trade[], transfers: Transfer[] = []) {
  const calculateMetrics = useCallback((): DashboardMetrics => {
    const totalTrades = trades.length;
    
    // Calculate total P&L
    const totalPnL = trades.reduce((sum, trade) => {
      // Handle the new format with ₹ symbol and + sign
      const cleanValue = trade.profitLoss.value.replace(/[₹,]/g, '').replace(/^\+/, '');
      const value = parseFloat(cleanValue) || 0;
      console.log('🔍 Dashboard P&L calculation:', {
        original: trade.profitLoss.value,
        cleaned: cleanValue,
        parsed: value,
        isProfit: trade.profitLoss.isProfit
      });
      return sum + value;
    }, 0);
    
    console.log('🔍 Dashboard total P&L:', totalPnL);
    
    // Calculate total deployed capital
    const totalCapital = trades.reduce((sum, trade) => {
      const value = parseFloat(trade.capital.value.replace(/,/g, ''));
      return sum + value;
    }, 0);
    
    // Calculate percentage return
    const percentageReturn = totalCapital > 0 ? (totalPnL / totalCapital) * 100 : 0;
    
    // Calculate total max profit
    const totalMaxProfit = trades.reduce((sum, trade) => {
      // Handle currency formatting and symbols
      const cleanValue = trade.maxProfit.value.replace(/[₹,]/g, '');
      const value = Math.abs(parseFloat(cleanValue) || 0); // Ensure max profit is always positive
      console.log('🔍 Dashboard Max Profit calculation:', {
        original: trade.maxProfit.value,
        cleaned: cleanValue,
        parsed: value
      });
      return sum + value;
    }, 0);
    
    console.log('🔍 Dashboard total Max Profit:', totalMaxProfit);
    
    // Calculate total max loss
    const totalMaxLoss = trades.reduce((sum, trade) => {
      // Handle currency formatting and symbols
      const cleanValue = trade.maxLoss.value.replace(/[₹,]/g, '');
      const value = parseFloat(cleanValue) || 0;
      console.log('🔍 Dashboard Max Loss calculation:', {
        original: trade.maxLoss.value,
        cleaned: cleanValue,
        parsed: value
      });
      return sum + value;
    }, 0);
    
    console.log('🔍 Dashboard total Max Loss:', totalMaxLoss);
    
    // Calculate buying power = Current Capital - Deployed Capital
    const closedTrades = trades.filter(t => t.status === 'closed');
    const closedPnL = closedTrades.reduce((sum, t) => {
      const value = parseFloat(t.profitLoss.value.replace(/[₹,+-]/g, ''));
      return sum + (t.profitLoss.isProfit ? value : -value);
    }, 0);
    
    // Calculate transfer capital from actual transfers data
    const transferCapital = transfers.reduce((sum, transfer) => {
      const amount = transfer.amount || 0;
      return sum + (transfer.type === 'deposit' ? amount : -amount);
    }, 0);
    
    const currentCapital = transferCapital + closedPnL; // Current Capital = Transfers + Closed P&L
    const buyingPower = currentCapital - totalCapital; // Buying Power = Current Capital - Deployed
    
    // Calculate total risk as % of current capital
    const totalRiskAmount = totalMaxLoss; // Sum of all max losses
    const totalRiskPercentage = currentCapital > 0 ? (totalRiskAmount / currentCapital) * 100 : 0;
    
    return {
      totalTrades,
      totalPnL,
      totalPnLFormatted: totalPnL.toLocaleString('en-IN'), // Keep the sign
      percentageReturn: percentageReturn >= 0 ? `+${percentageReturn.toFixed(1)}` : percentageReturn.toFixed(1),
      totalMaxProfit: totalMaxProfit.toLocaleString('en-IN'),
      totalMaxLoss: totalMaxLoss.toLocaleString('en-IN'),
      totalRisk: totalRiskPercentage.toFixed(1),
      totalCapital: totalCapital.toLocaleString('en-IN'),
      buyingPowerUsed: buyingPower.toLocaleString('en-IN'),
      buyingPowerPercentage: ((buyingPower / currentCapital) * 100).toFixed(1),
      isProfitable: totalPnL >= 0,
      backgroundColor: totalPnL >= 0 ? '#D1FAE5' : '#FEE2E2'
    };
  }, [trades, transfers]);

  return calculateMetrics();
}

