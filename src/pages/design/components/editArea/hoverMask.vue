<template>
  <template v-if="el">
    <Teleport :to="el">
      <div
        :style="{
          position: 'absolute',
          left: `${position.left}px`,
          top: `${position.top}px`,
          // backgroundColor: 'rgba(23,23,224,0.1)',
          border: '2px dashed blue',
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
            backgroundColor: 'blue',
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
import { computed, onMounted, ref, watch } from "vue";
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
  const { top: containerTop, left: containerLeft } =
    container.getBoundingClientRect();

  let labelTop = top - containerTop + container.scrollTop;
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
}

const curComponent = computed(() => {
  return findNode(props.componentId);
});

watch(
  () => props.componentId,
  () => {
    updatePosition();
  },
  { immediate: true },
);

onMounted(() => {
  el.value = document.querySelector(`.${props.portalWrapperClassName}`)!;
});
</script>

<style scoped></style>
