<template>
  <div class="preview-page">
    <PreviewRenderer :node="schema.root" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, getCurrentInstance } from "vue";
import { App } from "antdv-next";
import { useSchema } from "@/store/schema";
import { storeToRefs } from "pinia";
import PreviewRenderer from "./components/previewRenderer.vue";
import { provideRefsMap } from "@/composables/useRefsMap";
import {
  provideEventManager,
  createEventProxy,
} from "@/composables/useEventProxy";

const { schema } = storeToRefs(useSchema());
const { message, modal, notification } = App.useApp();

// 获取当前 Vue 组件实例和应用实例
const instance = getCurrentInstance();
const proxy = instance?.proxy;
const app = instance?.appContext.app;

// 创建共享的 ref 映射表，让递归 PreviewRenderer 中注册的组件 ref 可从根页面访问
const refsMap = provideRefsMap();

// 创建共享的事件管理器，让递归 PreviewRenderer 中组件的 emit 事件可被脚本监听
const eventManager = provideEventManager();

// 包装 proxy，将 $refs 访问委托到共享 ref 映射表
const proxiedProxy = proxy
  ? new Proxy(proxy, {
      get(target, key, receiver) {
        if (key === '$refs') {
          return refsMap;
        }
        return Reflect.get(target, key, receiver);
      },
    })
  : undefined;

const context = {
  // antdv-next App 方法
  message,
  modal,
  notification,
  // Vue 实例
  instance,
  proxy: proxiedProxy,
  app,
  // 直接暴露 refs 映射表，方便 context.refs.xxx 访问
  refs: refsMap,

  /** 监听指定 ref 组件的某个事件 */
  $on(refName: string, event: string, handler: (...args: unknown[]) => void) {
    let proxy = eventManager.get(refName);
    if (!proxy) {
      proxy = createEventProxy();
      eventManager.set(refName, proxy);
    }
    proxy.$on(event, handler);
  },

  /** 移除指定 ref 组件的事件监听 */
  $off(refName: string, event: string, handler?: (...args: unknown[]) => void) {
    const proxy = eventManager.get(refName);
    if (proxy) proxy.$off(event, handler);
  },

  /** 一次性监听指定 ref 组件的某个事件 */
  $once(refName: string, event: string, handler: (...args: unknown[]) => void) {
    let proxy = eventManager.get(refName);
    if (!proxy) {
      proxy = createEventProxy();
      eventManager.set(refName, proxy);
    }
    proxy.$once(event, handler);
  },
};

onMounted(() => {
  const pageSchema = schema.value;

  // 按顺序执行内联 JS 文件
  if (pageSchema.inlineScripts && pageSchema.inlineScripts.length > 0) {
    for (const file of pageSchema.inlineScripts) {
      if (!file.code) continue;
      try {
        new Function('context', file.code)(context);
      } catch (e) {
        console.error(`[预览] 脚本 "${file.name}" 执行错误:`, e);
      }
    }
  }
});
</script>

<style scoped>
.preview-page {
  width: 100%;
  height: 100vh;
  overflow: auto;
}
</style>
