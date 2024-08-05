<template>
  <kh-menu :param-in="menuItems"></kh-menu>
</template>

<script setup>
import {KhMenu} from '@kaseihaku.com/cloud-starter-basic';
import {v4 as uuidV4} from 'uuid';

/******************************* <el-menu> *******************************/
const menuItems = [
  {
    index: uuidV4(), label: 'Sample 流程 V2',
    children: [
      { index: '/ppe/PpeToDo.vue?procBrand=name1', label: '待办' },
      { index: '/ppe/PpeDone.vue?procBrand=name1', label: '已办' },
      { index: '/ppe/PpeDone.vue?brand=sample&verTag=cur_ver', label: '创建' },
    ],
  },
  {
    index: uuidV4(), label: '报表',
    children: [
      { index: '/proc/sample/v1/DefaultReport.vue', label: '默认' },
    ]
  },
];



</script>

<style lang="scss" scoped>
  .el-menu {
    height: 100%;
    overflow: auto;
  }
</style>
