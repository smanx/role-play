import { config } from './config'

const BACKEND_DISABLED_MESSAGE = '纯前端模式已禁用后端服务'

export function assertBackendEnabled(): void {
  if (!config.backendEnabled) {
    throw new Error(BACKEND_DISABLED_MESSAGE)
  }
}

export function isBackendRequestUrl(input: string | URL): boolean {
  const url = input instanceof URL ? input : new URL(input, window.location.href)
  return url.origin === window.location.origin
    && (url.pathname === '/api' || url.pathname.startsWith('/api/'))
}

export function installBackendRequestGuard(): void {
  if (config.backendEnabled) return

  const nativeFetch = window.fetch.bind(window)

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const rawUrl = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url
    if (isBackendRequestUrl(rawUrl)) {
      return Promise.reject(new Error(BACKEND_DISABLED_MESSAGE))
    }

    return nativeFetch(input, init)
  }) as typeof window.fetch
}
