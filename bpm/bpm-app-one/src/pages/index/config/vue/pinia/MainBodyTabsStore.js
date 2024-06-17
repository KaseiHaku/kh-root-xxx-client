import {defineStore} from 'pinia';
// import { useRouter, useRoute } from 'vue-router';
import * as VueRouterConfig from '@/pages/index/config/vue/router/VueRouterConfig.js';

const tabLabels = {
  '': '未知',
  '/': '首页',
  '/Home': '首页',
  '/PpeHome': '首页',
  '/ppe/FrontPage.vue': '首页',
  '/ppe/PpeDone.vue': '已办',
  '/ppe/PpeToDo.vue': '待办',
  '/ppe/ProcDone.vue': '已办',
  '/ppe/ProcToDo.vue': '待办',
  '/ppe/workflow/FlowCurVer.vue': '流程当前版本',
  '/ppe/workflow/FlowCurVerEdit.vue': '流程当前版本-编辑',
  '/ppe/workflow/FlowModel.vue': '流程模型',
  '/ppe/workflow/FlowModelEdit.vue': '流程模型-编辑',
  '/ppe/workflow/FlowInstance.vue': '流程实例',
  '/ppe/workflow/FlowInstanceEdit.vue': '流程实例-编辑',
  '/ppe/workflow/FlowNodeModel.vue': '节点模型',
  '/ppe/workflow/FlowNodeModelEdit.vue': '节点模型-编辑',
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
