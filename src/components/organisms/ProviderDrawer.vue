<template>
  <n-drawer v-model:show="show" :width="520" placement="right" @after-leave="handleClose">
    <n-drawer-content :title="mode === 'create' ? '添加 Provider' : '编辑 Provider'" closable>
      <ProviderForm ref="formRef" :initial-data="initialData" />

      <div class="test-section" v-if="formRef?.getFormData?.()">
        <TestConnection :base-url="formRef.getFormData().baseUrl || ''" />
      </div>

      <template #footer>
        <n-space justify="end">
          <n-button @click="show = false">取消</n-button>
          <n-button type="primary" :loading="saving" @click="handleSave">保存</n-button>
        </n-space>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useNotification } from 'naive-ui';
import ProviderForm from '@/components/molecules/ProviderForm.vue';
import TestConnection from '@/components/molecules/TestConnection.vue';
import api from '@/api';

const props = defineProps({
  show: { type: Boolean, default: false },
  mode: { type: String, default: 'create' },
  initialData: { type: Object, default: null },
});

const emit = defineEmits(['close', 'saved']);
const notification = useNotification();

const show = ref(props.show);
const saving = ref(false);
const formRef = ref(null);

watch(() => props.show, (val) => {
  show.value = val;
});

function handleClose() {
  emit('close');
}

async function handleSave() {
  const formData = formRef.value?.getFormData();
  if (!formData) return;

  saving.value = true;
  try {
    if (props.mode === 'create') {
      await api.post('/providers', formData);
      notification.success({ title: '添加成功', content: `Provider "${formData.id}" 已添加`, duration: 3000 });
    } else {
      await api.put(`/providers/${formData.id}`, formData);
      notification.success({ title: '更新成功', content: `Provider "${formData.id}" 已更新`, duration: 3000 });
    }
    emit('saved');
  } catch (err) {
    notification.error({
      title: '保存失败',
      content: err.response?.data?.error || '保存 Provider 失败',
      duration: 4000,
    });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.test-section {
  margin-top: 16px;
  padding: 12px;
  background: #F7F8FA;
  border-radius: 6px;
}
</style>
