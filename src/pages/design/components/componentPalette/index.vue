<script setup lang="ts">
import { paletteGroups } from "@/config";
import type { PaletteItem } from "@/config";
import { useSchema } from "@/store/schema";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import TreeView from "./TreeView.vue";
type TabKey = "components" | "code" | "tree";

const tabs: { key: TabKey; label: string }[] = [
  { key: "components", label: "组件" },
  { key: "code", label: "代码" },
  { key: "tree", label: "树形" },
];

const activeTab = ref<TabKey>("components");

const schemaStore = useSchema();
const { schema } = storeToRefs(schemaStore);

function onDragStart(e: DragEvent, item: PaletteItem): void {
  if (!e.dataTransfer) return;
  e.dataTransfer.setData("component-type", item.type);
  e.dataTransfer.effectAllowed = "copy";
}
</script>

<template>
  <div class="palette-container">
    <!-- 左侧垂直标签栏 -->
    <div class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="tab-content">
      <!-- 组件视图 -->
      <div v-if="activeTab === 'components'" class="component-palette">
        <div v-for="group in paletteGroups" :key="group.name" class="mb-4">
          <h4 class="text-sm font-medium text-gray-500 mb-2">{{ group.name }}</h4>
          <div class="grid grid-cols-3 gap-2">
            <div
              v-for="item in group.components"
              :key="item.type"
              draggable="true"
              class="palette-item cursor-grab rounded-lg border-2 border-gray-200 bg-white px-2 py-3 text-xs text-center font-medium text-gray-700 hover:border-primary hover:text-primary hover:shadow-sm active:cursor-grabbing transition-colors"
              @dragstart="onDragStart($event, item)"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- 代码视图 -->
      <div v-else-if="activeTab === 'code'" class="code-view">
        <pre class="code-block">{{ JSON.stringify(schema, null, 2) }}</pre>
      </div>

      <!-- 树形视图 -->
      <div v-else-if="activeTab === 'tree'" class="tree-tab">
        <TreeView />
      </div>

    </div>
  </div>
</template>

<style scoped>
.palette-container {
  display: flex;
  height: 100%;
  overflow: hidden;
}

/* 左侧垂直标签栏 */
.tab-bar {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 36px;
  border-right: 1px solid var(--color-border, #e8e8e8);
  background: var(--color-bg-elevated, #fafafa);
}

.tab-item {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  padding: 12px 8px;
  font-size: 13px;
  cursor: pointer;
  color: #666;
  transition: all 0.15s;
  border-right: 2px solid transparent;
  margin-right: -1px;
  position: relative;
  z-index: 1;
}

.tab-item:hover {
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.04);
}

.tab-item.active {
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.06);
  border-right-color: #1890ff;
  font-weight: 500;
}

/* 右侧内容区 */
.tab-content {
  flex: 1;
  overflow-y: auto;
  min-width: 0;
}

.component-palette {
  padding: 8px;
}

.code-view {
  padding: 8px;
  height: 100%;
  overflow: auto;
}

.code-block {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: "SF Mono", "Monaco", "Menlo", monospace;
  color: #333;
}

.tree-tab {
  height: 100%;
  overflow: auto;
}

</style>
