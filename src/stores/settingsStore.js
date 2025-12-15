import { defineStore } from 'pinia'
import { computed, ref, watch, nextTick } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import zhTW from 'ant-design-vue/es/locale/zh_TW';
import enUS from 'ant-design-vue/es/locale/en_US';
import jaJP from 'ant-design-vue/es/locale/ja_JP';
import frFR from 'ant-design-vue/es/locale/fr_FR';
import { i18n } from '@/utils/i18n.js'
import { getThemeByName, getThemeName, setTheme, antdThemes } from '@/styles/theme.js'
import { message as Message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { set, get, del } from 'idb-keyval'

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

	// 获取主题列表
	const themeList = computed(() => {
		return Object.keys(antdThemes).map(key => ({
			key,
			name: antdThemes[key]?.name || { [selectedLocale.value]: key }
		}));
	});

	function setThemeName(name) {
		// 追踪主题切换
		if (typeof window.gtag === 'function') {
			window.gtag("event", "UI-Settings", {
				select_Theme: name
			});
		}
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

	// 自定义背景
	const customBackgroundBase64 = ref(null);
	const CUSTOM_BG_KEY = 'custom-background';

	// 将文件转换为base64
	function fileToBase64(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	// 保存自定义背景到IndexedDB
	async function saveCustomBackground(base64Data) {
		try {
			await set(CUSTOM_BG_KEY, base64Data);
			customBackgroundBase64.value = base64Data;
			applyCustomBackground();
			Message.success($t('settings.customBackgroundSaved'));
		} catch (error) {
			Message.error($t('settings.customBackgroundSaveFailed'));
		}
	}

	// 从IndexedDB加载自定义背景
	async function loadCustomBackground() {
		try {
			const data = await get(CUSTOM_BG_KEY);
			if (data) {
				customBackgroundBase64.value = data;
				applyCustomBackground();
			}
		} catch (error) {
			console.error('Load background error:', error);
		}
	}

	// 应用自定义背景到页面
	function applyCustomBackground() {
		if (customBackgroundBase64.value) {
			const appElement = document.getElementById('app');
			if (appElement) {
				appElement.style.backgroundImage = `url(${customBackgroundBase64.value})`;
				appElement.style.backgroundSize = 'cover';
				appElement.style.backgroundPosition = 'center';
				appElement.style.backgroundRepeat = 'no-repeat';
				appElement.style.backgroundAttachment = 'fixed';
			}
		}
	}

	// 清除自定义背景
	async function clearCustomBackground() {
		try {
			await del(CUSTOM_BG_KEY);
			customBackgroundBase64.value = null;
			const appElement = document.getElementById('app');
			if (appElement) {
				appElement.style.backgroundImage = '';
			}
		} catch (error) {
			Message.error($t('settings.customBackgroundClearFailed'));
		}
	}

	// 处理文件上传
	async function handleFileUpload(file) {
		if (!file) return;
		
		// 检查文件类型
		if (!file.type.startsWith('image/')) {
			Message.error($t('settings.invalidImageFile'));
			return;
		}

		// 检查文件大小（限制为50MB）
		if (file.size > 50 * 1024 * 1024) {
			Message.error($t('settings.imageFileTooLarge'));
			return;
		}

		try {
			const base64Data = await fileToBase64(file);
			await saveCustomBackground(base64Data);
		} catch (error) {
			console.error('文件上传失败:', error);
			Message.error($t('settings.fileUploadFailed'));
		}
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
				Message.success($t('settings.clearUpdateSuccess'), 2);
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
		themeList,
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
		handleClearUpdate,
		updateAllScriptsHasUpdate,
		// 自定义背景
		customBackgroundBase64,
		loadCustomBackground,
		handleFileUpload,
		clearCustomBackground,
	}
})


