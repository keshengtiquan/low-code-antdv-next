<template>
  <template v-if="el">
    <Teleport :to="el">
      <div
        :style="{
          position: 'absolute',
          left: `${position.left}px`,
          top: `${position.top}px`,
          border: '2px solid #4096ff',
          pointerEvents: 'none',
          width: `${position.width}px`,
          height: `${position.height}px`,
          zIndex: 2,
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
          v-if="!(selectedNodeId === 'root')"
          style="
            color: #fff;
            padding: 2px 8px;
            background-color: #4096ff;
            pointer-events: auto;
          "
        >
          <DeleteOutlined @click.stop="(e: MouseEvent) => handleDelete(e)" />
        </div>
      </div>
    </Teleport>
  </template>
</template>
<script setup lang="ts">
import { useSchema } from "@/store/schema";
import { storeToRefs } from "pinia";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { throttle } from "lodash-es";
import { DeleteOutlined } from "@antdv-next/icons";

const schemaStore = useSchema();
const { selectedNodeId } = storeToRefs(schemaStore);
const { removeNode, deselectNode } = schemaStore;
const el = ref();
const props = defineProps<{
  componentId: string;
  containerClassName: string;
  portalWrapperClassName: string;
}>();
const position = ref({
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  labelTop: 0,
  labelLeft: 0,
});

function updatePosition() {
  if (!props.componentId) return;

  const container = document.querySelector(`.${props.containerClassName}`);
  if (!container) return;

  const node = document.querySelector(`[data-node-id='${props.componentId}']`);
  if (!node) return;

  requestAnimationFrame(() => {
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

    let labelTop = clampedTop + clampedHeight;
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
  });
}
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
      // 尺寸变化 → 遮罩重定位
      targetObserver = new ResizeObserver(() => {
        throttledUpdatePosition();
      });
      targetObserver.observe(targetNode);
      // 位置变化（如 a-col offset/pull/push）→ 遮罩重定位
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

const resizeHandler = () => {
  console.log("resize");
  throttledUpdatePosition();
  setTimeout(updatePosition, 100);
};

const handleDelete = (e: MouseEvent) => {
  e.stopPropagation();
  removeNode(props.componentId);
  deselectNode();
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  el.value = document.querySelector(`.${props.portalWrapperClassName}`)!;
  window.addEventListener("resize", resizeHandler);

  const container = document.querySelector(`.${props.containerClassName}`);
  if (container) {
    resizeObserver = new ResizeObserver(() => {
      throttledUpdatePosition();
    });
    resizeObserver.observe(container);
  }
});
onUnmounted(() => {
  window.removeEventListener("resize", resizeHandler);
  resizeObserver?.disconnect();
  targetObserver?.disconnect();
  mutationObserver?.disconnect();
});
</script>
