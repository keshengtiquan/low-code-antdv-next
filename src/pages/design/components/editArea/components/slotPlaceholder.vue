<script setup lang="ts">
defineProps<{
  slotName: string;
  parentNodeId: string;
  parentSelected: boolean;
}>();
</script>

<template>
  <div
    :data-slot-name="slotName"
    :data-drop-parent-id="parentNodeId"
    class="slot-placeholder"
    :class="{ 'slot-placeholder--selected': parentSelected }"
  >
    <span class="slot-placeholder__label">{{ slotName }}</span>
    <span v-if="parentSelected" class="slot-placeholder__hint">拖入组件</span>
  </div>
</template>

<style scoped>
.slot-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 32px;
  min-width: 60px;
  padding: 4px 12px;
  border: 2px dashed #d9d9d9;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.02);
  cursor: default;
  box-sizing: border-box;
  transition: border-color 0.2s, background-color 0.2s;
}
.slot-placeholder__label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}
.slot-placeholder__hint {
  font-size: 11px;
  color: #bbb;
}
/* .slot-placeholder--selected {
  border-color: #1890ff;
  background-color: rgba(24, 144, 255, 0.04);
}
.slot-placeholder--selected .slot-placeholder__label {
  color: #1890ff;
} */
</style>
