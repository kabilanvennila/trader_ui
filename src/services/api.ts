import { 
  ApiResponse, 
  Trade, 
  CreateTradeRequest, 
  UpdateTradeRequest, 
  DashboardMetrics,
  MarketInstrument,
  UserSettings,
  PaginatedResponse,
  TradeFilters,
  PaginationParams,
  Transfer,
  BackendTransfer,
  FrontendTransfer,
  CreateTransferRequest,
  UpdateTransferRequest,
  BackendTransfersResponse
} from '../types/api';
import { config } from '../config';
import { transformBackendTrades, transformToBackendTrade } from '../utils/dataTransforms';
import type { BackendTrade } from '../types/api';

// API Configuration from environment
const API_BASE_URL = config.api.baseUrl;
const API_TIMEOUT = config.api.timeout;

// HTTP Client Configuration
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(baseURL: string, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // Set authorization token
  setAuthToken(token: string) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  // Remove authorization token
  removeAuthToken() {
    delete this.headers['Authorization'];
  }

  // Generic request method
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Create abort controller for better timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
      signal: controller.signal,
    };

    // Debug logging
    if (import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true') {
      console.log('🌐 API Request:', {
        method: config.method || 'GET',
        url,
        headers: config.headers,
        body: config.body
      });
    }

    try {
      const response = await fetch(url, config);
      
      // Clear timeout since request completed
      clearTimeout(timeoutId);
      
      // Debug response
      if (import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true') {
        console.log('📡 API Response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
      }

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ API Error Response:', data);
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Since your backend returns direct array/object, wrap it in our expected format
      return {
        success: true,
        data: data,
        message: 'Success'
      };
    } catch (error) {
      // Clear timeout in case of error
      clearTimeout(timeoutId);
      
      console.error('❌ API Request failed:', { url, error });
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timed out after ${this.timeout}ms`);
        }
        if (error.message.includes('Load failed')) {
          throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
        }
      }
      
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    return this.request<T>(url, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL);

// API URLs using config
const TRADES_API_URL = `${API_BASE_URL}/trades/`;
const TRANSFERS_API_URL = `${API_BASE_URL}/transfers/`;

// Transfer Data Transform Functions
const transformBackendTransfers = (backendTransfers: BackendTransfer[]): FrontendTransfer[] => {
  return backendTransfers.map(transfer => ({
    id: transfer.id.toString(),
    date: {
      month: new Date(transfer.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: new Date(transfer.date).getDate().toString()
    },
    type: transfer.type.toLowerCase() as 'deposit' | 'withdrawal',
    amount: parseFloat(transfer.amount),
    method: transfer.notes,
    status: 'completed' as const,
    reference: `TXN${transfer.id}`
  }));
};

const transformToBackendTransfer = (transferData: CreateTransferRequest): CreateTransferRequest => {
  return {
    date: transferData.date,
    type: transferData.type,
    amount: transferData.amount,
    notes: transferData.notes
  };
};


// Trade API Services - with mock fallback
export const tradeApi = {
  // Get all trades with optional filters and pagination
  getTrades: async (
    _filters?: TradeFilters, 
    _pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Trade>>> => {
    console.log('🔗 Using API for getTrades');
    
    try {
      console.log('📡 Fetching from server:', TRADES_API_URL);
      
      const response = await fetch(TRADES_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const rawResponse = await response.json();
      console.log('📦 Raw backend response:', rawResponse);
      console.log('📦 Raw backend response type:', typeof rawResponse);
      console.log('📦 Raw backend response is array:', Array.isArray(rawResponse));
      
      // Handle different response formats
      let backendTrades: BackendTrade[];
      if (Array.isArray(rawResponse)) {
        backendTrades = rawResponse;
      } else if (rawResponse && Array.isArray(rawResponse.data)) {
        backendTrades = rawResponse.data;
      } else if (rawResponse && Array.isArray(rawResponse.trades)) {
        backendTrades = rawResponse.trades;
      } else {
        console.error('❌ Unexpected response format:', rawResponse);
        throw new Error('Backend returned unexpected data format');
      }
      
      console.log('📦 Parsed backend trades:', backendTrades);
      
      // Transform backend data to frontend format
      const transformedTrades = transformBackendTrades(backendTrades);
      console.log('🔄 Transformed trades:', transformedTrades);
      
      // Create paginated response
      const paginatedResponse: PaginatedResponse<Trade> = {
        data: transformedTrades,
        pagination: {
          page: 1,
          limit: 10,
          total: transformedTrades.length,
          totalPages: 1
        }
      };
      
      return {
        success: true,
        data: paginatedResponse,
        message: 'Success'
      };
    } catch (error) {
      console.error('❌ Failed to fetch from local server:', error);
      
      // Return empty data instead of throwing error to prevent app crash
      const emptyResponse: PaginatedResponse<Trade> = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1
        }
      };
      
      return {
        success: false,
        data: emptyResponse,
        message: 'Unable to connect to server. Please check if your backend is running.'
      };
    }
  },

  // Get a single trade by ID
  getTrade: async (id: string): Promise<ApiResponse<Trade>> => {
    return apiClient.get<Trade>(`/trades/${id}`);
  },

  // Create a new trade
  createTrade: async (tradeData: CreateTradeRequest): Promise<ApiResponse<Trade>> => {
    console.log('🔗 Using API for createTrade');
    
    try {
      console.log('📡 Creating trade at server:', TRADES_API_URL);
      
      // Transform frontend data to backend format
      const backendData = transformToBackendTrade(tradeData);
      console.log('📤 Sending trade data:', backendData);
      
      const response = await fetch(TRADES_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });
      
      console.log('📡 Create trade response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const rawResponse = await response.json();
      console.log('📦 Created trade raw response:', rawResponse);
      console.log('📦 Created trade response type:', typeof rawResponse);
      
      // Handle different response formats
      let createdTrade: BackendTrade;
      if (rawResponse && typeof rawResponse === 'object') {
        // If it's wrapped in a response object
        if (rawResponse.data) {
          createdTrade = rawResponse.data;
        } else if (rawResponse.trade) {
          createdTrade = rawResponse.trade;
        } else {
          createdTrade = rawResponse;
        }
      } else {
        throw new Error('Backend returned unexpected data format');
      }
      
      console.log('📦 Parsed created trade:', createdTrade);
      
      // Transform backend response to frontend format
      const transformedTrade = transformBackendTrades([createdTrade])[0];
      
      return {
        success: true,
        data: transformedTrade,
        message: 'Trade created successfully'
      };
    } catch (error) {
      console.error('❌ Failed to create trade at local server:', error);
      
      // Return error response instead of throwing to prevent app crash
      return {
        success: false,
        data: null as any,
        message: 'Unable to connect to server. Please check if your backend is running.'
      };
    }
  },

  // Update an existing trade
  updateTrade: async (id: string, tradeData: Partial<UpdateTradeRequest>): Promise<ApiResponse<Trade>> => {
    return apiClient.put<Trade>(`/trades/${id}`, tradeData);
  },

  // Delete a trade
  deleteTrade: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/trades/${id}`);
  },

  // Get dashboard metrics
  getDashboardMetrics: async (): Promise<ApiResponse<DashboardMetrics>> => {
    return apiClient.get<DashboardMetrics>('/trades/metrics');
  },
};

// Static instrument data (since backend doesn't have instruments endpoint)
const staticInstruments: MarketInstrument[] = [
  // Indices
  { symbol: 'NIFTY', name: 'Nifty 50', type: 'index', isActive: true },
  { symbol: 'BANKNIFTY', name: 'Bank Nifty', type: 'index', isActive: true },
  { symbol: 'FINNIFTY', name: 'Fin Nifty', type: 'index', isActive: true },
  { symbol: 'MIDCPNIFTY', name: 'MidCap Nifty', type: 'index', isActive: true },
  { symbol: 'SENSEX', name: 'BSE Sensex', type: 'index', isActive: true },
  
  // Stocks
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', type: 'stock', isActive: true },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', type: 'stock', isActive: true },
  { symbol: 'INFY', name: 'Infosys Ltd', type: 'stock', isActive: true },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', type: 'stock', isActive: true },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', type: 'stock', isActive: true },
  { symbol: 'SBIN', name: 'State Bank of India', type: 'stock', isActive: true },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', type: 'stock', isActive: true },
  { symbol: 'ITC', name: 'ITC Ltd', type: 'stock', isActive: true },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', type: 'stock', isActive: true },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd', type: 'stock', isActive: true },
];

// Market Data API Services - using static data since backend doesn't have instruments endpoint
export const marketApi = {
  // Get available instruments (indices and stocks)
  getInstruments: async (): Promise<ApiResponse<MarketInstrument[]>> => {
    console.log('📊 Using static instrument data (backend has no instruments endpoint)');
    return Promise.resolve({
      success: true,
      data: staticInstruments,
      message: 'Static instruments loaded'
    });
  },

  // Get indices only
  getIndices: async (): Promise<ApiResponse<MarketInstrument[]>> => {
    console.log('📊 Using static indices data');
    return Promise.resolve({
      success: true,
      data: staticInstruments.filter(i => i.type === 'index'),
      message: 'Static indices loaded'
    });
  },

  // Get stocks only
  getStocks: async (): Promise<ApiResponse<MarketInstrument[]>> => {
    console.log('📊 Using static stocks data');
    return Promise.resolve({
      success: true,
      data: staticInstruments.filter(i => i.type === 'stock'),
      message: 'Static stocks loaded'
    });
  },

  // Search instruments
  searchInstruments: async (query: string): Promise<ApiResponse<MarketInstrument[]>> => {
    console.log('📊 Searching static instruments for:', query);
    const filtered = staticInstruments.filter(instrument => 
      instrument.symbol.toLowerCase().includes(query.toLowerCase()) ||
      instrument.name.toLowerCase().includes(query.toLowerCase())
    );
    
    return Promise.resolve({
      success: true,
      data: filtered,
      message: 'Static search completed'
    });
  }
};

// User Settings API Services
export const userApi = {
  // Get user settings
  getSettings: async (): Promise<ApiResponse<UserSettings>> => {
    return apiClient.get<UserSettings>('/user/settings');
  },

  // Update user settings
  updateSettings: async (settings: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> => {
    return apiClient.put<UserSettings>('/user/settings', settings);
  },
};

// Transfer API Services
export const transferApi = {
  // Get all transfers
  getTransfers: async (): Promise<ApiResponse<FrontendTransfer[]>> => {
    console.log('🔗 Using API for getTransfers');
    
    try {
      console.log('📡 Fetching transfers from server:', TRANSFERS_API_URL);
      
      const response = await fetch(TRANSFERS_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const rawResponse: BackendTransfersResponse = await response.json();
      console.log('📦 Raw backend response:', rawResponse);
      
      // Extract transfers from the response
      const backendTransfers = rawResponse.data.transfers;
      console.log('📦 Parsed backend transfers:', backendTransfers);
      
      // Transform backend data to frontend format
      const transformedTransfers = transformBackendTransfers(backendTransfers);
      console.log('🔄 Transformed transfers:', transformedTransfers);
      
      return {
        success: true,
        data: transformedTransfers,
        message: 'Success'
      };
    } catch (error) {
      console.error('❌ Failed to fetch transfers from local server:', error);
      
      // Return empty data instead of throwing error to prevent app crash
      return {
        success: false,
        data: [],
        message: 'Unable to connect to server. Please check if your backend is running.'
      };
    }
  },

  // Create a new transfer
  createTransfer: async (transferData: CreateTransferRequest): Promise<ApiResponse<FrontendTransfer>> => {
    console.log('🔗 Using API for createTransfer');
    
    try {
      console.log('📡 Creating transfer at server:', TRANSFERS_API_URL);
      
      // Transform frontend data to backend format
      const backendData = transformToBackendTransfer(transferData);
      console.log('📤 Sending transfer data:', backendData);
      
      const response = await fetch(TRANSFERS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });
      
      console.log('📡 Create transfer response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const rawResponse = await response.json();
      console.log('📦 Created transfer raw response:', rawResponse);
      
      // Handle different response formats
      let createdTransfer: BackendTransfer;
      if (rawResponse && typeof rawResponse === 'object') {
        // If it's wrapped in a response object
        if (rawResponse.data) {
          createdTransfer = rawResponse.data;
        } else if (rawResponse.transfer) {
          createdTransfer = rawResponse.transfer;
        } else {
          createdTransfer = rawResponse;
        }
      } else {
        throw new Error('Backend returned unexpected data format');
      }
      
      console.log('📦 Parsed created transfer:', createdTransfer);
      
      // Transform backend response to frontend format
      const transformedTransfer = transformBackendTransfers([createdTransfer])[0];
      
      return {
        success: true,
        data: transformedTransfer,
        message: 'Transfer created successfully'
      };
    } catch (error) {
      console.error('❌ Failed to create transfer at local server:', error);
      
      // Return error response instead of throwing to prevent app crash
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : 'Unable to connect to server. Please check if your backend is running.'
      };
    }
  },

  // Update an existing transfer
  updateTransfer: async (id: string, transferData: Partial<UpdateTransferRequest>): Promise<ApiResponse<FrontendTransfer>> => {
    console.log('🔗 Using API for updateTransfer');
    
    try {
      const url = `${TRANSFERS_API_URL}${id}/`;
      console.log('📡 Updating transfer at server:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transferData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const rawResponse = await response.json();
      const updatedTransfer = transformBackendTransfers([rawResponse])[0];
      
      return {
        success: true,
        data: updatedTransfer,
        message: 'Transfer updated successfully'
      };
    } catch (error) {
      console.error('❌ Failed to update transfer at local server:', error);
      
      return {
        success: false,
        data: null as any,
        message: 'Unable to connect to server. Please check if your backend is running.'
      };
    }
  },

  // Delete a transfer
  deleteTransfer: async (id: string): Promise<ApiResponse<void>> => {
    console.log('🔗 Using API for deleteTransfer');
    
    try {
      const url = `${TRANSFERS_API_URL}${id}/`;
      console.log('📡 Deleting transfer at server:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return {
        success: true,
        data: undefined,
        message: 'Transfer deleted successfully'
      };
    } catch (error) {
      console.error('❌ Failed to delete transfer at local server:', error);
      
      return {
        success: false,
        data: undefined,
        message: 'Unable to connect to server. Please check if your backend is running.'
      };
    }
  },
};

// Authentication API Services
export const authApi = {
  // Login
  login: async (credentials: { email: string; password: string }): Promise<ApiResponse<{ token: string; user: any }>> => {
    return apiClient.post<{ token: string; user: any }>('/auth/login', credentials);
  },

  // Logout
  logout: async (): Promise<ApiResponse<void>> => {
    return apiClient.post<void>('/auth/logout');
  },

  // Refresh token
  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    return apiClient.post<{ token: string }>('/auth/refresh');
  },
};

// Export API client for direct use if needed
export { apiClient };

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (error.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

// Helper function to check if response is successful
export const isApiSuccess = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true } => {
  return response.success === true;
};
