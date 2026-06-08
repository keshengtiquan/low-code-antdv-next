<script setup lang="ts">
defineProps<{
  slotName: string;
  parentNodeId: string;
  parentSelected: boolean;
  compact?: boolean;
}>();
</script>

<template>
  <div
    :data-slot-name="slotName"
    :data-drop-parent-id="parentNodeId"
    class="slot-placeholder"
    :class="{
      'slot-placeholder--selected': parentSelected,
      'slot-placeholder--compact': compact,
    }"
  >
    <span class="slot-placeholder__label">{{ compact ? '' : slotName }}</span>
    <span v-if="parentSelected" class="slot-placeholder__hint">{{ compact ? '拖入到此处' : '拖入组件' }}</span>
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

.slot-placeholder--compact {
  min-height: 16px;
  padding: 2px 8px;
  border-style: dashed;
  border-color: transparent;
  background: transparent;
  transition: border-color 0.2s, background-color 0.2s, min-height 0.2s;
}
.slot-placeholder--compact.slot-placeholder--selected {
  min-height: 28px;
  border-color: #b3d8ff;
  background-color: rgba(24, 144, 255, 0.03);
}
.slot-placeholder--compact .slot-placeholder__hint {
  font-size: 11px;
  color: #91caff;
}
</style>
