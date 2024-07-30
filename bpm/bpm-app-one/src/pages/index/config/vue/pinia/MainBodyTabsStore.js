import {defineStore} from 'pinia';
// import { useRouter, useRoute } from 'vue-router';
import * as VueRouterConfig from '@/pages/index/config/vue/router/VueRouterConfig.js';

const tabLabels = {
  '': '未知',
  '/': '首页',
  '/Home': '首页',
  '/sys/WelcomePage.vue': 'Welcome',
  '/sys/ProcToDo.vue': '待办',
  '/sys/ProcDone.vue': '已办',
  '/sys/ProcApply.vue': '发起',
  '/sys/SwitchUser.vue': '切换用户',
  '/sys/PasswordChange.vue': '修改密码',
  '/proc/feature/v1/DefaultReport.vue': 'Feature 默认报表',
};




export const useMainBodyTabsStore = defineStore('mainBodyTabsStore', {
  state: () => ({
    // currentTabName: '/ppe/FrontPage.vue',
    currentTabName: null,
    currentElTabPanes: [
      // { name: '/ppe/FrontPage.vue', label: '首页' },
    ],
  }),

  getters: {

  },

  actions: {
    addOrSwitchTab(tabComponentName) {
      console.log('add or switch to tab component name: ', tabComponentName);
      // 如果存在相同的 tab name 那么直接跳转到该 tab
      if (this.currentElTabPanes.find(tab => tab.name === tabComponentName) !== undefined) {
        this.currentTabName = tabComponentName;
        return;
      }

      // 如果不存在相同的 tab name 那么新建 tab
      let path = tabComponentName ? new URL('file://'+tabComponentName).pathname : '';
      this.currentElTabPanes.push({name: tabComponentName, label: tabLabels[path] ? tabLabels[path] : '未知'});
      this.currentTabName = tabComponentName;
    },
    removeTab(tabComponentName){

      let targetName = tabComponentName;

      console.log('rm tab component name:', targetName);
      let tabs = this.currentElTabPanes;
      let curTabName = this.currentTabName;
      if (curTabName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            let nextTab = tabs[index + 1] || tabs[index - 1];
            if (nextTab) {
              VueRouterConfig.router.push(nextTab.name);
            } else {
              VueRouterConfig.router.push('/'); // 如果是最后一个 tab，那么要重新打开首页
            }
          }
        });
      }

      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].name === targetName) {
          tabs.splice(i, 1);
          i--;
        }
      }

    },
  }

});
