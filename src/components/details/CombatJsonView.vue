<template>
  <div class="combat-json-view">
    <a-table
        class="cj-table"
        :columns="columns"
        :data-source="rows"
        :pagination="false"
        :scroll="{ y: 520 }"
        size="small"
        row-key="key"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'character'">
          <span v-if="record.character">{{ record.character }}</span>
          <span v-else class="cj-empty">{{ $t('detail.combatUniversal') }}</span>
        </template>
        <template v-else-if="column.key === 'condition'">
          <span v-if="record.conditionText" :title="record.condition">{{ record.conditionText }}</span>
          <span v-else class="cj-pill">{{ $t('detail.combatAlways') }}</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <span :title="record.action">{{ record.actionText }}</span>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import {computed, toRef} from 'vue';
import {useI18n} from 'vue-i18n';
import {buildCombatRows} from '@/utils/combatJson';

const props = defineProps({
  data: {
    type: Object,
    default: null
  }
});

const {t: $t} = useI18n();

const dataRef = toRef(props, 'data');
const rows = computed(() => buildCombatRows(dataRef.value));

const columns = computed(() => [
  {title: 'Index', dataIndex: 'index', key: 'index', width: 80},
  {title: $t('detail.combatCharacter'), dataIndex: 'character', key: 'character', width: 110},
  {title: $t('detail.combatCondition'), dataIndex: 'conditionText', key: 'condition'},
  {title: $t('detail.combatAction'), dataIndex: 'actionText', key: 'action'}
]);
</script>

<style scoped>
.combat-json-view {
  padding: 12px 0 4px;
}

.cj-table :deep(.ant-table-cell) {
  vertical-align: top;
}

.cj-table :deep(.ant-table-thead > tr > th) {
  font-weight: 500;
}

.cj-empty {
  color: #98a1ad;
}

.cj-pill {
  display: inline-block;
  background: #e8f1ff;
  color: #1677ff;
  border-radius: 10px;
  padding: 0 8px;
  font-size: 12px;
  line-height: 19px;
}
</style>
