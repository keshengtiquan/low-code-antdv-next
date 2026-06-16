<script setup lang="ts">
import { useAttrs, useSlots, computed, ref } from "vue";
import TableCellContextProvider from "./TableCellContextProvider.vue";
import CellRenderer from "./CellRenderer.vue";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const slots = useSlots();

/* ======== 运行时数据（defineExpose getter/setter） ======== */

/**
 * 两个内部 ref 存储脚本的运行时覆盖值。
 * defineExpose 用 getter/setter：
 *   - 读：有覆盖值返回覆盖值，否则回退到 attrs 中的静态默认值
 *   - 写：写入覆盖值
 */
const _dataSource = ref<unknown[]>();
const _pagination = ref<Record<string, unknown>>();

defineExpose({
  get dataSource() {
    return (
      _dataSource.value ??
      ((attrs as Record<string, unknown>).dataSource as unknown[] | undefined)
    );
  },
  set dataSource(val: unknown[] | undefined) {
    _dataSource.value = val;
  },
  get pagination() {
    return (
      _pagination.value ??
      ((attrs as Record<string, unknown>).pagination as
        | Record<string, unknown>
        | undefined)
    );
  },
  set pagination(val: Record<string, unknown> | undefined) {
    _pagination.value = val;
  },
});


/* ======== 插槽透传 ======== */

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

/* ======== columns 包装 ======== */

/** columns 原始数组，供 wrappedColumns 和 generateMockData 共用 */
const rawColumns = computed(
  () => (attrs as Record<string, unknown>).columns as Record<string, unknown>[] | undefined,
);

/**
 * 递归包装单列：
 * 1. 剥离 render 字符串 → __renderCode
 * 2. 剥离 onFilter/sorter 字符串，编译为函数
 * 3. 有 bodyCell_* 插槽的列剥离 __renderCode，插槽优先
 * 4. 有 children 时递归处理子列
 */
function wrapColumn(col: Record<string, unknown>): Record<string, unknown> {
  const slotKey = `bodyCell_${col.key || col.dataIndex}`;
  const hasSlot = slotKey in slots;

  const { render: _render, onFilter: _onFilter, sorter: _sorter, onCell: _onCell, children, ...rest } = col;

  let extra: Record<string, unknown> = {};

  // 编译 onFilter 字符串为函数
  if (typeof _onFilter === "string" && _onFilter.trim()) {
    try {
      extra.onFilter = new Function("value", "record", `return (${_onFilter})(value, record)`);
    } catch (e: unknown) {
      console.warn("[a-table] onFilter compilation error:", (e as Error).message);
    }
  }

  // 编译 sorter 字符串为函数
  if (typeof _sorter === "string" && _sorter.trim()) {
    try {
      extra.sorter = new Function("a", "b", `return (${_sorter})(a, b)`);
    } catch (e: unknown) {
      console.warn("[a-table] sorter compilation error:", (e as Error).message);
    }
  }

  // 编译 onCell 字符串为函数
  if (typeof _onCell === "string" && _onCell.trim()) {
    try {
      extra.onCell = new Function("record", "rowIndex", `return (${_onCell})(record, rowIndex)`);
    } catch (e: unknown) {
      console.warn("[a-table] onCell compilation error:", (e as Error).message);
    }
  }

  // 递归处理子列
  const wrappedChildren =
    Array.isArray(children) && children.length > 0
      ? (children as Record<string, unknown>[]).map(wrapColumn)
      : undefined;

  if (hasSlot) {
    return { ...rest, ...extra, ...(wrappedChildren ? { children: wrappedChildren } : {}) };
  }

  let result = { ...rest, ...extra };

  if (typeof _render === "string" && _render.trim()) {
    result = { ...result, __renderCode: _render };
  }

  if (wrappedChildren) {
    result = { ...result, children: wrappedChildren };
  }

  return result;
}

/**
 * 包装 columns 数组，递归处理所有层级
 */
const wrappedColumns = computed(() => {
  if (!Array.isArray(rawColumns.value)) return undefined;
  return rawColumns.value.map(wrapColumn);
});


/* ======== 模拟数据 ======== */

/** 根据 columns 定义生成 3-5 条设计期模拟数据 */
function generateMockData(cols: Record<string, unknown>[]): Record<string, unknown>[] {
  const rowCount = Math.min(5, Math.max(3, Math.floor(Math.random() * 3) + 3));
  return Array.from({ length: rowCount }, (_, i) => {
    const row: Record<string, unknown> = {};
    for (const col of cols) {
      if (Array.isArray(col.children) && col.children.length > 0) {
        for (const child of col.children as Record<string, unknown>[]) {
          const key = (child.dataIndex || child.key) as string;
          if (key) row[key] = `${child.title ?? key} ${i + 1}`;
        }
      } else {
        const key = (col.dataIndex || col.key) as string;
        if (key) row[key] = `${col.title ?? key} ${i + 1}`;
      }
    }
    return row;
  });
}

/* ======== 其余 attrs 透传 ======== */

/**
 * 排除 columns（由 wrappedColumns 接管）。
 * dataSource / pagination 在此处合并运行时覆盖值，
 * 避免显式绑定 :data-source="undefined" 覆盖 attrs 中的静态默认值。
 */
const forwardedAttrs = computed(() => {
  const {
    columns: _columns,
    dataSource: ds,
    pagination: pg,
    ...rest
  } = attrs as Record<string, unknown>;
  return {
    ...rest,
    dataSource: _dataSource.value ?? ((Array.isArray(ds) && ds.length > 0) ? ds : generateMockData(rawColumns.value ?? [])),
    pagination: _pagination.value ?? pg,
  };
});
</script>

<template>
  <a-table
    v-bind="forwardedAttrs"
    :columns="wrappedColumns"
  >
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
        <TableCellContextProvider :context="{ column, text, record, index }">
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
