import { useState, useEffect, useCallback } from 'react';
import { handleApiError } from '../services/api';
import { ApiResponse } from '../types/api';

// Generic API state interface
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Generic API hook for GET requests
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
): ApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
    success: false,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || 'Request failed',
          success: false,
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: handleApiError(error),
        success: false,
      });
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}

// Generic mutation hook for POST, PUT, DELETE requests
export function useMutation<TData, TVariables = void>(
  apiCall: (variables: TVariables) => Promise<ApiResponse<TData>>
): {
  mutate: (variables: TVariables) => Promise<TData>;
  loading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
} {
  const [state, setState] = useState({
    loading: false,
    error: null as string | null,
    success: false,
  });

  const mutate = useCallback(async (variables: TVariables): Promise<TData> => {
    setState({ loading: true, error: null, success: false });
    
    try {
      const response = await apiCall(variables);
      
      if (response.success) {
        setState({ loading: false, error: null, success: true });
        return response.data;
      } else {
        const errorMessage = response.error || 'Request failed';
        setState({ loading: false, error: errorMessage, success: false });
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState({ loading: false, error: errorMessage, success: false });
      throw error;
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, success: false });
  }, []);

  return {
    mutate,
    loading: state.loading,
    error: state.error,
    success: state.success,
    reset,
  };
}

// Optimistic update hook for better UX
export function useOptimisticUpdate<T>(
  initialData: T[],
  updateFn: (items: T[], newItem: T) => T[],
  revertFn?: (items: T[], failedItem: T) => T[]
) {
  const [optimisticData, setOptimisticData] = useState<T[]>(initialData);

  const addOptimistic = useCallback((newItem: T) => {
    setOptimisticData(prev => updateFn(prev, newItem));
    return newItem;
  }, [updateFn]);

  const revertOptimistic = useCallback((failedItem: T) => {
    if (revertFn) {
      setOptimisticData(prev => revertFn(prev, failedItem));
    }
  }, [revertFn]);

  const updateData = useCallback((newData: T[]) => {
    setOptimisticData(newData);
  }, []);

  return {
    data: optimisticData,
    addOptimistic,
    revertOptimistic,
    updateData,
  };
}

// Debounced API hook for search functionality
export function useDebouncedApi<T>(
  apiCall: (query: string) => Promise<ApiResponse<T>>,
  delay: number = 300
): ApiState<T> & { 
  search: (query: string) => void;
  clearResults: () => void;
} {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const [searchQuery, setSearchQuery] = useState<string>('');

  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearResults = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
    setSearchQuery('');
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      clearResults();
      return;
    }

    const timeoutId = setTimeout(async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const response = await apiCall(searchQuery);
        
        if (response.success) {
          setState({
            data: response.data,
            loading: false,
            error: null,
            success: true,
          });
        } else {
          setState({
            data: null,
            loading: false,
            error: response.error || 'Search failed',
            success: false,
          });
        }
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: handleApiError(error),
          success: false,
        });
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, apiCall, delay]);

  return {
    ...state,
    search,
    clearResults,
  };
}

// Pagination hook
export function usePagination(initialPage: number = 1, initialLimit: number = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage));
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
  }, [initialPage, initialLimit]);

  return {
    page,
    limit,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    reset,
  };
}
