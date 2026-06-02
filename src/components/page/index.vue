<script setup lang="ts">
defineProps<{
  background?: string;
}>();
</script>

<template>
  <div class="low-code-page" :style="{ background, height: '100%' }">
    <slot />
  </div>
</template>
