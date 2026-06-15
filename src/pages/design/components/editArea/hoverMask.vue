<template>
  <template v-if="el">
    <Teleport :to="el">
      <div
        :style="{
          position: 'absolute',
          left: `${position.left}px`,
          top: `${position.top}px`,
          // backgroundColor: 'rgba(23,23,224,0.1)',
          border: '2px dashed #4096ff',
          pointerEvents: 'none',
          width: `${position.width}px`,
          height: `${position.height}px`,
          zIndex: 2,
          borderRadius: 4,
          boxSizing: 'border-box',
        }"
      />
      <div
        :style="{
          position: 'absolute',
          left: `${position.labelLeft}px`,
          top: `${position.labelTop}px`,
          fontSize: '14px',
          zIndex: 3,
          display: `${!position.width || position.width < 10 ? 'none' : 'inline'}`,
          transform: 'translate(-100%, -100%)',
        }"
      >
        <div
          :style="{
            padding: '0 8px',
            backgroundColor: '#4096ff',
            borderRadius: 4,
            color: '#fff',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }"
        >
          {{ curComponent?.type }}
        </div>
      </div>
    </Teleport>
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { throttle } from "lodash-es";
import { useSchema } from "@/store/schema";

const schemaStore = useSchema();
const { findNode } = schemaStore;

const el = ref();
const position = ref({
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  labelTop: 0,
  labelLeft: 0,
});
const props = defineProps<{
  componentId: string;
  containerClassName: string;
  portalWrapperClassName: string;
}>();

function updatePosition() {
  if (!props.componentId) return;

  const container = document.querySelector(`.${props.containerClassName}`);
  if (!container) return;

  const node = document.querySelector(
    `[data-node-id='${props.componentId}']`,
  );
  if (!node) return;

  const { top, left, width, height } = node.getBoundingClientRect();
  const {
    top: containerTop,
    left: containerLeft,
    width: containerWidth,
    height: containerHeight,
  } = container.getBoundingClientRect();

  // 裁剪到容器边界内（防止 a-row gutter 负 margin 导致超出）
  const relLeft = left - containerLeft + container.scrollLeft;
  const relTop = top - containerTop + container.scrollTop;
  const clampedLeft = Math.max(0, relLeft);
  const clampedTop = Math.max(0, relTop);
  const clampedWidth = Math.min(width, containerWidth - clampedLeft);
  const clampedHeight = Math.min(height, containerHeight - clampedTop);

  let labelTop = clampedTop;
  let labelLeft = clampedLeft + clampedWidth;

  if (labelTop <= 0) {
    labelTop -= -20;
  }
  position.value = {
    top: clampedTop,
    left: clampedLeft,
    width: clampedWidth,
    height: clampedHeight,
    labelTop,
    labelLeft,
  };
}

const curComponent = computed(() => {
  return findNode(props.componentId);
});

const throttledUpdatePosition = throttle(updatePosition, 16);

let targetObserver: ResizeObserver | null = null;
let mutationObserver: MutationObserver | null = null;

watch(
  () => props.componentId,
  () => {
    targetObserver?.disconnect();
    mutationObserver?.disconnect();
    updatePosition();
    const targetNode = document.querySelector(
      `[data-node-id='${props.componentId}']`,
    );
    if (targetNode) {
      // 尺寸变化
      targetObserver = new ResizeObserver(() => {
        throttledUpdatePosition();
      });
      targetObserver.observe(targetNode);
      // 位置变化（如 a-col offset/pull/push）
      mutationObserver = new MutationObserver(() => {
        throttledUpdatePosition();
      });
      mutationObserver.observe(targetNode, {
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }
  },
  { immediate: true },
);

onMounted(() => {
  el.value = document.querySelector(`.${props.portalWrapperClassName}`)!;
});

onUnmounted(() => {
  targetObserver?.disconnect();
  mutationObserver?.disconnect();
});
</script>

<style scoped></style>
