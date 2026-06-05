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
</script>

<template>
  <div class="prop-editor">
    <!-- 栅格宽度 span -->
    <div class="prop-row">
      <label class="prop-label">栅格宽度</label>
      <a-input-number
        :value="node.props.span"
        size="small"
        style="width: 140px"
        :min="0"
        :max="24"
        placeholder="auto"
        @change="(val: number | null) => setProp('span', val ?? undefined)"
      />
    </div>

    <!-- 左偏移 offset -->
    <div class="prop-row">
      <label class="prop-label">左偏移</label>
      <a-input-number
        :value="node.props.offset"
        size="small"
        style="width: 140px"
        :min="0"
        :max="24"
        placeholder="0"
        @change="(val: number | null) => setProp('offset', val || undefined)"
      />
    </div>

    <!-- flex -->
    <div class="prop-row">
      <label class="prop-label">Flex</label>
      <a-input
        :value="node.props.flex"
        size="small"
        style="width: 140px"
        placeholder='如 "1 1 auto"'
        allow-clear
        @change="(e: InputEvent) => setProp('flex', (e.target as HTMLInputElement).value || undefined)"
      />
    </div>

    <!-- 排序 order -->
    <div class="prop-row">
      <label class="prop-label">排序</label>
      <a-input-number
        :value="node.props.order"
        size="small"
        style="width: 140px"
        :min="0"
        placeholder="0"
        @change="(val: number | null) => setProp('order', val || undefined)"
      />
    </div>

    <!-- 左移 pull -->
    <div class="prop-row">
      <label class="prop-label">左移</label>
      <a-input-number
        :value="node.props.pull"
        size="small"
        style="width: 140px"
        :min="0"
        :max="24"
        placeholder="0"
        @change="(val: number | null) => setProp('pull', val || undefined)"
      />
    </div>

    <!-- 右移 push -->
    <div class="prop-row">
      <label class="prop-label">右移</label>
      <a-input-number
        :value="node.props.push"
        size="small"
        style="width: 140px"
        :min="0"
        :max="24"
        placeholder="0"
        @change="(val: number | null) => setProp('push', val || undefined)"
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
