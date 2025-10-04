import { createI18n } from 'vue-i18n'
import zhCN from '../locales/zh-CN.json'
import zhTW from '../locales/zh-TW.json'
import enUS from '../locales/en-US.json'
import jaJP from '../locales/ja-JP.json'
import frFR from '../locales/fr-FR.json'

const savedLocale = localStorage.getItem('user-locale') || 'zh-CN';

export const i18n = createI18n({
	legacy: false,
	locale: savedLocale,
	fallbackLocale: 'zh-CN',
	messages: {
		'zh': zhCN,
		'zh-CN': zhCN,
		'zh-TW': zhTW,
		'en-US': enUS,
		'ja-JP': jaJP,
		'fr-FR': frFR
	}
})


