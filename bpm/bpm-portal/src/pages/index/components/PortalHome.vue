<template>
  <div style="height: 100%; margin: 3%;">
    <el-input v-model.trim="searchStr" clearable size="large"
              placeholder="Please input" autofocus @keyup.enter="handleSearch" >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>
    <el-divider/>
    <el-space :wrap="true" >
      <el-card v-for="(value, key, index) in bpmApps" :key="value.service"
               shadow="always" @click="cardClickHandler(`/${value.service}/index.html?bpmAppName=${value.service}`)">

        <template #header>
          <el-icon><Grid /></el-icon> {{value.appName}}（{{value.service}}）
        </template>

        <el-space direction="vertical" alignment="start" :size="0">
          <el-link type="primary" @click.prevent.stop="cardClickHandler(`/bpm-ppe/admin.html?bpmAppName=${value.service}`)" >
            <el-space><el-icon><Tools /></el-icon> Administrate</el-space>
          </el-link><br/>
          <el-link type="primary" @click.prevent.stop="cardClickHandler(`/${value.service}/index.html?bpmAppName=${value.service}`)">
            <el-space><el-icon><HomeFilled /></el-icon> Home</el-space>
          </el-link>
        </el-space>
      </el-card>
    </el-space>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, onUnmounted} from 'vue';
import {ElMessage, ElMessageBox, ElPagination} from 'element-plus';
import {useRoute, useRouter} from 'vue-router';
import {useKhGlobalOptions} from '@kaseihaku.com/cloud-starter-basic';
import ServerUrl from '@/config/axios/ServerUrl.js';
import Constant from '@/constant/BpmPortalConstant.js';

/******************************* Config *******************************/
const allProps = defineProps({
  modelValue: {type: Array, default: (rawProps) => []},
});
const emit = defineEmits({
  'update:modelValue': (payload) => {
    // 校验 event
    return true;
  },
});
const router = useRouter();
const route = useRoute();
const axios = useKhGlobalOptions().axios;


/******************************* Var & Function *******************************/


/******************************* <el-input> *******************************/
const searchStr = ref('');
const handleSearch = () => {
  if(!searchStr.value){
    bpmApps.value.splice(0, Infinity, ...bpmAppsAll.value);
    return ;

  }

  let searchResultAry = bpmAppsAll.value.filter((item, idx) => {
    return item.appName.includes(searchStr.value);
  });
  bpmApps.value.splice(0, Infinity, ...searchResultAry);
};


/******************************* <el-card> *******************************/
const bpmApps = ref([]);
const bpmAppsAll = ref([]);


const fetchBpmApps = async () => {
  let respData = await axios.get(
    ServerUrl.default.bpmPortal.v1.consul.services,
    {params: {filter: 'Service matches "^bpm-app-.*$" and Meta["bpm-app-name"] matches ".{1,}"'}}
  ).then(resp=>resp.data);

  const service2AppNameMap = new Map();
  for (const key in respData) {
    let service = respData[key].Service;
    let appName = respData[key].Meta['bpm-app-name'];

    if(appName && !service2AppNameMap.get(service) ){
      service2AppNameMap.set(service, appName);
    }
  }

  for (const [key, value] of service2AppNameMap) { // 遍历对象的 key value，对象必须部署 Symbol.iterator 属性
    bpmApps.value.push({ service: key, appName: value});
    bpmAppsAll.value.push({ service: key, appName: value});
  }

};

const cardClickHandler = (href) => {
  window.open(href, '_blank');
};


/******************************* Lifecycle *******************************/
onMounted(() => {
  fetchBpmApps();
});
</script>

<style lang="scss" scoped>
  .el-input {
    padding-left: 25%;
    padding-right: 25%;
  }

  .el-input :deep(.el-input__wrapper) {
    border-radius: var(--el-border-radius-round);
  }

  .el-card {
    box-shadow: var(--el-box-shadow-light);
  }
  .el-card:hover {
    box-shadow: var(--el-box-shadow-dark);
  }

</style>
