import type { PageNode } from "@/types/schema";

export interface PaletteItem {
  type: string;
  label: string;
  props: Record<string, unknown>;
  /** 组件支持的插槽名列表（用于在编辑区显示占位提示，即使未填充也能让用户看到可拖放区域） */
  availableSlots?: string[];
  /** 拖入时自动生成的默认插槽内容 */
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
        type: "a-flex",
        label: "flex",
        props: { gap: 8 },
        availableSlots: ["default"],
      },
      {
        type: "a-row",
        label: "row",
        props: { span: 24 },
        availableSlots: ["default"],
        slots: {
          default: (parentId) => [
            {
              nodeId: `${parentId}_a-col1`,
              type: "a-col",
              props: { span: 12 },
              availableSlots: ["default"],
            },
            {
              nodeId: `${parentId}_a-col2`,
              type: "a-col",
              props: { span: 12 },
              availableSlots: ["default"],
            },
          ],
        },
      },
      {
        type: "a-col",
        label: "col",
        props: { span: 12 },
        availableSlots: ["default"],
      },
    ],
  },
  {
    name: "展示",
    components: [
      {
        type: "text",
        label: "文本",
        props: { content: "Text", tag: "span" },
      },
    ],
  },
  {
    name: "AntdV组件",
    components: [
      {
        type: "a-button",
        label: "按钮",
        props: {},
        availableSlots: ["default"],
        slots: {
          default: () => "按钮",
        },
      },
      {
        type: "a-card",
        label: "卡片",
        props: { title: "Card Title" },
        availableSlots: ["default", "title", "extra", "actions", "cover"],
        slots: {
          // default: () => "内容区域",
          // extra: (parentId) => [
          //   {
          //     nodeId: `${parentId}_card_extra`,
          //     type: "a-button",
          //     props: { type: "primary" },
          //     slots: {
          //       default: "plus",
          //     }
          //   }
          // ]
        },
      },
      {
        type: "a-input",
        label: "输入框",
        props: { placeholder: "Please input" },
        availableSlots: ["default", "prefix", "suffix"],
      },
      {
        type: "a-table",
        label: "表格",
        props: {},
        availableSlots: ["default", "title", "footer"],
      },
    ],
  },
];
