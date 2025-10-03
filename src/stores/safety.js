import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSafetyStore = defineStore('safety', () => {
	const pendingThemeName = ref(null)
	const showSafetyModal = ref(false)

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

	return {
		pendingThemeName,
		showSafetyModal,
		requestSafetyConfirm,
		confirmSafety,
		cancelSafety
	}
})


