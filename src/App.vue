<script setup>
import LayoutMain from './components/LayoutMain.vue';
import { useSettingsStore } from '@/stores/settingsStore.js'
import {onMounted} from "vue";

const settings = useSettingsStore();

onMounted(() => {
  console.log(settings.selectedLocale);
  // 追踪语言选择
  if (typeof window.gtag === 'function') {
    window.gtag("event", "UI-Settings", {
      select_language: settings.selectedLocale,
      selected_theme: settings.selectedThemeName
    });
  }
  console.log(settings.selectedThemeName);
});
</script>

<template>
  <a-config-provider :locale="settings.currentAntdLocale" :theme="settings.antdTheme">
    <LayoutMain />
  </a-config-provider>
  
</template>

<style>
::-webkit-scrollbar-track {
  display: none;
  padding: 10px 0;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background-color: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--text-base3);
  border-radius: 20px;
}

header {
  line-height: 1.5;
  max-height: 100vh;
}

body {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background: transparent;
}

#app {
  width: 100%;
  height: 100%;
}
</style>
