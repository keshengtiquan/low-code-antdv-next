<template>
  <div class="preview-page">
    <PreviewRenderer :node="schema.root" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useSchema } from "@/store/schema";
import { storeToRefs } from "pinia";
import PreviewRenderer from "./components/previewRenderer.vue";

const { schema } = storeToRefs(useSchema());

onMounted(() => {
  const pageSchema = schema.value;

  // 按顺序执行内联 JS 文件
  if (pageSchema.inlineScripts && pageSchema.inlineScripts.length > 0) {
    for (const file of pageSchema.inlineScripts) {
      if (!file.code) continue;
      try {
        new Function(file.code)();
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
