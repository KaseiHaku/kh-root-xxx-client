<template>
  <el-container class="kh-home">
    <el-header><header-menu /></el-header>
    <el-container class="kh-inner-container">
      <el-aside class="kh-aside-menu">
        <router-view v-slot="{ Component }" name="sideMenuView">
          <transition name="fade" mode="in-out">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-aside>
      <el-main><main-body /></el-main>
    </el-container>
    <el-footer>www.kaseihaku.com</el-footer>
  </el-container>
</template>

<script setup>
import HeaderMenu from '@/pages/index/components/HeaderMenu.vue';
import MainBody from '@/pages/index/components/MainBody.vue';

</script>


<style lang="scss" scoped>
@import '@/assets/styles/index.scss';

@mixin header-footer {
  background-color: var(--el-color-primary-light-7);
  color: var(--el-text-color-primary);
  text-align: center;
}

.el-container.kh-home {
  height: 100%;
}

.el-container.kh-inner-container{
  height: 94%;
  flex-wrap: nowrap;
}

.el-header {
  @include header-footer;
  height: 4%;
  padding: 0;
}
.el-header * {
  background-color: var(--el-color-primary-light-7);
}

.el-footer {
  @include header-footer;
  background-color: var(--el-color-primary-light-7);
  height: 2%;
}

.kh-aside-menu * {
  height: 100%;
  background-color: var(--el-color-primary-light-8);
  color: var(--el-text-color-primary);
  text-align: center;
  min-width: $side-menu-width;


}

.el-main {
  height: 100%;
  background-color: var(--el-color-primary-light-9);
  color: var(--el-text-color-primary);
  text-align: center;
}



</style>
