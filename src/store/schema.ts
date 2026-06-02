import type { PageNode, PageSchema } from "@/types/schema";
import {
  createEmptySchema,
  findNodeById,
  findParentById,
  genId,
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

  const addNode = (parentId: string, type: string): string => {
    const parent = findNode(parentId);
    if (!parent) return "";

    if (!parent.slots) {
      parent.slots = {};
    }

    const defaultSlot = parent.slots.default;
    const defaultChildren: PageNode[] = Array.isArray(defaultSlot)
      ? defaultSlot
      : [];
    if (!Array.isArray(defaultSlot)) {
      parent.slots.default = defaultChildren;
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

    defaultChildren.push(newNode);
    // selectedNodeId.value = newId;
    return newId;
  };

  const updateNode = (id: string, updates: Record<string, unknown>): void => {
    const node = findNode(id);
    if (!node) return;
    Object.assign(node.props, updates);
  };

  const removeNode = (id: string): void => {
    if (id === schema.value.root.nodeId) return;
    const parent = findParent(id);
    if (!parent?.slots) return;
    for (const slotName of Object.keys(parent.slots)) {
      const slotValue = parent.slots[slotName];
      if (typeof slotValue === "string") continue;
      parent.slots[slotName] = slotValue.filter((c) => c.nodeId !== id);
    }
    if (selectedNodeId.value === id) {
      selectedNodeId.value = null;
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
    removeNode,
    resetSchema,
    importSchema,
  };
});
