<template>
  <div>
    <el-form :inline="true" :model="searchFormData" label-width="auto" label-position="right">
      <el-row justify="start" align="top">
        <el-col :span="6">
          <el-form-item label="流程商标:" prop="processMetaQryDto.brand">
            <el-input v-model="searchFormData.processMetaQryDto.brand" placeholder="brand" @keyup.enter="doSearch" :disabled="procMetaBrand" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="节点名称:" prop="nodeMetaQryDto.name">
            <el-input v-model="searchFormData.nodeMetaQryDto.name" placeholder="name" @keyup.enter="doSearch" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-table :data="tableData" stripe border>
      <el-table-column fixed type="index" label="Row" />
      <el-table-column prop="id" label="节点 ID" />
      <el-table-column prop="updaterId" label="处理人" :formatter="userId2NameFormatter"/>
      <el-table-column prop="updateTime" label="最后修改时间" :formatter="timestampColFormatter" />
      <el-table-column prop="procId" label="流程实例 ID" />

      <el-table-column prop="brand" label="节点商标" />
      <el-table-column prop="name" label="节点名称" />

      <el-table-column prop="procBrand" label="流程商标" :formatter="procBrand2Name"/>
      <el-table-column prop="procVersionName" label="流程版本名称" />

      <el-table-column fixed="right" label="操作">
        <template #default="slotProps">
          <el-button round @click="handleView(slotProps)"><el-icon><View /></el-icon></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-model:page-size="paginationModel.pageSize" v-model:current-page="paginationModel.pageNum" :small="true"
                   layout="prev, next, jumper, ->"
                   :pager-count="paginationModel.pagerCount" :page-sizes="paginationModel.pageSizes" :default-current-page="1"
                   :total="paginationModel.total" />
  </div>
</template>

<script setup>
import {reactive, onMounted, onBeforeMount, watch} from 'vue';
import {timestamp2LocalDateTimeString} from '@kaseihaku.com/core-infra';
import {useUid2NameCache} from '@kaseihaku.com/cloud-starter-basic';
import {BpmPpeServerApi} from '@kaseihaku.com/bpm-starter-basic';

/******************************* Config *******************************/
const allProps = defineProps({
  modelValue: {type: Array, default: (rawProps) => []},
  procMetaBrand: {type: [String], default: null},
});
/******************************* Var & Function *******************************/
let procBrandNameMap = reactive({});
function fetchProcBrandNameMap(){

  let params = {
    paginate: false, offset: 0, limit: 1,
    param: {
      verTag: 'cur_ver',
    },
  };

  BpmPpeServerApi.default.bpmPpe.v1.CurrentVersion.empty.put(params).then(body => {
    body.forEach(item => {
      procBrandNameMap[item.brand] = item.name;
    });
  });
}

let uid2NameCache = null;
function userId2NameFormatter(row, column, cellValue, index) {
  return uid2NameCache.get(cellValue) ?? cellValue;
}
/******************************* <el-form> *******************************/
const searchFormData = reactive({

  nodeQryDto: {

  },
  processMetaQryDto: {
    brand: allProps.procMetaBrand,
    versionName: '',
  },
  nodeMetaQryDto: {
    brand: '',
    name: '',
  },
});
async function doSearch() {

  let params = {
    paginate: true, offset: (paginationModel.pageNum - 1) * paginationModel.pageSize, limit: paginationModel.pageSize,
    param: searchFormData,
  };

  const body = await BpmPpeServerApi.default.bpmPpe.v1.Node.done.put(params);
  uid2NameCache = await useUid2NameCache(body.map(item=>item.updaterId));
  tableData.splice(0, tableData.length, ...body);


}
/******************************* <el-table> *******************************/
const tableData = reactive([]);
const timestampColFormatter = (row, column, cellValue, index) => {
  return timestamp2LocalDateTimeString(cellValue);
};
const list2Str = (row, column, cellValue, index) => cellValue ? cellValue.toString() : '';
const procBrand2Name = (row, column, cellValue, index) => cellValue ? procBrandNameMap[cellValue] : '';
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
  fetchProcBrandNameMap();
});
</script>
