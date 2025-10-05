import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { transferApi } from '../services/api';
import type { Transfer } from '../types/api';

interface AppContextType {
  transfers: Transfer[];
  setTransfers: (transfers: Transfer[]) => void;
  loading: boolean;
  error: string | null;
  refreshTransfers: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transfers from API
  const fetchTransfers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await transferApi.getTransfers();
      
      if (response.success) {
        setTransfers(response.data);
      } else {
        setError(response.message || 'Failed to fetch transfers');
        // Keep existing transfers if API fails
      }
    } catch (err) {
      console.error('Error fetching transfers:', err);
      setError('Failed to fetch transfers');
      // Keep existing transfers if API fails
    } finally {
      setLoading(false);
    }
  };

  // Refresh transfers function
  const refreshTransfers = async () => {
    await fetchTransfers();
  };

  // Load transfers on component mount
  useEffect(() => {
    fetchTransfers();
  }, []);

  return (
    <AppContext.Provider value={{ 
      transfers, 
      setTransfers, 
      loading, 
      error, 
      refreshTransfers 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
