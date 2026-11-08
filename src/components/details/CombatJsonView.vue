<template>
  <div class="combat-json-view">
    <div v-if="parsed.preActions.length" class="cj-pre">
      <span class="cj-pre-title">{{ $t('detail.combatPreActions') }}</span>
      <span class="cj-pre-body">
        <template v-for="(p, i) in parsed.preActions" :key="i">
          <span v-if="i" class="cj-pre-sep">→</span>
          <span class="cj-pre-step" :title="p.raw">{{ p.text }}</span>
        </template>
      </span>
    </div>

    <div class="cj-hint">{{ $t('detail.combatOrderHint') }}</div>

    <a-table
        class="cj-table"
        :columns="columns"
        :data-source="parsed.rows"
        :pagination="false"
        :scroll="{ y: 520 }"
        :row-class-name="rowClassName"
        size="small"
        row-key="key"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'priority'">
          <span class="cj-prio">{{ record.priority }}</span>
          <span v-if="record.isExtra" class="cj-tag">{{ $t('detail.combatExtra') }}</span>
        </template>
        <template v-else-if="column.key === 'character'">
          <span v-if="record.character">{{ record.character }}</span>
          <span v-else class="cj-empty">{{ $t('detail.combatUniversal') }}</span>
        </template>
        <template v-else-if="column.key === 'condition'">
          <span v-if="record.conditionText" :title="record.condition">{{ record.conditionText }}</span>
          <span v-else class="cj-pill">{{ $t('detail.combatAlways') }}</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <span :title="record.action">
            <span v-if="record.actionName" class="cj-name">{{ record.actionName }}</span>
            <span v-if="record.actionText" class="cj-steps">{{ record.actionText }}</span>
            <span v-else-if="!record.actionName" class="cj-empty">—</span>
          </span>
          <span v-if="record.ensureCast" class="cj-badge">{{ $t('detail.combatEnsureCast') }}</span>
          <span v-if="record.isExtra" class="cj-same">
            {{ $t('detail.combatSameAction', {index: record.ownIndex}) }}
          </span>
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
const parsed = computed(() => buildCombatRows(dataRef.value));

const rowClassName = (record) => (record.isExtra ? 'cj-row-extra' : '');

const columns = computed(() => [
  {title: $t('detail.combatPriority'), dataIndex: 'priority', key: 'priority', width: 96},
  {title: $t('detail.combatCharacter'), dataIndex: 'character', key: 'character', width: 110},
  {title: $t('detail.combatCondition'), dataIndex: 'conditionText', key: 'condition'},
  {title: $t('detail.combatAction'), dataIndex: 'actionText', key: 'action'}
]);
</script>

<style scoped>
.combat-json-view {
  padding: 12px 0 4px;
}

.cj-hint {
  color: #98a1ad;
  font-size: 12px;
  padding: 0 0 8px;
}

.cj-pre {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 8px 12px;
  margin-bottom: 10px;
  background: #f7f8fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.cj-pre-title {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

.cj-pre-body {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.cj-pre-step {
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 6px;
  padding: 0 8px;
  font-size: 12.5px;
  line-height: 22px;
}

.cj-pre-sep {
  color: #b8bec8;
}

.cj-table :deep(.ant-table-cell) {
  vertical-align: top;
}

.cj-table :deep(.ant-table-thead > tr > th) {
  font-weight: 500;
}

.cj-table :deep(.cj-row-extra > td) {
  background: #fdf8f0;
}

.cj-table :deep(.cj-row-extra > td:first-child) {
  box-shadow: inset 3px 0 0 #c9762a;
}

.cj-prio {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 12.5px;
  color: #6f6b78;
}

.cj-tag {
  display: inline-block;
  margin-left: 6px;
  padding: 0 6px;
  border-radius: 4px;
  background: #fbeee2;
  color: #c9762a;
  font-size: 11px;
  line-height: 17px;
}

.cj-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 0 7px;
  border-radius: 5px;
  background: #eaf3fb;
  color: #2b6ea8;
  font-size: 11.5px;
  line-height: 18px;
}

.cj-same {
  margin-left: 8px;
  color: #b9b6bf;
  font-size: 12px;
}

.cj-name {
  display: inline-block;
  margin-right: 8px;
  color: #4b4653;
  font-size: 12.5px;
}

.cj-steps {
  color: #2f7d5d;
}

.cj-row-extra .cj-steps {
  color: #6f9c88;
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
