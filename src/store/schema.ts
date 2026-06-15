import type { PageNode, PageSchema } from "@/types/schema";
import {
  createEmptySchema,
  findNodeById,
  findParentById,
  genId,
  getAvailableSlots,
  getDefaultSlots,
  getDefaultProps,
} from "@/utils";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useSchema = defineStore("schemas", () => {
  const schema = ref<PageSchema>(createEmptySchema());
  const selectedNodeId = ref<string | null>(null);

  const selectedNode = computed<PageNode | null>(() => {
    if (!selectedNodeId.value) return null;
    return findNodeById(selectedNodeId.value, schema.value.root);
  });

  const selectNode = (id: string): void => {
    selectedNodeId.value = id;
  };

  const deselectNode = (): void => {
    selectedNodeId.value = null;
  };

  const findNode = (id: string): PageNode | null => {
    return findNodeById(id, schema.value.root);
  };

  const findParent = (id: string): PageNode | null => {
    if (id === schema.value.root.nodeId) return null;
    return findParentById(id, schema.value.root);
  };

  const addNode = (parentId: string, type: string, slotName = "default"): string => {
    const parent = findNode(parentId);
    if (!parent) return "";

    if (!parent.slots) {
      parent.slots = {};
    }

    const targetSlot = parent.slots[slotName];
    const targetChildren: PageNode[] = Array.isArray(targetSlot)
      ? targetSlot
      : [];
    if (!Array.isArray(targetSlot)) {
      parent.slots[slotName] = targetChildren;
    }

    const newId = genId();
    const newNode: PageNode = {
      nodeId: newId,
      type,
      props: { ...getDefaultProps(type) },
    };

    const defaultSlots = getDefaultSlots(type, newId);
    if (Object.keys(defaultSlots).length > 0) {
      newNode.slots = defaultSlots;
    }

    // 新节点默认隐藏所有非 default 插槽的占位符
    const nonDefaultSlots = getAvailableSlots(type).filter((s) => s !== "default");
    if (nonDefaultSlots.length > 0) {
      newNode.hiddenSlots = nonDefaultSlots;
    }

    targetChildren.push(newNode);
    // selectedNodeId.value = newId;
    return newId;
  };

  const updateNode = (id: string, updates: Record<string, unknown>): void => {
    const node = findNode(id);
    if (!node) return;
    Object.assign(node.props, updates);
  };

  const updateSlot = (id: string, slotName: string, value: PageNode[] | string): void => {
    const node = findNode(id);
    if (!node) return;
    if (!node.slots) {
      node.slots = {};
    }
    if (typeof value === "string" && !value) {
      delete node.slots[slotName];
    } else {
      node.slots[slotName] = value;
    }
  };

  const removeNode = (id: string): void => {
    if (id === schema.value.root.nodeId) return;
    const parent = findParent(id);
    if (!parent?.slots) return;
    for (const slotName of Object.keys(parent.slots)) {
      const slotValue = parent.slots[slotName];
      if (typeof slotValue === "string") continue;
      const filtered = slotValue.filter((c) => c.nodeId !== id);
      if (filtered.length > 0) {
        parent.slots[slotName] = filtered;
      } else {
        delete parent.slots[slotName];
      }
    }
    if (selectedNodeId.value === id) {
      selectedNodeId.value = null;
    }
  };

  const toggleSlotVisibility = (id: string, slotName: string): void => {
    const node = findNode(id);
    if (!node) return;
    if (!node.hiddenSlots) {
      node.hiddenSlots = [];
    }
    const idx = node.hiddenSlots.indexOf(slotName);
    if (idx >= 0) {
      node.hiddenSlots.splice(idx, 1);
      if (node.hiddenSlots.length === 0) {
        delete node.hiddenSlots;
      }
    } else {
      node.hiddenSlots.push(slotName);
    }
  };

  const updateEvents = (id: string, events: string[]): void => {
    const node = findNode(id);
    if (!node) return;
    if (events.length > 0) {
      node.events = events;
    } else {
      delete node.events;
    }
  };

  const resetSchema = (): void => {
    schema.value = createEmptySchema();
    selectedNodeId.value = null;
  };

  const importSchema = (newSchema: PageSchema): void => {
    schema.value = newSchema;
    selectedNodeId.value = null;
  };

  return {
    schema,
    selectedNodeId,
    selectedNode,
    selectNode,
    deselectNode,
    findNode,
    findParent,
    addNode,
    updateNode,
    updateSlot,
    updateEvents,
    toggleSlotVisibility,
    removeNode,
    resetSchema,
    importSchema,
  };
}, {
  persist: true,
});
