import path from 'path';
import webpack from 'webpack';
import {fileURLToPath} from 'url';
import fs from 'fs';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import {WebpackManifestPlugin} from 'webpack-manifest-plugin';



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


function getFilesByType(directory, fileType) {
  const files = fs.readdirSync(directory); // 同步读取目录下的所有文件和文件夹
  const filteredFiles = [];

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath); // 获取文件的状态信息

    if (stats.isFile() && path.extname(file) === `.${fileType}`) {
      filteredFiles.push(filePath);
    } else if (stats.isDirectory()) {
      const subDirectoryFiles = getFilesByType(filePath, fileType); // 递归处理子目录
      filteredFiles.push(...subDirectoryFiles);
    }
  });

  return filteredFiles;
}

function everyJsPerEntry(){
  const directoryPath = path.resolve(__dirnameEsModule, 'src');
  const fileType = 'js'; // 指定的文件类型

  const files = getFilesByType(directoryPath, fileType);

  let entryResult = {

  };
  for (const key of files) {
    let entryItem = {
      import: ['./'+path.relative(__dirnameEsModule, key)],
      // asyncChunks: true,
      filename: '[name]'
    };
    entryResult[path.relative(directoryPath, key)] = entryItem;
  }
  return entryResult;
}



// @doc https://github.com/survivejs/webpack-merge#mergewithcustomize-customizearray-customizeobject-configuration--configuration
export default {
  context: path.resolve(__dirnameEsModule),
  // entry: everyJsPerEntry,
  entry: {
    'index': {
      import: [`./src/share/index.js`],
    },
  },
  mode: process.env.NODE_ENV || 'production', // 开发模式 webpack 根据不同的模式做不同优化 [development, production, none]
  output: {
    path: path.resolve(__dirnameEsModule, 'dist'), // 产物保存路径
    clean: false, // 打包前先清理输出目录
    filename: function (pathData, assetInfo){ // entry 中 入口文件 对应的 输出文件 的名称
      return 'share/[name].js';
    },
    chunkFilename: (pathData, assetInfo) => {
      return '[contenthash:8].[name].chunk.js';
    },

    /* Library 重点配置 */
    chunkFormat: 'module',
    chunkLoading: 'import',
    module: true,
    scriptType: 'module',
    library: {
      type: 'module', // 指定当前 library 通过哪种方式暴露，即: 提供何种调用方式
    },
  },
  module: {

  },
  resolve: {
    alias: {
      '@': path.resolve(__dirnameEsModule, 'src/'),
    },
    modules: [
      path.resolve(process.cwd(), 'node_modules'), // 使用绝对路径，
      'node_modules', // 使用相对路径，这个绝对不能删除，必须作为兜底策略
    ],
    fallback: {
      fs: false, // do not include a polyfill for abc
    }
  },
  optimization: {
    // chunkIds: 'named',   // 设置为 named 可以方便 debug
    // moduleIds: 'named',  // 设置为 named 可以方便 debug
    runtimeChunk: {
      name: 'runtime'
    },
    // minimize: true,
    providedExports: true,
    usedExports: true,
    splitChunks: {
      chunks: 'all',
      usedExports: true,
      cacheGroups: {
        default: false,  // 关闭默认的 cacheGroup
        defaultVendors: false,  // 关闭默认的 cacheGroup
        node_modules: {
          test: (module, {chunkGraph, moduleGraph}) => {
            if (!module.resource) {
              return false;
            }
            return /[\\/]node_modules[\\/]/.test(module.resource)
              || !module.resource.startsWith(path.resolve(__dirnameEsModule, 'src/'));
          },
          priority: 10,
          reuseExistingChunk: false,
          name: (module, chunks, cacheGroupKey) => {
            let resultName = 'node_modules';
            return resultName;
          },
          filename: (pathData, assetInfo) => {
            return '[name]/index.js';
          },
          enforce: true,
        },
      },
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) || JSON.stringify('production'), // 要和 $.mode 中的配置保持一致
      'process.env.APP_PROFILE': JSON.stringify(process.env.APP_PROFILE) || JSON.stringify('sit'), // ditto
    }),
    new NodePolyfillPlugin(),
    new WebpackManifestPlugin({
      fileName: 'manifest.json',
    }),
  ],
  devtool: process.env.APP_PROFILE && process.env.APP_PROFILE!=='prod' ? 'source-map' : false, // prod 环境不生成 source-map, 其他环境都生成，方便 debug
  target: ['es2021'], // 这里不能有 'web'
  externals: [],
  stats: {
    preset: 'errors-warnings',
    errors: true,
    errorsCount: true,
    errorDetails: true,
    errorStack: true,
  },
  experiments: {
    outputModule: true,
  },
};

