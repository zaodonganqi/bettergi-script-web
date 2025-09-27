<script setup>
import {ref, watch, onMounted} from 'vue';
import {getThemeByName, getThemeName, setTheme} from './styles/theme'
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
// 从localStorage读取语言，如果没有则使用i18n的当前语言
const savedLocale = localStorage.getItem('user-locale');
const selectedLocale = ref(savedLocale || locale.value);
console.log(selectedLocale.value);

// 确保i18n的语言设置与localStorage同步
if (savedLocale && savedLocale !== locale.value) {
  locale.value = savedLocale;
  selectedLocale.value = savedLocale;
}

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

onMounted(() => {
  // 确保在组件挂载时正确设置语言
  const savedLocale = localStorage.getItem('user-locale');
  
  if (savedLocale && savedLocale !== locale.value) {
    locale.value = savedLocale;
    selectedLocale.value = savedLocale;
  }
  currentAntdLocale.value = antdLocales[selectedLocale.value] || zhCN;
});

// antd 主题对象
const selectedThemeName = ref(getThemeName());
console.log(selectedThemeName.value);
const antdTheme = ref(getThemeByName(selectedThemeName));

function handleThemeNameChange(name) {
  selectedThemeName.value = name;
}

// 当主题变化时，自动写入 CSS 变量
watch(selectedThemeName, (name) => {
  setTheme(name);
  antdTheme.value = getThemeByName(name);
}, { immediate: true, deep: true })

</script>

<template>
  <a-config-provider :locale="currentAntdLocale" :theme="antdTheme">
    <LayoutMain
        :selected-locale="selectedLocale"
        :handle-locale-change="handleLocaleChange"
        :selected-theme-name="selectedThemeName"
        :handle-theme-name-change="handleThemeNameChange"
    ></LayoutMain>
  </a-config-provider>
</template>

<style>
:root {
  --color-primary: #1677ff;
  --border-base: #d9d9d9;
  --text-base: #141414FF;
  --text-base2: #666;
  --text-base3: #999;
  --text-base4: #bbb;
  --text-light: #ffffff;
  --bg-container: #ffffff;
  --bg-menu: #ffffff;
  --bg-item-selected: #e6f4ff;
  --bg-shadow-light: #1677ff14;
  --bg-desc: #f8fbff;
  --color-shadow: #e6f0ff;
  --color-update: #52c41a;
  --text-error: #ff4d4f;
}

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
</style>
