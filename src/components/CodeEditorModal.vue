<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import MonacoEditor from "@/components/MonacoEditor.vue";

const props = withDefaults(
  defineProps<{
    open: boolean;
    title?: string;
    code?: string;
    language?: string;
    hint?: string;
    height?: string;
  }>(),
  {
    title: "编辑代码",
    code: "",
    language: "javascript",
    hint: "",
    height: "500px",
  },
);

const emit = defineEmits<{
  "update:open": [value: boolean];
  save: [code: string];
}>();

/** 内部编辑副本，避免直接修改外部 code prop */
const editingCode = ref("");

// 打开弹框时从 code prop 初始化
watch(
  () => props.open,
  (val) => {
    if (val) {
      editingCode.value = props.code ?? "";
    }
  },
);

const openComputed = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});

function handleOk() {
  emit("save", editingCode.value);
  emit("update:open", false);
}

function handleCancel() {
  emit("update:open", false);
}

/** Ctrl+S 快捷键 */
function onWindowKeydown(e: KeyboardEvent) {
  if (!props.open) return;
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    emit("save", editingCode.value);
  }
}

onMounted(() => window.addEventListener("keydown", onWindowKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onWindowKeydown));
</script>

<template>
  <a-modal
    v-model:open="openComputed"
    :title="title"
    width="50%"
    @ok="handleOk"
    cancelText="取消"
    okText="保存"
    @cancel="handleCancel"
  >
    <div class="code-editor-modal-body">
      <div v-if="hint" class="code-editor-modal-hint">{{ hint }}</div>
      <div class="code-editor-modal-wrapper" :style="{ height }">
        <MonacoEditor
          v-model="editingCode"
          :language="language"
          theme="vs"
          :options="{
            fontSize: 14,
            lineNumbers: 'on',
            minimap: { enabled: false },
          }"
        />
      </div>
    </div>
  </a-modal>
</template>

<style scoped>
.code-editor-modal-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.code-editor-modal-hint {
  font-size: 12px;
  color: #999;
  line-height: 1.6;
}
.code-editor-modal-wrapper {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;
}
</style>
