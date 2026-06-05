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

const justifyOptions = [
  { label: "start", value: "start" },
  { label: "end", value: "end" },
  { label: "center", value: "center" },
  { label: "space-around", value: "space-around" },
  { label: "space-between", value: "space-between" },
  { label: "space-evenly", value: "space-evenly" },
];

const alignOptions = [
  { label: "start", value: "start" },
  { label: "end", value: "end" },
  { label: "center", value: "center" },
  { label: "baseline", value: "baseline" },
];

const wrapOptions = [
  { label: "nowrap", value: "nowrap" },
  { label: "wrap", value: "wrap" },
  { label: "wrap-reverse", value: "wrap-reverse" },
];

const gapPresets = [
  { label: "small (8px)", value: "small" },
  { label: "middle (16px)", value: "middle" },
  { label: "large (24px)", value: "large" },
];
</script>

<template>
  <div class="prop-editor">
    <!-- 排列方向 -->
    <div class="prop-row">
      <label class="prop-label">垂直排列</label>
      <a-switch
        :checked="!!node.props.vertical"
        size="small"
        @change="(val: boolean) => setProp('vertical', val || undefined)"
      />
    </div>

    <!-- 换行 -->
    <div class="prop-row">
      <label class="prop-label">换行</label>
      <a-select
        :value="node.props.wrap ?? 'nowrap'"
        size="small"
        style="width: 140px"
        :options="wrapOptions"
        @change="(val: string) => setProp('wrap', val)"
      />
    </div>

    <!-- 主轴对齐 -->
    <div class="prop-row">
      <label class="prop-label">主轴对齐</label>
      <a-select
        :value="node.props.justify ?? 'start'"
        size="small"
        style="width: 140px"
        :options="justifyOptions"
        @change="(val: string) => setProp('justify', val)"
      />
    </div>

    <!-- 交叉轴对齐 -->
    <div class="prop-row">
      <label class="prop-label">交叉轴对齐</label>
      <a-select
        :value="node.props.align ?? 'start'"
        size="small"
        style="width: 140px"
        :options="alignOptions"
        @change="(val: string) => setProp('align', val)"
      />
    </div>

    <!-- 间距 -->
    <div class="prop-row">
      <label class="prop-label">间距</label>
      <a-select
        :value="node.props.gap"
        size="small"
        style="width: 140px"
        placeholder="无间距"
        allow-clear
        :options="gapPresets"
        @change="(val: string) => setProp('gap', val)"
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
