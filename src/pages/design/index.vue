<template>
  <div class="design-page">
    <a-splitter class="design-splitter">
      <a-splitter-panel :default-size="260" :min="200" :max="400">
        <div class="panel panel-left">
          <div class="panel-header">左侧面板</div>
          <div class="panel-body">
            <!-- 左侧内容区域 -->
            <ComponentPalette />
          </div>
        </div>
      </a-splitter-panel>

      <a-splitter-panel :min="300">
        <div class="panel panel-center">
          <div class="panel-header">
            <span>中间面板</span>
            <a-button size="small" @click="handlePreview">预览</a-button>
          </div>
          <div class="panel-body">
            <!-- 中间内容区域 -->
            <EditArea />
          </div>
        </div>
      </a-splitter-panel>

      <a-splitter-panel :default-size="320" :min="240" :max="500">
        <div class="panel panel-right">
          <div class="panel-header">属性面板</div>
          <div class="panel-body">
            <PropertyPanel />
          </div>
        </div>
      </a-splitter-panel>
    </a-splitter>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import ComponentPalette from "@/pages/design/components/componentPalette/index.vue";
import EditArea from "@/pages/design/components/editArea/index.vue";
import PropertyPanel from "@/pages/design/components/propertyPanel/index.vue";
import { provideRefsMap } from "@/composables/useRefsMap";

const router = useRouter();

// 为设计时渲染器的递归 ref 注册提供注入链路
provideRefsMap();

const handlePreview = () => {
  const route = router.resolve("/preview");
  window.open(route.href, "_blank");
};
</script>

<style scoped>
.design-page {
  height: 100vh;
  overflow: hidden;
}

.design-splitter {
  height: 100%;
}

.panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 1px solid var(--color-border, #e8e8e8);
  flex-shrink: 0;
  background: var(--color-bg-elevated, #fafafa);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-body {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}
</style>
