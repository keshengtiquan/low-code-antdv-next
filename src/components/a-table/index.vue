<script setup lang="ts">
import { useAttrs, useSlots, computed } from 'vue';
import TableCellContextProvider from './TableCellContextProvider.vue';

defineOptions({ inheritAttrs: false });

/** 透传所有 props（columns、dataSource、border、height 等）到内部 a-table */
const attrs = useAttrs();
const slots = useSlots();

/**
 * 需要透传给内部 a-table 的插槽名。
 * 排除 default（单独处理）和 bodyCell_* 开头的插槽（由 #bodyCell 分发逻辑消费）。
 * 其余如 title、footer、summary、emptyText、headerCell 等全部透传。
 */
const forwardedSlotNames = computed(() =>
  Object.keys(slots).filter(
    (name) => name !== 'default' && !name.startsWith('bodyCell_'),
  ),
);
</script>

<template>
  <a-table v-bind="attrs">
    <!-- 转发 default 插槽到内部 a-table -->
    <template v-if="slots.default" #default>
      <slot name="default" />
    </template>

    <!--
      #bodyCell scoped slot 分发：
      根据 column.key 动态查找是否存在对应的独立插槽（如 bodyCell_tags），
      如果存在则用 TableCellContextProvider 包裹并渲染插槽内容，
      如果不存在则直接显示 text 文本。
    -->
    <template #bodyCell="{ column, text, record, index }">
      <template v-if="slots[`bodyCell_${column.key || column.dataIndex}`]">
        <TableCellContextProvider
          :context="{ column, text, record, index }"
        >
          <slot :name="`bodyCell_${column.key || column.dataIndex}`" />
        </TableCellContextProvider>
      </template>
      <template v-else>
        {{ text }}
      </template>
    </template>

    <!--
      动态透传其余所有插槽（title、footer、summary、emptyText、
      headerCell、expandedRowRender、filterDropdown、filterIcon 等）。
      通过 v-bind 将 a-table 的 scoped slot props 原样传出。
    -->
    <template
      v-for="name in forwardedSlotNames"
      :key="name"
      #[name]="scope"
    >
      <slot :name="name" v-bind="scope ?? {}" />
    </template>

    <!-- 显式转发 title / footer / summary 插槽，确保它们始终被透传 -->
    <template v-if="slots.title" #title="data">
      <slot name="title" v-bind="data ?? {}" />
    </template>
    <template v-if="slots.footer" #footer="data">
      <slot name="footer" v-bind="data ?? {}" />
    </template>
    <template v-if="slots.summary" #summary="data">
      <slot name="summary" v-bind="data ?? {}" />
    </template>
  </a-table>
</template>
