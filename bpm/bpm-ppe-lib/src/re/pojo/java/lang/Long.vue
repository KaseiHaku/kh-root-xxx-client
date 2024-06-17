<template>
  <el-input-number v-model="pojoInsCpt" :disabled="readonlyInit" :max="max" :min="min"></el-input-number>
</template>

<script setup>
import {ref, onBeforeMount, computed} from 'vue';
import {computeReadonly, findAnnoFirst} from '@/share/util/PojoReUtil.js';
import {RecognizedAnno} from '@/share/constant/RecognizedJavaCls.js';

/******************************* Config *******************************/
const allProps = defineProps({
  pojoSchema: {type: Object, required: true, validator: (value, props)=> value != null},
  /* required 必须为 false，否则必须在父级声明 合法默认值 或者 直接不声明(即: undefined)
   * undefined 会使用 default 值
   * */
  pojoIns: {type: [String, Number], required: false},
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
  let maxAnno = findAnnoFirst(allProps.pojoSchema, RecognizedAnno.jsr303.Max);
  if(maxAnno){
    max.value = maxAnno.attributes.value;
  }

  let minAnno = findAnnoFirst(allProps.pojoSchema, RecognizedAnno.jsr303.Min);
  if(minAnno){
    min.value = minAnno.attributes.value;
  }

  let negativeAnno = findAnnoFirst(allProps.pojoSchema, RecognizedAnno.jsr303.Negative);
  let negativeOrZeroAnno = findAnnoFirst(allProps.pojoSchema, RecognizedAnno.jsr303.NegativeOrZero);
  if(negativeAnno || negativeOrZeroAnno){
    max.value = 0;
    min.value = -Infinity;
  }

  let positiveAnno = findAnnoFirst(allProps.pojoSchema, RecognizedAnno.jsr303.Positive);
  let positiveOrZeroAnno = findAnnoFirst(allProps.pojoSchema, RecognizedAnno.jsr303.NegativeOrZero);
  if(positiveAnno || positiveOrZeroAnno){
    max.value = Infinity;
    min.value = 0;
  }

  let rangeAnno = findAnnoFirst(allProps.pojoSchema, RecognizedAnno.hibernate.Range);
  if(rangeAnno){
    max.value = Number(rangeAnno.attributes.max);
    min.value = Number(rangeAnno.attributes.min);
  }
}

/******************************* <el-input-number> *******************************/
const max = ref(Infinity);
const min = ref(-Infinity);


/******************************* Lifecycle *******************************/
onBeforeMount(() => {
  initialize();
});
</script>

<style scoped>
  .el-input-number {
    width: 100%;
  }
</style>
