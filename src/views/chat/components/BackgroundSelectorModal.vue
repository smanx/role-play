<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xl"
    @click.self="$emit('update:visible', false)"
  >
    <div
      class="chat-card flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-theme-border shadow-2xl"
      style="max-height: min(86vh, calc(var(--vh, 1vh) * 86));"
    >
      <header class="flex items-center justify-between border-b border-theme-border bg-[var(--theme-card-hover)]/60 p-4 sm:p-6">
        <div>
          <h2 class="text-lg font-bold text-theme-text-primary sm:text-xl">聊天背景</h2>
          <p class="mt-1 text-xs text-theme-text-secondary">选择角色图片、纯色背景或本地图片</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center rounded-xl text-theme-text-secondary transition-colors hover:bg-[var(--theme-card-hover)] hover:text-theme-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]"
          aria-label="关闭背景选择"
          @click="$emit('update:visible', false)"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div class="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6" data-scrollable="true" style="-webkit-overflow-scrolling: touch;">
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <button
            type="button"
            class="background-option"
            :class="{ selected: currentMode === 'character' }"
            @click="chooseCharacterBackground"
          >
            <span
              class="background-preview"
              :style="characterPreviewUrl
                ? { backgroundImage: `url(${characterPreviewUrl})` }
                : { background: 'linear-gradient(135deg, var(--theme-gradient-start), var(--theme-gradient-end))' }"
            >
              <span v-if="!characterPreviewUrl" class="preview-placeholder">角色</span>
            </span>
            <span class="background-label">角色背景</span>
          </button>

          <button
            type="button"
            class="background-option"
            :class="{ selected: currentMode === 'none' }"
            @click="choosePlainBackground"
          >
            <span class="background-preview plain-preview"></span>
            <span class="background-label">主题纯色</span>
          </button>

          <div
            v-for="background in backgrounds"
            :key="background.name"
            class="background-option group"
            :class="{ selected: currentMode === 'custom' && selectedBackground === background.name }"
          >
            <button
              type="button"
              class="block w-full text-left"
              @click="chooseCustomBackground(background.name)"
            >
              <span class="background-preview" :style="{ backgroundImage: `url(${background.url})` }"></span>
              <span class="background-label block truncate" :title="background.name">{{ background.name }}</span>
            </button>
            <button
              type="button"
              class="delete-background"
              :aria-label="`删除背景 ${background.name}`"
              @click.stop="deleteBackground(background.name)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <label class="upload-option" :class="{ disabled: isUploading }">
            <input type="file" accept="image/*" class="hidden" :disabled="isUploading" @change="uploadBackground" />
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--theme-primary)]/10 text-theme-text-accent">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <span class="mt-2 text-sm font-semibold text-theme-text-primary">{{ isUploading ? '处理中…' : '添加图片' }}</span>
            <span class="mt-1 text-xs text-theme-text-secondary">保存在当前浏览器</span>
          </label>
        </div>

        <p v-if="errorMessage" class="mt-4 rounded-xl bg-[var(--theme-danger-bg)] px-4 py-3 text-sm text-[var(--theme-danger)]">
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import {
  addBackground,
  getBackgroundUrl,
  listBackgrounds,
  removeBackground,
  selectBackground,
  selectBackgroundMode,
  type BackgroundMode,
} from '@/utils/backgroundService'

interface BackgroundOption {
  name: string
  url: string
}

const props = defineProps<{
  visible: boolean
  currentMode: BackgroundMode
  selectedBackground: string | null
  characterPreviewUrl: string | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'backgroundChanged'): void
}>()

const backgrounds = ref<BackgroundOption[]>([])
const isUploading = ref(false)
const errorMessage = ref('')
let backgroundsLoadVersion = 0

function releaseBackgroundUrls() {
  for (const background of backgrounds.value) {
    URL.revokeObjectURL(background.url)
  }
  backgrounds.value = []
}

async function refreshBackgrounds() {
  const loadVersion = ++backgroundsLoadVersion
  releaseBackgroundUrls()
  const names = await listBackgrounds()
  const options = await Promise.all(names.map(async name => ({
    name,
    url: await getBackgroundUrl(name),
  })))

  const loadedBackgrounds = options.filter((item): item is BackgroundOption => Boolean(item.url))
  if (loadVersion !== backgroundsLoadVersion || !props.visible) {
    for (const background of loadedBackgrounds) URL.revokeObjectURL(background.url)
    return
  }

  backgrounds.value = loadedBackgrounds
}

async function chooseCharacterBackground() {
  await selectBackgroundMode('character')
  emit('backgroundChanged')
}

async function choosePlainBackground() {
  await selectBackgroundMode('none')
  emit('backgroundChanged')
}

async function chooseCustomBackground(name: string) {
  await selectBackground(name)
  emit('backgroundChanged')
}

async function uploadBackground(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  if (!file.type.startsWith('image/')) {
    errorMessage.value = '请选择有效的图片文件'
    return
  }

  isUploading.value = true
  errorMessage.value = ''

  try {
    await addBackground(file.name, file)
    const safeName = file.name.replace(/[^a-zA-Z0-9_\-.]/g, '_')
    await selectBackground(safeName)
    await refreshBackgrounds()
    emit('backgroundChanged')
  } catch (error) {
    console.error('Failed to add background:', error)
    errorMessage.value = '添加背景失败，请尝试选择尺寸更小的图片'
  } finally {
    isUploading.value = false
  }
}

async function deleteBackground(name: string) {
  try {
    await removeBackground(name)
    await refreshBackgrounds()
    emit('backgroundChanged')
  } catch (error) {
    console.error('Failed to delete background:', error)
    errorMessage.value = '删除背景失败，请稍后重试'
  }
}

watch(
  () => props.visible,
  async visible => {
    errorMessage.value = ''
    if (visible) {
      try {
        await refreshBackgrounds()
      } catch (error) {
        console.error('Failed to load backgrounds:', error)
        errorMessage.value = '背景列表加载失败'
      }
    } else {
      backgroundsLoadVersion++
      releaseBackgroundUrls()
    }
  },
)

onUnmounted(() => {
  backgroundsLoadVersion++
  releaseBackgroundUrls()
})
</script>

<style scoped>
.background-option,
.upload-option {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 2px solid var(--theme-border);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--theme-card-bg) 78%, transparent);
  cursor: pointer;
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.background-option:hover,
.upload-option:hover {
  border-color: color-mix(in srgb, var(--theme-primary) 65%, var(--theme-border));
  transform: translateY(-2px);
}

.background-option:focus-visible,
.upload-option:focus-within {
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-primary) 28%, transparent);
}

.background-option.selected {
  border-color: var(--theme-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-primary) 24%, transparent);
}

.background-preview {
  display: flex;
  width: 100%;
  aspect-ratio: 4 / 3;
  align-items: center;
  justify-content: center;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.plain-preview {
  background: linear-gradient(135deg, var(--theme-bg-start), var(--theme-bg-middle), var(--theme-bg-end));
}

.preview-placeholder {
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.background-label {
  display: block;
  padding: 0.65rem 0.75rem;
  color: var(--theme-text-primary);
  font-size: 0.8rem;
  font-weight: 650;
}

.delete-background {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--theme-danger) 84%, transparent);
  color: white;
  opacity: 0;
  transition: opacity 160ms ease, transform 160ms ease;
}

.background-option:hover .delete-background,
.delete-background:focus-visible {
  opacity: 1;
}

.delete-background:active {
  transform: scale(0.94);
}

.upload-option {
  display: flex;
  min-height: 9rem;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 1rem;
  border-style: dashed;
}

.upload-option.disabled {
  cursor: wait;
  opacity: 0.55;
}

@media (hover: none) {
  .delete-background {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .background-option,
  .upload-option,
  .delete-background {
    transition: none;
  }
}
</style>
