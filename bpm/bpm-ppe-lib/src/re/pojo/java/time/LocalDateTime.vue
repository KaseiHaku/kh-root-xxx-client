<template>
  <el-date-picker v-model="pojoInsCpt" :disabled="readonlyInit" type="datetime" placeholder="Select date and time"
                  value-format="x" :default-value="defaultValue" />
</template>

<script setup>
import {ref, computed, onBeforeMount, onMounted} from 'vue';
import {computeReadonly, findAnno, findAnnoFirst} from '@/share/util/PojoReUtil.js';
import {RecognizedAnno} from '@/share/constant/RecognizedJavaCls.js';

/******************************* Config *******************************/
const allProps = defineProps({
  pojoSchema: {type: Object, required: true, validator: (value, props)=> value != null},
  /* required 必须为 false，否则必须在父级声明 合法默认值 或者 直接不声明(即: undefined)
   * undefined 会使用 default 值
   * */
  pojoIns: {type: [Number, String], required: false},
  readonly: {type: [Boolean], default: true},
});
const emit = defineEmits({
  'update:pojoIns': (payload) => {
    // 校验 event
    return true;
  },
});
const pojoInsCpt = computed({
  get: () => allProps.pojoIns ? Number(allProps.pojoIns) : null,
  set: (newValue) => emit('update:pojoIns', newValue),
});
/******************************* Var & Function *******************************/
const readonlyInit = computeReadonly(allProps.pojoSchema, allProps.readonly);
function initialize(){



}

/******************************* <el-input> *******************************/
const defaultValue = ref(new Date());

/******************************* Lifecycle *******************************/
onBeforeMount(() => {
  initialize();
});
</script>

<style scoped>
  .el-date-picker {
    width: 100%;
  }
</style>
