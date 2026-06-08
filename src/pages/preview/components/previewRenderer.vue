<script setup lang="ts">
import { computed } from "vue";
import type { PageNode } from "@/types/schema";
import { resolveComponentType } from "@/pages/design/components/editArea/components/registry";

const props = defineProps<{
  node: PageNode;
}>();

const component = computed(() => resolveComponentType(props.node.type));
</script>

<template>
  <component
    :is="component"
    :style="node.style"
    v-bind="node.props"
    :id="node.props.id"
  >
    <template
      v-for="(slotNodes, slotName) in node.slots"
      :key="slotName"
      #[slotName]
    >
      <template v-if="typeof slotNodes === 'string'">{{ slotNodes }}</template>
      <PreviewRenderer
        v-else
        v-for="child in slotNodes"
        :key="child.nodeId"
        :node="child"
      />
    </template>
  </component>
</template>
