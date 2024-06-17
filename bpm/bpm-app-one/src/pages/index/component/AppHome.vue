<template>
  <div style="height: 100%;">
    BPM APP One
  </div>
</template>

<script setup>
import {ref, shallowRef, reactive, onMounted, onUnmounted, defineAsyncComponent} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useKhGlobalOptions} from '@kaseihaku.com/cloud-starter-basic';
import ServerUrl from '@/config/axios/ServerUrl.js';
import Constant from '@/constant/BpmAppConstant.js';
import {loadModule} from 'vue3-sfc-loader';
import _ from 'lodash-es';
import {i18n} from '@/config/vue/i18n/VueI18nConfig.js';

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



/******************************* Lifecycle *******************************/
onMounted(() => {

});
</script>

<style lang="scss" scoped>

</style>
