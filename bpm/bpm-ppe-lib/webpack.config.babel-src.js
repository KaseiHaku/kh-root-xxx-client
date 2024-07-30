import path from 'path';
import webpack from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';
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




// @doc https://github.com/survivejs/webpack-merge#mergewithcustomize-customizearray-customizeobject-configuration--configuration
export default {
  context: path.resolve(__dirnameEsModule),
  entry: () => {
    return {};
  },
  mode: process.env.NODE_ENV || 'production',
  target: ['es2021'],
  output: {
    path: path.resolve(__dirnameEsModule, 'dist'), // 产物保存路径
    clean: true, // 打包前先清理输出目录
    filename: function (pathData, assetInfo){ // entry 中 入口文件 对应的 输出文件 的名称
      return '[contenthash:8].[name].bundle.js';
    },
    chunkFilename: (pathData, assetInfo) => {
      return '[contenthash:8].[name].chunk.js';
    },
    // chunkLoading: 'import',
    // chunkFormat: 'module',
    module: true,
    scriptType: 'module',
    library: {
      type: 'module', // 指定当前 library 通过哪种方式暴露，即: 提供何种调用方式
    },
  },
  externals: [
    // 'lodash-es',
    // 'libsodium-wrappers-sumo',
    // 'uuid',
    // 'element-plus',
    // 'vue',
  ],
  module: {

  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) || JSON.stringify('production'), // 要和 $.mode 中的配置保持一致
      'process.env.APP_PROFILE': JSON.stringify(process.env.APP_PROFILE) || JSON.stringify('sit'), // ditto
    }),
    /* 仅仅是文件复制 */
    new CopyWebpackPlugin({
      patterns: [
        {
          context: path.resolve(__dirnameEsModule, 'src'),
          from: '**/*',
          to: path.resolve(__dirnameEsModule, 'dist/src'),
          transform: {
            cache: false,
            transformer: (content, absoluteFilename) => {

              // 将不管 windows 还是 linux 的路径，全转成 linux 格式的
              let src = path.posix.format(path.parse(path.resolve(__dirnameEsModule, 'src')));
              let posixAbsoluteFilename = path.posix.format(path.parse(absoluteFilename));


              let dirname = path.posix.dirname(absoluteFilename);
              if(dirname === src){
                // 如果当前文件所在的目录就是 src 目录，那么直接替换返回
                console.log(`@/ in file ${absoluteFilename} will replace to ./`);
                return content.toString().replaceAll('@/', `./`);
              }


              // 需要计算相对路径后在替换的
              let resultStr = content.toString(); // 最终返回值
              let relative = path.posix.relative(dirname, src); // 当前文件所在目录 和 src 的相对路径

              let regExpExecArray = [...content.toString().matchAll(/['"](@\/.*?)['"]/g)];
              for (const element of regExpExecArray) {
                let matchStr = element[1];
                let relativeImport = matchStr.replace('@/', `${relative}/`);

                let absoluteImport1 = path.posix.join(posixAbsoluteFilename, relativeImport);
                let absoluteImport5 = path.posix.join(dirname, relativeImport);
                let absoluteImport2 = path.posix.normalize(posixAbsoluteFilename + path.posix.sep + relativeImport);
                let absoluteImport3 = path.posix.normalize(dirname + path.posix.sep + relativeImport);
                let absoluteImport4 = path.posix.resolve(dirname, relativeImport);

                let ultimateImport = path.posix.relative(dirname, absoluteImport4);
                if(!ultimateImport.startsWith('.')){
                  ultimateImport = './' + ultimateImport;
                }

                if(matchStr.endsWith(path.posix.sep)){
                  console.log(`${matchStr} in file ${absoluteFilename} will be replace to ${ultimateImport + path.posix.sep}`);
                  resultStr = resultStr.replace(matchStr, ultimateImport + path.posix.sep);
                } else {
                  console.log(`${matchStr} in file ${absoluteFilename} will be replace to ${ultimateImport}`);
                  resultStr = resultStr.replace(matchStr, ultimateImport);
                }

              }

              resultStr = resultStr.replaceAll('process.env.APP_PROFILE', JSON.stringify(process.env.APP_PROFILE) || JSON.stringify('sit'));

              return resultStr;
            },
          },
          info: (fileInfo) => ({ minimized: true }),
        },
      ]
    }),
  ],
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

