<script setup lang="ts">
import "@/utils/monacoEnv";
import * as monaco from "monaco-editor";
import type { editor } from "monaco-editor";
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";

const props = defineProps<{
  modelValue?: string;
  language?: string;
  theme?: string;
  readOnly?: boolean;
  options?: editor.IStandaloneEditorConstructionOptions;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const containerRef = ref<HTMLElement | null>(null);
let editorInstance: editor.IStandaloneCodeEditor | null = null;
let resizeObserver: ResizeObserver | null = null;
let isDisposing = false;

onMounted(async () => {
  await nextTick();
  if (!containerRef.value) return;

  editorInstance = monaco.editor.create(containerRef.value, {
    value: props.modelValue ?? "",
    language: props.language ?? "javascript",
    theme: props.theme ?? "vs-dark",
    readOnly: props.readOnly ?? false,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: false,
    tabSize: 2,
    fontSize: 13,
    lineNumbers: "on",
    renderWhitespace: "selection",
    ...props.options,
  });

  editorInstance.onDidChangeModelContent(() => {
    if (isDisposing || !editorInstance) return;
    emit("update:modelValue", editorInstance.getValue());
  });

  resizeObserver = new ResizeObserver(() => {
    editorInstance?.layout();
  });
  resizeObserver.observe(containerRef.value);
});

onBeforeUnmount(() => {
  isDisposing = true;
  resizeObserver?.disconnect();
  resizeObserver = null;
  editorInstance?.dispose();
  editorInstance = null;
});

watch(
  () => props.language,
  (newLang) => {
    if (!editorInstance) return;
    const model = editorInstance.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, newLang ?? "javascript");
    }
  },
);

watch(
  () => props.theme,
  (newTheme) => {
    monaco.editor.setTheme(newTheme ?? "vs-dark");
  },
);

watch(
  () => props.readOnly,
  (val) => {
    editorInstance?.updateOptions({ readOnly: val ?? false });
  },
);

watch(
  () => props.modelValue,
  (newVal) => {
    if (!editorInstance) return;
    if (newVal !== editorInstance.getValue()) {
      editorInstance.setValue(newVal ?? "");
    }
  },
);

defineExpose({
  getValue: () => editorInstance?.getValue() ?? "",
  setValue: (value: string) => editorInstance?.setValue(value),
  getEditor: () => editorInstance,
});
</script>

<template>
  <div ref="containerRef" class="monaco-editor-container"></div>
</template>

<style scoped>
.monaco-editor-container {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
