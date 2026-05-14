export const config = {
  showAuthEntry: import.meta.env.VITE_SHOW_AUTH_ENTRY === 'true',
  // 发送建议时的最大聊天记录条数，设为 0 表示不限制
  suggestionsMaxHistory: 20,
  // 聊天时的最大聊天记录条数，设为 0 表示不限制
  chatMaxHistory: 100
}
