<script setup lang="ts">
import { toRef } from 'vue';
import { useProvideTableCellContext, type TableCellContext } from '@/composables/useTableCellContext';

const props = defineProps<{
  context: TableCellContext;
}>();

/**
 * 将 context prop 包装为响应式 ref 后 provide，
 * 确保 a-table 重渲染（如排序、分页）导致 context prop 更新时，
 * 子组件 inject 到的值也能同步变化。
 */
useProvideTableCellContext(toRef(props, 'context'));
</script>

<template>
  <slot />
</template>
