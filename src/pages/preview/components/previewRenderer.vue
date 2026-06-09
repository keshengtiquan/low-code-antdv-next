<script setup lang="ts">
import { computed } from "vue";
import type { PageNode } from "@/types/schema";
import { resolveComponentType } from "@/pages/design/components/editArea/components/registry";
import { useRefsMap } from "@/composables/useRefsMap";
import { useFormModelBinding } from "@/composables/useFormModelBinding";
import {
  useEventManager,
  createEventProxy,
  eventToPropName,
} from "@/composables/useEventProxy";

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
const eventManager = useEventManager();

/** ref 回调：将组件实例注册到共享 ref 映射表 */
function handleRef(el: unknown) {
  if (!refsMap) return;
  const name = props.node.props.ref as string | undefined;
  if (!name) return;
  if (el) {
    refsMap[name] = el;
    // 如果该节点声明了需要转发的事件，则创建对应的 EventProxy
    if (eventManager && props.node.events && props.node.events.length > 0) {
      if (!eventManager.has(name)) {
        eventManager.set(name, createEventProxy());
      }
    }
  } else {
    delete refsMap[name];
    if (eventManager) eventManager.delete(name);
  }
}

// a-form → a-form-item → 输入组件的 model 和 v-model 自动绑定
const { finalProps: formBindingProps } = useFormModelBinding(props, filteredProps);

/** 在 formBindingProps 基础上附加事件转发处理器 */
const finalProps = computed(() => {
  const base = formBindingProps.value;
  const refName = props.node.props.ref as string | undefined;
  if (!refName || !eventManager) return base;

  const nodeEvents = props.node.events;
  if (!nodeEvents || nodeEvents.length === 0) return base;

  const proxy = eventManager.get(refName);
  if (!proxy) return base;

  const handlers: Record<string, (...args: unknown[]) => void> = {};
  for (const event of nodeEvents) {
    const propName = eventToPropName(event);
    const forwarder = (...args: unknown[]) => proxy.$emit(event, ...args);
    const existing = base[propName];

    if (existing && typeof existing === 'function') {
      // 链式调用：先执行已有逻辑（如 form model binding），再转发到 EventProxy
      handlers[propName] = (...args: unknown[]) => {
        (existing as (...a: unknown[]) => void)(...args);
        forwarder(...args);
      };
    } else if (!(propName in base)) {
      // 该 prop 不存在于已有 props 中，直接添加转发处理器
      handlers[propName] = forwarder;
    }
    // 如果 propName 存在于 base 但非函数（如恰好同名的 boolean prop），跳过不覆盖
  }

  return { ...base, ...handlers };
});
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
