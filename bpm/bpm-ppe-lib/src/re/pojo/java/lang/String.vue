<template>
  <el-input v-model="pojoInsCpt" :disabled="readonlyInit" :type="type" :minlength="minlength" :maxlength="maxlength"></el-input>
</template>

<script setup>
import {ref, computed, onBeforeMount} from 'vue';
import {computeReadonly, findAnnoFirst} from '@/share/util/PojoReUtil.js';
import {RecognizedAnno} from '@/share/constant/RecognizedJavaCls.js';

/******************************* Config *******************************/
const allProps = defineProps({
  pojoSchema: {type: Object, required: true, validator: (value, props)=> value != null},
  /* required 必须为 false，否则必须在父级声明 合法默认值 或者 直接不声明(即: undefined)
   * undefined 会使用 default 值
   * */
  pojoIns: {type: String, required: false},
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
  let emailAnno = findAnnoFirst(allProps.pojoSchema, RecognizedAnno.jsr303.Email);
  if(emailAnno){
    type.value = 'email';
  }
  let urlAnno = findAnnoFirst(allProps.pojoSchema, RecognizedAnno.hibernate.URL);
  if(urlAnno){
    type.value = 'url';
  }


  let notBlankAnno = findAnnoFirst(allProps.pojoSchema, RecognizedAnno.jsr303.NotBlank);
  let notEmptyAnno = findAnnoFirst(allProps.pojoSchema, RecognizedAnno.jsr303.NotEmpty);
  if(notBlankAnno || notEmptyAnno){
    minlength.value = 1;
  }

  let sizeAnno = findAnnoFirst(allProps.pojoSchema, RecognizedAnno.jsr303.Size);
  if(sizeAnno){
    maxlength.value = Number(sizeAnno.attributes.max);
    minlength.value = Number(sizeAnno.attributes.min);
  }

  let lengthAnno = findAnnoFirst(allProps.pojoSchema, RecognizedAnno.hibernate.Length);
  if(lengthAnno){
    maxlength.value = Number(lengthAnno.attributes.max);
    minlength.value = Number(lengthAnno.attributes.min);
  }



}

/******************************* <el-input> *******************************/
const type = ref('text');
const maxlength = ref(undefined);
const minlength = ref(0);

/******************************* Lifecycle *******************************/
onBeforeMount(() => {
  initialize();
});
</script>

<style scoped>
  .el-input {
    width: 100%;
  }
</style>
