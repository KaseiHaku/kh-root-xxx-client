<template>
  <div>
    <el-form :inline="true" :model="searchFormData" label-width="auto" label-position="right">
      <el-row justify="start" align="top">
        <el-col :span="6">
          <el-form-item label="ID:" prop="id">
            <el-input v-model="searchFormData.procId" placeholder="ID" @keyup.enter="doSearch" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-table :data="tableData" stripe border>
      <el-table-column fixed type="index" label="Row" />
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="updaterId" label="处理人" :formatter="userId2NameFormatter" />
      <el-table-column prop="updateTime" label="最后修改时间" :formatter="timestampColFormatter" />
      <el-table-column prop="deleted" label="是否删除" />

      <el-table-column prop="procId" label="流程实例 ID" />
      <el-table-column prop="countSignTotal" label="会签总和" />

      <el-table-column fixed="right" label="操作">
        <template #default="slotProps">
          <el-button round @click="handleView(slotProps)"><el-icon><View /></el-icon></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-model:page-size="paginationModel.pageSize" v-model:current-page="paginationModel.pageNum" size="small"
                   layout="prev, next, jumper, ->"
                   :pager-count="paginationModel.pagerCount" :page-sizes="paginationModel.pageSizes" :default-current-page="1"
                   :total="paginationModel.total" />
  </div>
</template>


<script setup>
import {reactive, onBeforeMount, watch} from 'vue';
import {timestamp2LocalDateTimeString} from '@kaseihaku.com/core-infra';
import {useUid2NameCache, useGid2NameCache} from '@kaseihaku.com/cloud-starter-basic';
import ServerApi from '@/config/axios/ServerApi.js';

/******************************* Config *******************************/
const allProps = defineProps({
  modelValue: {type: Array, default: (rawProps) => []},
});
/******************************* Var & Function *******************************/
let uid2NameCache = null;
function userId2NameFormatter(row, column, cellValue, index) {
  return uid2NameCache.get(cellValue) ?? cellValue;
}
/******************************* <el-form> *******************************/
const searchFormData = reactive({
  id: null,
  updateTimeStart: null,
  updateTimeEnd: null,
  deleted: null,

  procId: null,
});
async function doSearch() {

  let params = {
    paginate: true, offset: (paginationModel.pageNum - 1) * paginationModel.pageSize, limit: paginationModel.pageSize,
    param: searchFormData,
  };

  const body = await ServerApi.default.bpmAppOne.v1.Feature.empty.put(params);
  uid2NameCache = await useUid2NameCache(body.map(item=>item.updaterId));
  tableData.splice(0, tableData.length, ...body);


}
/******************************* <el-table> *******************************/
const tableData = reactive([]);
const timestampColFormatter = (row, column, cellValue, index) => {
  return timestamp2LocalDateTimeString(cellValue);
};
const handleView = ({ row, column, $index }) => {
  let bpmAppName = new URLSearchParams(window.location.search).get('bpmAppName');
  window.open(`/bpm-ppe/editor.html?bpmAppName=${bpmAppName}#/?procId=${row.procId}`, '_blank');
};

/******************************* <el-pagination> *******************************/
const paginationModel = reactive({
  pagerCount: 9, // 当页数超过该值时，压缩中间页码，该值必须是 奇数
  pageSizes: [4, 10, 60, 100], // 页大小的选项

  /* 交互相关 */
  pageNum: 1, // 当前页码
  pageSize: 10, // 当前页大小
  total: 10000,
});
watch(()=>paginationModel.pageSize, (newValue, oldValue) => {
  console.log(`current pageSize: ${newValue}; current PageNum: ${paginationModel.pageNum}`);
  doSearch();
});
watch(()=>paginationModel.pageNum, (newValue, oldValue) => {
  console.log(`current PageNum: ${paginationModel.pageNum}`);
  doSearch();
});

/******************************* Lifecycle *******************************/
onBeforeMount(() => {
  doSearch();
});

</script>


<style lang="scss" scoped>

</style>
