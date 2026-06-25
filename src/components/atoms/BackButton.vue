<template>
  <n-button text @click="goBack">
    <template #icon><n-icon><ArrowBackOutlined /></n-icon></template>
    {{ text }}
  </n-button>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ArrowBackOutlined } from '@vicons/antd';

const props = defineProps({
  to: { type: String, default: '' },
  text: { type: String, default: '返回' },
});
const router = useRouter();

function goBack() {
  if (props.to) {
    router.push(props.to);
  } else {
    router.back();
  }
}
</script>
