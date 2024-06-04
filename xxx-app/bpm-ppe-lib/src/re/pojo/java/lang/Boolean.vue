<template>
  <el-switch v-model="pojoInsCpt" :disabled="readonlyInit" />
</template>

<script setup>
import {computed, onBeforeMount} from 'vue';
import {computeReadonly} from '@/share/util/PojoReUtil.js';

/******************************* Config *******************************/
const allProps = defineProps({
  pojoSchema: {type: Object, required: true, validator: (value, props)=> value != null},
  /* required 必须为 false，否则必须在父级声明 合法默认值 或者 直接不声明(即: undefined)
   * undefined 会使用 default 值
   * */
  pojoIns: {type: [Boolean], required: false},
  readonly: {type: [Boolean], default: true},
});
const emit = defineEmits({
  'update:pojoIns': (payload) => {
    // 校验 event
    return true;
  },
});
const pojoInsCpt = computed({
  get: () => allProps.pojoIns,
  set: (newValue) => emit('update:pojoIns', newValue),
});
/******************************* Var & Function *******************************/
const readonlyInit = computeReadonly(allProps.pojoSchema, allProps.readonly);
function initialize(){

}

/******************************* <el-input> *******************************/

/******************************* Lifecycle *******************************/
onBeforeMount(() => {
  initialize();
});
</script>

<style scoped>

</style>
