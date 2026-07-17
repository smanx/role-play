/// <reference types="vite/client" />

declare const __APP_BUILD_TIME__: string

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_BACKEND_ENABLED: string
  readonly VITE_SHOW_AUTH_ENTRY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
