<template>
  <el-form>
    <el-form-item label="选择用户">
      <kh-user-picker ref="khUserPickerRef" v-model="selectedUserId"></kh-user-picker>
    </el-form-item>
    <el-form-item>
      <el-button @click="submit">确定</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import {ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useMainBodyTabsStore} from '@/pages/index/config/vue/pinia/MainBodyTabsStore.js';
import {useKhGlobalOptions, KhUserPicker} from '@kaseihaku.com/cloud-starter-basic';
import {BpmPpeServerApi} from '@kaseihaku.com/bpm-starter-basic';
import {ElMessage} from 'element-plus';


/******************************* Config *******************************/
const router = useRouter();
const route = useRoute();
const { axios } = useKhGlobalOptions();
const mainBodyTabsStore = useMainBodyTabsStore();
/******************************* <el-form> *******************************/
const khUserPickerRef = ref(null);
const selectedUserId = ref(null);
async function submit(){
  BpmPpeServerApi.default.cloudUser.v1.authenticate.ordinaryUserForgery.get(selectedUserId.value).then(body => {
    ElMessage({type: 'success', message: 'switch success'});
    mainBodyTabsStore.removeTab(route.fullPath);
  });
}
</script>

<style lang="scss" scoped>


</style>
