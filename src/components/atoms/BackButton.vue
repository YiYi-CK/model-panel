<template>
  <n-button text @click="goBack">
    <template #icon><n-icon><ArrowBackOutlined /></n-icon></template>
    {{ text }}
  </n-button>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ArrowBackOutlined } from '@vicons/antd';

const props = defineProps({
  to: { type: String, default: '' },
  text: { type: String, default: '' },
});
const router = useRouter();
const { t } = useI18n();

function goBack() {
  if (props.to) {
    router.push(props.to);
  } else {
    router.back();
  }
}
</script>
