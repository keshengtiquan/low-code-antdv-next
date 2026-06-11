<script setup lang="ts">
import { useSchema } from "@/store/schema";
import { storeToRefs } from "pinia";
import { ref, watch, onBeforeUnmount } from "vue";
import { PlusOutlined } from "@antdv-next/icons";
import MonacoEditor from "@/components/MonacoEditor.vue";

const schemaStore = useSchema();
const { schema } = storeToRefs(schemaStore);

const editingIndex = ref<number | null>(null);
const createModalOpen = ref(false);
const newFileName = ref("");
const currentCode = ref("");
const isModified = ref(false);
const monacoRef = ref<InstanceType<typeof MonacoEditor> | null>(null);
function ensureInlineScripts() {
  if (!schema.value.inlineScripts) {
    schema.value.inlineScripts = [];
  }
  return schema.value.inlineScripts;
}

function openFile(index: number): void {
  editingIndex.value = index;
}

function openCreateModal(): void {
  newFileName.value = "";
  createModalOpen.value = true;
}

function confirmCreateFile(): void {
  const name = newFileName.value.trim();
  if (!name) return;
  ensureInlineScripts().push({ name, code: "" });
  createModalOpen.value = false;
  editingIndex.value = schema.value.inlineScripts!.length - 1;
}

function deleteFile(index: number): void {
  if (editingIndex.value === index) {
    editingIndex.value = null;
  } else if (editingIndex.value !== null && editingIndex.value > index) {
    editingIndex.value--;
  }
  ensureInlineScripts().splice(index, 1);
}

function onCodeChange(code: string): void {
  if (editingIndex.value === null) return;
  const originalCode =
    schema.value.inlineScripts?.[editingIndex.value]?.code ?? "";
  isModified.value = code !== originalCode;
}

function handleSave(): void {
  if (editingIndex.value === null) return;
  const code = monacoRef.value?.getValue() ?? "";
  schema.value.inlineScripts![editingIndex.value].code = code;
  isModified.value = false;
  editingIndex.value = null;
}

function handleSaveAndClose(): void {
  handleSave();
  editingIndex.value = null;
}

/** DOM 级拦截 Ctrl+S，阻止浏览器默认保存页面行为 */
function onKeyDown(e: KeyboardEvent): void {
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    handleSave();
  }
}

// 文件打开/关闭时：加载代码并绑定/解绑 Ctrl+S
watch(editingIndex, (newIndex) => {
  if (newIndex !== null) {
    currentCode.value = schema.value.inlineScripts?.[newIndex]?.code ?? "";
    isModified.value = false;
    document.addEventListener("keydown", onKeyDown);
  } else {
    document.removeEventListener("keydown", onKeyDown);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeyDown);
});
</script>

<template>
  <div class="script-editor">
    <!-- 内联 JS 文件列表 -->
    <div class="section-header">
      <span>内联 JS</span>
      <a-button size="small" type="text" @click="openCreateModal">
        <template #icon><PlusOutlined /></template>
      </a-button>
    </div>
    <div
      v-for="(file, index) in schema.inlineScripts || []"
      :key="index"
      class="file-row"
    >
      <span class="file-index">{{ index + 1 }}</span>
      <span class="file-name" @click="openFile(index)">{{ file.name }}</span>
      <a-button size="small" type="link" danger @click="deleteFile(index)"
        >删除</a-button
      >
    </div>
    <div
      v-if="!(schema.inlineScripts && schema.inlineScripts.length > 0)"
      class="empty-hint"
    >
      暂无内联 JS 文件，点击 + 新建
    </div>

    <!-- 新建文件弹框 -->
    <a-modal
      v-model:open="createModalOpen"
      title="新建脚本文件"
      @ok="confirmCreateFile"
      :ok-button-props="{ disabled: !newFileName.trim() }"
    >
      <a-input
        v-model:value="newFileName"
        placeholder="输入文件名，如 main.js"
        @keydown.enter="confirmCreateFile"
      />
    </a-modal>

    <!-- 代码编辑 Drawer -->
    <a-drawer
      :open="editingIndex !== null"
      :title="schema.inlineScripts?.[editingIndex ?? -1]?.name || '编辑脚本'"
      placement="right"
      :maskClosable="false"
      :closable="false"
      size="70%"
      @close="editingIndex = null"
    >
      <template #title>
        编辑【{{
          schema.inlineScripts?.[editingIndex ?? -1]?.name || "编辑脚本"
        }}】
        <span class="save-btn-wrapper">
          <span v-if="isModified" class="unsaved-dot"></span>
          <a-button
            size="small"
            color="default"
            variant="solid"
            @click="handleSaveAndClose"
            >保存</a-button
          >
        </span>
      </template>
      <div v-if="editingIndex !== null" class="drawer-code-editor-wrapper">
        <MonacoEditor
          ref="monacoRef"
          :model-value="currentCode"
          language="javascript"
          :options="{ fontSize: 16 }"
          @update:model-value="onCodeChange"
        />
      </div>
    </a-drawer>
  </div>
</template>

<style scoped>
.script-editor {
  padding: 12px;
  height: 100%;
  overflow-y: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 12px;
  color: #999;
  padding: 8px 0;
}

/* 文件列表 */
.file-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  margin-bottom: 6px;
  background: #fff;
}

.file-index {
  font-size: 12px;
  color: #999;
  min-width: 18px;
  text-align: center;
}

.file-name {
  flex: 1;
  font-size: 13px;
  color: #1890ff;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-name:hover {
  text-decoration: underline;
}

/* Drawer 中的编辑器 */
.drawer-code-editor-wrapper {
  height: calc(100vh - 110px);
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
}

.drawer-code-editor-wrapper:focus-within {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

/* 保存按钮右上角红色未保存圆点 */
.save-btn-wrapper {
  position: relative;
  display: inline-flex;
}

.unsaved-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #ff4d4f;
  border-radius: 50%;
  z-index: 1;
  pointer-events: none;
}
:deep(.ant-drawer .ant-drawer-body) {
  padding: 10px;
}
</style>
