<script lang="ts">
import { h, defineComponent } from "vue";

/**
 * 渲染 render 代码字符串的结果。
 * 使用纯 render function（非 template），因此可以直接返回 VNode，
 * 避免模板中 {{ vnode }} 的 JSON 序列化循环引用问题。
 */
export default defineComponent({
  props: {
    renderCode: { type: String, required: true },
    text: {},
    record: {},
    index: { type: Number, required: true },
  },
  setup(props) {
    return () => {
      try {
        const fn = new Function(
          "h",
          "text",
          "record",
          "index",
          `return (${props.renderCode})(text, record, index)`,
        );
        return fn(h, props.text, props.record, props.index);
      } catch (e: unknown) {
        console.warn(
          "[a-table] render error:",
          (e as Error).message,
        );
        return String(props.text ?? "");
      }
    };
  },
});
</script>
