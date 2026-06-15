<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <a-result
      status="404"
      title="404"
      sub-title="Sorry, the page you visited does not exist."
    >
      <template #extra>
        <a-button type="primary" @click="router.push('/')">Back Home</a-button>
      </template>
    </a-result>
  </div>
</template>
