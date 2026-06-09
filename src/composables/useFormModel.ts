import { provide, inject, reactive, type InjectionKey } from 'vue';

/**
 * Form model 上下文，用于在 a-form → a-form-item → 输入组件链路中
 * 自动传递 reactive model 和字段名，以建立 v-model 双向绑定。
 */
export type FormModel = Record<string, unknown>;

const FORM_MODEL_KEY: InjectionKey<FormModel> = Symbol('formModel');
const FIELD_NAME_KEY: InjectionKey<string> = Symbol('fieldName');

/**
 * 在渲染 a-form 时调用：创建响应式 model 并通过 provide 向下传递。
 * @returns 新创建的响应式 model 对象
 */
export function useProvideFormModel(): FormModel {
  const model = reactive<FormModel>({});
  provide(FORM_MODEL_KEY, model);
  return model;
}

/**
 * 在渲染表单项或输入组件时调用：注入父级 a-form 提供的 model。
 * @returns form model，若未在表单内则返回 undefined
 */
export function useInjectFormModel(): FormModel | undefined {
  return inject(FORM_MODEL_KEY, undefined);
}

/**
 * 在渲染 a-form-item 时调用：提供当前字段名。
 * @param name 字段名（来自 a-form-item 的 name prop）
 */
export function useProvideFieldName(name: string | undefined): void {
  if (name !== undefined) {
    provide(FIELD_NAME_KEY, name);
  }
}

/**
 * 在渲染输入组件时调用：注入父级 a-form-item 提供的字段名。
 * @returns 字段名，若未在表单项内则返回 undefined
 */
export function useInjectFieldName(): string | undefined {
  return inject(FIELD_NAME_KEY, undefined);
}
