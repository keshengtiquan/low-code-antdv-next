<script setup lang="ts">
import type { PageNode } from "@/types/schema";
import { useSchema } from "@/store/schema";

const props = defineProps<{
  node: PageNode;
}>();

const schemaStore = useSchema();
const { updateNode, updateSlot } = schemaStore;

function setProp(key: string, value: unknown) {
  updateNode(props.node.nodeId, { [key]: value });
}

const typeOptions = [
  { label: "default", value: "default" },
  { label: "primary", value: "primary" },
  { label: "dashed", value: "dashed" },
  { label: "link", value: "link" },
  { label: "text", value: "text" },
];

const sizeOptions = [
  { label: "small", value: "small" },
  { label: "middle", value: "middle" },
  { label: "large", value: "large" },
];

const shapeOptions = [
  { label: "default", value: "default" },
  { label: "circle", value: "circle" },
  { label: "round", value: "round" },
];

const htmlTypeOptions = [
  { label: "button", value: "button" },
  { label: "submit", value: "submit" },
  { label: "reset", value: "reset" },
];

const variantOptions = [
  { label: "outlined", value: "outlined" },
  { label: "dashed", value: "dashed" },
  { label: "solid", value: "solid" },
  { label: "filled", value: "filled" },
  { label: "text", value: "text" },
  { label: "link", value: "link" },
];

const colorOptions = [
  { label: "default", value: "default" },
  { label: "primary", value: "primary" },
  { label: "danger", value: "danger" },
  { label: "blue", value: "blue" },
  { label: "purple", value: "purple" },
  { label: "cyan", value: "cyan" },
  { label: "green", value: "green" },
  { label: "magenta", value: "magenta" },
  { label: "pink", value: "pink" },
  { label: "red", value: "red" },
  { label: "orange", value: "orange" },
  { label: "yellow", value: "yellow" },
  { label: "volcano", value: "volcano" },
  { label: "geekblue", value: "geekblue" },
  { label: "lime", value: "lime" },
  { label: "gold", value: "gold" },
];

const iconPlacementOptions = [
  { label: "start", value: "start" },
  { label: "end", value: "end" },
];
</script>

<template>
  <div class="prop-editor">
    <!-- 文本 -->
    <div class="prop-row">
      <label class="prop-label">文本</label>
      <a-input
        :value="(node.slots?.default as string) ?? ''"
        size="small"
        style="width: 140px"
        placeholder="按钮文字"
        allow-clear
        @change="(e: InputEvent) => updateSlot(node.nodeId, 'default', (e.target as HTMLInputElement).value)"
      />
    </div>

    <!-- 类型 -->
    <div class="prop-row">
      <label class="prop-label">类型</label>
      <a-select
        :value="node.props.type ?? 'default'"
        size="small"
        style="width: 140px"
        :options="typeOptions"
        @change="(val: string) => setProp('type', val)"
      />
    </div>

    <!-- 变体 variant -->
    <div class="prop-row">
      <label class="prop-label">变体</label>
      <a-select
        :value="node.props.variant"
        size="small"
        style="width: 140px"
        placeholder="auto"
        allow-clear
        :options="variantOptions"
        @change="(val: string) => setProp('variant', val || undefined)"
      />
    </div>

    <!-- 颜色 color -->
    <div class="prop-row">
      <label class="prop-label">颜色</label>
      <a-select
        :value="node.props.color"
        size="small"
        style="width: 140px"
        placeholder="auto"
        allow-clear
        :options="colorOptions"
        @change="(val: string) => setProp('color', val || undefined)"
      />
    </div>

    <!-- 尺寸 -->
    <div class="prop-row">
      <label class="prop-label">尺寸</label>
      <a-select
        :value="node.props.size ?? 'middle'"
        size="small"
        style="width: 140px"
        :options="sizeOptions"
        @change="(val: string) => setProp('size', val)"
      />
    </div>

    <!-- 形状 -->
    <div class="prop-row">
      <label class="prop-label">形状</label>
      <a-select
        :value="node.props.shape ?? 'default'"
        size="small"
        style="width: 140px"
        :options="shapeOptions"
        @change="(val: string) => setProp('shape', val)"
      />
    </div>

    <!-- HTML 类型 -->
    <div class="prop-row">
      <label class="prop-label">HTML 类型</label>
      <a-select
        :value="node.props.htmlType ?? 'button'"
        size="small"
        style="width: 140px"
        :options="htmlTypeOptions"
        @change="(val: string) => setProp('htmlType', val)"
      />
    </div>

    <!-- 图标位置 iconPlacement -->
    <div class="prop-row">
      <label class="prop-label">图标位置</label>
      <a-select
        :value="node.props.iconPlacement ?? 'start'"
        size="small"
        style="width: 140px"
        :options="iconPlacementOptions"
        @change="(val: string) => setProp('iconPlacement', val)"
      />
    </div>

    <!-- 链接地址 -->
    <div class="prop-row">
      <label class="prop-label">链接</label>
      <a-input
        :value="node.props.href"
        size="small"
        style="width: 140px"
        placeholder="href"
        allow-clear
        @change="(e: InputEvent) => setProp('href', (e.target as HTMLInputElement).value || undefined)"
      />
    </div>

    <!-- Block -->
    <div class="prop-row">
      <label class="prop-label">通栏</label>
      <a-switch
        :checked="!!node.props.block"
        size="small"
        @change="(val: boolean) => setProp('block', val || undefined)"
      />
    </div>

    <!-- 自动空格 autoInsertSpace -->
    <div class="prop-row">
      <label class="prop-label">自动空格</label>
      <a-switch
        :checked="node.props.autoInsertSpace !== false"
        size="small"
        @change="(val: boolean) => setProp('autoInsertSpace', val ? undefined : false)"
      />
    </div>

    <!-- Danger -->
    <div class="prop-row">
      <label class="prop-label">危险</label>
      <a-switch
        :checked="!!node.props.danger"
        size="small"
        @change="(val: boolean) => setProp('danger', val || undefined)"
      />
    </div>

    <!-- Ghost -->
    <div class="prop-row">
      <label class="prop-label">幽灵</label>
      <a-switch
        :checked="!!node.props.ghost"
        size="small"
        @change="(val: boolean) => setProp('ghost', val || undefined)"
      />
    </div>

    <!-- Disabled -->
    <div class="prop-row">
      <label class="prop-label">禁用</label>
      <a-switch
        :checked="!!node.props.disabled"
        size="small"
        @change="(val: boolean) => setProp('disabled', val || undefined)"
      />
    </div>

    <!-- Loading -->
    <div class="prop-row">
      <label class="prop-label">加载中</label>
      <a-switch
        :checked="!!node.props.loading"
        size="small"
        @change="(val: boolean) => setProp('loading', val || undefined)"
      />
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
</style>
