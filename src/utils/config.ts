const backendEnabled = import.meta.env.VITE_BACKEND_ENABLED === 'true'

export const config = {
  backendEnabled,
  showAuthEntry: backendEnabled && import.meta.env.VITE_SHOW_AUTH_ENTRY === 'true'
}
