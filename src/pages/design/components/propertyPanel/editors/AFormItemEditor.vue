<script setup lang="ts">
import type { PageNode } from "@/types/schema";
import { useSchema } from "@/store/schema";

const props = defineProps<{
  node: PageNode;
}>();

const schemaStore = useSchema();
const { updateNode, updateSlot } = schemaStore;

function setProp(key: string, value: unknown) {
  updateNode(props.node.nodeId, { [key]: value });
}

const labelAlignOptions = [
  { label: "left", value: "left" },
  { label: "right", value: "right" },
];
</script>

<template>
  <div class="prop-editor">
    <!-- 标签文本 label slot -->
    <div class="prop-row">
      <label class="prop-label">标签</label>
      <a-input
        :value="(node.slots?.label as string) ?? (node.props.label as string) ?? ''"
        size="small"
        style="width: 140px"
        placeholder="字段标签"
        allow-clear
        @change="(e: InputEvent) => {
          const val = (e.target as HTMLInputElement).value;
          if (val) {
            updateSlot(node.nodeId, 'label', val);
            setProp('label', undefined);
          } else {
            updateSlot(node.nodeId, 'label', '');
            setProp('label', undefined);
          }
        }"
      />
    </div>

    <!-- 字段名 name -->
    <div class="prop-row">
      <label class="prop-label">字段名</label>
      <a-input
        :value="node.props.name"
        size="small"
        style="width: 140px"
        placeholder="field name"
        allow-clear
        @change="(e: InputEvent) => setProp('name', (e.target as HTMLInputElement).value || undefined)"
      />
    </div>

    <!-- 必填 required -->
    <div class="prop-row">
      <label class="prop-label">必填</label>
      <a-switch
        :checked="!!node.props.required"
        size="small"
        @change="(val: boolean) => setProp('required', val || undefined)"
      />
    </div>

    <!-- 标签对齐 labelAlign -->
    <div class="prop-row">
      <label class="prop-label">标签对齐</label>
      <a-select
        :value="node.props.labelAlign ?? 'right'"
        size="small"
        style="width: 140px"
        :options="labelAlignOptions"
        @change="(val: string) => setProp('labelAlign', val)"
      />
    </div>

    <!-- 标签列宽 labelCol.span -->
    <div class="prop-row">
      <label class="prop-label">标签列宽</label>
      <a-input-number
        :value="(node.props.labelCol as Record<string, unknown> | null)?.span ?? undefined"
        size="small"
        style="width: 140px"
        :min="0"
        :max="24"
        placeholder="继承表单"
        @change="(val: number | null) => setProp('labelCol', val != null ? { span: val } : undefined)"
      />
    </div>

    <!-- 控件列宽 wrapperCol.span -->
    <div class="prop-row">
      <label class="prop-label">控件列宽</label>
      <a-input-number
        :value="(node.props.wrapperCol as Record<string, unknown> | null)?.span ?? undefined"
        size="small"
        style="width: 140px"
        :min="0"
        :max="24"
        placeholder="继承表单"
        @change="(val: number | null) => setProp('wrapperCol', val != null ? { span: val } : undefined)"
      />
    </div>

    <!-- 冒号 colon -->
    <div class="prop-row">
      <label class="prop-label">冒号</label>
      <a-switch
        :checked="node.props.colon !== false"
        size="small"
        @change="(val: boolean) => setProp('colon', val ? undefined : false)"
      />
    </div>

    <!-- 校验规则 rules -->
    <div class="prop-row prop-row--col">
      <label class="prop-label">校验规则</label>
      <a-textarea
        :value="node.props.rules ? JSON.stringify(node.props.rules, null, 2) : ''"
        size="small"
        style="width: 140px"
        placeholder="JSON 数组，如：[{&quot;required&quot;:true,&quot;message&quot;:&quot;必填&quot;}]"
        :rows="3"
        @change="(e: InputEvent) => {
          const raw = (e.target as HTMLTextAreaElement).value.trim();
          if (!raw) {
            setProp('rules', undefined);
            return;
          }
          try {
            const parsed = JSON.parse(raw);
            setProp('rules', parsed);
          } catch { /* 忽略 JSON 解析错误，保留原值 */ }
        }"
      />
    </div>

    <!-- 提示 tooltip slot -->
    <div class="prop-row">
      <label class="prop-label">提示</label>
      <a-input
        :value="(node.slots?.tooltip as string) ?? (node.props.tooltip as string) ?? ''"
        size="small"
        style="width: 140px"
        placeholder="字段提示"
        allow-clear
        @change="(e: InputEvent) => {
          const val = (e.target as HTMLInputElement).value;
          updateSlot(node.nodeId, 'tooltip', val || '');
        }"
      />
    </div>

    <!-- 额外信息 extra slot -->
    <div class="prop-row">
      <label class="prop-label">额外信息</label>
      <a-input
        :value="(node.slots?.extra as string) ?? (node.props.extra as string) ?? ''"
        size="small"
        style="width: 140px"
        placeholder="额外提示"
        allow-clear
        @change="(e: InputEvent) => {
          const val = (e.target as HTMLInputElement).value;
          updateSlot(node.nodeId, 'extra', val || '');
        }"
      />
    </div>
  </div>
</template>

<style scoped>
.prop-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prop-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.prop-label {
  font-size: 13px;
  color: #555;
  flex-shrink: 0;
}

.prop-row--col {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}
</style>
