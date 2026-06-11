<template>
  <div class="tree-view">
    <TreeNode
      :node="schema.root"
      :selected-node-id="selectedNodeId"
      :depth="0"
      @select="handleSelect"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { useSchema } from "@/store/schema";
import { storeToRefs } from "pinia";
import TreeNode from "./TreeNode.vue";

const schemaStore = useSchema();
const { schema, selectedNodeId } = storeToRefs(schemaStore);
const { selectNode, removeNode } = schemaStore;

function handleSelect(nodeId: string) {
  selectNode(nodeId);
}

function handleDelete(nodeId: string) {
  removeNode(nodeId);
}
</script>

<style scoped>
.tree-view {
  font-size: 13px;
  padding: 4px 0;
}
</style>
