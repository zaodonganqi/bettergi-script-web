<script setup>
import { ref } from 'vue';
import LayoutMain from './components/LayoutMain.vue';
import ScriptListPanel from './components/ScriptListPanel.vue';
import ScriptDetail from './components/ScriptDetail.vue';

const selectedScript = ref(null);

const handleScriptSelect = (script) => {
  selectedScript.value = script;
};
</script>

<template>
  <LayoutMain>
    <template #script-list="{ searchKey }">
      <ScriptListPanel :search-key="searchKey" @select="handleScriptSelect" />
    </template>
    <template #content>
      <ScriptDetail :script="selectedScript" />
    </template>
  </LayoutMain>
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
