import { computed, type ComputedRef } from "vue";
import type { PageNode } from "@/types/schema";
import {
  useProvideFormModel,
  useInjectFormModel,
  useProvideFieldName,
  useInjectFieldName,
} from "./useFormModel";

/** 需要与 form model 建立 v-model 双向绑定的输入组件类型 */
const FORM_INPUT_TYPES = new Set([
  "a-input",
  "a-input-number",
  "a-textarea",
  "a-select",
  "a-tree-select",
  "a-cascader",
  "a-date-picker",
  "a-month-picker",
  "a-time-picker",
  "a-range-picker",
  "a-checkbox",
  "a-switch",
  "a-rate",
  "a-radio-group",
  "a-slider",
  "a-transfer",
]);

/**
 * 为 a-form → a-form-item → 输入组件链路自动建立 model 和 v-model 绑定。
 * 必须在组件 setup 期间调用（依赖 provide/inject 的调用时机）。
 *
 * @param props   当前渲染节点的 props（用于读取 node.type, node.props.name 等）
 * @param filteredProps  已剥离 ref 的基础 props computed
 * @returns finalProps —— 可直接 v-bind 到 <component> 的最终 props computed
 */
export function useFormModelBinding(
  props: { node: PageNode },
  filteredProps: ComputedRef<Record<string, unknown>>,
) {
  const isForm = computed(() => props.node.type === "a-form");
  const isFormItem = computed(() => props.node.type === "a-form-item");
  const isFormInput = computed(() => FORM_INPUT_TYPES.has(props.node.type));

  // a-form: 创建 model 并 provide
  const formModel = isForm.value ? useProvideFormModel() : undefined;

  // a-form-item: 提供字段名
  if (isFormItem.value) {
    useProvideFieldName(props.node.props.name as string | undefined);
  }

  // 输入组件: 注入 model 和字段名
  const injectedModel = isFormInput.value ? useInjectFormModel() : undefined;
  const injectedFieldName = isFormInput.value ? useInjectFieldName() : undefined;

  const finalProps = computed(() => {
    const base = filteredProps.value;

    // a-form: 附加 model prop
    if (isForm.value && formModel) {
      return { ...base, model: formModel };
    }

    // 输入组件（在表单内）: 用 model 值替换 value，并监听回写
    if (isFormInput.value && injectedModel && injectedFieldName !== undefined) {
      return {
        ...base,
        value: injectedModel[injectedFieldName],
        "onUpdate:value": (val: unknown) => {
          injectedModel[injectedFieldName] = val;
        },
      };
    }

    return base;
  });

  return { finalProps };
}
