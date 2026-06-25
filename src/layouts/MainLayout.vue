<template>
  <n-layout class="main-layout">
    <!-- 顶部导航 -->
    <n-layout-header bordered class="nav-header">
      <div class="nav-left">
        <span class="logo" @click="$router.push('/dashboard')">🦊 OpenClaw 模型管理</span>
      </div>
      <div class="nav-right">
        <n-dropdown :options="userMenuOptions" @select="handleUserMenu">
          <n-button text>
            <template #icon><n-icon><UserOutlined /></n-icon></template>
            {{ username }}
          </n-button>
        </n-dropdown>
      </div>
    </n-layout-header>

    <n-layout has-sider class="layout-body">
      <!-- 侧边栏 -->
      <n-layout-sider
        bordered
        collapse-mode="transform"
        :collapsed-width="0"
        :width="180"
        :native-scrollbar="false"
        class="sidebar"
      >
        <n-menu
          :value="currentRoute"
          :options="menuOptions"
          @update:value="handleMenu"
        />
      </n-layout-sider>

      <!-- 内容区 -->
      <n-layout-content class="content-area">
        <slot />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup>
import { h, computed, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { NIcon } from 'naive-ui';
import { UserOutlined, DashboardOutlined, CloudServerOutlined, LogoutOutlined } from '@vicons/antd';
import api from '@/api';

const router = useRouter();
const route = useRoute();
const username = ref('');

onMounted(async () => {
  try {
    const res = await api.get('/status');
    username.value = res.data.user;
  } catch (_) {
    router.push('/login');
  }
});

const currentRoute = computed(() => {
  if (route.path.startsWith('/providers')) return 'providers';
  return route.path;
});

const menuOptions = [
  { label: '仪表盘', key: '/dashboard', icon: renderIcon(DashboardOutlined) },
  { label: '提供者管理', key: 'providers', icon: renderIcon(CloudServerOutlined) },
];

const userMenuOptions = [
  { label: '登出', key: 'logout', icon: renderIcon(LogoutOutlined) },
];

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

function handleMenu(key) {
  router.push(key);
}

async function handleUserMenu(key) {
  if (key === 'logout') {
    await api.post('/auth/logout');
    router.push('/login');
  }
}
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 52px;
}

.nav-left .logo {
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.layout-body {
  height: calc(100vh - 53px);
}

.sidebar {
  height: 100%;
}

.content-area {
  padding: 24px;
  background: #F7F8FA;
  overflow-y: auto;
}
</style>
