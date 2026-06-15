<script setup lang="ts">
import { useAttrs, useSlots, computed } from "vue";
import TableCellContextProvider from "./TableCellContextProvider.vue";
import CellRenderer from "./CellRenderer.vue";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const slots = useSlots();

/**
 * 需要透传给内部 a-table 的插槽名。
 * 排除 default（单独处理）和 bodyCell_* 开头的插槽（由 #bodyCell 分发逻辑消费）。
 * 其余如 title、footer、summary、emptyText、headerCell 等全部透传。
 */
const forwardedSlotNames = computed(() =>
  Object.keys(slots).filter(
    (name) => name !== "default" && !name.startsWith("bodyCell_"),
  ),
);

/**
 * 包装 columns：
 * 1. 剥离 render 字符串，转为 __renderCode 供 #bodyCell 模板使用
 * 2. 有 bodyCell_* 插槽的列同时剥离 __renderCode，插槽优先
 * 3. 其余列原样透传
 *
 * 不在 column 上直接放 render 函数：当 #bodyCell 插槽存在时，
 * a-table 的内部渲染行为不可控（VNode 会被塞进 text 导致 JSON 循环引用）。
 */
const wrappedColumns = computed(() => {
  const rawColumns = (attrs as Record<string, unknown>).columns;
  if (!Array.isArray(rawColumns)) return undefined;

  return rawColumns.map((col: Record<string, unknown>) => {
    const slotKey = `bodyCell_${col.key || col.dataIndex}`;
    const hasSlot = slotKey in slots;

    const { render: _render, ...rest } = col;

    // bodyCell_* 插槽优先：不注入 __renderCode，让插槽处理渲染
    if (hasSlot) {
      return rest;
    }

    // render 字符串存在时，转为 __renderCode 供 CellRenderer 消费
    if (typeof _render === "string" && _render.trim()) {
      return { ...rest, __renderCode: _render };
    }

    return rest;
  });
});

/** 排除 columns 后的其余 attrs，用于向内部 a-table 透传 */
const forwardedAttrs = computed(() => {
  const { columns: _columns, ...rest } = attrs as Record<string, unknown>;
  return rest;
});
</script>

<template>
  <a-table v-bind="forwardedAttrs" :columns="wrappedColumns">
    <!-- 转发 default 插槽到内部 a-table -->
    <template v-if="slots.default" #default>
      <slot name="default" />
    </template>

    <!--
      #bodyCell 分发优先级：
      1. bodyCell_* 插槽存在 → 渲染插槽内容（TableCellContextProvider 包裹）
      2. column.__renderCode 存在 → 通过 CellRenderer 执行代码并渲染
      3. 其他 → 显示原始 text
    -->
    <template #bodyCell="{ column, text, record, index }">
      <template v-if="slots[`bodyCell_${column.key || column.dataIndex}`]">
        <TableCellContextProvider
          :context="{ column, text, record, index }"
        >
          <slot :name="`bodyCell_${column.key || column.dataIndex}`" />
        </TableCellContextProvider>
      </template>
      <template v-else-if="column.__renderCode">
        <CellRenderer
          :render-code="column.__renderCode"
          :text="text"
          :record="record"
          :index="index"
        />
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
    <template v-for="name in forwardedSlotNames" :key="name" #[name]="scope">
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
