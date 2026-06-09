<template>
  <div
    class="edit-area relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-gray-100"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @click="handleClick"
    @mouseover="handleMouseOver"
    @mouseleave="
      () => {
        hoverNodeId = null;
      }
    "
    @dragleave="handleDragLeave"
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
const dropTargetEl = ref<HTMLElement | null>(null);
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

  // 找到鼠标下方对应的 drop 目标元素
  let targetEl: HTMLElement | null = null;

  // 优先检查插槽占位符
  const slotPlaceholder = (e.target as HTMLElement).closest(
    "[data-drop-parent-id]",
  ) as HTMLElement | null;
  if (slotPlaceholder) {
    targetEl = slotPlaceholder;
  } else {
    // 检查节点元素
    const nodeEl = (e.target as HTMLElement).closest(
      "[data-node-id]",
    ) as HTMLElement | null;
    if (nodeEl) {
      const nodeId = nodeEl.getAttribute("data-node-id");
      if (nodeId) {
        const node = findNodeById(nodeId, schema.value.root);
        if (node && isContainerType(node.type)) {
          targetEl = nodeEl;
        } else {
          // 向上找容器祖先
          let el: HTMLElement | null = nodeEl.parentElement;
          while (el) {
            const id = el.getAttribute("data-node-id");
            if (id) {
              const pNode = findNodeById(id, schema.value.root);
              if (pNode && isContainerType(pNode.type)) {
                targetEl = el;
                break;
              }
            }
            el = el.parentElement;
          }
        }
      }
    }
  }

  // 切换高亮：移除旧目标、添加新目标
  if (dropTargetEl.value && dropTargetEl.value !== targetEl) {
    dropTargetEl.value.classList.remove("editor-drop-target");
  }
  if (targetEl && targetEl !== dropTargetEl.value) {
    targetEl.classList.add("editor-drop-target");
  }
  dropTargetEl.value = targetEl;
};

const handleDragLeave = () => {
  if (dropTargetEl.value) {
    dropTargetEl.value.classList.remove("editor-drop-target");
    dropTargetEl.value = null;
  }
};
const handleDrop = (e: DragEvent): void => {
  e.preventDefault();
  document
    .querySelectorAll(".editor-drop-target")
    .forEach((el) => el.classList.remove("editor-drop-target"));
  dropTargetEl.value = null;

  const type = e.dataTransfer?.getData("component-type");
  console.log(type);
  if (!type) return;

  // 优先检查是否拖放到插槽占位符上（data-drop-parent-id）
  const slotPlaceholder = (e.target as HTMLElement).closest(
    "[data-drop-parent-id]",
  ) as HTMLElement | null;
  if (slotPlaceholder) {
    const pId = slotPlaceholder.getAttribute("data-drop-parent-id")!;
    const sName = slotPlaceholder.getAttribute("data-slot-name") || "default";
    addNode(pId, type, sName);
    return;
  }

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

  // 读取拖放目标的 slot-name，支持投放到特定插槽
  const slotName = target?.getAttribute("data-slot-name") || "default";
  addNode(parentId, type, slotName);
};

const handleMouseOver = (e: MouseEvent): void => {
  const path = e.composedPath();
  for (let i = 0; i < path.length; i++) {
    const ele = path[i] as HTMLElement;
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

<style>
.editor-drop-target {
  background-color: rgba(2, 128, 246, 0.08) !important;
  outline: 2px dashed #1890ff;
  outline-offset: -2px;
  transition: background-color 0.15s ease;
}
</style>
