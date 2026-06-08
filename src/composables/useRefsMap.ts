import { provide, inject, reactive, type InjectionKey } from 'vue';

/**
 * 共享 ref 映射表，用于跨递归渲染器收集组件实例。
 * key 为用户设置的 ref 名称，value 为对应组件的实例。
 */
export type RefsMap = Record<string, unknown>;

const REFS_MAP_KEY: InjectionKey<RefsMap> = Symbol('refsMap');

/**
 * 在根组件中调用：创建响应式 ref 映射表并通过 provide 向下传递。
 * @returns 创建的响应式映射表
 */
export function provideRefsMap(): RefsMap {
  const refsMap = reactive<RefsMap>({});
  provide(REFS_MAP_KEY, refsMap);
  return refsMap;
}

/**
 * 在子渲染器中调用：注入由根组件提供的 ref 映射表。
 * @returns ref 映射表，若未提供则返回 undefined
 */
export function useRefsMap(): RefsMap | undefined {
  return inject(REFS_MAP_KEY, undefined);
}
