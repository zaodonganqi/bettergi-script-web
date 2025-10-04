import { defineStore } from 'pinia'
import { computed, ref, watch, nextTick } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import zhTW from 'ant-design-vue/es/locale/zh_TW';
import enUS from 'ant-design-vue/es/locale/en_US';
import jaJP from 'ant-design-vue/es/locale/ja_JP';
import frFR from 'ant-design-vue/es/locale/fr_FR';
import { i18n } from '@/utils/i18n.js'
import { getThemeByName, getThemeName, setTheme } from '@/styles/theme.js'
import { message as Message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'

const antdLocales = {
	'zh-CN': zhCN,
	'zh-TW': zhTW,
	'en-US': enUS,
	'ja-JP': jaJP,
	'fr-FR': frFR
};

const savedLocale = localStorage.getItem('user-locale');

export const useSettingsStore = defineStore('settings', () => {
	const { t: $t } = useI18n();
	
	const showSettingsModal = ref(false);

	// 语言
	const selectedLocale = ref(savedLocale || i18n.global.locale.value);
	const currentAntdLocale = computed(() => antdLocales[selectedLocale.value] || zhCN);

	function setLocale(newLocale) {
		selectedLocale.value = newLocale
	}

	watch(selectedLocale, (newLocale) => {
		// 同步到 i18n 全局与 localStorage
		i18n.global.locale.value = newLocale
		try { localStorage.setItem('user-locale', newLocale) } catch (_) {}
	}, { immediate: true });

	// 主题
	const selectedThemeName = ref(getThemeName());
	const antdTheme = ref(getThemeByName(selectedThemeName.value));

	function setThemeName(name) {
		selectedThemeName.value = name
	}

	function useTheme() {
		const name = confirmSafety();
		if (name) {
			setThemeName(name);
			showSafetyModal.value = false;
		}
	}

	// 主题切换（拦截 egg）
	function onThemeChange(name) {
		if (name === 'egg') {
			requestSafetyConfirm(name);
			return;
		}
		setThemeName(name);
		showSettingsModal.value = false;
	}

	watch(selectedThemeName, (name) => {
		setTheme(name)
		antdTheme.value = getThemeByName(name)
	}, { immediate: true })

	// 彩蛋安全确认
	const pendingThemeName = ref(null);
	const showSafetyModal = ref(false);

	function requestSafetyConfirm(themeName) {
		pendingThemeName.value = themeName;
		showSafetyModal.value = true;
	}

	function confirmSafety() {
		showSafetyModal.value = false;
		const name = pendingThemeName.value;
		pendingThemeName.value = null;
		return name;
	}

	function cancelSafety() {
		showSafetyModal.value = false;
		pendingThemeName.value = null;
	}

	// 更新信息汇总弹窗显示状态
	const showUpdateMessageModal = ref(false);
	
	// 清除更新提示红点
	const clearUpdateLoading = ref(false);

	function setClearUpdateLoading() {
		clearUpdateLoading.value = !clearUpdateLoading.value;
	}

	// 清除更新提示
	const handleClearUpdate = async (mainStore) => {
		const isModeSingle = import.meta.env.VITE_MODE === 'single';
		if (!isModeSingle) return;

		clearUpdateLoading.value = true;
		try {
			const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
			const result = await repoWebBridge.ClearUpdate();

			if (result) {
				// 清除成功，更新所有脚本的hasUpdate状态
				updateAllScriptsHasUpdate(mainStore, false);
				// 显示成功消息
				Message.success($t('settings.clearUpdateSuccess'));
			} else {
				// 清除失败
				Message.error($t('settings.clearUpdateFailed'));
			}
		} catch (error) {
			console.error('ClearUpdate failed:', error);
			Message.error($t('settings.clearUpdateFailed'));
		} finally {
			clearUpdateLoading.value = false;
			showUpdateMessageModal.value = false;
		}
	};

	// 更新所有脚本的hasUpdate状态
	const updateAllScriptsHasUpdate = (mainStore, hasUpdate) => {
		if (!mainStore.repoData || !mainStore.repoData.indexes) return;

		const updateNodeHasUpdate = (nodes) => {
			for (let node of nodes) {
				if (node.children && node.children.length > 0) {
					// 如果是目录，递归更新
					updateNodeHasUpdate(node.children);
					node.hasUpdate = hasUpdate;
				} else {
					// 如果是文件，更新hasUpdate状态
					node.hasUpdate = hasUpdate;
				}
			}
		};

		// 更新所有类型的脚本
		mainStore.repoData.indexes.forEach(index => {
			if (index.children) {
				updateNodeHasUpdate(index.children);
			}
		});

		// 强制触发响应式更新
		nextTick(() => {
			mainStore.repoData = {...mainStore.repoData};
		});
	};

	return {
		showSettingsModal,
		// 语言
		selectedLocale,
		currentAntdLocale,
		setLocale,
		// 主题
		selectedThemeName,
		antdTheme,
		useTheme,
		onThemeChange,
		// 彩蛋安全
		pendingThemeName,
		showSafetyModal,
		cancelSafety,
		// 更新信息弹窗
		showUpdateMessageModal,
		// 清除更新提示
		clearUpdateLoading,
		setClearUpdateLoading,
		handleClearUpdate,
		updateAllScriptsHasUpdate,
	}
})


