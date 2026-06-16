<script setup lang="ts">
import zhCN from 'antdv-next/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { ref } from 'vue'

dayjs.locale('zh-cn')

const locale = ref(zhCN)
const theme = ref({
  components: {
    Table: {
      borderColor: '#000',
    },
  },
})
</script>

<template>
  <a-config-provider :theme="theme" :locale="locale">
    <a-app>
      <router-view />
    </a-app>
  </a-config-provider>
</template>
