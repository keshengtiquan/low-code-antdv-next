<script setup lang="ts">
import type { Component } from "vue";
import { useSchema } from "@/store/schema";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { findPaletteItem } from "@/utils";
import ScriptEditor from "@/pages/design/components/componentPalette/ScriptEditor.vue";
import AFlexEditor from "./editors/AFlexEditor.vue";
import ARowEditor from "./editors/ARowEditor.vue";
import AColEditor from "./editors/AColEditor.vue";
import AButtonEditor from "./editors/AButtonEditor.vue";
import AFormEditor from "./editors/AFormEditor.vue";
import AFormItemEditor from "./editors/AFormItemEditor.vue";
import AInputEditor from "./editors/AInputEditor.vue";


/** 类型 → 属性编辑器组件 */
const editorRegistry: Record<string, Component> = {
  "a-flex": AFlexEditor,
  "a-row": ARowEditor,
  "a-col": AColEditor,
  "a-button": AButtonEditor,
  "a-form": AFormEditor,
  "a-form-item": AFormItemEditor,
  "a-input": AInputEditor,
};

const schemaStore = useSchema();
const { selectedNode } = storeToRefs(schemaStore);
const { updateNode } = schemaStore;

function setDomId(val: string) {
  if (!selectedNode.value) return;
  updateNode(selectedNode.value.nodeId, { id: val || undefined });
}

function setRef(val: string) {
  if (!selectedNode.value) return;
  updateNode(selectedNode.value.nodeId, { ref: val || undefined });
}

/** 根据当前选中组件的类型，从配置中获取该组件支持的事件建议 */
const eventSuggestions = computed(() => {
  if (!selectedNode.value) return [];
  const item = findPaletteItem(selectedNode.value.type);
  if (!item?.events) return [];
  return item.events.map(e => ({ label: e, value: e }));
});

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
    <!-- 脚本管理 -->
    <div class="section">
      <div class="section-title">脚本</div>
      <ScriptEditor />
    </div>

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
          <span class="info-label">Ref</span>
          <a-input
            size="small"
            :value="selectedNode.props.ref"
            placeholder="设置 ref"
            allow-clear
            @change="(e: InputEvent) => setRef((e.target as HTMLInputElement).value)"
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

      <!-- 事件 -->
      <div class="section">
        <div class="section-title">事件</div>
        <a-select
          mode="tags"
          size="small"
          style="width: 100%"
          placeholder="输入事件名称，如 click、change"
          :value="selectedNode.events ?? []"
          :options="eventSuggestions"
          @change="(vals: string[]) => schemaStore.updateEvents(selectedNode!.nodeId, vals)"
        />
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
