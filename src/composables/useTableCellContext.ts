import { provide, inject, toRef, type InjectionKey, type Ref, type MaybeRef } from 'vue';

/**
 * 表格单元格上下文，包含当前渲染单元格的列/行/值信息。
 * 在 a-table 封装组件中通过 #bodyCell scoped slot 提供，
 * 子组件通过 useInjectTableCellContext() 获取。
 */
export interface TableCellContext {
  column: Record<string, unknown>;
  text: unknown;
  record: Record<string, unknown>;
  index: number;
}

const TABLE_CELL_KEY: InjectionKey<Ref<TableCellContext>> = Symbol('tableCell');

/**
 * 在表格封装组件的 bodyCell 分发逻辑中调用，向子组件树提供当前单元格上下文。
 * 传入的 context 会被包装为响应式 ref，确保 props 更新时注入方也能同步。
 */
export function useProvideTableCellContext(context: MaybeRef<TableCellContext>): void {
  provide(TABLE_CELL_KEY, toRef(context));
}

/**
 * 在表格单元格内的子组件中调用，获取当前单元格的上下文信息。
 * @returns 包含 column、text、record、index 的响应式 ref，若不在表格单元格内则返回 undefined
 */
export function useInjectTableCellContext(): Ref<TableCellContext> | undefined {
  return inject(TABLE_CELL_KEY, undefined);
}
