# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 类型检查后构建生产版本
pnpm preview      # 本地预览生产构建
```

## 架构

这是一个**低代码页面搭建工具**，基于 Vue 3 + TypeScript + Vite 8 构建。使用 `antdv-next`（Ant Design Vue next）作为 UI 组件库，图标库为 `@antdv-next/icons`，`@antdv-next/tailwind` + Tailwind CSS 4 处理样式。状态管理使用 Pinia，并启用了 `pinia-plugin-persistedstate` 持久化插件。路由使用 hash 模式。

### 核心概念：PageSchema 组件树

正在设计的整个页面以 `PageSchema` 对象的形式存储在 Pinia store（`src/store/schema.ts`）中。schema 包含一个 `root` 根节点（类型为 `"page"`）以及递归的 `PageNode` 树，其中每个节点可以包含 `slots`（按插槽名索引，值为 `PageNode[]` 或纯文本字符串）。

节点类型如 `"text"`、`"container"` 等定义在 `src/config/index.ts`（组件面板配置）中，同时也包含 Ant Design 组件名如 `"a-button"`、`"a-card"`、`"a-input"`、`"a-table"`。

### 组件解析（`src/pages/design/components/editArea/components/registry.ts`）

内置注册表将类型字符串映射到 Vue 组件（如 `"page"` → `Page`、`"text"` → `Text`）。注册表中找不到的类型会被当作 **antdv-next 组件名**，直接传给 Vue 的 `<component :is="...">` 进行动态渲染。这就是 `"a-button"` 能够解析为实际 `<a-button>` 组件的原理。

### 设计页面布局（`src/pages/design/index.vue`）

三栏可拖拽分割布局（左/中/右）：
- **左侧面板**（`ComponentPalette`）：三个标签页 — 组件面板（可拖拽的组件项）、代码视图（原始 JSON）、树形视图（节点层级结构）
- **中间面板**（`EditArea`）：递归渲染器、拖放目标区、点击选中、悬停遮罩、带删除按钮的选中遮罩
- **右侧面板**：目前为空（待实现的属性面板）

### 路径别名

`@` 映射到 `./src`，在 `vite.config.ts` 和 `tsconfig.app.json` 中均有配置。

### TypeScript 严格规则

启用了 `noUnusedLocals`、`noUnusedParameters`、`erasableSyntaxOnly` 和 `noFallthroughCasesInSwitch`。其中 `erasableSyntaxOnly` 要求类型导入必须使用 `type` 关键字——纯类型的运行时 `import` 将无法编译。

### 容器类型

定义在 `src/constants/index.ts` 中：`"page"`、`"container"`、`"a-card"`、`"a-form"`。拖放目标只允许将新子节点添加到容器类型节点中；非容器节点会将拖放操作向上冒泡到最近的容器祖先节点。
