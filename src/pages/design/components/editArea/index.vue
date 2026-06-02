<template>
  <div
    class="edit-area relative flex-1 min-h-0 overflow-auto bg-gray-100"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @click="handleClick"
    @mouseover="handleMouseOver"
    @mouseleave="
      () => {
        hoverNodeId = null;
      }
    "
  >
    <Renderer :node="schema.root" />
    <SelectedMask
      v-if="selectedNodeId"
      portalWrapperClassName="portal-wrapper"
      containerClassName="edit-area"
      :componentId="selectedNodeId"
    />
    <HoverMask
      v-if="hoverNodeId && hoverNodeId !== selectedNodeId"
      :component-id="hoverNodeId"
      container-class-name="edit-area"
      portal-wrapper-class-name="portal-wrapper"
    />
    <div class="portal-wrapper"></div>
  </div>
</template>

<script setup lang="ts">
import { useSchema } from "@/store/schema";
import Renderer from "./components/renderer.vue";
import { storeToRefs } from "pinia";
import { findNodeById, isContainerType } from "@/utils";
import SelectedMask from "./selectedMask.vue";
import HoverMask from "./hoverMask.vue";
import { ref } from "vue";

const schemaStore = useSchema();
const hoverNodeId = ref<string | null>(null);
const { schema, selectedNodeId } = storeToRefs(schemaStore);
const { addNode, findNode, selectNode, deselectNode } = schemaStore;

const handleClick = (e: MouseEvent): void => {
  const target = (e.target as HTMLElement).closest(
    "[data-node-id]",
  ) as HTMLElement | null;
  const nodeId = target?.getAttribute("data-node-id");
  console.log(nodeId);
  if (nodeId && findNode(nodeId)) {
    selectNode(nodeId);
  } else {
    deselectNode();
  }
};
const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  if (!e.dataTransfer) return;
  e.dataTransfer.dropEffect = "copy";
};
const handleDrop = (e: DragEvent): void => {
  e.preventDefault();
  document
    .querySelectorAll(".editor-drop-target")
    .forEach((el) => el.classList.remove("editor-drop-target"));

  const type = e.dataTransfer?.getData("component-type");
  console.log(type);
  if (!type) return;
  const target = (e.target as HTMLElement).closest(
    "[data-node-id]",
  ) as HTMLElement | null;
  if (!target) return;
  let parentId = schema.value.root.nodeId;
  const targetNodeId = target?.getAttribute("data-node-id");
  if (targetNodeId) {
    const node = findNodeById(targetNodeId, schema.value.root);
    if (node && isContainerType(node.type)) {
      parentId = targetNodeId;
    } else {
      let el: HTMLElement | null = target.parentElement;
      while (el) {
        const nodeId = el.getAttribute("data-node-id");
        if (nodeId) {
          const parentNode = findNodeById(nodeId, schema.value.root);
          if (parentNode && isContainerType(parentNode.type)) {
            parentId = nodeId;
            break;
          }
        }
        el = el.parentElement;
      }
    }
  }

  addNode(parentId, type);
};

const handleMouseOver = (e: MouseEvent): void => {
  const path = e.composedPath();
  for (let i = 0; i < path.length; i++) {
    const ele = path[i] as HTMLElement;
    console.log(ele?.dataset);
    const nodeId = ele?.dataset?.nodeId;
    if (nodeId) {
      hoverNodeId.value = nodeId;
      return;
    }
  }
};
</script>

<style scoped>
.portal-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}
</style>
