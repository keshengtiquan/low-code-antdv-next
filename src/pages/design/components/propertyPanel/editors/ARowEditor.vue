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
  { label: "top", value: "top" },
  { label: "middle", value: "middle" },
  { label: "bottom", value: "bottom" },
  { label: "stretch", value: "stretch" },
];
</script>

<template>
  <div class="prop-editor">
    <!-- 水平排列 -->
    <div class="prop-row">
      <label class="prop-label">水平排列</label>
      <a-select
        :value="node.props.justify ?? 'start'"
        size="small"
        style="width: 140px"
        :options="justifyOptions"
        @change="(val: string) => setProp('justify', val)"
      />
    </div>

    <!-- 垂直对齐 -->
    <div class="prop-row">
      <label class="prop-label">垂直对齐</label>
      <a-select
        :value="node.props.align ?? 'top'"
        size="small"
        style="width: 140px"
        :options="alignOptions"
        @change="(val: string) => setProp('align', val)"
      />
    </div>

    <!-- 栅格间距 -->
    <div class="prop-row">
      <label class="prop-label">栅格间距</label>
      <a-input-number
        :value="node.props.gutter ?? 0"
        size="small"
        style="width: 140px"
        :min="0"
        placeholder="0"
        @change="(val: number) => setProp('gutter', val || undefined)"
      />
    </div>

    <!-- 自动换行 -->
    <div class="prop-row">
      <label class="prop-label">自动换行</label>
      <a-switch
        :checked="node.props.wrap !== false"
        size="small"
        @change="(val: boolean) => setProp('wrap', val ? undefined : false)"
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
