<script lang="ts">
import { h, defineComponent, getCurrentInstance } from "vue";
import { kebabToPascalCase } from "@/utils";

/**
 * 渲染 render 代码字符串的结果。
 * 使用纯 render function（非 template），因此可以直接返回 VNode，
 * 避免模板中 {{ vnode }} 的 JSON 序列化循环引用问题。
 *
 * 关键：Vue 模板中的 <a-tag> 会被编译器转为 h(resolveComponent("a-tag"))，
 * 但裸 h("a-tag") 不会自动解析全局注册的组件，会被当成普通 DOM 元素。
 * 因此这里用 resolveH 包装：字符串类型先从 appContext.components 查找，
 * 找到已注册组件就用组件对象调用 h()，找不到才走原生的字符串 → DOM 逻辑。
 */
export default defineComponent({
  props: {
    renderCode: { type: String, required: true },
    text: {},
    record: {},
    index: { type: Number, required: true },
  },
  setup(props) {
    const instance = getCurrentInstance();
    const components = instance?.appContext?.components ?? {};

    /** 可解析全局注册组件的 h 包装 */
    function resolveH(type: any, p?: any, c?: any): any {
      if (typeof type === "string") {
        // Vue 的 app.component('ATag', Tag) 以 PascalCase 存储 key
        // h('a-tag') 需要转 PascalCase 去查表
        const resolved =
          components[type] || components[kebabToPascalCase(type)];
        if (resolved) {
          return h(resolved, p, c);
        }
        // 未匹配到组件时，按 HTML 元素处理。
        // 必须匹配 Vue h() 的参数个数逻辑：c 为 undefined 时只传 2 个参数，
        // 否则 h() 会把 p（可能是字符串）当 props 处理 → 'value' in 'John Brown' 报错。
        if (c === undefined) {
          return h(type, p);
        }
      }
      return h(type, p, c);
    }

    return () => {
      try {
        const fn = new Function(
          "h",
          "text",
          "record",
          "index",
          `return (${props.renderCode})(text, record, index)`,
        );
        return fn(resolveH, props.text, props.record, props.index);
      } catch (e: unknown) {
        console.warn("[a-table] render error:", (e as Error).message);
        return String(props.text ?? "");
      }
    };
  },
});
</script>
