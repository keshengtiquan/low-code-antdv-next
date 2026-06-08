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
  { label: "text", value: "text" },
  { label: "password", value: "password" },
  { label: "number", value: "number" },
  { label: "email", value: "email" },
  { label: "tel", value: "tel" },
  { label: "url", value: "url" },
  { label: "search", value: "search" },
];

const sizeOptions = [
  { label: "small", value: "small" },
  { label: "middle", value: "middle" },
  { label: "large", value: "large" },
];

const variantOptions = [
  { label: "outlined", value: "outlined" },
  { label: "filled", value: "filled" },
  { label: "borderless", value: "borderless" },
  { label: "underlined", value: "underlined" },
];

const statusOptions = [
  { label: "默认", value: "" },
  { label: "error", value: "error" },
  { label: "warning", value: "warning" },
];
</script>

<template>
  <div class="prop-editor">
    <!-- 占位文本 placeholder -->
    <div class="prop-row">
      <label class="prop-label">占位文本</label>
      <a-input
        :value="node.props.placeholder"
        size="small"
        style="width: 140px"
        placeholder="请输入"
        allow-clear
        @change="(e: InputEvent) => setProp('placeholder', (e.target as HTMLInputElement).value || undefined)"
      />
    </div>

    <!-- 默认值 value -->
    <div class="prop-row">
      <label class="prop-label">默认值</label>
      <a-input
        :value="node.props.value"
        size="small"
        style="width: 140px"
        placeholder="默认值"
        allow-clear
        @change="(e: InputEvent) => setProp('value', (e.target as HTMLInputElement).value || undefined)"
      />
    </div>

    <!-- 类型 type -->
    <div class="prop-row">
      <label class="prop-label">类型</label>
      <a-select
        :value="node.props.type ?? 'text'"
        size="small"
        style="width: 140px"
        :options="typeOptions"
        @change="(val: string) => setProp('type', val)"
      />
    </div>

    <!-- 尺寸 size -->
    <div class="prop-row">
      <label class="prop-label">尺寸</label>
      <a-select
        :value="node.props.size"
        size="small"
        style="width: 140px"
        placeholder="默认"
        allow-clear
        :options="sizeOptions"
        @change="(val: string) => setProp('size', val || undefined)"
      />
    </div>

    <!-- 变体 variant -->
    <div class="prop-row">
      <label class="prop-label">变体</label>
      <a-select
        :value="node.props.variant"
        size="small"
        style="width: 140px"
        placeholder="默认"
        allow-clear
        :options="variantOptions"
        @change="(val: string) => setProp('variant', val || undefined)"
      />
    </div>

    <!-- 状态 status -->
    <div class="prop-row">
      <label class="prop-label">状态</label>
      <a-select
        :value="node.props.status"
        size="small"
        style="width: 140px"
        placeholder="默认"
        allow-clear
        :options="statusOptions"
        @change="(val: string) => setProp('status', val || undefined)"
      />
    </div>

    <!-- 禁用 disabled -->
    <div class="prop-row">
      <label class="prop-label">禁用</label>
      <a-switch
        :checked="!!node.props.disabled"
        size="small"
        @change="(val: boolean) => setProp('disabled', val || undefined)"
      />
    </div>

    <!-- 可清除 allowClear -->
    <div class="prop-row">
      <label class="prop-label">可清除</label>
      <a-switch
        :checked="!!node.props.allowClear"
        size="small"
        @change="(val: boolean) => setProp('allowClear', val || undefined)"
      />
    </div>

    <!-- 最大长度 maxlength -->
    <div class="prop-row">
      <label class="prop-label">最大长度</label>
      <a-input-number
        :value="node.props.maxlength"
        size="small"
        style="width: 140px"
        :min="0"
        placeholder="不限"
        @change="(val: number | null) => setProp('maxlength', val ?? undefined)"
      />
    </div>

    <!-- 显示计数 showCount -->
    <div class="prop-row">
      <label class="prop-label">显示计数</label>
      <a-switch
        :checked="!!node.props.showCount"
        size="small"
        @change="(val: boolean) => setProp('showCount', val || undefined)"
      />
    </div>

    <!-- 前缀 prefix slot -->
    <div class="prop-row">
      <label class="prop-label">前缀</label>
      <a-input
        :value="(node.slots?.prefix as string) ?? ''"
        size="small"
        style="width: 140px"
        placeholder="前缀文本"
        allow-clear
        @change="(e: InputEvent) => updateSlot(node.nodeId, 'prefix', (e.target as HTMLInputElement).value || '')"
      />
    </div>

    <!-- 后缀 suffix slot -->
    <div class="prop-row">
      <label class="prop-label">后缀</label>
      <a-input
        :value="(node.slots?.suffix as string) ?? ''"
        size="small"
        style="width: 140px"
        placeholder="后缀文本"
        allow-clear
        @change="(e: InputEvent) => updateSlot(node.nodeId, 'suffix', (e.target as HTMLInputElement).value || '')"
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
