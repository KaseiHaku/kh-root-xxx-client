<template>
  <el-tabs v-model="currentTabName" type="border-card" closable
           @tab-remove="removeTab2"
           @tab-click="tabClick">

    <el-tab-pane v-for="(item, index) in currentElTabPanes" :key="item.name"
                 :label="item.label" :name="item.name" lazy>
    </el-tab-pane>
  </el-tabs>
  <div class="kh-router-view">
    <router-view v-slot="{ Component }" name="mainBodyView">
      <!-- <keep-alive :include="keepAliveInclude"> 方案实测失败，留作纪念 -->
      <keep-alive :max="32">
        <component :is="Component" :key="$route.fullPath" />
      </keep-alive>
    </router-view>
  </div>
</template>


<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import path from 'path';
import {storeToRefs} from 'pinia';
import {useMainBodyTabsStore} from '@/pages/index/config/vue/pinia/MainBodyTabsStore.js';


/******************************* Config *******************************/
const router = useRouter(); // 必须放在外层，赋值给一个变量才能用
const route = useRoute();
const mainBodyTabsStore = useMainBodyTabsStore();


/******************************* Var & Function *******************************/



/******************************* <el-tabs> *******************************/
const {currentTabName, currentElTabPanes} = storeToRefs(mainBodyTabsStore); // 提取 store 中的 props 并保留 reactive 特性
const {addOrSwitchTab, removeTab} = mainBodyTabsStore; // 从 store 中提取 actions，可以直接 解构

/* @trap 以下方法都只能在 Vue Options API 下使用，在 Vue Composition API 不能用，
 *       即: 不能在 setup() 方法中使用
 * */
// const mapStateObj = mapState(useMainBodyTabsStore, ['currentTabName']);
// const mapWritableStateObj = mapWritableState(useMainBodyTabsStore, ['currentTabName']);
// const mapActionsStateObj = mapActions(useMainBodyTabsStore, ['removeTab']);
// const mapStoresObj = mapStores(useMainBodyTabsStore);


function tabClick(pane, ev){
  router.push(pane.props.name);
}

function removeTab2(targetName) {
  removeTab(targetName);
}


/**
 * 想通过 keep-alive include 属性，只保留当前 tabs 中的页面，已关闭的 tab 从 keep-alive 中删除
 * 实测无效，还会导致 keep-alive 失效
 * */
const keepAliveInclude = computed(() => currentElTabPanes.value.map(item => item.name));


/******************************* Lifecycle *******************************/


</script>


<style lang="scss" scoped>
  .el-tabs {
    height: 5%;

    :deep(> .el-tabs__content) {
      padding: 0 ;
    }
  }

  .kh-router-view {
    height: 95%;
    padding: 15px;
  }
</style>
