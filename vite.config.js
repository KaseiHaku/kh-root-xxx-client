import path from 'path';
import {fileURLToPath, pathToFileURL, URL} from 'url';

import {defineConfig, loadEnv, createLogger} from 'vite';
import pluginVue from '@vitejs/plugin-vue';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { createHtmlPlugin } from 'vite-plugin-html';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import viteServeStatic from 'vite-plugin-serve-static';

/**
 * 坑：
 *  ./                  表示当前工作目录， 即： shell> node xxx.js 命令执行的目录，不随 ./ 所在文件的位置改变而改变
 *                      如果 /root/bb/cc.js 文件中有个相对路径 ./tty
 *                      且执行命令所在的路径为 /home/kasei
 *                      那么 /root/bb/cc.js 中的 ./tty 表示的绝对路径为 /home/kasei/tty 而不是 /root/bb/tty
 *                      如果 ./tty 在 import 语句中，那么 . 不代表当前工作目录，而是代表当前文件所在的目录
 *
 *  __filename          nodejs 的全局变量，值为当前正在执行的 js 文件的绝对路径
 *  __dirname           nodejs 的全局变量，值为当前正在执行的 js 文件所在目录的绝对路径，注意跟 ./ 要区分开
 * */
const __dirnameEsModule = path.dirname(fileURLToPath(import.meta.url)); // 由于当前模块采用的是 ESM 的模块系统，所以没有 __dirname 全局变量
console.info('__dirnameEsModule=' + __dirnameEsModule);
export function getPkgPath() {
  return path.dirname(process.argv[process.argv.indexOf('-c') + 1]);
}
console.log(`packagePath=${path.resolve(__dirnameEsModule, getPkgPath())}; `);





/**
 * @see https://vitejs.dev/config/server-options.html
 */
process.env.BROWSER = 'google-chrome-stable';
process.env.BROWSER_ARGS = [
  // '--incognito',    // 该模式会导致 localstorage 无法设置和访问，导致网页无法正常登录，所以注释掉
  '--new-window',
  // 设置成 idea debug 用的 chrome user data，用以创建 独立的 chrome 实例，防止干扰系统默认的 chrome 配置
  '--user-data-dir=/home/kasei/.config/JetBrains/IntelliJIdea2024.1/chrome-user-data',
].join(' ');
const serverOptions = {
  host: '0.0.0.0',
  port: 8080,
  strictPort: true,
  open: '/index.html',
  proxy: {
    '/login': 'http://192.168.0.106:8910',
    '/oauth2-login': 'http://192.168.0.106:8910',
    '/logout': {
      target: 'http://192.168.0.106:8910',
      changeOrigin: false,
    },
    '/oauth2': {
      target: 'http://192.168.0.106:8910',
      secure: false,
      toProxy: true,
    },
    '/consul': {
      target: 'http://192.168.0.201:8500',
      secure: false,
      rewrite: (path) => path.replace(/^\/consul/, ''),
    },
    /**
     * @ref {Options 文档} https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/proxy.ts
     * @ref {Options 文档} https://github.com/vitejs/vite/blob/main/packages/vite/src/types/http-proxy.d.ts
     * */
    '^/api': {
      target: 'http://localhost:8999',
      rewrite: (path) => path.replace(/^\/api/, ''),
      secure: false,   // 当后端地址是 https 但是证书是无效的时，必须配置为 false ，否则无法访问
      toProxy: true,            // true: 将全部的 URL 作为 path（用于代理到代理服务器）
      prependPath: true,        // true: 将 /api/* 拼接到 target 后面
      ignorePath: false,        // true: 将 /api/* 都忽略掉, @trap target 地址需要自行处理
      // localAddress: '',         // 向外发起请求时，使用本地哪张网卡
      /* @trap 巨神坑：这里 false 的话，会以原始请求 URL 发送给 目标服务器，
       *    即：http://localhost/bpm-ppe-lib/native/proc_brand1/v1/Node1Brand.vue
       *    但是目标端口会从 $.devServer.port(8080) 变成 target 中的 目标端口(80)
       *    坑中带坑
       * */
      changeOrigin: false,     // true: 修改 Origin http header 用于防止跨域问题
      preserveHeaderKeyCase: false,     // false: 不保留响应头大小写格式
      // auth: 'user:password',    // 使用指定 账号/密码 登录目标服务器
      // hostRewrite: ,     // 重定向时，重写 hostname
      autoRewrite: false,  // 重定向时，重写 host/port
      // protocolRewrite: 'https', // 重定向时，将 protocol 重写为 "http" 或 "https"，默认为 null
      // 添加额外的请求头，再发送给目标服务器
      headers: {
        // 'x-kasei-gray-req-flag': 'Canary=bpm-app-one,bpm-app-xxx',    // browser 灰度请求定义 header
      },
      followRedirects: false,  // false: agent 自动跟踪 redirect 响应
    },
    // '/bpm-ppe-lib': {
    //   target: 'https://bpm.kaseihaku.com',
    //   secure: false,
    //   toProxy: true,
    //   /* @trap 巨神坑：这里 false 的话，会以原始请求 URL 发送给 目标服务器，
    //    *    即：http://localhost/bpm-ppe-lib/native/proc_brand1/v1/Node1Brand.vue
    //    *    但是目标端口会从 $.devServer.port(8080) 变成 target 中的 目标端口(80)
    //    *    坑中带坑
    //    * */
    //   changeOrigin: true,
    //   followRedirects: false,
    // },
  },
  cors: true,
  headers: {
    'x-kh-server': 'vite dev server',
  },
  fs: {
    strict: true,
  },
  sourcemapIgnoreList(sourcePath, sourcemapPath) {
    return sourcePath.includes('node_modules');
  }
};

/**
 * @see https://vitejs.dev/config/build-options.html
 */
const buildOptions = {
  target: ['es2021'],
  outDir: 'dist',
  assetsDir: 'assets',
  /**
   * @return true: inline; false: separate; undefined: default logic;
   * @trap 当指定了 lib 属性，该属性配置将失效，所有东西都 inline
   * */
  assetsInlineLimit: (filePath, buffer) => {
    console.error(filePath);
    //
    return undefined;
  },
  /* true: css 代码整合到 js chunk 中，随着 js chunk 的加载而加载 */
  // cssCodeSplit: true, // 当指定 lib 属性时，该值默认为 false
  // sourcemap: process.env.APP_PROFILE && process.env.APP_PROFILE!=='prod', // prod 环境不生成 source-map, 其他环境都生成，方便 debug,
  sourcemap: false,
  // rollupOptions: {},
  // lib: {},
  minify: true,
  emptyOutDir: true,
  copyPublicDir: true,
  reportCompressedSize: true,
  chunkSizeWarningLimit: 500,  // unit: KB
};


const optimizationOptions = {
  include: [
    '@kaseihaku.com/**',
  ],
  force: true
};


/**
 * 生成当前项目 vite 的 基本配置
 *
 * @doc https://vitejs.dev/config/#conditional-config
 */
export async function genBasicViteConfig({command, mode, isSsrBuild, isPreview}){
  /**
   * @doc https://vitejs.dev/config/#using-environment-variables-in-config
   * */
  const env = loadEnv(mode, process.cwd(), '');

  /**
   * Shared Options
   * @doc https://vitejs.dev/config/shared-options.html
   * */
  return {
    root: path.resolve(__dirnameEsModule, getPkgPath()),
    /* 指定 assets 相关的文件，在 browser 地址栏中是如何访问的，例如：
     *  'https://cdn.com/assets/'     # 表示 assets 的访问路径是 https://cdn.com/assets/xxx.jpg
     *  '/assets/'                    # 表示 assets 的访问路径是 /assets/xxx.jpg    域名同当前页面
     *  ''                            # 表示 assets 的访问路径是 相对于当前 .html 页面路径的 (same directory)
     *  './'                          # ditto(同上)
     * */
    base: './',
    mode: mode,
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
      // 源代码中的 process.env.NODE_ENV 替换为 NODE_ENV 环境变量的值
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) || JSON.stringify('production'), // 要和 $.mode 中的配置保持一致
      'process.env.APP_PROFILE': JSON.stringify(process.env.APP_PROFILE) || JSON.stringify('sit'),  // ditto
    },
    plugins: [
      nodePolyfills(),
      pluginVue(),
      /**
       * @trap 使用该方式需要先修改 node_modules/vite-plugin-serve-static/dist/index.js#L50
       *       "Content-Type": type || void 0
       *       修改为
       *       "Content-Type": type || 'application/octet-stream'
       * */
      {
        apply: 'serve',   // server: 表示只在 shell> vite serve 时应用该插件
        ...viteServeStatic([
          {
            pattern: /^\/bpm-ppe-lib\/.*/,
            resolve: ([match]) => {
              const pathname = URL.parse(match, 'file://').pathname;
              return path.resolve(__dirnameEsModule, 'bpm/bpm-ppe-lib/dist', pathname.substring('/bpm-ppe-lib/'.length));
            }
          },
          // {
          //   pattern: /^\/bpm-ppe\/(.*)/,
          //   resolve: (groups) => path.resolve(__dirnameEsModule, 'bpm/bpm-ppe/dist', groups[1]),
          // },
        ]),
      },
    ],
    publicDir: 'public', // 直接将该目录下的文件原样 copy 到 build.outDir 目录下
    cacheDir: 'node_modules/.vite',
    resolve: {
      alias: [
        {
          find: '@',
          // replacement: '/src', // 该文件中以 / 开头的路径，代表的是当前文件(vite.config.js)所在目录，跟 submodule 中的 vite.config.js 没有任何关系
          replacement: path.resolve(__dirnameEsModule, getPkgPath(), 'src'),
        },
        {
          find: /^(.*)\?resource/i,
          replacement: '$1?url',
        },
      ],
      dedupe: [],
      /**
       * 添加额外的 condition，默认的有: import, module, browser, default, and production/development
       * 什么是 condition?
       *    package.json 中 exports['.']['import']  中的 import 就是 condition
       * */
      conditions: [],
      preserveSymlinks: false,  // 解析时，使用 符号链接，而不解析为 实际路径
    },
    css: {
      modules: {},
      preprocessorOptions: {},
    },
    json: {
      namedExports: true,
      stringify: false,
    },
    /* 发布时间: webpack < rollup < parcel < esbuild */
    esbuild: {
      // include: [],  // 如果没有，禁止添加，会导致 esbuild 报错
    },
    /*
     * 该属性用于将符合 picomatch patterns 的文件作为 静态资源 对待
     * @doc { picomatch patterns } https://github.com/micromatch/picomatch#globbing-features
     * @ref { vite assets import } https://vite.dev/guide/assets.html
     *
     * Vite 中 Assets 导入方式:
     *  以 URL 形式导入（包括 CSS 中使用 url() 形式导入），同 webpack file-loader
     *    import url from './path/to/img.png';
     *    import url from '/path/to/worklet.js?url';                    # 如果 import string 在 assetsInclude 中没有包含，可以使用 ?url 来明确的表示导入为 URL
     *    import dataUrl from './shader.glsl?raw';                      # ?raw 表示使用 Data URL 形式导入
     *    import worker from './shader.js?worker';                      # ?worker 表示导入为 Web Worker
     *    import sharedWorker from './shader.js?sharedworker';          # ?worker 表示导入为 Web Worker
     *    import inlineWorker from './shader.js?worker&inline';         # ?worker&inline 表示以 base64 形式导入为 Web Worker
     *
     *  Public Directory
     *    默认为 当前文件所在目录下的 public 目录，可以使用 publicDir 属性修改
     *
     *  基于当前 JS Module 来导入 Asset
     *    const imgUrl = new URL('./img.png', import.meta.url).href;
     *    @trap 第一个参数必须是以 静态路径开头的字符串，不能完全是变量，如果仅仅是变量，那么 vite 会原样保留
     *    @trap SSR 下不能使用
     *
     * */
    assetsInclude: [
      '**/*\?resource'
    ],
    logLevel: 'info',
    clearScreen: true,
    // 指定哪个目录下的 .env 文件会被使用，绝对路径 或 相对于 root 的相对路径
    envDir: '',
    envPrefix: ['VITE_'],   // 指定 string 开头的 env 会在 import.meta.env 存在
    appType: 'custom',


    /** 非 Shared Options  */
    server: {},
    build: buildOptions,
    preview: {},
    optimizeDeps: optimizationOptions,
    /** Web Worker 配置 */
    worker: {
      format: 'es', // 可选值: [iife, es]
    }
  };
}


export async function genLibBasicConfig(configEnv) {

  const basicConfig = await genBasicViteConfig(configEnv);

  basicConfig.build.rollupOptions = {
    /**
     * 要想 node_modules 下的 pkg，在 source 中的 import 保持不变，
     * 需要在 import 没解析的情况下 设置是否是 external，即: isResolved=false 时判断
     * 如果 isResolved=true，那么 import '@pkg'; 就已经变成 import '/xxx/yyy/node_module/pkg'; 了
     * */
    external: (id, parentId, isResolved) => {
      if(!isResolved && !id.startsWith('@/') && !id.startsWith('.') && !id.startsWith('/') ){
        console.log(id);
        return true;
      }

      return false;
    },
    output: {
      assetFileNames: assetInfo => {
        // return 'assets/[name]-[hash].[ext]';
        return 'assets/[name]-[hash][extname]'; // ditto
      },
      manualChunks: (id, {getModuleInfo, getModuleIds}) => {
        if (id.includes('node_modules')) {
          // 将 node_modules 下的依赖打成一个文件
          return 'vendor';
        }
      },
      // preserveModules: true,
      // preserveModulesRoot: 'src',  // 剔除 input 中的指定路径前缀
    },
    // makeAbsoluteExternalsRelative: false, // true: external 包使用 相对路径 import
  };

  basicConfig.build.lib = {
    entry: {
      'index': './src/index.js',
    },
    formats: ['es', 'cjs', 'umd', 'iife'],
    name: 'KH', // 当 format 是 umd/iife 时，当前 lib 挂载到哪个 global variable 上
    fileName: (format, entryName) => {
      if(format === 'es'){
        return `${entryName}.mjs`;
      }
      if(format === 'cjs'){
        return `${entryName}.${format}`;
      }
      return `${entryName}.${format}.js`;
    }
  };



  // basicConfig.build.minify = false;  // 不配置可以看到整个打包结构

  return basicConfig;
}

export async function genMpaBasicConfig(configEnv) {
  const basicConfig = await genBasicViteConfig(configEnv);

  basicConfig.plugins = [
    ...basicConfig.plugins,
    // createHtmlPlugin({}),  // 没有研究先放着
  ];


  basicConfig.build.target = [...basicConfig.build.target, 'chrome120', 'firefox120'];
  basicConfig.build.rollupOptions = {
    input: {
      'index': path.resolve(__dirnameEsModule, getPkgPath(), 'index.html') ,
    },
  };



  basicConfig.server = serverOptions;
  basicConfig.appType = 'mpa';

  return basicConfig;
}


