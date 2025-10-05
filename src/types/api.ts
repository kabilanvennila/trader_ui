// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Strike interface for backend
export interface Strike {
  id?: number;
  strike_price: number;
  option_type: 'CE' | 'PE';
  position: 'B' | 'S'; // Django model uses 'B' for Buy, 'S' for Sell
  lots: number;
  expiry_date: string;
  ltp?: number;
}

// Backend Trade Response (from your API)
export interface BackendTrade {
  id: number;
  indices_stock: string;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  setup: string;
  strategy: string;
  days_to_expiry: string;
  main_lots: number;
  price_per_unit: string;
  hedge_lots: number | null;
  price_per_hedge_unit: string | null;
  max_profit: string;
  max_loss: string;
  capital: string;
  notes: string | null;
  status: 'ACTIVE' | 'CLOSED';
  created_at: string;
  updated_at: string;
  strikes: Strike[];
}

// Frontend Trade Type (transformed for UI)
export interface Trade {
  id: string;
  date: { month: string; day: string };
  instrument: { name: string; type: string };
  bias: 'bullish' | 'bearish' | 'neutral';
  setup: { name: string; type: string };
  lots: { value: string; type: string };
  profitLoss: { value: string; percentage: string; isProfit: boolean };
  maxProfit: { value: string; percentage: string };
  maxLoss: { value: string; percentage: string };
  maxProfitLossRatio: number;
  calculatedMaxProfit?: { 
    value: string; 
    buyStrike: string; 
    sellStrike: string; 
    buyLtp: string; 
    sellLtp: string; 
    lots: string; 
    multiplier: string; 
    instrument: string;
  };
  calculatedMaxLoss?: { 
    value: string; 
    buyStrike: string; 
    sellStrike: string; 
    buyLtp: string; 
    sellLtp: string; 
    lots: string; 
    multiplier: string; 
    instrument: string;
  };
  capital: { value: string; label: string };
  risk: { value: string; label: string };
  status: 'active' | 'closed';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  strikes?: any[]; // Frontend strikes with BUY/SELL positions
}

export interface CreateTradeRequest {
  instrument: string;
  instrumentType: 'index' | 'stock';
  bias: 'bullish' | 'bearish' | 'neutral';
  setup: string;
  strategy: string;
  daysToExpiry: string;
  mainLots: number;
  pricePerUnit: number;
  hedgeLots?: number;
  pricePerHedgeUnit?: number;
  maxProfit: number;
  maxLoss: number;
  capital: number;
  strikes?: Strike[];
}

export interface UpdateTradeRequest extends Partial<CreateTradeRequest> {
  id: string;
}

// Dashboard Metrics Types
export interface DashboardMetrics {
  totalTrades: number;
  totalPnL: number;
  totalPnLFormatted: string;
  percentageReturn: string;
  totalMaxProfit: string;
  totalMaxLoss: string;
  totalRisk: string;
  totalCapital: string;
  buyingPowerUsed: string;
  buyingPowerPercentage: string;
  isProfitable: boolean;
  backgroundColor: string;
}

// Market Data Types
export interface MarketInstrument {
  symbol: string;
  name: string;
  type: 'index' | 'stock';
  isActive: boolean;
}

// User Settings Types
export interface UserSettings {
  totalCapital: number;
  maxBuyingPower: number;
  riskPercentage: number;
  currency: string;
  timezone: string;
}

// API Error Types
export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, any>;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter Types
export interface TradeFilters {
  instrument?: string;
  bias?: 'bullish' | 'bearish' | 'neutral';
  dateFrom?: string;
  dateTo?: string;
  profitOnly?: boolean;
  lossOnly?: boolean;
}

// Transfer Types
export interface Transfer {
  id: string;
  date: { month: string; day: string };
  type: 'deposit' | 'withdrawal';
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

// Backend Transfer Response (from your API)
export interface BackendTransfer {
  id: number;
  date: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Frontend Transfer Type (transformed for UI)
export interface FrontendTransfer {
  id: string;
  date: { month: string; day: string };
  type: 'deposit' | 'withdrawal';
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

export interface CreateTransferRequest {
  date: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: string;
  notes: string;
}

export interface UpdateTransferRequest extends Partial<CreateTransferRequest> {
  id: string;
}

// Backend API Response with summary
export interface BackendTransfersResponse {
  success: boolean;
  data: {
    summary: {
      totalCapital: string;
      totalDeposits: string;
      totalWithdrawals: string;
    };
    transfers: BackendTransfer[];
  };
}

