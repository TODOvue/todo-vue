<script setup>
import { TvButton } from '@todovue/tv-button'

const { t } = useI18n()

const props = defineProps({
  error: {
    type: Object,
    required: false,
    default: () => ({ statusCode: 404, message: 'Page Not Found' })
  }
})

const handleError = (redirect) => {
  clearError({ redirect })
}

const is404 = computed(() => props.error?.statusCode === 404)
const title = computed(() => is404.value ? '404' : '500')
const description = computed(() => is404.value ? t('errorPage.404.title') : t('errorPage.500.title'))
const message = computed(() => is404.value
  ? t('errorPage.404.description')
  : t('errorPage.500.description'))

const isDarkMode = ref(false)
onMounted(() => {
  if (import.meta.client) {
    isDarkMode.value = document.documentElement.className.includes('dark-mode')
  }
})
</script>

<template>
  <NuxtLayout name="default">
    <div class="error-container">
      <div class="error-content">
        <h1 class="error-code">{{ title }}</h1>
        <h2 class="error-title">{{ description }}</h2>
        <p class="error-message">{{ message }}</p>

        <div class="action-button">
          <TvButton
            rounded
            @click="handleError('/')"
          >
            {{ t('errorPage.homeButton') }}
          </TvButton>
          <TvButton
            rounded
            variant="info"
            @click="handleError('/blog')"
          >
            {{ t('errorPage.blogButton') }}
          </TvButton>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.error-content {
  text-align: center;
  max-width: 600px;
  animation: fadeIn 0.8s ease-out forwards;
}

.error-code {
  font-size: 8rem;
  line-height: 1;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--button-bg);
  opacity: 0;
  animation: floatUp 0.8s ease-out 0.2s forwards;
}

.error-title {
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
  opacity: 0;
  animation: floatUp 0.8s ease-out 0.4s forwards;
}

.error-message {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.8;
  animation: floatUp 0.8s ease-out 0.6s forwards;
}

.action-button {
  opacity: 0;
  animation: fadeIn 0.8s ease-out 0.8s forwards;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@keyframes floatUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
