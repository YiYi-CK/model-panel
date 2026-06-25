import { createI18n } from 'vue-i18n';
import zhCN from './zh-CN';
import en from './en';

// 从 localStorage 读取语言偏好，默认中文
const saved = localStorage.getItem('model-panel-lang');
const defaultLocale = saved || 'zh-CN';

const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'zh-CN',
  messages: { 'zh-CN': zhCN, en },
});

export default i18n;
export { defaultLocale };
