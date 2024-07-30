<template>
  <el-form ref="formRef" :model="nodeContentCpt" :disabled="readonly" :rules="rules">
    <el-row justify="start" align="top">
      <el-col :span="12">
        <el-form-item label="提交后会被 AfterReceiveHook 修改的" prop="tamperByServer">
          <el-input type="text" v-model="nodeContentCpt.tamperByServer"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="渲染时由 AfterRetrieveHook 生成的" prop="genByRetrieveHook" >
          <el-input type="text" v-model="nodeContentCpt.genByRetrieveHook" disabled></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row justify="center" v-if="!readonly">
      <el-col style="display: flex; justify-content: center;"><el-button type="primary" @click="submit">提交</el-button></el-col>
    </el-row>
  </el-form>
</template>

<script setup>
/******************************* 所有可用 import ********************************
 * 由于 框架设计问题，如果 import 其他 node_module 中的 module 会报错;
 * */
import {ref, onBeforeMount, computed} from 'vue';
import {ElMessage} from 'element-plus';
import _ from 'lodash-es';
import path from 'path';
import {v4 as uuidV4} from 'uuid';
import {getJwsPayload} from '@kaseihaku.com/core-infra';
import {useKhGlobalOptions} from '@kaseihaku.com/cloud-starter-basic';
import {usePpeShare} from '@kaseihaku.com/bpm-starter-basic';

const { axios } = useKhGlobalOptions();
const { reLocationWithoutTodoId} = usePpeShare();


// 以下都是当前 module/src 下的 import
import ServerUrl from '@/config/axios/ServerUrl.js';
import {getToDoId} from '@/share/util/PojoReUtil.js';

/******************************* Config *******************************/
const allProps = defineProps({
  nodeContent: {type: [Object, null], required: true},
  readonly: {type: [Boolean], default: true},
});
const emit = defineEmits({
  'update:nodeContent': (payload) => {
    // 校验 event
    return true;
  },
});
const nodeContentCpt = computed({
  get(oldVal){
    return allProps.nodeContent;
  },
  set(newVal){
    emit('update:nodeContent', newVal);
  },
});


/******************************* Var & Function *******************************/

/******************************* <el-form> *******************************/


const formRef = ref(null);
const rules = {
  tamperByServer: [
    { type: 'string', required: true, message: '不能为 null'},
  ],
  genByRetrieveHook: [
    { type: 'string' }
  ]

};
async function submit(){
  try{
    let validate = await formRef.value.validate();
  } catch (err){
    for (const key in err) {
      err[key].forEach(item => {
        ElMessage({type: 'error', message: `${item.field}: ${item.message}`});
      });
    }
  }

  let nodeCommitParams = {
    toDoId: getToDoId(),
    content: allProps.nodeContent,
  };
  await axios.post(ServerUrl.default.bpmPpe.v1.Engine.nodeSubmit, nodeCommitParams).then(resp => resp.data);
  ElMessage({type: 'success', message: 'success'});
  if(window.opener){
    window.close();
  } else {
    reLocationWithoutTodoId();
  }
}

/******************************* Lifecycle *******************************/
onBeforeMount(() => {

});
</script>

<style lang="scss" scoped>

</style>
