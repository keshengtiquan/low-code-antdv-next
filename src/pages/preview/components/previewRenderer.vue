<script setup lang="ts">
import { computed } from "vue";
import type { PageNode } from "@/types/schema";
import { resolveComponentType } from "@/pages/design/components/editArea/components/registry";
import { useRefsMap } from "@/composables/useRefsMap";
import { useFormModelBinding } from "@/composables/useFormModelBinding";

const props = defineProps<{
  node: PageNode;
}>();

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

// a-form → a-form-item → 输入组件的 model 和 v-model 自动绑定
const { finalProps } = useFormModelBinding(props, filteredProps);
</script>

<template>
  <component
    :is="component"
    :style="node.style"
    v-bind="finalProps"
    :id="node.props.id"
    :ref="handleRef"
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
