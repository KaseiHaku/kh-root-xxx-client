import * as VueRouter from 'vue-router';
import path from 'path';
import _ from 'lodash-es';
import {login, needLogin} from '@kaseihaku.com/cloud-starter-basic';
import Constant from '@/constant/BpmPortalConstant.js';





/**
 * 创建路由器
 * @type {Router}
 */
const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory('/'),
  routes: [
    {
      path: '/',
      redirect: '/PortalHome.vue',
      props: false,
      // @trap children 里面以 / 开头的 path 会当作 root 路径对待，即：bpm.kaseihaku.com/
      children: [
        /**
         * 由于该中间层没有指定任何 components，则该中间层路由不会渲染任何内容，但它仍然可以作为父级路由的占位符或者用于嵌套其他子路由
         * 具体表现如下：
         *  如果直接访问中间层路由的 URL(/ppe)，它不会渲染任何内容，可能会显示空白页面或出现错误。
         *  如果中间层路由用作父级路由，它可以作为容器，用于嵌套其他子路由，但它本身不会渲染任何内容。
         *
         * */
        {
          path: 'PortalHome.vue',
          component: () => import('@/pages/index/components/PortalHome.vue'),
          props: true,
        },
      ],
    },



  ]
});

/**
 * @return false 结束当前路由
 * @return Route location 跳转到制定路由
 * @return void undefined true 继续执行下一个 guard
 * @throws Error 那么执行 router.onError()
 * */
router.beforeEach((to, from) => {
  let loginNeedlessRoute = ['/PortalHome.vue'];
  if (!loginNeedlessRoute.includes(to.path) && needLogin()) {
    login();
  }
});

router.beforeResolve(async (to, from) => {

  console.log(to.fullPath);

});
router.afterEach((to, from) => {
});

export {router};
