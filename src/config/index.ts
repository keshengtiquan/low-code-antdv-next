import type { PageNode } from "@/types/schema";

export interface PaletteItem {
  type: string;
  label: string;
  props: Record<string, unknown>;
  /** 组件支持的插槽名列表（用于在编辑区显示占位提示，即使未填充也能让用户看到可拖放区域） */
  availableSlots?: string[];
  /** 拖入时自动生成的默认插槽内容 */
  slots?: Record<string, (parentId: string) => PageNode[] | string>;
  /** 允许追加子节点的插槽名列表（即使已填充也显示 compact 占位符作为拖放目标） */
  appendableSlots?: string[];
  /** 该组件支持的常见事件名，用于属性面板的事件建议列表 */
  events?: string[];
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
    name: "数据录入",
    components: [
      {
        type: "a-form",
        label: "表单",
        props: { layout: "horizontal" },
        availableSlots: ["default"],
        appendableSlots: ["default"],
        slots: {
          default: (parentId) => [
            {
              nodeId: `${parentId}_fi1`,
              type: "a-form-item",
              props: { label: "字段", name: "field" },
              availableSlots: ["default"],
              slots: {},
            },
          ],
        },
      },
      {
        type: "a-form-item",
        label: "表单项",
        props: { label: "字段", name: "field" },
        availableSlots: ["default", "label"],
        slots: {},
      },
      {
        type: "a-input",
        label: "输入框",
        props: { placeholder: "Please input" },
        availableSlots: ["default"],
        events: [
          "change",
          "input",
          "focus",
          "blur",
          "update:value",
          "pressEnter",
        ],
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
        events: ["click", "dblclick"],
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
        type: "a-table",
        label: "表格",
        props: {
          columns: [{
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
          },
          {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
          },
          {
            title: 'Tags',
            key: 'tags',
            dataIndex: 'tags',
          },
          {
            title: 'Action',
            key: 'action',
          },],
          dataSource: [{
            name: 'John Brown',
            age: 32,
            address: 'New York No. 1 Lake Park',
            tags: ['nice', 'developer'],
          },
          {
            name: 'Jim Green',
            age: 42,
            address: 'London No. 1 Lake Park',
            tags: ['loser'],
          },
          {
            name: 'Joe Black',
            age: 32,
            address: 'Sydney No. 1 Lake Park',
            tags: ['cool', 'teacher'],
          },],
          border: true,
          height: 300,
        },
        availableSlots: ["default","title","footer","summary" ],
        appendableSlots: ["default"],
        slots: {},
        events: [],
      },
    ],
  },
];
