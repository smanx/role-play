import { ref, watch, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { useModelConfigStore, type ModelConfig } from '@/stores/modelConfig'

export function useCustomModel() {
  const chatStore = useChatStore()
  const userStore = useUserStore()
  const modelConfigStore = useModelConfigStore()
  
  const showCustomModelConfig = ref(false)
  const isFetchingModels = ref(false)
  const fetchModelsError = ref('')
  const isLoadingBuiltinModels = ref(false)
  const pendingSwitchToBuiltin = ref(false)
  const hasMigrated = ref(false)

  // 当前选中的配置ID（用于配置弹窗）
  const selectedConfigId = ref<string | null>(null)

  // 计算当前激活配置的可用模型
  const availableCustomModels = ref<string[]>([])

  // 初始化 - 加载配置和迁移旧数据
  async function initialize() {
    await modelConfigStore.load()
    
    // 检查是否需要迁移旧配置
    await migrateOldConfigIfNeeded()
    
    // 加载当前激活配置的模型列表
    await loadCurrentConfigModels()
  }

  // 迁移旧的 localStorage 配置到新 store
  async function migrateOldConfigIfNeeded() {
    if (hasMigrated.value) return
    
    // 检查是否有旧配置
    const oldUseCustomModel = localStorage.getItem('role_play_use_custom_model') === 'true'
    const oldConfigStr = localStorage.getItem('role_play_custom_model_config')
    
    if (!oldConfigStr) {
      hasMigrated.value = true
      return
    }

    try {
      const oldConfig = JSON.parse(oldConfigStr)
      if (oldConfig && (oldConfig.api_url || oldConfig.api_key)) {
        // 检查是否已经有配置了
        if (modelConfigStore.configs.length === 0) {
          // 创建新配置
          const newConfig = modelConfigStore.addConfig({
            name: '我的配置',
            provider: oldConfig.provider || 'openai',
            api_url: oldConfig.api_url || '',
            api_key: oldConfig.api_key || '',
            default_model: oldConfig.default_model || '',
            is_default: true
          })
          modelConfigStore.setActive(newConfig.id)
        }
        
        // 保持旧的 useCustomModel 设置
        if (oldUseCustomModel) {
          chatStore.setUseCustomModel(true)
        }
      }
    } catch (e) {
      console.error('迁移旧配置失败:', e)
    }
    
    hasMigrated.value = true
  }

  // 加载当前激活配置的模型列表
  async function loadCurrentConfigModels() {
    const activeConfig = modelConfigStore.activeConfig
    if (!activeConfig) {
      availableCustomModels.value = []
      return
    }

    // 先尝试从 store 的缓存中获取
    const cachedModels = modelConfigStore.modelLists[activeConfig.id]
    if (cachedModels && cachedModels.length > 0) {
      availableCustomModels.value = cachedModels.map(m => m.id)
      return
    }

    // 如果没有缓存，尝试从 localStorage 加载旧数据
    if (loadOldModelsFromStorage(activeConfig)) {
      return
    }
  }

  // 从旧的 localStorage 格式加载模型列表
  function loadOldModelsFromStorage(config: ModelConfig): boolean {
    try {
      const configHash = btoa(config.api_url + '|' + config.api_key.slice(-8))
      const storageKey = `role_play_custom_models_${configHash}`
      const saved = localStorage.getItem(storageKey)
      
      if (saved) {
        const models = JSON.parse(saved)
        if (Array.isArray(models)) {
          availableCustomModels.value = models
          // 缓存到 store
          modelConfigStore.modelLists[config.id] = models.map(id => ({ id }))
          return true
        }
      }
    } catch (e) {
      console.error('加载旧模型列表失败:', e)
    }
    return false
  }



  // 获取当前选中配置的模型列表
  async function fetchCustomModels(configId?: string) {
    const targetConfigId = configId || modelConfigStore.activeConfigId
    if (!targetConfigId) {
      fetchModelsError.value = '请先选择一个配置'
      return
    }

    const config = modelConfigStore.configs.find(c => c.id === targetConfigId)
    if (!config) {
      fetchModelsError.value = '配置不存在'
      return
    }

    if (!config.api_url || !config.api_key) {
      fetchModelsError.value = '请先填写 API 地址和 API Key'
      return
    }

    isFetchingModels.value = true
    fetchModelsError.value = ''
    
    try {
      const models = await modelConfigStore.refreshModelList(targetConfigId)
      const modelIds = models.map(m => m.id)
      
      // 更新可用模型列表
      if (targetConfigId === modelConfigStore.activeConfigId) {
        availableCustomModels.value = modelIds
      }

      // 如果当前配置没有选中模型，自动选第一个
      if (modelIds.length > 0 && !config.default_model) {
        modelConfigStore.updateConfig(targetConfigId, {
          default_model: modelIds[0]
        })
      }
      
    } catch (error: any) {
      fetchModelsError.value = error.message || '获取模型列表失败，请检查配置'
      console.error('获取模型列表失败:', error)
    } finally {
      isFetchingModels.value = false
    }
  }

  // 更新配置
  function updateConfig(configId: string, updates: Partial<ModelConfig>) {
    modelConfigStore.updateConfig(configId, updates)
    
    // 如果更新的是当前激活配置，更新 chatStore 的 customModelConfig
    if (configId === modelConfigStore.activeConfigId) {
      syncToChatStore()
    }
  }

  // 同步当前激活配置到 chatStore（保持向后兼容）
  function syncToChatStore() {
    const activeConfig = modelConfigStore.activeConfig
    if (activeConfig) {
      chatStore.setCustomModelConfig({
        provider: activeConfig.provider,
        api_url: activeConfig.api_url,
        api_key: activeConfig.api_key,
        default_model: activeConfig.default_model
      })
    }
  }

  // 设置激活配置
  function setActiveConfig(configId: string) {
    modelConfigStore.setActive(configId)
    syncToChatStore()
    loadCurrentConfigModels()
  }

  // 添加新配置
  function addConfig() {
    const newConfig = modelConfigStore.addConfig({
      name: `配置 ${modelConfigStore.configs.length + 1}`
    })
    selectedConfigId.value = newConfig.id
    return newConfig
  }

  // 删除配置
  function deleteConfig(configId: string) {
    modelConfigStore.removeConfig(configId)
    if (selectedConfigId.value === configId) {
      selectedConfigId.value = modelConfigStore.configs[0]?.id || null
    }
    syncToChatStore()
    loadCurrentConfigModels()
  }

  // 复制配置
  function duplicateConfig(configId: string) {
    const newConfig = modelConfigStore.duplicateConfig(configId)
    if (newConfig) {
      selectedConfigId.value = newConfig.id
    }
  }

  // 设置默认配置
  function setDefaultConfig(configId: string) {
    modelConfigStore.setDefault(configId)
  }

  async function switchToBuiltinModel() {
    chatStore.setUseCustomModel(false)
    
    isLoadingBuiltinModels.value = true
    try {
      await chatStore.loadModels(true)
    } finally {
      isLoadingBuiltinModels.value = false
    }
  }
  
  async function handleServiceSelect(event: Event) {
    const target = event.target as HTMLSelectElement
    const value = target.value
    
    if (value === 'custom') {
      if (!modelConfigStore.activeConfig?.api_key || !modelConfigStore.activeConfig?.api_url) {
        showCustomModelConfig.value = true
      }
      chatStore.setUseCustomModel(true)
      pendingSwitchToBuiltin.value = false
    } else {
      if (!userStore.isLoggedIn()) {
        pendingSwitchToBuiltin.value = true
        userStore.requireLogin()
        target.value = 'custom'
        return
      }
      await switchToBuiltinModel()
    }
  }
  
  watch(() => userStore.user, async (newUser) => {
    if (newUser && pendingSwitchToBuiltin.value) {
      pendingSwitchToBuiltin.value = false
      await switchToBuiltinModel()
    }
  })

  // 监听激活配置变化，同步到 chatStore
  watch(() => modelConfigStore.activeConfigId, () => {
    syncToChatStore()
    loadCurrentConfigModels()
  })

  // 监听配置变化
  watch(() => modelConfigStore.configs, () => {
    syncToChatStore()
  }, { deep: true })

  // 初始化
  onMounted(() => {
    initialize()
  })
  
  // 向后兼容：旧的 updateCustomModelConfig 函数
  function updateCustomModelConfig(field: string, value: any) {
    if (modelConfigStore.activeConfigId) {
      updateConfig(modelConfigStore.activeConfigId, { [field]: value })
    }
  }

  // 向后兼容：旧的 loadCustomModelsFromStorage 函数
  async function loadCustomModelsFromStorage() {
    await loadCurrentConfigModels()
  }

  return {
    showCustomModelConfig,
    isFetchingModels,
    availableCustomModels,
    fetchModelsError,
    isLoadingBuiltinModels,
    pendingSwitchToBuiltin,
    modelConfigStore,
    selectedConfigId,
    fetchCustomModels,
    updateConfig,
    updateCustomModelConfig, // 向后兼容
    setActiveConfig,
    addConfig,
    deleteConfig,
    duplicateConfig,
    setDefaultConfig,
    handleServiceSelect,
    switchToBuiltinModel,
    initialize,
    loadCustomModelsFromStorage // 向后兼容
  }
}
