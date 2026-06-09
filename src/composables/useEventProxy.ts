import { provide, inject, reactive, type InjectionKey } from 'vue';

/**
 * 轻量级事件代理，提供 $on/$off/$once/$emit 方法。
 * 用于桥接 Vue 组件事件到脚本执行上下文。
 */
export type EventHandler = (...args: unknown[]) => void;

export interface EventProxy {
  $on(event: string, handler: EventHandler): void;
  $off(event: string, handler?: EventHandler): void;
  $once(event: string, handler: EventHandler): void;
  $emit(event: string, ...args: unknown[]): void;
}

/** 创建新的 EventProxy 实例 */
export function createEventProxy(): EventProxy {
  const listeners = new Map<string, EventHandler[]>();

  const $on = (event: string, handler: EventHandler): void => {
    if (!listeners.has(event)) {
      listeners.set(event, []);
    }
    listeners.get(event)!.push(handler);
  };

  const $off = (event: string, handler?: EventHandler): void => {
    if (!handler) {
      listeners.delete(event);
      return;
    }
    const handlers = listeners.get(event);
    if (!handlers) return;
    const idx = handlers.indexOf(handler);
    if (idx !== -1) handlers.splice(idx, 1);
    if (handlers.length === 0) listeners.delete(event);
  };

  const $once = (event: string, handler: EventHandler): void => {
    const wrapper = (...args: unknown[]) => {
      $off(event, wrapper);
      handler(...args);
    };
    $on(event, wrapper);
  };

  const $emit = (event: string, ...args: unknown[]): void => {
    const handlers = listeners.get(event);
    if (!handlers) return;
    for (const h of [...handlers]) {
      h(...args);
    }
  };

  return { $on, $off, $once, $emit };
}

/** 将事件名转为 Vue 3 props 名：'click' → 'onClick'，'update:value' → 'onUpdate:value' */
export function eventToPropName(event: string): string {
  const colonIdx = event.indexOf(':');
  if (colonIdx !== -1) {
    const prefix = event.slice(0, colonIdx);
    const suffix = event.slice(colonIdx + 1);
    return 'on' + prefix[0].toUpperCase() + prefix.slice(1) + ':' + suffix;
  }
  return 'on' + event[0].toUpperCase() + event.slice(1);
}

/** 事件管理器类型：key 为 ref 名称，value 为对应的 EventProxy */
export type EventManager = Map<string, EventProxy>;

const EVENT_MANAGER_KEY: InjectionKey<EventManager> = Symbol('eventManager');

/**
 * 在根组件中调用：创建响应式事件管理器并通过 provide 向下传递。
 * @returns 创建的事件管理器
 */
export function provideEventManager(): EventManager {
  const manager = reactive(new Map<string, EventProxy>()) as EventManager;
  provide(EVENT_MANAGER_KEY, manager);
  return manager;
}

/**
 * 在子渲染器中调用：注入由根组件提供的事件管理器。
 * @returns 事件管理器，若未提供则返回 undefined
 */
export function useEventManager(): EventManager | undefined {
  return inject(EVENT_MANAGER_KEY, undefined);
}
