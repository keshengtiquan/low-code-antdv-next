<script setup lang="ts">
import type { PageNode } from "@/types/schema";
import { useSchema } from "@/store/schema";

const props = defineProps<{
  node: PageNode;
}>();

const schemaStore = useSchema();
const { updateNode } = schemaStore;

function setProp(key: string, value: unknown) {
  updateNode(props.node.nodeId, { [key]: value });
}

const layoutOptions = [
  { label: "horizontal", value: "horizontal" },
  { label: "vertical", value: "vertical" },
  { label: "inline", value: "inline" },
];

const labelAlignOptions = [
  { label: "left", value: "left" },
  { label: "right", value: "right" },
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

const requiredMarkOptions = [
  { label: "true", value: true },
  { label: "false", value: false },
  { label: "optional", value: "optional" },
];
</script>

<template>
  <div class="prop-editor">
    <!-- 布局 layout -->
    <div class="prop-row">
      <label class="prop-label">布局</label>
      <a-select
        :value="node.props.layout ?? 'horizontal'"
        size="small"
        style="width: 140px"
        :options="layoutOptions"
        @change="(val: string) => setProp('layout', val)"
      />
    </div>

    <!-- 标签对齐 labelAlign -->
    <div class="prop-row">
      <label class="prop-label">标签对齐</label>
      <a-select
        :value="node.props.labelAlign ?? 'right'"
        size="small"
        style="width: 140px"
        :options="labelAlignOptions"
        @change="(val: string) => setProp('labelAlign', val)"
      />
    </div>

    <!-- 标签列宽 labelCol.span -->
    <div class="prop-row">
      <label class="prop-label">标签列宽</label>
      <a-input-number
        :value="(node.props.labelCol as Record<string, unknown> | null)?.span ?? undefined"
        size="small"
        style="width: 140px"
        :min="0"
        :max="24"
        placeholder="auto"
        @change="(val: number | null) => setProp('labelCol', val != null ? { span: val } : undefined)"
      />
    </div>

    <!-- 控件列宽 wrapperCol.span -->
    <div class="prop-row">
      <label class="prop-label">控件列宽</label>
      <a-input-number
        :value="(node.props.wrapperCol as Record<string, unknown> | null)?.span ?? undefined"
        size="small"
        style="width: 140px"
        :min="0"
        :max="24"
        placeholder="auto"
        @change="(val: number | null) => setProp('wrapperCol', val != null ? { span: val } : undefined)"
      />
    </div>

    <!-- 标签换行 labelWrap -->
    <div class="prop-row">
      <label class="prop-label">标签换行</label>
      <a-switch
        :checked="!!node.props.labelWrap"
        size="small"
        @change="(val: boolean) => setProp('labelWrap', val || undefined)"
      />
    </div>

    <!-- 冒号 colon -->
    <div class="prop-row">
      <label class="prop-label">冒号</label>
      <a-switch
        :checked="node.props.colon !== false"
        size="small"
        @change="(val: boolean) => setProp('colon', val ? undefined : false)"
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

    <!-- 禁用 disabled -->
    <div class="prop-row">
      <label class="prop-label">禁用</label>
      <a-switch
        :checked="!!node.props.disabled"
        size="small"
        @change="(val: boolean) => setProp('disabled', val || undefined)"
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

    <!-- 必填标记 requiredMark -->
    <div class="prop-row">
      <label class="prop-label">必填标记</label>
      <a-select
        :value="node.props.requiredMark ?? true"
        size="small"
        style="width: 140px"
        :options="requiredMarkOptions"
        @change="(val: unknown) => setProp('requiredMark', val)"
      />
    </div>

    <!-- 隐藏必填标记 hideRequiredMark -->
    <div class="prop-row">
      <label class="prop-label">隐藏必填</label>
      <a-switch
        :checked="!!node.props.hideRequiredMark"
        size="small"
        @change="(val: boolean) => setProp('hideRequiredMark', val || undefined)"
      />
    </div>

    <!-- 表单名 name -->
    <div class="prop-row">
      <label class="prop-label">表单名称</label>
      <a-input
        :value="node.props.name"
        size="small"
        style="width: 140px"
        placeholder="form name"
        allow-clear
        @change="(e: InputEvent) => setProp('name', (e.target as HTMLInputElement).value || undefined)"
      />
    </div>

    <!-- 滚动到错误 scrollToFirstError -->
    <div class="prop-row">
      <label class="prop-label">滚动到错误</label>
      <a-switch
        :checked="!!node.props.scrollToFirstError"
        size="small"
        @change="(val: boolean) => setProp('scrollToFirstError', val || undefined)"
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
