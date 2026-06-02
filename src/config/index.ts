import type { PageNode } from "@/types/schema";

export interface PaletteItem {
  type: string;
  label: string;
  defaultProps: Record<string, unknown>;
  slots?: Record<string, (parentId: string) => PageNode[] | string>;
}

export interface PaletteGroup {
  name: string;
  components: PaletteItem[];
}

export const paletteGroups: PaletteGroup[] = [
  {
    name: "布局",
    components: [
      {
        type: "container",
        label: "容器",
        defaultProps: { direction: "column", gap: 8 },
      },
    ],
  },
  {
    name: "展示",
    components: [
      {
        type: "text",
        label: "文本",
        defaultProps: { content: "Text", tag: "p" },
      },
      {
        type: "image",
        label: "图片",
        defaultProps: { src: "", alt: "" },
      },
    ],
  },
  {
    name: "AntdV组件",
    components: [
      {
        type: "a-button",
        label: "按钮",
        defaultProps: { type: "primary" },
        slots: {
          default: () => "按钮",
          icon: (parentId) => [
            {
              nodeId: `${parentId}_btn_icon`,
              type: "icon",
              props: { icon: "icon-add" },
            },
          ],
        },
      },
      {
        type: "a-card",
        label: "卡片",
        defaultProps: { title: "Card Title" },
      },
      {
        type: "a-input",
        label: "输入框",
        defaultProps: { placeholder: "Please input" },
      },
      {
        type: "a-table",
        label: "表格",
        defaultProps: {},
      },
    ],
  },
];
