<script setup lang="ts">
import { computed } from "vue";
import type { PageNode } from "@/types/schema";
import { resolveComponentType } from "./registry";
import { getAvailableSlots, getAppendableSlots } from "@/utils";
import { useSchema } from "@/store/schema";
import { storeToRefs } from "pinia";
import SlotPlaceholder from "./slotPlaceholder.vue";
import { useRefsMap } from "@/composables/useRefsMap";
import { useFormModelBinding } from "@/composables/useFormModelBinding";

const props = defineProps<{
  node: PageNode;
}>();

const schemaStore = useSchema();
const { selectedNodeId } = storeToRefs(schemaStore);

const component = computed(() => resolveComponentType(props.node.type));

/** 排除 Vue 模板 ref 属性（它应作为模板指令而非组件 prop） */
const filteredProps = computed(() => {
  const { ref, ...rest } = props.node.props;
  return rest;
});

const refsMap = useRefsMap();

/** ref 回调：将组件实例注册到共享 ref 映射表 */
function handleRef(el: unknown) {
  if (!refsMap) return;
  const name = props.node.props.ref as string | undefined;
  if (!name) return;
  if (el) {
    refsMap[name] = el;
  } else {
    delete refsMap[name];
  }
}

const { updateNode } = schemaStore;

// a-form → a-form-item → 输入组件的 model 和 v-model 自动绑定
const { finalProps } = useFormModelBinding(props, filteredProps);

/** 组件支持但尚未填充的插槽名列表 */
const unfilledSlots = computed(() => {
  const available = getAvailableSlots(props.node.type);
  const filled = props.node.slots ? Object.keys(props.node.slots) : [];
  return available.filter((s) => {
    // 已填充插槽内容的，不再显示占位
    if (filled.includes(s)) return false;
    // 如果该插槽名对应的 prop 已有有效值，则不再显示插槽占位（如 a-card 的 title）
    const propValue = props.node.props?.[s];
    if (propValue !== undefined && propValue !== null && propValue !== "")
      return false;
    return true;
  });
});

/** 允许追加子节点的插槽名列表（即使已填充也显示 compact 占位符） */
const appendableSlots = computed(() => getAppendableSlots(props.node.type));

const isSelected = computed(() => selectedNodeId.value === props.node.nodeId);
</script>

<template>
  <component
    :is="component"
    :data-node-id="node.nodeId"
    :style="node.style"
    v-bind="finalProps"
    @update:value="(val: unknown) => updateNode(node.nodeId, { value: val })"
    :id="node.props.id"
    :ref="handleRef"
  >
    <template
      v-for="(slotNodes, slotName) in node.slots"
      :key="slotName"
      #[slotName]
    >
      <template v-if="typeof slotNodes === 'string'">{{ slotNodes }}</template>
      <template v-else>
        <Renderer
          v-for="child in slotNodes"
          :key="child.nodeId"
          :node="child"
        />
        <SlotPlaceholder
          v-if="appendableSlots.includes(slotName)"
          :slot-name="slotName"
          :parent-node-id="node.nodeId"
          :parent-selected="isSelected"
          compact
        />
      </template>
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
