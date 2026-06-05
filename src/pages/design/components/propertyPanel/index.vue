<script setup lang="ts">
import type { Component } from "vue";
import { useSchema } from "@/store/schema";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import AFlexEditor from "./editors/AFlexEditor.vue";
import ARowEditor from "./editors/ARowEditor.vue";
import AColEditor from "./editors/AColEditor.vue";
import AButtonEditor from "./editors/AButtonEditor.vue";

/** 类型 → 属性编辑器组件 */
const editorRegistry: Record<string, Component> = {
  "a-flex": AFlexEditor,
  "a-row": ARowEditor,
  "a-col": AColEditor,
  "a-button": AButtonEditor,
};

const schemaStore = useSchema();
const { selectedNode } = storeToRefs(schemaStore);
const { updateNode } = schemaStore;

function setDomId(val: string) {
  if (!selectedNode.value) return;
  updateNode(selectedNode.value.nodeId, { id: val || undefined });
}

const editorComponent = computed<Component | null>(() => {
  if (!selectedNode.value) return null;
  return editorRegistry[selectedNode.value.type] ?? null;
});

const typeLabel = computed(() => {
  if (!selectedNode.value) return "";
  // 可以从 config 里查找 label，这里先简单返回 type
  return selectedNode.value.type;
});
</script>

<template>
  <div class="property-panel">
    <!-- 未选中任何节点 -->
    <div v-if="!selectedNode" class="empty-state">
      请在画布中选择一个节点
    </div>

    <!-- 已选中节点 -->
    <template v-else>
      <!-- 基础信息 -->
      <div class="section">
        <div class="section-title">基本信息</div>
        <div class="info-grid">
          <span class="info-label">类型</span>
          <span class="info-value">{{ typeLabel }}</span>
          <span class="info-label">NodeId</span>
          <span class="info-value info-id">{{ selectedNode.nodeId }}</span>
          <span class="info-label">DOM ID</span>
          <a-input
            size="small"
            :value="selectedNode.props.id"
            placeholder="设置 id"
            allow-clear
            @change="(e: InputEvent) => setDomId((e.target as HTMLInputElement).value)"
          />
        </div>
      </div>

      <!-- 属性编辑区 -->
      <div class="section">
        <div class="section-title">属性</div>
        <component
          v-if="editorComponent"
          :is="editorComponent"
          :node="selectedNode"
        />
        <div v-else class="no-editor">
          暂无 {{ selectedNode.type }} 的属性编辑器
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.property-panel {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 13px;
}

.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #eee;
}

.info-grid {
  display: grid;
  grid-template-columns: 55px 1fr;
  gap: 6px 12px;
  font-size: 13px;
}

.info-label {
  color: #999;
}

.info-value {
  color: #333;
  word-break: break-all;
}

.info-id {
  font-family: monospace;
  font-size: 13px;
  color: #888;
}

.no-editor {
  color: #bbb;
  font-size: 13px;
  padding: 8px 0;
}
</style>
