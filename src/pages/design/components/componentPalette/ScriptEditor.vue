<script setup lang="ts">
import { useSchema } from "@/store/schema";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { PlusOutlined } from "@antdv-next/icons";

const schemaStore = useSchema();
const { schema } = storeToRefs(schemaStore);

const editingIndex = ref<number | null>(null);
const createModalOpen = ref(false);
const newFileName = ref("");

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
      <a-button size="small" type="link" danger @click="deleteFile(index)">删除</a-button>
    </div>
    <div v-if="!(schema.inlineScripts && schema.inlineScripts.length > 0)" class="empty-hint">
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
      :width="500"
      @close="editingIndex = null"
    >
      <textarea
        v-if="editingIndex !== null"
        class="drawer-code-editor"
        :value="schema.inlineScripts![editingIndex!].code"
        placeholder="在此编写 JS 代码"
        spellcheck="false"
        @input="(e) => { schema!.inlineScripts![editingIndex!].code = (e.target as HTMLTextAreaElement).value }"
      ></textarea>
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
.drawer-code-editor {
  width: 100%;
  height: calc(100vh - 110px);
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-family: "SF Mono", "Monaco", "Menlo", monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
  outline: none;
  tab-size: 2;
}

.drawer-code-editor:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}
</style>
