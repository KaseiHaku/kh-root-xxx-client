<template>
  <kh-menu :param-in="menuItems"></kh-menu>
</template>

<script setup>
  import {KhMenu} from '@kaseihaku.com/cloud-starter-basic';
import {v4 as uuidV4} from 'uuid';

/******************************* <el-menu> *******************************/
const menuItems = [
  {
    index: uuidV4(), label: 'Sample 流程',
    children: [
      { index: '/sys/ProcToDo.vue?procMetaBrand=feature', label: '待办' },
      { index: '/sys/ProcDone.vue?procMetaBrand=feature', label: '已办' },
      { index: '/sys/ProcApply.vue?procMetaBrand=feature', label: '发起' },
    ],
  },
  {
    index: uuidV4(), label: '报表',
    children: [
      { index: '/proc/feature/v1/DefaultReport.vue', label: '默认' },
    ]
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
