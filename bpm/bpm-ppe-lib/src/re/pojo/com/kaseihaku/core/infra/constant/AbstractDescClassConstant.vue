<template>
  <el-select v-model="pojoInsCpt" :disabled="readonly" clearable autocomplete>
    <el-option v-for="(item) in options" :key="item.key" :label="item.description" :value="item.key">{{`${item.description} : ${item.key}`}}</el-option>
  </el-select>
</template>

<script setup>
import {ref, onBeforeMount, onMounted, computed} from 'vue';
import {findAnno, findAnnoFirst} from '@/share/util/PojoReUtil.js';
import {RecognizedAnno, RecognizedCls, PojoRePrimitiveType} from '@/share/constant/RecognizedJavaCls.js';

/******************************* Config *******************************/
const allProps = defineProps({
  pojoSchema: {type: Object, required: true},
  /* required 必须为 false，否则必须在父级声明 合法默认值 或者 直接不声明(即: undefined)
   * undefined 会使用 default 值
   * */
  pojoIns: {type: [String], required: false},
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
function initialize(){
  let ppeFormFieldAnno = findAnnoFirst(allProps.pojoSchema, RecognizedAnno.bpm.PpeFormField, 2);
  if(ppeFormFieldAnno){

    if(PojoRePrimitiveType.ClassConstant === allProps.pojoSchema.type){
      options.value = ppeFormFieldAnno.attributes.enumeration;
    }
  }
}

/******************************* <el-input-number> *******************************/
const options = ref([]);




/******************************* Lifecycle *******************************/
onBeforeMount(() => {
  initialize();
});
</script>

<style lang="scss" scoped>

</style>
