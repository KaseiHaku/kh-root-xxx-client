<template>
  <div style="height: 100%;">
    example view
  </div>
</template>

<script setup>
/******************************* 所有可用 import ********************************
 * 由于 框架设计问题，如果 import 其他 node_module 中的 module 会报错;
 * */
import {ref, onBeforeMount} from 'vue';
import {ElMessage} from 'element-plus';
import _ from 'lodash-es';
import path from 'path';
import {v4 as uuidV4} from 'uuid';
import {getJwsPayload} from '@kaseihaku.com/core-infra';
import {useKhGlobalOptions} from '@kaseihaku.com/cloud-starter-basic';
import {usePpeShare} from '@kaseihaku.com/bpm-starter-basic';


/******************************* Config *******************************/
const allProps = defineProps({
  reModel: {type: Array, default: (rawProps) => []},
  readonly: {type: [Boolean], default: true},
});
const emit = defineEmits({
  'update:modelValue': (payload) => {
    // 校验 event
    return true;
  },
});


/******************************* Var & Function *******************************/

/******************************* <el-form> *******************************/


/******************************* Lifecycle *******************************/
onBeforeMount(() => {

});
</script>

<style lang="scss" scoped>

</style>
