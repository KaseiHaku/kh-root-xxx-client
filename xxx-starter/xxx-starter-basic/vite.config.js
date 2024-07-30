import {defineConfig, loadEnv, createLogger} from 'vite';
import {genLibBasicConfig} from  '../../vite.config.js';



export default defineConfig(async envConfig => {
  const basicConfig = await genLibBasicConfig(envConfig);

  /** Prod */
  basicConfig.build.lib.formats = ['es', 'cjs'];
  basicConfig.build.rollupOptions.output.assetFileNames = assetInfo => 'assets/[name][extname]';

  /** Dev */
  // basicConfig.build.cssCodeSplit = true;  // 剥离 css 到独立文件中
  // basicConfig.build.rollupOptions.output = {
  //   preserveModules: true,
  //   preserveModulesRoot: 'src',  // 剔除 input 中的指定路径前缀
  // };
  // basicConfig.build.minify = false;

  debugger;
  console.log('Ultimate Config:', basicConfig);
  return basicConfig;
});

