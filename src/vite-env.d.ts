/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_DEFAULT_TOTAL_CAPITAL: string
  readonly VITE_DEFAULT_MAX_BUYING_POWER: string
  readonly VITE_DEFAULT_CURRENCY: string
  readonly VITE_DEFAULT_TIMEZONE: string
  readonly VITE_DEFAULT_PAGE_SIZE: string
  readonly VITE_MAX_PAGE_SIZE: string
  readonly VITE_SEARCH_DEBOUNCE_MS: string
  readonly VITE_MIN_SEARCH_LENGTH: string
  readonly VITE_CACHE_DURATION_MS: string
  readonly VITE_ENABLE_CACHE: string
  readonly VITE_ENABLE_DEBUG_LOGS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
