import path from 'path';
// @doc https://github.com/survivejs/webpack-merge#mergesmart-mergewebpack-mergecustom-mergesmartstrategy
import {merge as webpackMerge, mergeWithCustomize, customizeArray, customizeObject } from 'webpack-merge';
import {default as webpackBaseConfig, getEntryPath} from '../../webpack.config.babel.js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import {fileURLToPath} from 'url';


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

const __dirnameEsModule = path.dirname(fileURLToPath(import.meta.url)); // 由于当前模块采用的是 EMS 的模块系统，所以没有 __dirname 全局变量
console.info('__dirnameEsModule=' + __dirnameEsModule);


export default mergeWithCustomize({
  customizeArray: customizeArray({
    'resolve.modules': 'prepend'
  }),
  customizeObject: customizeObject({
    entry: 'replace'
  })
})(webpackBaseConfig, {
  // webpack 构建当前 module 依赖图谱的入口
  entry: {
    'index': {
      // 入口文件，可以有多个，但最终生成一个 chunk
      import: [
        './src/pages/index/index.js',
      ],
    },
  },
  // 插件，用于扩展 webpack 的功能
  plugins: [
    /* 用于在 bundle.js 文件名包含 hash 值的时候，动态插入正确的 bundle.js 名称到指定的 index.html 中
     * html-webpack-plugin 会把全部 entry 的输出都集中到一个 .html 里，只适合单页应用
     * 所以如果是多页应用，则定义多个 html-webpack-plugin
     * @doc https://github.com/jantimon/html-webpack-plugin#options
     * 或者使用 multipage-webpack-plugin 替代 html-webpack-plugin
     * */
    new HtmlWebpackPlugin({
      chunks: ['index'], // 只在 html 文件中引入指定的 chunk
      template: path.resolve(__dirnameEsModule, './src/pages/index/index.html'), // 配置需要动态添加 <script> 标签的 html 路径
      favicon: path.resolve(__dirnameEsModule, './src/pages/index/favicon.png'), // 配置浏览器 tab 页图标
      /* 配置最后生成的 html 文件名， [name].html == (entryName) => entryName+'.html'
       * @trap 如果是多个 html-webpack-plugin，那么该字段的值必须保证唯一性
       *       如果都配置成 [name].html，那么会报错，
       *       因为 webpack 解析 entry 时，会同时执行多个 html-webpack-plugin
       *       [name].html 会导致多个 html-webpack-plugin 的 filename 都为 entryName.html
       *       即: 多个 html-webpack-plugin 的 filename 的值相同，
       *       所以会导致报错
       * */
      filename: (entryName) => 'index.html',
    }),
  ]
});

