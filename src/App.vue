<script setup>
import { ref, watch } from 'vue';
import LayoutMain from './components/LayoutMain.vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import zhTW from 'ant-design-vue/es/locale/zh_TW';
import enUS from 'ant-design-vue/es/locale/en_US';
import jaJP from 'ant-design-vue/es/locale/ja_JP';
import frFR from 'ant-design-vue/es/locale/fr_FR';
import { useI18n } from 'vue-i18n';

const antdLocales = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': enUS,
  'ja-JP': jaJP,
  'fr-FR': frFR
};

const { locale } = useI18n();
// 优先从localStorage读取语言
const savedLocale = localStorage.getItem('user-locale');
const selectedLocale = ref(savedLocale || locale.value);
const currentAntdLocale = ref(antdLocales[selectedLocale.value] || zhCN);

watch(selectedLocale, (newLocale) => {
  locale.value = newLocale;
  currentAntdLocale.value = antdLocales[newLocale] || zhCN;
  // 保存到localStorage
  localStorage.setItem('user-locale', newLocale);
});

function handleLocaleChange(val) {
  selectedLocale.value = val;
}
</script>

<template>
  <a-config-provider :locale="currentAntdLocale">
    <LayoutMain :selected-locale="selectedLocale" :handle-locale-change="handleLocaleChange" />
  </a-config-provider>
</template>

<style>
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
  background: #f0f2f5;
}

.content-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #999;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}
</style>
