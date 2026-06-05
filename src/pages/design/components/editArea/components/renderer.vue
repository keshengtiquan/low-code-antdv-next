<script setup lang="ts">
import { computed } from "vue";
import type { PageNode } from "@/types/schema";
import { resolveComponentType } from "./registry";
import { getAvailableSlots } from "@/utils";
import { useSchema } from "@/store/schema";
import { storeToRefs } from "pinia";
import SlotPlaceholder from "./slotPlaceholder.vue";

const props = defineProps<{
  node: PageNode;
}>();

const schemaStore = useSchema();
const { selectedNodeId } = storeToRefs(schemaStore);

const component = computed(() => resolveComponentType(props.node.type));

/** 组件支持但尚未填充的插槽名列表 */
const unfilledSlots = computed(() => {
  const available = getAvailableSlots(props.node.type);
  const filled = props.node.slots ? Object.keys(props.node.slots) : [];
  return available.filter((s) => {
    // 已填充插槽内容的，不再显示占位
    if (filled.includes(s)) return false;
    // 如果该插槽名对应的 prop 已有有效值，则不再显示插槽占位（如 a-card 的 title）
    const propValue = props.node.props?.[s];
    if (propValue !== undefined && propValue !== null && propValue !== "") return false;
    return true;
  });
});

const isSelected = computed(() => selectedNodeId.value === props.node.nodeId);
</script>

<template>
  <component
    :is="component"
    :data-node-id="node.nodeId"
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
      <Renderer
        v-else
        v-for="child in slotNodes"
        :key="child.nodeId"
        :node="child"
      />
    </template>
    <template
      v-for="slotName in unfilledSlots"
      :key="`placeholder_${slotName}`"
      #[slotName]
    >
      <SlotPlaceholder
        :slot-name="slotName"
        :parent-node-id="node.nodeId"
        :parent-selected="isSelected"
      />
    </template>
  </component>
</template>
