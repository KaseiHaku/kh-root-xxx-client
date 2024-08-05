<template>
  <el-menu :default-active="'/'" class="el-menu-demo" mode="horizontal" :ellipsis="false" :router="true">
    <el-menu-item index="/">
      <img src="@/assets/images/logo.png" alt="LOGO">
    </el-menu-item>
    <div class="flex-grow" />
    <el-sub-menu :index="uuidV4()">
      <template #title>各流程菜单</template>
      <el-sub-menu index="/proc/feature/v1/AsideMenu.vue">
        <template #title>Feature</template>
        <el-menu-item index="/proc/feature/v1/AsideMenu.vue">菜单版本-v1</el-menu-item>
        <el-menu-item index="/proc/feature/v2/AsideMenu.vue">菜单版本-v2212</el-menu-item>
      </el-sub-menu>
      <el-menu-item index="/proc/name2/v1/AsideMenu.vue">流程2</el-menu-item>
      <el-sub-menu :index="uuidV4()">
        <template #title>流程3</template>
        <el-menu-item index="2-4-1">item one</el-menu-item>
        <el-menu-item index="2-4-2">item two</el-menu-item>
        <el-menu-item index="2-4-3">item three</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>
    <span class="flex-grow" style="flex-grow: 1;" />
    <el-sub-menu :index="uuidV4()">
      <template #title>
        <el-icon><Avatar /></el-icon><span>{{ curUserStore.nickname }}</span>
      </template>
      <el-menu-item index="/sys/PasswordChange.vue">
        <el-icon><Lock /></el-icon>修改密码
      </el-menu-item>
      <el-menu-item index="/sys/SwitchUser.vue">
        <el-icon><Switch /></el-icon>shell&gt;&nbsp;su
      </el-menu-item>
      <el-menu-item :index="logoutMenuItemIndex" @click="menuItemClick">
        <el-icon><Moon /></el-icon><span>Logout</span>
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script setup>
import {ref, computed, watch, onBeforeMount} from 'vue';
import { v4 as uuidV4 } from 'uuid';
import {getJwsPayload} from '@kaseihaku.com/core-infra';
import {logout, getJwsToken, CloudImConst, useCurUserStore} from '@kaseihaku.com/cloud-starter-basic';
import Profile from '@/constant/BpmAppProfile.js';

/******************************* Config *******************************/
const curUserStore = useCurUserStore();

/******************************* Var & Function *******************************/
const logoutMenuItemIndex = '/logout_' + uuidV4();
function menuItemClick(el) {
  console.log('menu-item instance: ', el);
  if(el.index === logoutMenuItemIndex){
    logout(Profile[Profile.activated].baseUrl, Profile[Profile.activated].signOutPath, Profile[Profile.activated].asLogoutUrl);
  }
}

/******************************* <el-menu> *******************************/
window.addEventListener(CloudImConst.jws.changeEventType, function(event) {
  curUserStore.refresh();
});
window.addEventListener('storage', function(event) {
  console.log('storage event', event);
  if (event.storageArea === localStorage) {
    console.log('localStorage changed');
    console.log('Key: ' + event.key);
    console.log('Old value: ' + event.oldValue);
    console.log('New value: ' + event.newValue);


    if (CloudImConst.jws.accessToken === event.key) {
      curUserStore.refresh();
    }
  }
});

/******************************* Lifecycle *******************************/
onBeforeMount(() => {
  curUserStore.refresh();
});

</script>

<style lang="scss" scoped>
  .el-menu {
    height: 100%;
  }

  img {
    max-width: 100%;
    max-height: 90%;
  }
</style>
