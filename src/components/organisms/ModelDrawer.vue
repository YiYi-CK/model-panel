<template>
  <n-drawer v-model:show="show" :width="480" placement="right" @after-leave="handleClose">
    <n-drawer-content :title="mode === 'create' ? $t('model.add') : $t('model.edit')" closable>
      <ModelForm
        ref="formRef"
        :initial-data="initialData"
        :provider-api="providerApi"
      />

      <template #footer>
        <n-space justify="end">
          <n-button @click="show = false">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" :loading="saving" @click="handleSave">{{ $t('common.save') }}</n-button>
        </n-space>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useNotification } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import ModelForm from '@/components/molecules/ModelForm.vue';
import api from '@/api';

const props = defineProps({
  show: { type: Boolean, default: false },
  mode: { type: String, default: 'create' },
  initialData: { type: Object, default: null },
  providerId: { type: String, required: true },
  providerApi: { type: String, default: 'openai-completions' },
});

const emit = defineEmits(['close', 'saved']);
const notification = useNotification();
const { t } = useI18n();

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
      await api.post(`/providers/${props.providerId}/models`, formData);
      notification.success({ title: t('model.createSuccess', { id: formData.id }), duration: 3000 });
    } else {
      await api.put(`/providers/${props.providerId}/models/${formData.id}`, formData);
      notification.success({ title: t('model.updateSuccess', { id: formData.id }), duration: 3000 });
    }
    emit('saved');
  } catch (err) {
    notification.error({
      title: t('common.error'),
      content: err.response?.data?.error || t('model.createFailed'),
      duration: 4000,
    });
  } finally {
    saving.value = false;
  }
}
</script>
