<template>
  <kh-upload v-model="pojoInsCpt" :base-action-url="axios.defaults.baseURL" :limit="limit" :readonly="readonlyInit"></kh-upload>
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
  pojoIns: {type: [Array], required: false},
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
    return allProps.pojoIns ? allProps.pojoIns : [];
  },
  set(newVal){
    emit('update:pojoIns', newVal);
  },
});
const {axios} = useKhGlobalOptions();

/******************************* Var & Function *******************************/
const readonlyInit = computeReadonly(allProps.pojoSchema, allProps.readonly);
function initialize(){
  let sizeAnno = findAnnoFirst(allProps.pojoSchema, RecognizedAnno.jsr303.Size);
  if(sizeAnno){
    limit.value = sizeAnno.attributes.max;
  }


}

/******************************* <kh-upload> *******************************/
const limit = ref(32);

/******************************* Lifecycle *******************************/
onBeforeMount(() => {
  initialize();
});
</script>

<style lang="scss" scoped>

</style>
