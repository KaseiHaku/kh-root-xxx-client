<template>
  <div>
    <el-table :data="tableData">
      <el-table-column fixed type="index" label="Row" />
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="userId" label="用户 ID" />
      <el-table-column prop="identifierType" label="标识符类型" />
      <el-table-column prop="identifier" label="标识符" />
      <el-table-column prop="updateTime" label="更新时间" :formatter="timestampColFormatter" />
      <el-table-column prop="deleted" label="是否删除" />
      <el-table-column fixed="right" label="操作">
        <template #default="scope">
          <el-button round @click="handleEdit(scope.$index, tableData)">Edit</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogFormVisible" title="Authenticate Edit Dialog">
      <el-form :model="dialogFormData" label-width="auto" label-position="right">
        <el-form-item label="ID:">
          <el-input v-model="dialogFormData.id" placeholder="authenticate id" :disabled="true" />
        </el-form-item>
        <el-form-item label="用户 ID:">
          <el-input v-model="dialogFormData.userId" placeholder="user id" :disabled="true" />
        </el-form-item>
        <el-form-item label="标识符类型:">
          <el-input v-model="dialogFormData.identifierType" placeholder="identifierType" :disabled="dialogFormInEditState" />
        </el-form-item>
        <el-form-item label="标识符:">
          <el-input v-model="dialogFormData.identifier" placeholder="identifier" :disabled="dialogFormInEditState"/>
        </el-form-item>
        <el-form-item label="新密码:">
          <el-input type="password" v-model="dialogFormData.certificate" placeholder="new password" />
        </el-form-item>
        <el-form-item label="确认密码:">
          <el-input type="password" v-model="dialogFormData.certificateConfirm" placeholder="confirm password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button round @click="dialogFormVisible = false">Cancel</el-button>
          <el-button type="primary" round @click="dialogEditConfirmed">Confirm</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>

import {ref, reactive, onBeforeMount} from 'vue';
import {ElMessage} from 'element-plus';
import {timestamp2LocalDateTimeString, argon2HashPromise} from '@kaseihaku.com/core-infra';
import {CloudServerApi, useCurUserStore} from '@kaseihaku.com/cloud-starter-basic';
/******************************* Var & Function *******************************/
const curUserStore = useCurUserStore();

/******************************* <el-table> *******************************/
const tableData = reactive([]);
function loadData(){

  curUserStore.refresh();
  if(!curUserStore.id){
    ElMessage({type: 'error', message: '无法获取当前用户'});
    return ;
  }

  CloudServerApi.default.cloudUser.v1.authenticate.queryWithoutCert.put({
    paginate: false,
    param: {
      userId: curUserStore.id,
      identifierType: 'account',
    }
  }).then(body => {
    tableData.splice(0, tableData.length, ...body.data);
  });
}
const handleEdit = (index, rows) => {
  clearForm();
  Object.assign(dialogFormData, rows[index]);
  dialogFormVisible.value = true;
  dialogFormInEditState.value = true;
};
const timestampColFormatter = (row, column, cellValue, index) => {
  return timestamp2LocalDateTimeString(cellValue);
};
/******************************* <el-dialog> *******************************/
const dialogFormVisible = ref(false);
const dialogFormInEditState = ref(false);
const dialogFormData = reactive({
  id: '',

  userId: '',
  identifierType: '',
  identifier: '',
  certificate: '',
  certificateConfirm: '',
});
/* 清空数据 */
function clearForm(){
  Reflect.ownKeys(dialogFormData).forEach(item => {
    // 需要特殊处理的字段名
    let specialTreatmentFields = [
      // 无需处理的字段
      'id',
      // 需要特殊清空的字段
      'certificateConfirm',
    ];
    if(specialTreatmentFields.includes(item)){
      return ;
    }
    dialogFormData[item] = null;
  });

  // 清空特殊字段
  dialogFormData.certificateConfirm = '';
}
const dialogEditConfirmed = async () => {
  if (!(typeof dialogFormData.id || dialogFormData.id instanceof String)) {
    throw new Error('身份认证 id 数据类型错误');
  }

  // 密码校验
  if(dialogFormData.certificate!==dialogFormData.certificateConfirm){
    ElMessage({type: 'error', message: '两次输入的密码不同，请重新输入'});
    dialogFormData.certificate = '';
    dialogFormData.certificateConfirm = '';
    return ;
  }

  // 参数调整
  let params = Object.assign({}, dialogFormData);
  if(dialogFormData.identifierType === 'account'){
    params.certificate = (await argon2HashPromise)(dialogFormData.identifier, dialogFormData.certificate);
  }


  // 更新凭证
  CloudServerApi.default.cloudUser.v1.authenticate.empty.patch(params)
    .then(body => {
      ElMessage({type: 'success', message: 'authenticate update success'});
      dialogFormVisible.value = false;
    });
};

/******************************* Lifecycle *******************************/
onBeforeMount(() => {
  loadData();
});
</script>
