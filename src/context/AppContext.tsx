import { createContext, useContext, useState, ReactNode } from 'react';

interface Transfer {
  id: string;
  date: { month: string; day: string };
  type: 'deposit' | 'withdrawal';
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

interface AppContextType {
  transfers: Transfer[];
  setTransfers: (transfers: Transfer[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [transfers, setTransfers] = useState<Transfer[]>([
    {
      id: 'transfer1',
      date: { month: 'OCT', day: '15' },
      type: 'deposit',
      amount: 50000,
      method: 'Bank Transfer',
      status: 'completed',
      reference: 'TXN123456789'
    },
    {
      id: 'transfer2',
      date: { month: 'OCT', day: '10' },
      type: 'withdrawal',
      amount: 25000,
      method: 'UPI',
      status: 'completed',
      reference: 'TXN987654321'
    },
    {
      id: 'transfer3',
      date: { month: 'OCT', day: '08' },
      type: 'deposit',
      amount: 100000,
      method: 'NEFT',
      status: 'completed',
      reference: 'TXN456789123'
    },
    {
      id: 'transfer4',
      date: { month: 'OCT', day: '05' },
      type: 'withdrawal',
      amount: 15000,
      method: 'Bank Transfer',
      status: 'completed',
      reference: 'TXN789123456'
    },
    {
      id: 'transfer5',
      date: { month: 'SEP', day: '28' },
      type: 'deposit',
      amount: 75000,
      method: 'RTGS',
      status: 'completed',
      reference: 'TXN321654987'
    },
    {
      id: 'transfer6',
      date: { month: 'SEP', day: '20' },
      type: 'withdrawal',
      amount: 30000,
      method: 'UPI',
      status: 'completed',
      reference: 'TXN654987321'
    }
  ]);

  return (
    <AppContext.Provider value={{ transfers, setTransfers }}>
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
