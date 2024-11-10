import {defineConfig, loadEnv, createLogger} from 'vite';
import {genMpaBasicConfig} from '../../vite.config.js';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirnameEsModule = path.dirname(fileURLToPath(import.meta.url));
console.info('__dirnameEsModule=' + __dirnameEsModule);

export default defineConfig(async envConfig => {
  const basicConfig = await genMpaBasicConfig(envConfig);

  /** Common */


  /** Prod */

  /** Dev */
  // basicConfig.build.cssCodeSplit = true;  // 剥离 css 到独立文件中
  // basicConfig.build.rollupOptions.output = {
  //   preserveModules: true,
  //   preserveModulesRoot: 'src',  // 剔除 input 中的指定路径前缀
  // };
  // basicConfig.build.minify = false;

  // console.log('Ultimate Config:', basicConfig);
  return basicConfig;
});

