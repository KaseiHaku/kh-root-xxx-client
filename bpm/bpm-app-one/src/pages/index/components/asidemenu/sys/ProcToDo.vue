<template>
  <div style="height: 100%;">
    <el-scrollbar class="scrollbar-el-form">
      <el-form :inline="true" :model="searchFormData" label-width="auto" label-position="right">
        <el-row justify="start" align="top">
          <el-col :span="6">
            <el-form-item label="ID:" prop="id">
              <el-input v-model="searchFormData.id" placeholder="ID" @keyup.enter="doSearch" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="流程实例 ID:" prop="procId">
              <el-input v-model="searchFormData.procId" placeholder="procId" @keyup.enter="doSearch" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="父节点实例 ID:" prop="nodeId">
              <el-input v-model="searchFormData.nodeId" placeholder="nodeId" @keyup.enter="doSearch" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="当前节点商标:" prop="nextNodeMetaBrand">
              <el-input v-model="searchFormData.nextNodeMetaBrand" placeholder="nextNodeMetaBrand" @keyup.enter="doSearch" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="当前节点名称:" prop="nextNodeMetaBrandName">
              <el-input v-model="searchFormData.nextNodeMetaBrandName" placeholder="nextNodeMetaBrandName" @keyup.enter="doSearch" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="当前处理人用户同名组 ID:" prop="nextApproverHgid">
              <el-input v-model="searchFormData.nextApproverHgid" placeholder="nextApproverHgid" @keyup.enter="doSearch" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="审批状态:">
              <el-select v-model="searchFormData.approvalState" clearable placeholder="approvalState" disabled>
                <el-option label="待办" value="todo" />
                <el-option label="已办" value="done" />
                <el-option label="忽略" value="ignore" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="流程模型商标:" prop="procMetaBrand">
              <el-select v-model="searchFormData.procMetaBrand" clearable placeholder="procMetaBrand" :disabled="procMetaBrand">
                <el-option v-for="(value, key, index) in procBrandNameMap" :key="key" :label="value" :value="value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-scrollbar>
    <el-table :data="tableData" stripe border>
      <el-table-column fixed type="index" label="Row" />
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="updateTime" label="最后修改时间" :formatter="timestampColFormatter" />
      <el-table-column prop="deleted" label="是否删除" />

      <el-table-column prop="procId" label="流程实例 ID" />
      <el-table-column prop="nodeId" label="父节点实例 ID" />
      <el-table-column prop="nextNodeMetaBrand" label="当前节点商标" />
      <el-table-column prop="nextNodeMetaBrandName" label="当前节点名称" />
      <el-table-column prop="nextApproverHgid" label="当前处理人用户同名组 ID" :formatter="groupId2NameFormatter" />
      <!--<el-table-column prop="nextApproverHgid" label="当前处理人用户同名组 ID" />-->
      <el-table-column prop="approvalState" label="审批状态" />

      <el-table-column prop="procMetaBrand" label="流程商标" />
      <el-table-column prop="procMetaBrand" label="流程商标名称" :formatter="procBrand2Name" />

      <el-table-column fixed="right" label="操作">
        <template #default="slotProps">
          <el-button round @click="handleCommit(slotProps)"><el-icon><Edit /></el-icon></el-button>
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
import {useGid2NameCache} from '@kaseihaku.com/cloud-starter-basic';
import {BpmPpeServerApi} from '@kaseihaku.com/bpm-starter-basic';

/******************************* Config *******************************/
const allProps = defineProps({
  modelValue: {type: Array, default: (rawProps) => []},
  procMetaBrand: {type: [String], default: null},
});
const emit = defineEmits({
  'update:modelValue': (payload) => {
    // 校验 event
    return true;
  },
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

let gid2NameCache = null;
function groupId2NameFormatter(row, column, cellValue, index) {
  return gid2NameCache.get(cellValue) ?? cellValue;
}
/******************************* <el-form> *******************************/
const searchFormData = reactive({
  id: null,
  updateTimeStart: null,
  updateTimeEnd: null,
  deleted: null,

  procId: null,
  nodeId: null,
  nextNodeMetaBrand: null,
  nextApproverHgid: null,
  approvalState: 'todo',

  procMetaBrand: allProps.procMetaBrand,
  nextNodeMetaBrandName: null,
});
async function doSearch() {

  let params = {
    paginate: true, offset: (paginationModel.pageNum - 1) * paginationModel.pageSize, limit: paginationModel.pageSize,
    param: searchFormData,
  };

  const body = await BpmPpeServerApi.default.bpmPpe.v1.ToDo.queryWithMeta.put(params);
  gid2NameCache = await useGid2NameCache(body.map(item=>item.nextApproverHgid));
  tableData.splice(0, tableData.length, ...body);


}

/******************************* <el-table> *******************************/
const tableData = reactive([]);
const timestampColFormatter = (row, column, cellValue, index) => {
  return timestamp2LocalDateTimeString(cellValue);
};
const list2Str = (row, column, cellValue, index) => cellValue ? cellValue.toString() : '';
const procBrand2Name = (row, column, cellValue, index) => cellValue ? procBrandNameMap[cellValue] : '';
const handleCommit = ({ row, column, $index }) => {
  let bpmAppName = new URLSearchParams(window.location.search).get('bpmAppName');
  window.open(`/bpm-ppe/editor.html?bpmAppName=${bpmAppName}#/?procId=${row.procId}&todoId=${row.id}`, '_blank');
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
  fetchProcBrandNameMap();
});
onMounted(() => {
  doSearch();
});
</script>

<style lang="scss" scoped>
  .scrollbar-el-form {
    height: 15%;
    width: 100%;
    overflow: auto;
  }
  .el-table {
    height: 82%;
  }
  .el-pagination {
    height: 3%;
  }
  .el-form-item {
    width: 100%;
  }
</style>
