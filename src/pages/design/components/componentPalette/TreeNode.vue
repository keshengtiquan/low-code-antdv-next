<template>
  <div class="tree-node">
    <div
      class="tree-node-row"
      :class="{ selected: selectedNodeId === node.nodeId }"
      :style="{ paddingLeft: `${depth * 16 + 4}px` }"
      @click.stop="$emit('select', node.nodeId)"
    >
      <span
        v-if="hasChildren"
        class="tree-toggle"
        @click.stop="expanded = !expanded"
      >
        {{ expanded ? '▾' : '▸' }}
      </span>
      <span v-else class="tree-toggle tree-toggle-placeholder" />
      <span class="tree-type">{{ node.type }}</span>
      <span class="tree-id">{{ node.nodeId.slice(0, 8) }}</span>
    </div>
    <template v-if="expanded && hasChildren">
      <TreeNode
        v-for="child in children"
        :key="child.nodeId"
        :node="child"
        :selected-node-id="selectedNodeId"
        :depth="depth + 1"
        @select="$emit('select', $event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { PageNode } from "@/types/schema";
import { computed, ref } from "vue";

const props = defineProps<{
  node: PageNode;
  selectedNodeId: string | null;
  depth: number;
}>();

defineEmits<{
  select: [nodeId: string];
}>();

const expanded = ref(true);

const children = computed<PageNode[]>(() => {
  if (!props.node.slots) return [];
  const result: PageNode[] = [];
  for (const slotValue of Object.values(props.node.slots)) {
    if (typeof slotValue === "string") continue;
    result.push(...slotValue);
  }
  return result;
});

const hasChildren = computed(() => children.value.length > 0);
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.tree-node-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  margin: 1px 4px;
  transition: background-color 0.15s;
}

.tree-node-row:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.tree-node-row.selected {
  background-color: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.tree-toggle {
  width: 16px;
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
  text-align: center;
  cursor: pointer;
}

.tree-toggle-placeholder {
  width: 16px;
  flex-shrink: 0;
}

.tree-type {
  font-weight: 500;
}

.tree-id {
  font-size: 11px;
  color: #bbb;
  margin-left: auto;
}
</style>
