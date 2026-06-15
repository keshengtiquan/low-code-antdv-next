<script setup lang="ts">
defineProps<{
  content?: string;
  tag?: "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: "left" | "center" | "right" | "justify";
}>();
</script>

<template>
  <component
    :is="tag ?? 'p'"
    :style="{ color, fontSize, fontWeight, textAlign }"
  >
    {{ content }}
  </component>
</template>
