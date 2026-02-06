<script setup lang="ts">
import { TvButton } from '@todovue/tv-ui'
import type { AppErrorLike } from '@/types/views'

const { t } = useI18n()

const props = withDefaults(defineProps<{ error?: AppErrorLike }>(), {
  error: () => ({ statusCode: 404, message: 'Page Not Found' })
})

const handleError = (redirect: string): void => {
  clearError({ redirect })
}

const is404 = computed(() => props.error?.statusCode === 404)
const title = computed(() => is404.value ? '404' : '500')
const description = computed(() => is404.value ? t('errorPage.404.title') : t('errorPage.500.title'))
const message = computed(() => is404.value
  ? t('errorPage.404.description')
  : t('errorPage.500.description'))

</script>

<template>
  <NuxtLayout name="default">
    <div class="flex justify-center items-center min-h-[60vh] p-8 transition-colors duration-300 ease-in-out">
      <div class="max-w-2xl text-center animation-fade-in">
        <h1 class="text-9xl leading-none font-bold mb-4 text-primary opacity-0 animation-fade-in">{{ title }}</h1>
        <h2 class="text-4 mb-4 font-semibold opacity-0 animation-fade-in">{{ description }}</h2>
        <p class="text-2 mb-4 opacity-0 animation-fade-in">{{ message }}</p>

        <div class="opacity-0 animation-fade-in flex gap-4 justify-center">
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
