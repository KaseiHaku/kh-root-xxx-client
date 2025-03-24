/******************************* 三方导入 *******************************/
import * as Vue from 'vue';
import ElementPlus, {ElNotification} from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import {KhVuePlugin} from '@kaseihaku.com/cloud-starter-basic';

/******************************* 当前 Module 通用导入 *******************************/
import '@/assets/styles/index.scss';
import axios from '@/config/axios/AxiosConfig.js';
import * as VueI18nConfig from '@/config/vue/i18n/VueI18nConfig.js';

/******************************* 当前 Page 定制导入 *******************************/
import * as VueRouterConfig from '@/pages/index/config/vue/router/VueRouterConfig.js';
import * as PiniaConfig from '@/pages/index/config/vue/pinia/PiniaConfig.js';
import App from '@/pages/index/App.vue';






/** Vue 相关初始化 */
const app = Vue.createApp(App)
  .use(PiniaConfig.pinia) // vuex 用于全局状态管理
  .use(VueRouterConfig.router) // vue-router 由于使用 vue 开发，原先 web 页面之间跳转的超链接不能使用了，需要用这个进行组件间跳转
  .use(VueI18nConfig.i18n) // vue-i18n 国际化
  // 导入 element plus 所有组件
  .use(ElementPlus, {
    size: 'small',        // 全局配置 element 组件 size
    zIndex: 3000,         // 全局配置 element 组件的 zIndex
    locale: zhCn,         // 用中文
  })
  .use(KhVuePlugin, {
    axios
  })
;

// 注册 element-plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// Vue 全局异常处理
app.config.errorHandler = (err, vm, info) => {
  // handle error
  // `info` is a Vue-specific error info, e.g. which lifecycle hook
  // the error was found in
  console.error('Vue Global Capture Error', {err, vm, info});
  ElNotification({type: 'error', title: 'Vue Global Capture Error', message: err.message,});
};
app.mount('#app');  // 将 dataModel 挂载到指定 dom 节点上


/**
 * 为了防止 pinia store 在使用时，pinia 还没有初始化的问题，所以直接在最开始就加载用到 pinia store 的 js 文件
 * */
// import ('@/config/axios/ServerApi.js');
