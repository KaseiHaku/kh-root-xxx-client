<template>
  <kh-upload v-model="pojoInsCpt" :base-action-url="axios.defaults.baseURL" :limit="1" :readonly="readonlyInit"></kh-upload>
</template>

<script setup>
import {ref, computed, onBeforeMount, onMounted, inject} from 'vue';
import {usePpeShare} from '@kaseihaku.com/bpm-starter-basic';
import {useKhGlobalOptions} from '@kaseihaku.com/cloud-starter-basic';

const {computeReadonly, findAnno, findAnnoFirst} = usePpeShare().PojoReUtil;
const {RecognizedAnno} = usePpeShare().RecognizedJavaCls;

/******************************* Config *******************************/
const allProps = defineProps({
  pojoSchema: {type: Object, required: true, validator: (value, props)=> value !== null},
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
  get(oldVal){
    return allProps.pojoIns ? [allProps.pojoIns] : [];
  },
  set(newVal){
    if(newVal.length>0){
      emit('update:pojoIns', newVal[0]);
      return ;
    }
    emit('update:pojoIns', null);
  },
});
const {axios} = useKhGlobalOptions();

/******************************* Var & Function *******************************/
const readonlyInit = computeReadonly(allProps.pojoSchema, allProps.readonly);
function initialize(){
  let maxAnno = findAnnoFirst(allProps.pojoSchema, RecognizedAnno.jsr303.Max);
  if(maxAnno){
    max.value = maxAnno.attributes.value;
  }


}

/******************************* <el-input> *******************************/


/******************************* Lifecycle *******************************/
onBeforeMount(() => {
  initialize();
});
</script>

<style lang="scss" scoped>

</style>
