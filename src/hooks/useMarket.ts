import { useCallback, useMemo } from 'react';
import { MarketInstrument } from '../types/api';
import { marketApi } from '../services/api';
import { useApi, useDebouncedApi } from './useApi';

// Hook for fetching all instruments
export function useInstruments() {
  const apiCall = useCallback(() => marketApi.getInstruments(), []);
  
  const { data, loading, error, success, refetch } = useApi(apiCall);

  // Separate indices and stocks for easier access
  const { indices, stocks } = useMemo(() => {
    if (!data) {
      return { indices: [], stocks: [] };
    }

    const indices = data.filter(instrument => instrument.type === 'index');
    const stocks = data.filter(instrument => instrument.type === 'stock');

    return { indices, stocks };
  }, [data]);

  return {
    instruments: data || [],
    indices,
    stocks,
    loading,
    error,
    success,
    refetch,
  };
}

// Hook for fetching only indices
export function useIndices() {
  const apiCall = useCallback(() => marketApi.getIndices(), []);
  
  return useApi(apiCall);
}

// Hook for fetching only stocks
export function useStocks() {
  const apiCall = useCallback(() => marketApi.getStocks(), []);
  
  return useApi(apiCall);
}

// Hook for searching instruments with debouncing
export function useInstrumentSearch(debounceMs: number = 300) {
  const searchCall = useCallback((query: string) => {
    return marketApi.searchInstruments(query);
  }, []);

  const {
    data: searchResults,
    loading: searchLoading,
    error: searchError,
    success: searchSuccess,
    search,
    clearResults,
  } = useDebouncedApi<MarketInstrument[]>(searchCall, debounceMs);

  // Separate search results by type
  const { searchedIndices, searchedStocks } = useMemo(() => {
    if (!searchResults) {
      return { searchedIndices: [], searchedStocks: [] };
    }

    const searchedIndices = searchResults.filter(instrument => instrument.type === 'index');
    const searchedStocks = searchResults.filter(instrument => instrument.type === 'stock');

    return { searchedIndices, searchedStocks };
  }, [searchResults]);

  return {
    searchResults: searchResults || [],
    searchedIndices,
    searchedStocks,
    searchLoading,
    searchError,
    searchSuccess,
    search,
    clearResults,
  };
}

// Combined hook for instrument management with search
export function useInstrumentManager() {
  const {
    instruments,
    indices,
    stocks,
    loading: instrumentsLoading,
    error: instrumentsError,
    refetch: refetchInstruments,
  } = useInstruments();

  const {
    searchResults,
    searchedIndices,
    searchedStocks,
    searchLoading,
    searchError,
    search,
    clearResults,
  } = useInstrumentSearch();

  // Helper function to find instrument by symbol
  const findInstrument = useCallback((symbol: string): MarketInstrument | undefined => {
    return instruments.find(instrument => 
      instrument.symbol.toLowerCase() === symbol.toLowerCase()
    );
  }, [instruments]);

  // Helper function to get filtered instruments based on search
  const getFilteredInstruments = useCallback((query: string, type?: 'index' | 'stock'): MarketInstrument[] => {
    if (!query.trim()) {
      if (type === 'index') return indices;
      if (type === 'stock') return stocks;
      return instruments;
    }

    const filtered = instruments.filter(instrument => {
      const matchesQuery = instrument.symbol.toLowerCase().includes(query.toLowerCase()) ||
                          instrument.name.toLowerCase().includes(query.toLowerCase());
      const matchesType = !type || instrument.type === type;
      
      return matchesQuery && matchesType;
    });

    return filtered;
  }, [instruments, indices, stocks]);

  return {
    // All instruments data
    instruments,
    indices,
    stocks,
    
    // Search results
    searchResults,
    searchedIndices,
    searchedStocks,
    
    // Loading states
    loading: instrumentsLoading || searchLoading,
    instrumentsLoading,
    searchLoading,
    
    // Error states
    error: instrumentsError || searchError,
    instrumentsError,
    searchError,
    
    // Actions
    search,
    clearResults,
    refetchInstruments,
    
    // Helpers
    findInstrument,
    getFilteredInstruments,
  };
}

// Hook for instrument dropdown/select components
export function useInstrumentSelect(_initialValue?: string) {
  const { instruments, loading, error } = useInstruments();
  const { search, searchResults, clearResults } = useInstrumentSearch();

  // Format instruments for dropdown options
  const instrumentOptions = useMemo(() => {
    const allInstruments = searchResults.length > 0 ? searchResults : instruments;
    
    return allInstruments.map(instrument => ({
      value: instrument.symbol,
      label: `${instrument.symbol} - ${instrument.name}`,
      type: instrument.type,
      disabled: !instrument.isActive,
    }));
  }, [instruments, searchResults]);

  // Separate options by type
  const { indexOptions, stockOptions } = useMemo(() => {
    const indexOptions = instrumentOptions.filter(option => option.type === 'index');
    const stockOptions = instrumentOptions.filter(option => option.type === 'stock');
    
    return { indexOptions, stockOptions };
  }, [instrumentOptions]);

  return {
    options: instrumentOptions,
    indexOptions,
    stockOptions,
    loading,
    error,
    search,
    clearResults,
  };
}

