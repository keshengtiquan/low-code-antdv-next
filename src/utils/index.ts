import { paletteGroups } from "@/config";
import type { PaletteItem } from "@/config";
import { CONTAINER_TYPES } from "@/constants";
import type { PageNode, PageSchema } from "@/types/schema";
import * as UUID from "uuid";

export const genId = (): string => {
  return UUID.v4().replace(/-/g, "");
};

// 查找节点自身
export function findNodeById(id: string, node: PageNode): PageNode | null {
  if (!node) return null;
  if (node.nodeId === id) return node;

  if (node.slots) {
    for (const slotNodes of Object.values(node.slots)) {
      if (typeof slotNodes === "string") continue;
      for (const child of slotNodes) {
        const found = findNodeById(id, child);
        if (found) return found;
      }
    }
  }
  return null;
}

// 查找节点的父节点
export function findParentById(id: string, node: PageNode): PageNode | null {
  if (!node) return null;

  if (node.slots) {
    for (const slotNodes of Object.values(node.slots)) {
      if (typeof slotNodes === "string") continue;
      for (const child of slotNodes) {
        if (child.nodeId === id) return node;
        const found = findParentById(id, child);
        if (found) return found;
      }
    }
  }
  return null;
}

export function isContainerType(type: string): boolean {
  return CONTAINER_TYPES.has(type);
}

export function findPaletteItem(type: string): PaletteItem | undefined {
  for (const group of paletteGroups) {
    const item = group.components.find((c) => c.type === type);
    if (item) return item;
  }
  return undefined;
}

export function getAvailableSlots(type: string): string[] {
  const item = findPaletteItem(type);
  return item?.availableSlots ?? [];
}

export function getAppendableSlots(type: string): string[] {
  const item = findPaletteItem(type);
  return item?.appendableSlots ?? [];
}

export function getDefaultProps(type: string): Record<string, unknown> {
  const item = findPaletteItem(type);
  return item?.props ?? {};
}

export function getDefaultSlots(
  type: string,
  parentId: string,
): Record<string, PageNode[] | string> {
  const item = findPaletteItem(type);
  if (!item?.slots) return {};

  const result: Record<string, PageNode[] | string> = {};
  for (const [slotName, factory] of Object.entries(item.slots)) {
    result[slotName] = factory(parentId);
  }
  return result;
}

export function createEmptySchema(): PageSchema {
  return {
    version: "1.0.0",
    meta: { title: "New Page" },
    root: {
      nodeId: "root",
      type: "page",
      props: { background: "#ffffff" },
      slots: {},
    },
  };
}
