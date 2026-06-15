<script setup lang="ts">
import type { PageNode } from "@/types/schema";
import { useSchema } from "@/store/schema";
import { computed, ref } from "vue";
import { HolderOutlined } from "@antdv-next/icons";

interface ColumnInfo {
  title?: string;
  dataIndex?: string;
  key?: string;
  width?: number | string;
  fixed?: string;
  align?: string;
  ellipsis?: boolean;
  sorter?: boolean;
  /** 子列：存在时该列为分组列，不再有 dataIndex/key */
  children?: ColumnInfo[];
  render?: string;
}

/** 递归展开后的渲染行 */
interface FlatRow {
  path: number[];
  col: ColumnInfo;
  depth: number;
  hasChildren: boolean;
  isLast: boolean;
  /** 该路径每一层的 isLast 状态，用于画树线 */
  parentLast: boolean[];
}

const props = defineProps<{
  node: PageNode;
}>();

const schemaStore = useSchema();
const { updateNode, updateSlot } = schemaStore;

/** 当前选中的列路径（用于定位新列插入位置） */
const selectedPath = ref<number[] | null>(null);

/** 当前打开的 popover 行路径字符串 */
const popoverOpenKey = ref<string | null>(null);

/** 路径是否相同 */
function isSamePath(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** 选中/取消选中列 */
function selectColumn(path: number[]) {
  selectedPath.value = selectedPath.value && isSamePath(selectedPath.value, path) ? null : [...path];
}

/** 选中行是否匹配 */
function isSelected(path: number[]): boolean {
  return !!selectedPath.value && isSamePath(selectedPath.value, path);
}

/** 打开指定行的 popover */
function openPopover(path: number[]) {
  popoverOpenKey.value = path.join('-');
}

/** 在树中指定路径的同级位置插入一个新列 */
function insertAtPath(tree: ColumnInfo[], path: number[], col: ColumnInfo) {
  const { arr, idx } = resolvePathFromTree(tree, path);
  arr.splice(idx + 1, 0, col);
}

/* ======== 拖拽排序 ======== */
const dragPath = ref<number[] | null>(null);
const dropTarget = ref<number[] | null>(null);
const dropPos = ref<'before' | 'after' | 'inside'>('after');

function onDragStart(e: DragEvent, path: number[]) {
  if (!e.dataTransfer) return;
  dragPath.value = path;
  e.dataTransfer.effectAllowed = 'move';
}

function onDragOver(e: DragEvent, path: number[]) {
  e.preventDefault();
  if (!e.dataTransfer) return;
  if (!dragPath.value || isSamePath(dragPath.value, path)) {
    e.dataTransfer.dropEffect = 'none';
    return;
  }
  e.dataTransfer.dropEffect = 'move';
  dropTarget.value = path;

  const el = e.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  const y = e.clientY - rect.top;
  const h = rect.height;
  // 通过当前行的 hasChildren 属性判断是否为分组
  const isGroup = (el.dataset.hasChildren as string) === 'true';
  if (isGroup && y > h * 0.25 && y < h * 0.75) {
    dropPos.value = 'inside';
  } else if (y < h / 2) {
    dropPos.value = 'before';
  } else {
    dropPos.value = 'after';
  }
}

function onDragLeave() {
  dropTarget.value = null;
}

function onDrop(e: DragEvent, targetPath: number[]) {
  e.preventDefault();
  if (!dragPath.value || isSamePath(dragPath.value, targetPath)) {
    resetDrag();
    return;
  }
  moveColumn(dragPath.value, targetPath, dropPos.value);
  resetDrag();
}

function onDragEnd() {
  resetDrag();
}

function resetDrag() {
  dragPath.value = null;
  dropTarget.value = null;
}

function getDropClass(path: number[]): string {
  if (!dropTarget.value || !isSamePath(dropTarget.value, path)) return '';
  return `drop-${dropPos.value}`;
}

/** 移动列：从 fromPath 移除，插入到 toPath 对应位置 */
function moveColumn(fromPath: number[], toPath: number[], position: string) {
  const tree = cloneTree();

  // 1. 从原位置移除
  const { arr: fromArr, idx: fromIdx } = resolvePathFromTree(tree, fromPath);
  const [moved] = fromArr.splice(fromIdx, 1);

  // 2. 调整目标路径（如果目标在原位置之后且同级，需要修正索引）
  let { arr: toArr, idx: toIdx } = resolvePathFromTree(tree, toPath);

  // 3. 根据 position 插入
  if (position === 'inside') {
    // 插入到目标分组内部末尾
    const target = toArr[toIdx];
    if (!target.children) target.children = [];
    target.children.push(moved);
  } else if (position === 'before') {
    toArr.splice(toIdx, 0, moved);
  } else {
    // after
    toArr.splice(toIdx + 1, 0, moved);
  }

  // 4. 清理空分组
  removeEmptyGroups(tree);

  updateNode(props.node.nodeId, { columns: tree });
}

function setProp(key: string, value: unknown) {
  updateNode(props.node.nodeId, { [key]: value });
}

/** 解析 columns */
const columnsTree = computed<ColumnInfo[]>(() => {
  const cols = props.node.props?.columns;
  if (!Array.isArray(cols)) return [];
  return cols as ColumnInfo[];
});

/** 将树递归展开为平铺行 */
function flatten(
  cols: ColumnInfo[],
  depth: number,
  basePath: number[],
  parentLast: boolean[],
): FlatRow[] {
  const result: FlatRow[] = [];
  cols.forEach((col, idx) => {
    const path = [...basePath, idx];
    const hasChildren = Array.isArray(col.children) && col.children.length > 0;
    const isLast = idx === cols.length - 1;
    const myParentLast = [...parentLast, isLast];
    result.push({ path, col, depth, hasChildren, isLast, parentLast });
    if (hasChildren) {
      result.push(...flatten(col.children!, depth + 1, path, myParentLast));
    }
  });
  return result;
}

const flatRows = computed<FlatRow[]>(() =>
  flatten(columnsTree.value, 0, [], []),
);

/** 深拷贝 columns 树 */
function cloneTree(): ColumnInfo[] {
  return JSON.parse(JSON.stringify(columnsTree.value));
}

/** 在指定节点下新增子列 */
function addChild(path: number[]) {
  const tree = cloneTree();
  const { arr, idx } = resolvePathFromTree(tree, path);
  const parent = arr[idx];
  if (!parent.children) parent.children = [];
  const newCol: ColumnInfo = {
    title: `子列${parent.children.length + 1}`,
    dataIndex: `child${parent.children.length + 1}`,
    key: `child${parent.children.length + 1}`,
  };
  parent.children.push(newCol);
  updateNode(props.node.nodeId, { columns: tree });
}

function resolvePathFromTree(tree: ColumnInfo[], path: number[]): { arr: ColumnInfo[]; idx: number } {
  if (path.length === 1) return { arr: tree, idx: path[0] };
  let cursor = tree;
  for (let i = 0; i < path.length - 1; i++) {
    const p = cursor[path[i]];
    cursor = p.children ?? [];
  }
  return { arr: cursor, idx: path[path.length - 1] };
}

/** 添加叶子列 */
function addColumn() {
  const tree = cloneTree();
  const newCol: ColumnInfo = {
    title: `列${tree.length + 1}`,
    dataIndex: `col${tree.length + 1}`,
    key: `col${tree.length + 1}`,
  };
  if (selectedPath.value) {
    insertAtPath(tree, selectedPath.value, newCol);
  } else {
    tree.push(newCol);
  }
  updateNode(props.node.nodeId, { columns: tree });
  selectedPath.value = null;
}

/** 添加顶层分组 */
function addGroup() {
  const tree = cloneTree();
  const newIdx = tree.length;
  const group: ColumnInfo = {
    title: `分组${newIdx + 1}`,
    children: [
      {
        title: "子列1",
        dataIndex: `g${newIdx + 1}_1`,
        key: `g${newIdx + 1}_1`,
      },
    ],
  };
  if (selectedPath.value) {
    insertAtPath(tree, selectedPath.value, group);
  } else {
    tree.push(group);
  }
  updateNode(props.node.nodeId, { columns: tree });
  selectedPath.value = null;
}

/** 更新单列属性 */
function updateColumn(path: number[], field: string, value: unknown) {
  const tree = cloneTree();
  const { arr, idx } = resolvePathFromTree(tree, path);
  arr[idx] = { ...arr[idx], [field]: value || undefined };
  updateNode(props.node.nodeId, { columns: tree });
}

/** 递归清理所有空分组 */
function removeEmptyGroups(cols: ColumnInfo[]): boolean {
  let changed = false;
  for (let i = cols.length - 1; i >= 0; i--) {
    const col = cols[i];
    if (Array.isArray(col.children)) {
      if (removeEmptyGroups(col.children)) changed = true;
      if (col.children.length === 0) {
        cols.splice(i, 1);
        changed = true;
      }
    }
  }
  return changed;
}

/** 删除列（含清理插槽，自动删除空分组） */
function deleteColumn(path: number[]) {
  const tree = cloneTree();
  const { arr, idx } = resolvePathFromTree(tree, path);
  const col = arr[idx];

  // 递归清理所有叶子列的 bodyCell 插槽
  function cleanSlots(c: ColumnInfo) {
    if (Array.isArray(c.children) && c.children.length > 0) {
      c.children.forEach(cleanSlots);
    } else {
      const key = columnSlotKey(c);
      if (key) updateSlot(props.node.nodeId, `bodyCell_${key}`, "");
    }
  }
  cleanSlots(col);
  arr.splice(idx, 1);

  // 删除完成后清理所有已空的父分组
  removeEmptyGroups(tree);

  updateNode(props.node.nodeId, { columns: tree });
}

/** 获取叶子列的 slot key */
function columnSlotKey(col: ColumnInfo): string {
  return (col.key || col.dataIndex || "") as string;
}

/** 判断叶子列是否启用了自定义单元格 */
function hasCustomSlot(path: number[]): boolean {
  const { arr, idx } = resolvePathFromTree(columnsTree.value, path);
  const col = arr[idx];
  if (col.children?.length) return false;
  const key = columnSlotKey(col);
  return `bodyCell_${key}` in (props.node.slots ?? {});
}

function toggleCustomSlot(path: number[], enabled: boolean) {
  const { arr, idx } = resolvePathFromTree(columnsTree.value, path);
  const col = arr[idx];
  if (col.children?.length) return;
  const key = columnSlotKey(col);
  if (enabled) {
    updateSlot(props.node.nodeId, `bodyCell_${key}`, []);
  } else {
    updateSlot(props.node.nodeId, `bodyCell_${key}`, "");
  }
}

const sizeOptions = [
  { label: "large", value: "large" },
  { label: "middle", value: "middle" },
  { label: "small", value: "small" },
];

const alignOptions = [
  { label: "left", value: "left" },
  { label: "center", value: "center" },
  { label: "right", value: "right" },
];

const fixedOptions = [
  { label: "无", value: "" },
  { label: "left", value: "left" },
  { label: "right", value: "right" },
];
</script>

<template>
  <div class="prop-editor">
    <!-- 基础属性 -->
    <div class="section-label">基础属性</div>

    <div class="prop-row">
      <label class="prop-label">边框</label>
      <a-switch
        :checked="!!node.props.bordered"
        size="small"
        @change="(val: boolean) => setProp('bordered', val || undefined)"
      />
    </div>

    <div class="prop-row">
      <label class="prop-label">高度</label>
      <a-input-number
        :value="(node.props.height as number)"
        size="small"
        style="width: 140px"
        placeholder="auto"
        :min="0"
        @change="(val: number | null) => setProp('height', val ?? undefined)"
      />
    </div>

    <div class="prop-row">
      <label class="prop-label">尺寸</label>
      <a-select
        :value="(node.props.size as string) ?? 'large'"
        size="small"
        style="width: 140px"
        :options="sizeOptions"
        @change="(val: string) => setProp('size', val)"
      />
    </div>

    <!-- 列管理 -->
    <div class="section-break">
      <div class="columns-header">
        <span class="section-label">列管理</span>
        <div class="header-actions">
          <a-button size="small" type="dashed" @click="addGroup">分组</a-button>
          <a-button size="small" type="dashed" @click="addColumn">+ 列</a-button>
        </div>
      </div>

      <div v-if="flatRows.length === 0" class="columns-empty">
        暂无列，点击上方按钮添加
      </div>

      <!-- 列列表（树形展开） -->
      <div class="columns-list">
        <template v-for="row in flatRows" :key="row.path.join('-')">
          <!-- 叶子列：popover 包住整行以定位，但只在点齿轮时打开 -->
          <a-popover
            v-if="!row.hasChildren"
            :open="popoverOpenKey === row.path.join('-')"
            @update:open="(val: boolean) => !val && (popoverOpenKey = null)"
            trigger="click"
            placement="leftTop"
            :overlay-style="{ width: '220px', maxHeight: '380px', overflowY: 'auto' }"
          >
            <template #content>
              <div class="pop-header">
                <span class="pop-title">列设置</span>
                <span class="pop-subtitle">{{ row.col.title }}</span>
              </div>
              <div class="column-settings">
                <div class="pop-field">
                  <label class="pop-label">标题</label>
                  <a-input size="small" :value="row.col.title"
                    @change="(e: InputEvent) => updateColumn(row.path, 'title', (e.target as HTMLInputElement).value)" />
                </div>
                <div class="pop-field">
                  <label class="pop-label">dataIndex</label>
                  <a-input size="small" :value="row.col.dataIndex"
                    @change="(e: InputEvent) => updateColumn(row.path, 'dataIndex', (e.target as HTMLInputElement).value)" />
                </div>
                <div class="pop-field">
                  <label class="pop-label">key</label>
                  <a-input size="small" :value="row.col.key"
                    @change="(e: InputEvent) => updateColumn(row.path, 'key', (e.target as HTMLInputElement).value)" />
                </div>
                <div class="pop-field">
                  <label class="pop-label">render</label>
                  <a-input size="small" :value="row.col.render"
                    @change="(e: InputEvent) => updateColumn(row.path, 'render', (e.target as HTMLInputElement).value)" />
                </div>
                <div class="pop-field">
                  <label class="pop-label">宽度</label>
                  <a-input size="small" :value="row.col.width" placeholder="auto"
                    @change="(e: InputEvent) => updateColumn(row.path, 'width', (e.target as HTMLInputElement).value || undefined)" />
                </div>
                <div class="pop-field">
                  <label class="pop-label">固定</label>
                  <a-select size="small" :value="row.col.fixed ?? ''" style="width:100%" :options="fixedOptions"
                    @change="(val: string) => updateColumn(row.path, 'fixed', val || undefined)" />
                </div>
                <div class="pop-field">
                  <label class="pop-label">对齐</label>
                  <a-select size="small" :value="row.col.align ?? 'left'" style="width:100%" :options="alignOptions"
                    @change="(val: string) => updateColumn(row.path, 'align', val)" />
                </div>
                <div class="pop-field pop-row">
                  <label class="pop-label">省略</label>
                  <a-switch size="small" :checked="!!row.col.ellipsis"
                    @change="(val: boolean) => updateColumn(row.path, 'ellipsis', val || undefined)" />
                </div>
                <div class="pop-field pop-row">
                  <label class="pop-label">排序</label>
                  <a-switch size="small" :checked="!!row.col.sorter"
                    @change="(val: boolean) => updateColumn(row.path, 'sorter', val || undefined)" />
                </div>
                <div class="pop-divider" />
                <div class="pop-field pop-row">
                  <label class="pop-label">自定义单元格</label>
                  <a-switch size="small" :checked="hasCustomSlot(row.path)"
                    @change="(val: boolean) => toggleCustomSlot(row.path, val)" />
                </div>
              </div>
            </template>
            <div
              class="column-row"
              :class="[`depth-${Math.min(row.depth, 3)}`, { selected: isSelected(row.path) }, getDropClass(row.path)]"
              :data-has-children="false"
              @click="selectColumn(row.path)"
              @dragover="onDragOver($event, row.path)"
              @dragleave="onDragLeave"
              @drop="onDrop($event, row.path)"
              @dragend="onDragEnd"
            >
              <span class="drag-handle" draggable="true" @dragstart="onDragStart($event, row.path)" @click.stop>
                <HolderOutlined />
              </span>
              <span class="tree-lines">
                <span v-for="(last, pi) in row.parentLast" :key="pi" class="tree-seg">
                  <span v-if="!last" class="tree-vline" />
                  <span v-else class="tree-space" />
                </span>
              </span>
              <div class="col-body">
                <div class="col-head">
                  <span class="col-title">{{ row.col.title }}</span>
                  <span class="col-key">{{ columnSlotKey(row.col) }}</span>
                  <span v-if="hasCustomSlot(row.path)" class="col-badge">自定义</span>
                </div>
              </div>
              <div class="col-actions">
                <span class="col-gear" @click.stop="openPopover(row.path)">⚙</span>
                <span class="col-close" @click.stop="deleteColumn(row.path)">×</span>
              </div>
            </div>
          </a-popover>

          <!-- 分组列：不可设置属性，可添加子列 -->
          <div
            v-else
            class="column-row group-row"
            :class="[`depth-${Math.min(row.depth, 3)}`, { selected: isSelected(row.path) }, getDropClass(row.path)]"
            :data-has-children="true"
            @click="selectColumn(row.path)"
            @dragover="onDragOver($event, row.path)"
            @dragleave="onDragLeave"
            @drop="onDrop($event, row.path)"
            @dragend="onDragEnd"
          >
            <span class="drag-handle" draggable="true" @dragstart="onDragStart($event, row.path)" @click.stop>
              <HolderOutlined />
            </span>
            <span class="tree-lines">
              <span v-for="(last, pi) in row.parentLast" :key="pi" class="tree-seg">
                <span v-if="!last" class="tree-vline" />
                <span v-else class="tree-space" />
              </span>
            </span>
            <div class="col-body">
              <span class="col-title group-title">{{ row.col.title }}</span>
            </div>
            <div class="col-actions group-actions">
              <span class="col-add" title="添加子列" @click.stop="addChild(row.path)">+</span>
              <span class="col-close" @click.stop="deleteColumn(row.path)">×</span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prop-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prop-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.prop-label {
  font-size: 13px;
  color: #555;
  flex-shrink: 0;
}

.section-break {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: #888;
}

/* ── 列管理头部 ── */
.columns-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.header-actions {
  display: flex;
  gap: 6px;
}

/* ── 列列表 ── */
.columns-list {
  display: flex;
  flex-direction: column;
}

.columns-empty {
  font-size: 12px;
  color: #bbb;
  padding: 20px 0;
  text-align: center;
  background: #fafafa;
  border-radius: 6px;
  border: 1px dashed #e8e8e8;
}

/* ── 行（叶子列 / 分组列通用） ── */
.column-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 4px 8px 0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.column-row:hover {
  background: #f0f5ff;
  border-color: #d6e4ff;
}

.group-row {
  cursor: default;
}

.group-row:hover {
  background: #f5f5f5;
  border-color: #e8e8e8;
}

.column-row.selected {
  background: #e6f4ff;
  border-color: #91caff;
}

.column-row.selected:hover {
  background: #dceeff;
  border-color: #69b1ff;
}

.group-row.selected {
  background: #fffbe6;
  border-color: #ffe58f;
}

.group-row.selected:hover {
  background: #fff7d0;
  border-color: #ffd666;
}

/* ── 树线 ── */
.tree-lines {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  font-family: monospace;
  font-size: 13px;
  color: #ccc;
  letter-spacing: 0;
  user-select: none;
  min-width: 0;
}

.tree-seg {
  display: inline-block;
  width: 12px;
  text-align: center;
  position: relative;
}

.tree-vline {
  color: #d9d9d9;
}

.tree-vline::before {
  content: '│';
}

.tree-space {
  visibility: hidden;
}

.tree-space::before {
  content: '│';
}

/* ── 列体 ── */
.col-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.col-head {
  display: flex;
  align-items: center;
  gap: 5px;
}

.col-title {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-title {
  font-size: 13px;
  font-weight: 600;
  color: #d48806;
}

.col-badge {
  font-size: 10px;
  padding: 1px 5px;
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
  border-radius: 3px;
  flex-shrink: 0;
  line-height: 1.4;
}

.col-key {
  font-size: 11px;
  color: #999;
  font-weight: 600;
  font-family: "SF Mono", "Fira Code", monospace;
}

/* ── 操作按钮 ── */
.col-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s;
}

.group-actions {
  opacity: 1;
}

.column-row:hover .col-actions {
  opacity: 1;
}

.col-gear,
.col-add,
.col-close {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 13px;
  transition: all 0.15s;
  user-select: none;
}

.col-gear { color: #999; }
.col-gear:hover { background: #e6f0ff; color: #1677ff; }

.col-add {
  color: #999;
  font-weight: 700;
  font-size: 15px;
}

.col-add:hover {
  background: #f6ffed;
  color: #52c41a;
}

.col-close:hover { background: #fff1f0; color: #ff4d4f; }

/* ── 拖拽手柄 ── */
.drag-handle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: #999;
  cursor: grab;
  border-radius: 3px;
  transition: color 0.15s, background 0.15s;
  opacity: 1;
  font-weight: 700;
}

.drag-handle:hover {
  color: #1677ff;
  background: #e6f4ff;
}

.drag-handle:active {
  cursor: grabbing;
}

/* ── 拖放指示线 ── */
.column-row.drop-before {
  border-top: 2px solid #1677ff;
}

.column-row.drop-after {
  border-bottom: 2px solid #1677ff;
}

.column-row.drop-inside {
  box-shadow: inset 0 0 0 2px #1677ff;
  border-radius: 6px;
}

/* ── Popover ── */
.pop-header {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.pop-title { font-size: 13px; font-weight: 600; color: #333; }
.pop-subtitle { font-size: 12px; color: #999; }

.column-settings {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pop-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pop-field.pop-row {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.pop-label { font-size: 12px; color: #888; }

.pop-divider {
  border-top: 1px solid #f0f0f0;
  margin: 4px 0;
}
</style>
