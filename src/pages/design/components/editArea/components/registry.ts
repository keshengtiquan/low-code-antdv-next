import type { Component } from "vue";
import Page from "@/components/page/index.vue";
import Text from "@/components/text/index.vue";

const builtInRegistry: Record<string, Component> = {
  page: Page,
  text: Text,
};
export function resolveComponentType(type: string): Component | string {
  return builtInRegistry[type] ?? type;
}
