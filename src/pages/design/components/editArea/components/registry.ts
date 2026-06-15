import type { Component } from "vue";
import Page from "@/components/page/index.vue";
import Text from "@/components/text/index.vue";
import ATable from "@/components/a-table/index.vue";

const builtInRegistry: Record<string, Component> = {
  page: Page,
  text: Text,
  "a-table": ATable,
};
export function resolveComponentType(type: string): Component | string {
  return builtInRegistry[type] ?? type;
}
