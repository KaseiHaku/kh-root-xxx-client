import * as VueRouter from 'vue-router';
import path from 'path';
import {useMainBodyTabsStore} from '@/pages/index/config/vue/pinia/MainBodyTabsStore.js';
import {login, needLogin} from '@kaseihaku.com/cloud-starter-basic';





/**
 * webpack module 批量加载， 并批量注册到 vue-router 中
 * @type {webpack.Context}
 *
 * @see https://webpack.js.org/configuration/module/#moduleparserjavascriptimportmetacontext   是否开启指定的功能
 * @see https://webpack.js.org/api/module-variables/#importmetawebpack  包含所有可以在代码中使用的变量
 * @see https://webpack.js.org/guides/dependency-management/  # import.meta.webpackContext 和 require.context 文档
 */
const asideMenuRequireContext = import.meta.webpackContext('@/pages/index/components/asidemenu', {
  recursive: true,
  regExp: /\/AsideMenu\.vue$/i,  // 名称为 SideMenu.vue 的文件就是侧边菜单，  是针对 requireContext.keys() 进行匹配的
  mode: 'lazy',
});
// console.log(asideMenuRequireContext.resolve('@/config')); // 返回模块 id，该方法只在编译期存在，运行期是 undefined
console.log(asideMenuRequireContext.keys()); // 返回一个 ary，包含当前 context 能处理的所有可能的请求
console.log(asideMenuRequireContext.id); // context module 的 id

/** 侧边栏菜单 批量路由 生成 */
const asideMenuCache = new Map();
const asideMenuRoutes = [];
for (const key of asideMenuRequireContext.keys()) {
  asideMenuRoutes.push({
    path: path.join(key),
    components: {
      sideMenuView: () => import(`@/pages/index/components/asidemenu/${path.normalize(key)}`),
    }
  });
  asideMenuCache.set(path.join('/', key), asideMenuRequireContext(key));
}


/** 普通菜单项 批量路由 生成 */
const menuItemRequireContext = import.meta.webpackContext('@/pages/index/components/asidemenu', {
  recursive: true,
  regExp: /\.vue$/i,  // 是针对 requireContext.keys() 进行匹配的
  exclude: /\/AsideMenu\.vue$/i,
  mode: 'lazy',
});
const menuItemRoutes = [];
for (const key of menuItemRequireContext.keys()) {

  // 找到最近的 SideMenu.vue 文件作为 sideMenuView 的组件
  let curAsideMenuPath = null;
  for(let sideMenuPath = path.join('/', key, '..', 'AsideMenu.vue');
      sideMenuPath!=='/AsideMenu.vue';
      sideMenuPath = path.join(sideMenuPath, '../..', 'AsideMenu.vue')
  ){
    if (asideMenuCache.get(sideMenuPath)) {
      curAsideMenuPath = sideMenuPath;
      break;
    }
  }
  if (!curAsideMenuPath) {
    throw new Error(`can not to find matched AsideMenu.vue: ${key}`);
  }


  menuItemRoutes.push({
    path: path.join(key),
    components: {
      sideMenuView: () => import(`@/pages/index/components/asidemenu/${path.relative('/', curAsideMenuPath)}`),
      mainBodyView: () => import(`@/pages/index/components/asidemenu/${path.normalize(key)}`),
    },
    props: {
      // default 表示没有 name 属性的 <router-view />
      // default: false, // Boolean Mode: true 表示将所有的路由参数作为 props 传递给默认视图。
      sideMenuView: { staticProp: 0 }, // Object Mode: 用于直接赋予静态 props
      mainBodyView: route => ({...route.query}), // Function Mode: 将返回值作为最终 props，用于自定义的场景
    }
  });
}


/**
 * 创建路由器
 * @type {Router}
 */
const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory('/'),
  routes: [
    {
      path: '/',
      component: () => import('@/pages/index/components/AppHome.vue'),
      props: false,
      alias: ['/Home',],
      redirect: '/sys/WelcomePage.vue',
      // @trap children 里面以 / 开头的 path 会当作 root 路径对待，即：bpm.kaseihaku.com/
      children: [
        ...asideMenuRoutes,
        ...menuItemRoutes,
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
  let loginNeedlessRoute = [];
  if (!loginNeedlessRoute.includes(to.path) && needLogin()) {
    login();
  }
});

router.beforeResolve(async (to, from) => {
  const mainBodyTabsStore = useMainBodyTabsStore();

  console.log(to.fullPath);
  if (/.*AsideMenu.vue$/i.test(to.path)) {
    // 如果是 AsideMenu 中的组件，直接过
    return true;
  }

  // 需要显示在 MainBody <el-tabs> 中的组件
  mainBodyTabsStore.addOrSwitchTab(to.fullPath);

});
router.afterEach((to, from) => {
});

export {router};
