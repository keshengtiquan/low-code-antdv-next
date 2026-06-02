<template>
  <template v-if="el">
    <Teleport :to="el">
      <div
        :style="{
          position: 'absolute',
          left: `${position.left}px`,
          top: `${position.top}px`,
          border: '2px solid blue',
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
          v-if="!(selectedNodeId === 'root')"
          style="
            color: #fff;
            padding: 2px 8px;
            background-color: blue;
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
    // debugger
    const { top, left, width, height } = node.getBoundingClientRect();
    const { top: containerTop, left: containerLeft } =
      container.getBoundingClientRect();

    let labelTop = top - containerTop + container.scrollTop + height;
    let labelLeft = left - containerLeft + width;

    if (labelTop <= 0) {
      labelTop -= -20;
    }

    position.value = {
      top: top - containerTop + container.scrollTop,
      left: left - containerLeft + container.scrollLeft,
      width,
      height,
      labelTop,
      labelLeft,
    };
  });
}
const throttledUpdatePosition = throttle(updatePosition, 16);

watch(
  () => props.componentId,
  () => {
    updatePosition();
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
});
</script>
