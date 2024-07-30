import path from 'path';
import {fileURLToPath, pathToFileURL} from 'url';
import {v4 as uuidV4} from 'uuid';
import webpack from 'webpack';
// @doc https://github.com/survivejs/webpack-merge#mergesmart-mergewebpack-mergecustom-mergesmartstrategy
import {merge, mergeWithCustomize, customizeArray, customizeObject } from 'webpack-merge';
import {VueLoaderPlugin} from 'vue-loader';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import EslintWebpackPlugin from 'eslint-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import {WebpackManifestPlugin} from 'webpack-manifest-plugin';
import PostCompileWebpackPlugin from 'post-compile-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';



/**
 * webpack 命令不能加 --watch 命令，每次必须手动编译
 * 坑： 路径相关
 *  ./                  表示当前工作目录， 即： shell> node xxx.js 命令执行的目录，不随 ./ 所在文件的位置改变而改变
 *                      如果 /root/bb/cc.js 文件代码中有个相对路径 ./tty
 *                      且执行命令所在的路径为 /home/kasei
 *                      那么 /root/bb/cc.js 中的 ./tty 表示的绝对路径为 /home/kasei/tty 而不是 /root/bb/tty
 *                      如果 ./tty 在 import 语句中，那么 . 不代表当前工作目录，而是代表当前文件所在的目录
 *
 *  __filename          nodejs 的全局变量，值为当前正在执行的 js 文件的绝对路径
 *  __dirname           nodejs 的全局变量，值为当前正在执行的 js 文件所在目录的绝对路径，注意跟 ./ 要区分开
 *
 *
 * Module Variables:
 *  @see https://webpack.js.org/api/module-variables/#importmetawebpack  包含所有可以在代码中使用的变量
 *  @see https://webpack.js.org/configuration/module/#moduleparserjavascriptimportmetacontext   是否开启指定的功能
 *
 *    module.loaded                     nodejs                判断当前 module 是否加载完成
 *    module.hot                        webpack-specific      判断 HMR 功能是否开启
 *    global                            nodejs                相当于 web 中的 window
 *    __dirname                         nodejs
 *    __filename                        nodejs
 *    __webpack_public_path__           webpack-specific      output.publicPath
 *
 *
 *    import.meta.url                   返回当前 module 的绝对路径，例如: file:///path/to/your/module
 *    import.meta.webpack
 *    import.meta.webpackHot            判断 HMR 功能是否开启
 *    # 只在 javascript/esm 和 javascript/auto 类型中的 js 代码中有效，而当前文件是 javascript/node 所以写在当前文件中会报错
 *    # https://webpack.js.org/guides/dependency-management/
 *    import.meta.webpackContext
 *
 *
 * */
const __dirnameEsModule = path.dirname(fileURLToPath(import.meta.url)); // 由于当前模块采用的是 EMS 的模块系统，所以没有 __dirname 全局变量
console.info('__dirnameEsModule=' + __dirnameEsModule);
export function getEntryPath() {
  return path.dirname(process.argv[process.argv.indexOf('--config') + 1]);
}
console.log(`packagePath=${path.resolve(__dirnameEsModule, getEntryPath())}; `);

/**
 * webpack 的作用：根据 entry point 构建依赖图，并根据 依赖图 将多个 module 捆绑成一个或者多个包(捆)
 * Concept:
 *  Entry: 配置入口文件，webpack 根据入口文件来构建 依赖图谱，默认值： ./src/index.js
 *  Output: 配置 包(捆) 输出路径及输出文件名，默认主输出文件路径: ./dist/main.js 默认其他生成文件保存位置: ./dist
 *  Loaders: webpack 默认只识别 .js 和 .json 文件，所以需要通过 loader 来加载其他类型的文件，并将这些文件转换成为 module，以方便添加到 依赖图谱中
 *  Plugins: loaders 只用于转换不同类型的文件为 module，plugin 可以干更多事情
 *  Mode: 指定当前应用环境，方便 webpack 优化
 *  Browser Compatibility: webpack 只支持 IE9+, 老版本浏览器需要加载额外的 polyfill
 *
 * webpack 打包中的概念：
 *  Module: 是指 JavaScript 代码的最小单位，它可以是一个文件或一个代码块，即: 可以通过 import 导入的内容。
 *          在 Webpack 中，模块可以包含各种资源，例如 JavaScript、CSS、图片等。
 *          模块之间可以相互引用和依赖。Webpack 通过加载和解析模块来构建依赖图，并将其转换为可执行的代码。
 *          其中 ES2015 modules (alias Harmony Modules)
 *  Chunk: 是由 Webpack 根据依赖关系动态创建的代码块。
 *         它是一组相关模块的集合，通常是由入口模块和它们的依赖组成。
 *         Webpack 根据配置和代码中的动态导入语句（如import()）来确定块的边界。
 *         每个块都会被打包成一个单独的文件，以便在需要时按需加载。
 *         生成 Chunk 的方法:
 *          - 设置多个 entry 入口点，每个 entry 会被打包到一个 chunk 中
 *          - 动态导入(即: import('xxx') )某些代码，这些代码会被打包到一个 chunk 中
 *          - 通过 optimization.splitChunks.cacheGroups 分割代码，分割的代码会被打包到一个 chunk 中
 *  Bundle: 是由Webpack将所有模块和块打包成的最终输出文件，即：整个 dist 目录。
 *          它是Webpack构建过程的结果，可以是一个或多个文件。
 *          捆包包含了所有需要在浏览器中执行的代码和资源。
 *          通常，一个捆包文件对应一个入口点（如一个 index.html 页面）。
 *  模块（Module）是最小的代码单元，块（Chunk）是相关模块（Module）的集合，而捆包（Bundle）是最终的输出文件
 *
 * webpack module 路径解析规则，即 import * from 'path'; 中的 path 的解析规则
 *  @doc 静态导入文档：https://webpack.js.org/api/module-methods/#import
 *  @doc 动态导入文档：https://webpack.js.org/api/module-methods/#dynamic-expressions-in-import
 *
 *  webpack 路径分为三种： 绝对路径，相对路径，模块路径
 *    import Default from '/home/kasei/Desktop/file'       # 绝对路径
 *    import Default from './file'                         # 相对路径
 *    import Default from '../file'                        # 相对路径
 *    import Default from 'module/lib/file'                # 模块路径，即：不是 ., .., / 三个字符开头的路径都认为是 module path
 *    import Default from '-!path/to/loader!module'        # 表示禁止指定的 path/to/loader 对指定的 module 进行处理
 *
 *    @doc inline loader: https://webpack.js.org/concepts/loaders/#inline
 *    import Default from 'loaderName!path/to/module'      # 使用指定 loader 加载当前 module
 *
 *    @doc module.rules[0].resourceQuery: https://webpack.js.org/configuration/module/#ruleresourcequery
 *    import Default from '../file?raw'                    # 使用 ?raw 来进行 module.rule 规则的匹配
 *  模块路径根据 webpack.config.babel.js 中配置的 resolve 来解析
 *
 *
 *
 * */
export default {
  // context: path.resolve(__dirname, ''), // webpack 解析 入口点 和 加载模块文件 的 base directory
  context: path.resolve(__dirnameEsModule, getEntryPath()), // webpack 解析 入口点 和 加载模块文件 的 base directory
  /* webpack 构建当前 module 依赖图谱的入口，
   * @trap 每个 entrypoint 对应一个 .html 文件
   * entry 值对应的 chunk 命名规则:
   *    如果是 string | [string] , 那么该 entry 的 chunk 名为 main
   *    如果是 object ，那么 key 就是 chunk name，value 是 entry point
   * */
  entry: () => ({
    /* 一个 key
     *    就是一个 entry point,
     *    就是一个 .html 文件,
     *    就是一个 chunk name,
     * */
    'index': {
      // 入口文件，可以有多个，但最终生成一个 chunk。@trap 这里的路径是相对于 context 的
      import: ['./core/core-infra/src/index.esm.js'],
      /* webpack bundle 之后，产品的文件名，
       * 一般通过 output.filename 配置， 在这里配置是分别为每个 entry 配置产出文件名
       * @trap 这里配置的是相对于 output.path 的路径，而不是相对于 context 的
       * */
      filename: './[name].[contenthash:8].bundle.js',

      // dependOn: [], // 表示当前 entry 依赖其他 entry

      /* 什么是 runtime?
       *    即：webpack 的运行时代码（runtime code）。运行时代码包含了 模块解析、模块加载 和 模块执行 的逻辑
       *
       * true: 将 webpack runtime code 提取到一个名为 runtime~${entrypoint.name} 的独立 chunk 文件中
       * */
      runtime: false,

      /* false: 关闭 chunk 异步加载，所有内容都塞到一个 chunk 中，
       * 'jsonp': 通过 jsonp 的方式，异步加载 chunk
       * */
      // chunkLoading: false,
      // asyncChunks: true,  // true: 创建 异步 chunk ，并按需加载

      // layer: 'name of layer',
    },
  }),
  mode: process.env.NODE_ENV || 'production', // 开发模式 webpack 根据不同的模式做不同优化 [development, production, none]
  // webpack bundle 之后，产物相关的配置
  output: {
    path: path.resolve(__dirnameEsModule, getEntryPath(), 'dist'), // 产物保存路径
    /* 指定 assets 相关的文件，在 browser 地址栏中是如何访问的，例如：
     *  'auto'                        # 根据 'import.meta.url', '<script />' 等信息自动计算
     *  'https://cdn.com/assets/'     # 表示 assets 的访问路径是 https://cdn.com/assets/xxx.jpg
     *  '//cdn.com/assets/'           # 表示 assets 的访问路径是 ???://cdn.com/assets/xxx.jpg        ??? 为当前协议
     *  '/assets/'                    # 表示 assets 的访问路径是 /assets/xxx.jpg    域名同当前页面
     *  '../assets/'                  # 表示 assets 的访问路径是 相对于当前 .html 页面路径的 上级目录/assets/
     *  'assets/'                     # 表示 assets 的访问路径是 相对于当前 .html 页面路径的 ./assets/
     *  ''                            # 表示 assets 的访问路径是 相对于当前 .html 页面路径的 (same directory)
     * @doc https://webpack.js.org/configuration/output/#outputpublicpath
     * */
    publicPath: '',
    filename: function (pathData, assetInfo){ // entry 中 入口文件 对应的 输出文件 的名称
      return '[name].[contenthash:8].bundle.js';
    },
    chunkFilename: (pathData, assetInfo) => {
      return '[name].[contenthash:8].chunk.js';
    },
    /* 资产文件打包后，输出的文件名
     * ''     表示直接使用 data URI 模式直接嵌入到 html 里面
     * @doc https://webpack.js.org/configuration/output/#template-strings
     * */
    assetModuleFilename: 'assets/[name]-[hash:8][ext][query]',
    clean: true, // 打包前先清理输出目录

    /* IIFE (Immediately Invoked Function Expression)
     * 让 webpack 将编译后的代码放到
     *  (function(){
     *    ...  // 放这里
     *  })();
     * 中
     * */
    iife: true,

    /* 使用 <script> 标签加载 asynchronous chunks 时，使用指定的 <script> 标签 type 属性的值
     * 例如: <script type="module" ... /> 或者 <script type='text/javascript'>
     *
     * @trap module     需要 $.experiments.outputModule = true
     * */
    // scriptType: 'module',

    /* 将 js 输出为 esm 类型的文件，
     * @trap 设置为 true 会强制设置
     *       $.output.iffe: false,
     *       $.output.scriptType: 'module',
     * @trap experimental feature
     * @trap 需要 $.experiments.outputModule = true
     * */
    // module: true

    /* 产出一个 library，并暴露 entry point 中的 exports */
    // library: {
    //   type: 'module', // 指定当前 library 通过哪种方式暴露，即: 提供何种调用方式
    //   name: 'curLibName', // 指定当前 library 的名称
    //   export: ['default', 'subModule'],// 指定当前 library 使用 module.exports['default']['subModule'] 路径进行 expose(暴露/公开)
    //   auxiliaryComment: {
    //     amd: 'AMD Auxiliary Comment',
    //     commonjs: 'CommonJS Auxiliary Comment',
    //     commonjs2: 'CommonJS2 Auxiliary Comment',
    //     root: 'Root Auxiliary Comment',
    //   }
    // }
  },
  // 用于配置 webpack 如何对待不同类型的 module
  module: {
    generator: {
      'asset/resource': {
        emit: true,
        filename: '[name]-[hash:8][ext][query][fragment]',
        publicPath: 'assets/',
        outputPath: 'assets/',
      },
    },
    parser: {
      javascript: {
        importMeta: true,           // js 代码中 import.meta 是否可用
        importMetaContext: true,    // 是否开启 import.meta.webpackContext
        dynamicImportMode: 'lazy',  // dynamic import 模式，即: import("xxx")
      },
      'javascript/auto': {
        // ditto
      },
      'javascript/dynamic': {
        // ditto
      },
      'javascript/esm': {
        // ditto
      },
    },
    noParse: /^(vue|vue-router)$/,
    /* 用于自定义 webpack 针对不同资源，创建 module 的过程，webpack 默认只识别 .js 和 .json 文件
     * 一个 Rule 分为三个部分:
     *    Condition:
     *    Results:
     *    Nested Rules:
     * @doc https://webpack.js.org/configuration/module/#modulerules
     * */
    defaultRules:[ // 这里的 rule 对所有的 module 都有效
      '...', // '...' 表示引用 webpack 默认的 rules
    ],
    rules: [
      /* 配置如何加载 .vue 文件
       * @doc https://vuejs.org/guide/scaling-up/tooling.html#lower-level-packages
       * @doc https://vue-loader.vuejs.org/guide/#manual-setup
       * */
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            sourceMap: false
          }
        },
      },

      {
        /******************************* Condition: 匹配规则相关配置 ********************************
         * Condition:
         *    resource: 请求文件 经过 $.resolve 解析过后的绝对路径
         *    issuer: 代码 import * from resource; 所在文件的 绝对路径
         *    @trap 当同时存在多个 condition 时，所有的 condition 都必须匹配
         * */
        /**
         * import m from './module';
         * @param {string} resourcePath: module 的绝对路径
         * @param {string} issuerPath: import 语句所在文件的绝对路径
         * */
        test: (resourcePath, issuerPath) => {
          return false
            && /\.m?js/.test(resourcePath)
            && new RegExp(getEntryPath() + '.*', 'i').test(resourcePath)
            ;
        },
        // include: null, // 用于匹配 path 参数的
        // exclude: null,// 用于匹配 path 参数的
        // resource: null,// 用于匹配 path 参数的
        // resourceQuery: null,// 用于匹配 path?query 参数的
        // issuer: null,// 用于匹配 issuerPath 参数的
        // mimetype: 'application/json', // 使用 resource 的 MIME Type 进行匹配

        /******************************* Results.Applied Loaders 相关配置 ********************************
         * Results:
         *    Applied Loaders: 应用于匹配 resource 的 loader 数组
         * */
        // loader: null, // @deprecated {用 use 替代} loaders 相关的配置
        // options: null,// @deprecated {用 use 替代} loaders 相关的配置

        /* 配置使用哪些 loader，一个 element 可以指定一个 loader
         * @trap ary 里面 loader 的执行顺序为 从右到左
         * */
        // use: (info) => [{
        //   // 用于唯一标识一个 loader 实例，loaderIns = loaderName + loaderOptions，
        //   // 一般情况下不用配，webpack 会自动计算出一个 唯一值
        //   ident: uuidV4(),   // @trap 该值是 webpack 的配置项，而不是 xxx-loader 的 options
        //   loader: 'xxx-loader',
        //   options: {
        //     key: 'val',
        //   },
        // }],

        /* 指定当前 module 的类型
         * 这会阻止 $.module.defaultRules 及其默认的 import 行为
         * @scenario 希望通过自定义的 loader 来处理 .json 文件
         *           那么就需要将 type 配置为 javascript/auto，来绕过 webpack 内建的 json import 逻辑
         * @doc {Asset Modules 默认使用的 Loader} https://webpack.js.org/guides/asset-modules/
         *
         * 常见可用值描述:
         *  - asset/resource        file-loader       将 module 生成独立的 file 放到 output 目录中
         *  - asset/inline          url-loader        将 module 编译成 Data URI，格式为: data:[<mediatype>][;base64],<data> 插入到 code 中
         *  - asset/source          raw-loader        将 module 转换成 string 插入到 code 中
         *  - asset                 根据大小自动选择 url-loader or file-loader
         *
         * */
        // type: 'asset/resource',

        /* 指定 loader 的类别，normal, pre, post, 没有值代表 normal
         * 不同类别的 loader 的执行顺序是不同的：
         * Loaders 的执行顺序分为两个阶段:
         *    pitching 阶段顺序: post, inline, normal, pre
         *    normal 阶段顺序: pre, normal, inline, post
         *      @tip 该阶段会进行源码转换/预处理
         * Loaders 的执行不是只执行第一个匹配的 loader，而是每个 loader 都会执行一遍
         * Loaders 的 resolve 规则: 符合标准的 module resolve 规则
         * */
        // enforce: null,

        /******************************* Results.ParserOption 相关配置 ********************************
         * Results:
         *    Parser option: 当前 module parser 的配置项
         * */
        // parser: null,

        /******************************* Nested Rules 相关配置 ********************************
         * 嵌入式规则：执行顺序为: 父规则, rules, oneOf
         * */
        // rules: null,
        // oneOf: null,

        /******************************* Other ********************************/
        // generator: {
        //   dataUrl: {
        //     encoding: 'base64',
        //     mimetype: 'mimetype/png',
        //   },
        //   emit: false, // false: 不通过 Asset Module 的 asset writing 写出，适用于 SSR(Server Side Rendering) 场景
        //   // override $.output.assetModuleFilename 的配置，
        //   // @trap 只对 $.module.rules[].type = [asset, asset/resource] 类型的 module 有效
        //   filename: (pathData, assetInfo) => '[file]',
        //   // 指定当前 module 在 Browser URL 地址的 path 路径
        //   publicPath: 'assets/png',
        //   /* 将 asset 发送到相对于 $.output.path 的目录中
        //    * @trap 只有当 publicPath 已经被指定为匹配 deploy 处的文件夹结构时，
        //    *       才用需要配置该值，默认和 publicPath 相同
        //    * */
        //   outputPath: 'cdn-assets/',
        // },


        /*
         * 什么是 sideEffect(副作用)?
         *  指 import 当前 module，会导致 global 环境的改变
         *  即：当前 module 在被 import 时，不仅仅是 export，还执行其他特殊的行为。
         *     而这些行为会改变 global 环境，从而对其他代码的执行产生影响，因此叫做 副作用。
         *     polyfill 是典型的具有 sideEffect 的 module:
         *        因为 polyfill 肯定会在 window 对象上定义或修改 变量/函数
         *
         * true:    表示当前 module 有副作用
         * false:   表示没有 副作用，很 pure，tree shaking 时，可以直接 terse
         * */
        // sideEffects: true,

        /* 在当前 rule 中，覆盖 $.resolve 中的配置 */
        resolve: {
          fullySpecified: false,
        }
      },
      // 配置如何加载 js 文件，但是不包含 .min.js
      {
        test: (resourcePath, issuerPath) => {
          // return !resourcePath.includes('.min.') && /.(c|m)?js$/.test(resourcePath);
          return /.(c|m)?js$/.test(resourcePath);
        },
        exclude: file => (
          // /node_modules/.test(file)                // 排除掉 node_modules 模块下的代码，防止被 babel 重复编译
          /node_modules\/(?!@kaseihaku)/.test(file)   // 排除掉 node_modules 模块下的代码，但是保留 @kaseihaku 开头的包中的 js
          && !/\.vue\.[cm]?js/.test(file)             // 保留 .vue.js 文件，交给 loader 处理
        ),
        use: [
          {
            loader: 'babel-loader',
            options: {
              rootMode: 'upward',  // 表示在向上查找 babel 根配置文件
            }
          },
        ],
      },
      // 配置如何加载 css 文件
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [
          /* 以下三个 loader 三选一:
           *    'style-loader'                  # 将 CSS 字符串作为 <style> 插入到 html 中
           *    'vue-style-loader'              # 处理 .vue 文件中的 <style lang="scss">，并包含 'style-loader' 的功能
           *    MiniCssExtractPlugin.loader     # 将 css 提取到单独的 .css 文件中
           * */
          // !process.env.NODE_ENV || process.env.NODE_ENV==='production' ? MiniCssExtractPlugin.loader : 'style-loader',
          !process.env.NODE_ENV || process.env.NODE_ENV==='production' ? MiniCssExtractPlugin.loader : 'vue-style-loader',

          // 将 CSS 转化成 CommonJS 模块
          {
            loader: 'css-loader',
            options: {
              import: true,  // 允许 @import 语法
            },
          },
          'resolve-url-loader', // https://www.npmjs.com/package/resolve-url-loader
          // 将 Sass Scss 编译成 CSS
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,  // <-- !!IMPORTANT!!
            }
          }
        ],
      },
      // 配置如何加载 图片 文件
      {
        test: /\.(png|jpe?g|gif|svg)(\?\S*)?$/,
        /* @doc https://webpack.js.org/guides/asset-modules/
         * asset/resource       相当于之前的 file-loader
         * asset/inline         相当于之前的 url-loader
         * asset/source         相当于之前的 raw-loader
         * asset                相当于之前的 url-loader，根据大小自动适配是否 剥离成单独的文件
         */
        type: 'asset/resource',
        generator: {
          filename: '[name]-[hash:8][ext][query][fragment]', // 指定打包后的文件名
          /* 见 output.publicPath 上的解释 */
          publicPath: 'assets/',
          /* 指定构建后的 assets 放在哪个相对路径下，相对于 output.path;
           * 只有当 'publicPath' 被用来匹配文件夹结构时才会需要设置该配置。
           * */
          outputPath: 'assets/',
        },
      },
      // 配置如何加载 字体 文件
      {
        test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
        type: 'asset/resource',
      },
      // 使用 resource 中的 query 部分进行匹配
      {
        resourceQuery: /resource|url/,  // 匹配 import './xxx/yyy?resource';
        type: 'asset/resource',
      },

      // 支持 html 标签中的路径，使用 webpack 编译
      // {
      //   test: /\.html$/i,
      //   loader: 'html-loader',
      //   enforce: 'post',
      // },


    ]
  },
  // 配置 webpack 如何解析 import * from 'path'; 语句中的 path, 即: 从哪个文件路径加载 module
  resolve: {

    /* 给 import xxx from 'path' 中的 path 取别名
     * 修改别名后，需要在 idea
     *  File -> Settings -> Languages & Frameworks -> JavaScript -> Webpack
     * 中配置 webpack.config.babel.js 的路径，否则别名会提示找不到路径
     * */
    alias: {
      /* 将 ./src 目录取别名为 @ 模块，
       * 这样在 import src 目录下的文件时，可以使用模块路径，即：import Default from '@/...'
       * 这样可以避免相对路径, 避免出现类似 ../../../file 形式的路径
       * 坑： @$ 中 $ 表示精准匹配，具体参考 webpack 文档
       * */
      '@': path.resolve(__dirnameEsModule, getEntryPath(), 'src/'),
      // 默认 vue 包含 compiler-sfc，即：运行时编译 的包
      // vue: '@vue/runtime-dom', // 该配置可以让项目排除掉 运行时编译 的包

    },

    /* 指定 webpack 读取第三方 module 的 package.json 时，从哪些字段获取入口文件
     * 默认值: ['browser', 'module', 'main']
     */
    aliasFields: ['browser'],
    // cacheWithContext: false,
    // descriptionFiles: ['package.json'],

    /* 巨神坑：官方文档写错了
     *  @doc {错误的官方文档} https://webpack.js.org/configuration/resolve/#resolveenforceextension
     *  @doc {错误 issue} https://github.com/webpack/webpack/issues/10511
     *
     *  true: 表示强制将 extensions 中的扩展名添加到 import 路径中，
     * 如果:
     *      extensions: ['.js', '.json'],
     *      enforceExtension: true,
     *      import aa from './aa.js';
     * 那么最终结果为:
     *      import aa from './aa.js.js';
     *      import aa from './aa.js.json';
     * */
    enforceExtension: false,
    extensions: ['.js', '.json'], // 导入时，如果没有扩展名，则自动加上扩展名后搜索, ... 引入默认配置
    // 正常解析失败时, 重定向模块请求
    fallback: {
      /* 因为 webpack 5 不再自动填充 Node.js 的 core modules，
       * 所以这里需要手动填充，以防止在浏览器中调用 Node.js core modules 时报错
       * */
      fs: false, // false: node 的 fs module 无法 polyfill，直接不处理
    },

    /* import * as D3 from 'd3' 时，指定导入 d3 的哪个环境版本，
     * 浏览器环境版本，NodeJS 环境版本，...
     * */
    // mainFields: ['browser', 'module', 'main'],
    mainFiles: ['index'], // 如果 import * from '@' 中 @ 是目录，那么会导入 @/index.js
    // exportsFields: ['exports', 'myCompanyExports'],

    /* webpack 解析 module 时，从哪个目录开始寻找
     * 如果是相对路径，会一直递归寻找父目录中的 ../node_modules, ../../node_modules
     * 如果是绝对路径，只会在指定的目录中寻找，
     * 查找顺序，哪个在前哪个先
     * */
    modules: [
      path.resolve(__dirnameEsModule, 'node_modules'), // 使用绝对路径，
      'node_modules', // 使用相对路径，这个绝对不能删除，必须作为兜底策略
    ],

    // unsafeCache: true,
    // plugins: [new DirectoryNamedWebpackPlugin()],
    // preferRelative: false, // 当启用此选项时，webpack 更倾向于将模块请求解析为相对请求，而不使用来自 node_modules 目录下的模块。
    // preferAbsolute: true,
    symlinks: false, // true 软链接解析为实际的地址
    // cachePredicate: (module) => {/* additional logic*/return true;},
    // restrictions: [/\.(sass|scss|css)$/],
    // roots: [__dirname, fixtures],
    // importsFields: ['browser', 'module', 'main'],
    // fallback: {xyz: path.resolve(__dirname, 'path/to/file.js'),}

    /* true:    当文件名为 xxx.mjs 或者 package.json 中 "type":"module" 时，即当前 模块系统 为 es module 时
     *          import aa from 'path.js';   中扩展名不能省略，否则报错
     *          即：
     *            - $.resolve.extensions 中的后缀不会自动添加
     *            - $.resolve.mainFiles  中的文件不会自动搜索
     *
     * false:   表示即使 模块系统 为 es module，也可以省略扩展名来 import module
     * */
    fullySpecified: false,  // 必须为 false

    /* 特定的模块使用特殊的解析配置 */
    // byDependency: {
    //     // ...
    //     esm: {
    //         mainFields: ['browser', 'module'],
    //     },
    //     commonjs: {
    //         aliasFields: ['browser'],
    //     },
    //     url: {
    //         preferRelative: true,
    //     },
    // },

  },
  optimization: {
    // chunkIds: 'named',   // 设置为 named 可以方便 debug
    // moduleIds: 'named',  // 设置为 named 可以方便 debug
    // minimize: true,      // 使用 TerserPlugin 进行压缩和修剪
    providedExports: true,  // 告诉 webpack 分析并记录 module 提供哪些 export，以生成更高效的代码
    usedExports: true,      // true: 告诉 webpack 分析和记录每个 module 被使用到的 export; 'global': 不对 used export 进行分析和记录
    /* 关于 webpack runtime code chunk 的优化项 */
    runtimeChunk: {
      // name: 'runtime-chunk',  // 等价于 runtimeChunk: 'single'
      name: (entrypoint) => `${entrypoint.name}~runtime`, // 等价于 runtimeChunk: 'multiple' 或 runtimeChunk: true
    },

    /* webpack 4+ 为 dynamic import(动态导入) common chunk(公共块) 而提供的一种新的策略
     * @doc {默认配置} https://webpack.js.org/plugins/split-chunks-plugin/#optimizationsplitchunks
     *
     * 如何将 分块(chunk)后的文件 通过 <link> 和 <script> 引入到 index.html 中？
     *  在 MPA(Multiple Page Application) 中可以通过 ChunksWebpackPlugin 将分块后的 .js, .css 等文件注入到 index.html 中
     *  @doc https://webpack.js.org/plugins/chunks-webpack-plugin/
     *  在 SPA(Single Page Application) 中可以通过 HtmlWebpackPlugin 将分块后的 .js, .css 等文件注入到 index.html 中
     *  @doc https://webpack.js.org/plugins/html-webpack-plugin/
     *
     * */
    splitChunks: {
      /* chunk 选择器，选择哪些 chunk 需要被 split(拆分)
       * 可用值：
       *  - 'all'                           所有类型的 module 都会被拆分为一个个 chunk
       *  - 'async'                         动态引入的 module 会被拆分出去
       *  - 'initial'                       从 entrypoint 中 直接引入的 module，以及 级联引入的 module 进行拆分
       *                                    但是无法 拆分动态引入 module 中 import 的其他 module
       *  - RegExp
       *  - function(chunk) => boolean      true: 表示需要被 split
       * */
      // chunks: function (chunk){
      //   return true;
      // },
      chunks: 'async',

      usedExports: true, // 分析 code 中实际使用三方包中的哪些代码，忽略没用到的代码，并生成更高效的 code
      /* 指定拆分的规则和策略 */
      cacheGroups: {
        // default: false,  // 关闭默认的 cacheGroup
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
        /* 可以从 splitChunks.* 中继承除了 test, priority, reuseExistingChunk 以外的属性
         * */
        defaultVendors: {
          /* 用于判断哪个 module 和当前 cacheGroup 匹配
           * omit: 匹配所有 module
           * 可以匹配 module 的绝对资源路径 或者 chunk name
           * 如果和 chunk name 匹配，那么该 chunk 下的所有 module 都会被选中
           * */
          // type: 'json', // 和 test 互斥，所有 json 类型的 module 都符合当前 cacheGroup
          // layer: '',  // 根据 module layer 分配 module 到当前从 cacheGroup
          test: /[\\/]node_modules[\\/]/,
          // test: (module, {chunkGraph, moduleGraph}) => {
          //   return module.resource && module.resource.endsWith('.vue');
          // },

          /* 一个 module 可能符合多个 cacheGroup，优化器会选择 priority 最大的 group 配置
           * @tips "default" cacheGroup.priority==0
           * */
          priority: -10,
          /* true: 如果当前 chunk 包含已经 split out(拆分) 出去的 module, 那么当前 chunk 会复用该 module,
           *       否则会重新生成一个新的
           * */
          reuseExistingChunk: true,

          /* 指定分割出来的 chunk 的名称
           * @tip 当 function 返回值保持不变时，会将所有 common module 和 vendors(三方包) 都合并到一个 chunk 文件中
           * @tip 当 function 返回值和 entry.xxx 相同时，那么 entry.xxx 会被移除
           * @tip 可以使用 'js/[name]/chunk.js' 来创建目录结构
           * */
          name: false, // false: 保持 chunk 的名称相同
          // name: (module, chunks, cacheGroupKey) => {
          //   let relativePathName = path.relative(path.join(__dirnameEsModule, 'src'), module.resource);
          //   return relativePathName;
          // },
          /* 当且仅当 chunk 是 initial chunk 时，可以用于 override chunk 的 filename
           * @tip 允许使用 output.filename 中的 placeholder
           * @tip 可以使用 'js/[name]/chunk.js' 来创建目录结构
           * */
          filename: (pathData, assetInfo) => {
            return 'vendor/[name]';
          },
          idHint: 'vendors', // 会添加到 filename 当中去，用于标识

          /* 告诉 webpack 忽略以下配置:
           *    splitChunks.minSize, splitChunks.minChunks,
           *    splitChunks.maxAsyncRequests, splitChunks.maxInitialRequests
           * 只要匹配当前 cacheGroup 的，就创建一个 chunk file
           * */
          enforce: true,
        },
      }
    },
  },
  // 插件，用于扩展 webpack 的功能
  plugins: [
    /**
     * @trap 该插件直接做文本替换，所以如果值是字符串，那么需要 值 需要配置成 'val' 而不能单单是 val
     *       所以常规做法是使用 JSON.stringify(val); 这样可以不用额外考虑值的类型
     * */
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: true, // true 开启 Vue Optional API
      __VUE_PROD_DEVTOOLS__: process.env.APP_PROFILE && process.env.APP_PROFILE!=='prod', // true 表示在 production 中开启 devtools 支持
      // true: 启用 prod 中 hydration(SSR 和 CSR 混合) 不匹配的详细警告，
      // @trap 必须为 false，否则会导致 CSR 父组件在子组件上使用 kebab-case 定义的 props，无法传递给使用 defineAsyncComponent() 定义的子组件
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
      // 源代码中的 process.env.NODE_ENV 替换为 NODE_ENV 环境变量的值
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) || JSON.stringify('production'), // 代表是否需要在本地开发，即: webpack serve
      'process.env.APP_PROFILE': JSON.stringify(process.env.APP_PROFILE) || JSON.stringify('prod'), // 代表当前打的包的 deploy 环境
    }),
    /* 用于在 bundle.js 文件名包含 hash 值的时候，动态插入正确的 bundle.js 名称到指定的 index.html 中
     * html-webpack-plugin 会把全部 entry 的输出都集中到一个 .html 里，只适合单页应用
     * 所以如果是多页应用，则定义多个 html-webpack-plugin
     * @doc https://github.com/jantimon/html-webpack-plugin#options
     * 或者使用 multipage-webpack-plugin 替代 html-webpack-plugin
     * */
    // new HtmlWebpackPlugin({}),
    new MiniCssExtractPlugin(),
    new WebpackManifestPlugin({
      fileName: 'manifest.json',
    }),
    /* 用于扩展 webpack 使其能够编译 .vue 文件 */
    new VueLoaderPlugin(),
    /* 模块热替换插件 */
    new webpack.HotModuleReplacementPlugin({
      // Options...
    }),
    /* 用于添加 Node.js core module polyfill */
    new NodePolyfillPlugin(),
    /* 使 webpack 装配 .js, .vue 文件时自动检查 eslint 规则
     * @doc https://webpack.js.org/plugins/eslint-webpack-plugin/#getting-started
     * */
    new EslintWebpackPlugin({
      context: path.resolve(__dirnameEsModule, getEntryPath()), // 用于表明 项目文件 所在的 root 路径
      // eslintPath: '', // 用于指定 eslint 自身所在的位置，一般不用，都是通过 package.json 引入
      extensions: ['js', 'vue'], // 需要执行 eslint 检查的文件后缀名
      exclude: ['node_modules'], // 不需要检查的 文件集 和 目录，必须想对于 context
      // files: [], // 只对 指定的文件，目录(必须是 context 的相对路径) 做 eslint 检查，不开启
      fix: false, // 是否自动修复错误，必须关闭，这东西会自动改 源代码
      formatter: 'stylish',
      lintDirtyModulesOnly: true, // true: 只检查已经改变文件，在刚启动的时候不检查
      threads: true, // true: 开启线程池执行检查; Number: 指定线程池线程的数量
      emitError: true, // true: 总是输出 error
      emitWarning: true, // true: 总是输出 warning
      failOnError: true, // true: 有任何 error 直接构建失败
      quiet: false, // true: 只报告 error 忽略 warning
      outputReport: { filePath: 'eslintReport.xml'}, // false: 不将错误输出到文件中，默认在 dist 目录下
      cache: false,  // 默认=true，必须得关闭，否则会导致使用的文件是 缓存 中的文件
    }),
    new PostCompileWebpackPlugin(()=>{

    }),
  ],
  /* devtool: 用于配置 source-map 文件生成规则
   *  eval：用 eval 语句包裹需要安装的模块；
   *  eval-source-map：用 eval 语句包裹需要安装的模块；.js.map 质量高
   *  source-map：生成独立的 Source Map 文件；.js.map 质量高
   *  hidden：不在 JavaScript 文件中指出 Source Map 文件所在，这样浏览器就不会自动加载 Source Map；
   *  inline：把生成的 Source Map 转换成 base64 格式内嵌在 JavaScript 文件中；
   *  cheap：生成的 Source Map 中不会包含列信息，这样计算量更小，输出的 Source Map 文件更小；同时 Loader 输出的 Source Map 不会被采用；
   *  module：来自 Loader 的 Source Map 被简单处理成每行一个模块；
   *  nosources: 表示 sourcemap 中不包含 源码，看源码需要额外配置
   * quality:
   *  bundled code                  webpack 打包好的 code，没有模块信息，所有代码在一个很大的文件中
   *  generated code                webpack 根据各个 module 生成的代码，可以看到 module 信息
   *  transformed code              webpack Loaders 转义过的代码，例如 babel
   *  original source               源码
   *  without source content        表示 源码 不在 source map 中，需要独立指定 源码 的 URL
   *  (lines only)                  表示 sourcemap 只包含行信息，不包含列信息
   *
   * 推荐配置: source-map + original;
   *  不要 eval，代码都在字符串里面，不好格式化
   *  推荐 source-map 将 sourcemap 独立为一个文件，即:不要 inline
   *  quality 最好 original，可以方便看到源码
   *
   * */
  devtool: process.env.APP_PROFILE && process.env.APP_PROFILE!=='prod' ? 'source-map' : false, // prod 环境不生成 source-map, 其他环境都生成，方便 debug
  /* 表示当前 module 的 js 代码的运行环境 是什么？例如: node, web 等，默认 web
   * 如果多个则取 交集，
   * false: 表示没有预定义的运行环境
   * @doc https://webpack.js.org/configuration/target/
   * */
  target: ['web', 'es2021'],
  /* 将指定的依赖从当前 output bundles 中排除，打包时，不打入到当前 bundle 中
   *
   * @scenario 适用于 library developers(库开发人员)，可以将依赖项排除掉
   * @scenario 适用于不能静态 import 的 module，
   *           需要在项目运行时，通过 import(`${var}`) 进行导入的 module
   *           这种方式导入需要在 index.html 中导入所有动态导入的 module，
   *           或者将所有动态导入的 module 放到项目的 lib 下，然后可以根据相对路径进行动态导入
   * @tips 如果作为 js lib 库，那么这里的配置应该跟 package.json 中的 dependencies:{} 配置完全一样
   *
   * @doc https://webpack.js.org/configuration/externals/
   * */
  externals: [
    // 'jquery', // 下个格式的缩写，全局变量名和 key 相同
    // {
    //   /* 将 import $ from 'jquery'; 中的 jquery(同 key 名) module 从 bundle 中排除，
    //    * 并使用全局变量 window.jQuery 来替代代码中的 $
    //    * 格式: 'moduleName': '${externalsType} ${libraryName}'
    //    * @trap 单个字符串的都是这种格式的 abbr
    //    * */
    //   'jquery': 'jQuery',
    // },

    // ['jquery', 'funcInJq'],  // 下个格式的缩写，全局变量名和 第二个元素 相同
    // {
    //   /* 将 import {funcInJq} from 'jquery'; 转换为 window['./math']['subtract']
    //    * 提取 jquery module 中名为 funcInJq 的函数，使用全局变量 funcInJq2 替代
    //    * */
    //   'funcInJq': ['jquery', 'funcInJq2'],
    //   'funcInJq': {     // ditto
    //     root: ['jquery', 'funcInJq2'],
    //   }
    // },


    // function ({ context, request, contextInfo, getResolve }, callback){
    //   let err = null;
    //   let result = null; // 同 externals 的配置
    //   let type = null;   // 同 externalsType 的配置
    //   callback(err, result, type);
    // },
    // function ({ context, request, contextInfo, getResolve }) {
    //   return Promise.resolve();
    // },

    // /^(jquery|\$)$/i, // 匹配的 module 都将被作为 external
  ],
  /* 配置代码中的 import jq from 'jquery'; 编译后是通过什么样的方式导入的：
   *  module:
   *    import * as __WEBPACK_EXTERNAL_MODULE_jquery__ from 'jquery';
   *    const jq = __WEBPACK_EXTERNAL_MODULE_jquery__['default'];
   *  script:
   *    <script type="module" src="./xxx.js">
   *  window:
   *    const jq = window['$'];
   * @doc https://webpack.js.org/configuration/externals/#externalstype
   * */
  // externalsType: 'module',
  externalsPresets: {
    web: true, // external 依赖，使用 import * from 'xxx'; 导入
    webAsync: true, // external 依赖，使用 async import() 导入
  },
  // watch: true, // 在初始构建之后，webpack 将继续监听任何已解析文件的更改，webpack-dev-server 启用时，默认开启
  // 规定 webpack 怎么解析 loader 包，选项和 resolve 一样
  // resolveLoader:{},
  // 开发服务器
  devServer: {
    /* 允许访问 devServer 的域名列表 */
    allowedHosts: ['host.com', 'subdomain.host.com',],
    // bonjour: true, // 在 devServer 启动时，广播自己的地址
    client: {
      logging: 'info', // 'info' | 'silent' | 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'none' | 'warning'
      overlay: true, // 编译报错时，在 Browser 中  full-screen overlay 全屏覆盖显示报错信息
      progress: true,
      reconnect: 5,  // dev-server 重连 client 的次数
    },

    compress: false, // 压缩 devServer 中的内容

    devMiddleware: {
      index: true,    // false: 表示对 root(/) 路径也进行 proxy 处理
      mimeTypes: { phtml: 'text/html' },
      // publicPath: '/publicPathForDevServe',
      publicPath: '/',
      serverSideRender: true,
      writeToDisk: true,
    },

    // 添加指定的 Http Response Header 到 response 中
    headers: {
      'x-kh-server': 'webpack dev server',
    },
    historyApiFallback: false,
    host: '0.0.0.0', // 表示 devServer 需要在外部网络访问
    liveReload: true, // 实时重新加载，true 时， hot 必须关闭 或者 devServer.watchFiles 必须开启
    // devServer 启动完成后执行函数
    onListening: function (devServer) {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      const port = devServer.server.address().port;
      console.log('Listening on port:', port);
    },

    // devServer 启动完成后自动打开 Browser
    open: {
      // devServer 启动完成时，自动打开的页面，
      target: [
        'http://localhost:8080/index.html',
        // 'second.html', // 不要 / 开头，会自动加上，否则会变成 localhost//path
      ],
      app: {
        name: 'google-chrome-stable',
        arguments: [
          // '--incognito',    // 该模式会导致 localstorage 无法设置和访问，导致网页无法正常登录，所以注释掉
          '--new-window',
          // 设置成 idea debug 用的 chrome user data，用以创建 独立的 chrome 实例，防止干扰系统默认的 chrome 配置
          '--user-data-dir=/home/kasei/.config/JetBrains/IntelliJIdea2024.1/chrome-user-data',
        ],
      },
    },
    port: 8080, // devServer 监听的端口

    /* 配置不同的路径 代理 转发到不同的地址
     * @doc https://webpack.js.org/configuration/dev-server/#devserverproxy         webpack 中的文档
     * */
    proxy: [
      { context: ['/login', '/oauth2-login', '/logout'], target: 'http://sit-cloud-oidc-rp.kaseihaku.com', changeOrigin: true},
      { context: ['/oauth2'], target: 'http://sit-cloud-oidc-rp.kaseihaku.com', secure: false, toProxy: true, changeOrigin: true },
      { context: ['/consul'], target: 'http://sit-cloud-consul.kaseihaku.com', pathRewrite: { '^/consul': '' }, secure: false, changeOrigin: true},
      {
        context: ['/api'],
        /* webpack devServer options
         * 不同的 return 值代表的含义:
         *  null or undefined = 继续 proxy request
         *  false             = return 404
         *  '/index.html'     = 替换原有 proxy request
         * */
        // router: async function(req) {
        //   return url;
        // },

        /* http-proxy-middleware options
         * @doc https://github.com/chimurai/http-proxy-middleware#http-proxy-options
         * */
        pathRewrite: { '^/api': '' },

        /* http-proxy options
         * @doc https://github.com/http-party/node-http-proxy#options
         * */
        target: 'http://sit-cloud-gateway.kaseihaku.com:80',
        // forward: '',  // 和 target 互斥
        // agent: {}, // agent 配置
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
        changeOrigin: true,     // true: 修改 Origin http header 用于防止跨域问题
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
      {
        context: ['/bpm-ppe', '/bpm-ppe-lib', '/bpm-portal', '/bpm-app-one'],
        target: 'https://localhost',
        secure: false,
        toProxy: true,
        /* @trap 巨神坑：这里 false 的话，会以原始请求 URL 发送给 目标服务器，
         *    即：http://localhost/bpm-ppe-lib/native/proc_brand1/v1/Node1Brand.vue
         *    但是目标端口会从 $.devServer.port(8080) 变成 target 中的 目标端口(80)
         *    坑中带坑
         * */
        changeOrigin: true,
        followRedirects: false,
      },
    ],

    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      return middlewares;
    },
    static: [
      {
        directory: path.resolve(__dirnameEsModule, getEntryPath(), './dist'),
        // @doc {可用配置} https://expressjs.com/en/4x/api.html#express.static
        staticOptions: {  // 在 devServer.contentBase 值为 string 的时候该配置才有效
          redirect: false,
        },
        publicPath: '/',
        serveIndex: { icons: true }, // 在访问没有 index.html 文件的目录时，返回目录清单
        watch: true,  // 监控变化
      },
    ],


    watchFiles: {
      // globbing(通配符/文件名扩展): https://github.com/micromatch/picomatch#basic-globbing
      paths: ['src/**/*', 'public/**/*'],
      // 更多参数 https://github.com/paulmillr/chokidar
      options: {
        // 匹配文档 https://github.com/micromatch/anymatch
        ignored: ['**/node_modules'],  // glob pattern 方式配置 不监听指定的文件
        /* 使用轮询的方式监听文件变动，
         * @trap 在 NFS( Network File System ) 文件系统中不能为 false
         * false  关闭轮询
         * 1000   每 1000 毫秒轮询一次
         * */
        usePolling: false,
        useFsEvents: true,
        // cwd:   // 默认 paths 中的路径基于当前文件
      },
    },

  },
  cache: !process.env.NODE_ENV || process.env.NODE_ENV==='production' ? false : {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirnameEsModule, getEntryPath(), './dist/wp-cache'),
  },
  // @doc https://webpack.js.org/configuration/stats/#statslogging
  stats: {
    // https://webpack.js.org/configuration/stats/#stats-presets
    preset: 'errors-warnings', // errors-warnings, normal, verbose,
    // logging: 'log',
    // source: true, // 添加 module 的源码
    errors: true,
    errorsCount: true,
    errorDetails: true,
    errorStack: true,
    // warnings: true,
    // warningsCount: true,
    // children: true,
  },
  /* 试验特性开关 */
  experiments: {
    /* 只有在被用到时才对  entrypoint 和 import() 进行 compile，可以提升 $.devServer 的启动时间
     * @trap 只对 compile 期有效，runtime 无效
     * */
    lazyCompilation: false,
    outputModule: false,  // true: 使用 ESM 格式的 output 文件
    topLevelAwait: false, // JS 顶层是否可以使用 await 关键字
  },

  /* @doc https://webpack.js.org/configuration/other-options/ */



};
