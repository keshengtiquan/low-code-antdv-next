<script setup lang="ts">
defineProps<{
  background?: string;
}>();
</script>

<template>
  <div
    class="low-code-page"
    :style="{ background, width: '100%', height: '100%', boxSizing: 'border-box' }"
  >
    <slot />
  </div>
</template>
