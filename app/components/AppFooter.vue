<script setup>
import { useSiteConfigInfo } from '@/composables/useSiteConfigInfo'

defineProps({
  version: {
    type: String,
    required: true
  }
})

const { siteName, siteUrl } = useSiteConfigInfo()
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p class="site-info">
        &copy; {{ currentYear }} <a :href="siteUrl" rel="home">{{ siteName }}</a>
      </p>
      <p class="credits-row">
        Designed & Developed by
        <a href="https://cris-dev.com" target="_blank" rel="noopener noreferrer">cris-dev.com</a>
        <span class="separator">|</span>
        Made with 💙 using Vue.js
      </p>
      <p class="version">
        {{ version }}
      </p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  width: 100%;
  padding: 1.5rem 1rem;
  margin-top: auto;
  border-top: 1px solid #e0e0e0;
  background-color: var(--light-body-bg);
  color: var(--light-text);
  box-sizing: border-box;
  position: relative;
  z-index: 10;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.site-info {
  font-size: 0.85rem;
  color: inherit;
  margin: 0;
  opacity: 0.7;
  font-weight: 500;
}

.site-info a {
  color: inherit;
  text-decoration: none;
}

.site-info a:hover {
  color: #42b983;
  text-decoration: underline;
}

.credits-row {
  font-size: 0.9rem;
  color: inherit;
  margin: 0;
  opacity: 0.8;
}

.separator {
  margin: 0 0.5rem;
  opacity: 0.5;
}

.version {
  font-size: 0.8rem;
  color: inherit;
  margin-top: 0.25rem;
  opacity: 0.6;
}

a {
  color: #42b983;
  text-decoration: none;
  font-weight: 600;
}

a:hover {
  text-decoration: underline;
}

:global(.dark-mode) .app-footer {
  background-color: var(--dark-body-bg);
  border-color: #2d3748;
  color: var(--dark-text);
}
</style>

