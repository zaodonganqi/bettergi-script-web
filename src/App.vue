<script setup>
import LayoutMain from './components/LayoutMain.vue';
import ScriptListPanel from './components/ScriptListPanel.vue';
</script>

<template>
  <LayoutMain>
    <ScriptListPanel />
  </LayoutMain>
</template>

<style>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

</style>
