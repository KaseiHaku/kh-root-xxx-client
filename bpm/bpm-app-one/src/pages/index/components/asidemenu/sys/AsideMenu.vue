<template>
  <kh-menu :param-in="menuItems"></kh-menu>
</template>

<script setup>
import {KhMenu} from '@kaseihaku.com/cloud-starter-basic';
import {v4 as uuidV4} from 'uuid';

/******************************* <el-menu> *******************************/
const menuItems = [
  { index: '/sys/WelcomePage.vue', label: '首页' },
  {
    index: uuidV4(), label: '我的',
    children: [
      { index: '/sys/ProcToDo.vue', label: '待办' },
      { index: '/sys/ProcDone.vue', label: '已办' },
      { index: '/sys/ProcApply.vue', label: '发起' },
    ],
  },
  {
    index: '/sys/SwitchUser.vue', label: '切换用户',
  },
  {
    index: '/sys/PasswordChange.vue', label: '修改密码',
  },
];


</script>

<style lang="scss" scoped>
  .el-menu {
    height: 100%;
    background-color: var(--el-color-primary-light-8);
    overflow: auto;
  }

  .el-menu * {
    background-color: var(--el-color-primary-light-8);
  }
</style>
