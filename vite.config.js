import path from 'path';
import {fileURLToPath} from 'url';

import {defineConfig, loadEnv, createLogger} from 'vite';
import pluginVue from '@vitejs/plugin-vue';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { createHtmlPlugin } from 'vite-plugin-html';
import { viteStaticCopy } from 'vite-plugin-static-copy';

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
    '/logout': 'http://192.168.0.106:8910',
    '^/api': {
      target: 'http://localhost:8999',
      changeOrigin: false,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
    '/bpm-ppe-lib': {
      target: 'https://bpm.kaseihaku.com',
      changeOrigin: false,
    },
  },
  cors: true,
  headers: {
    'x-kh-server': 'vite dev server',
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
  sourcemap: true,
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
    base: '/',
    mode: mode,
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    plugins: [
      nodePolyfills(),
      pluginVue(),
    ],
    publicDir: 'public', // 直接将该目录下的文件原样 copy 到 build.outDir 目录下
    cacheDir: 'node_modules/.vite',
    resolve: {
      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirnameEsModule, getPkgPath(), 'src'),
        },
        {
          find: /(.*)\?resource/i,
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
    /* 将符合 picomatch patterns 的文件作为 静态资源 对待
     * @doc {picomatch patterns} https://github.com/micromatch/picomatch#globbing-features
     * */
    assetsInclude: [
      '**/*?resource'
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


  basicConfig.build.target = [...basicConfig.build.target, 'firefox100', 'chrome100'];
  basicConfig.build.rollupOptions = {
    input: {
      'index': path.resolve(__dirnameEsModule, getPkgPath(), 'index.html') ,
    },
  };



  basicConfig.server = serverOptions;
  basicConfig.appType = 'mpa';

  return basicConfig;
}


