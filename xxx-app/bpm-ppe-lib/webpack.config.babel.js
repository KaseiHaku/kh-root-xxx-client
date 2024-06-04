import {default as srcWebpackConfig} from './webpack.config.babel-src.js';
import {default as esmLibWebpackConfig} from './webpack.config.babel-esmlib.js';


export default function(env, argv) {
  return [
    srcWebpackConfig,     // 用于给 bpm-ppe module 客户端编译 SFC 使用
    esmLibWebpackConfig,  // 用于给 bpm-ppe module import('bpm-ppe-lib/xxx.js') 使用
  ];
}
