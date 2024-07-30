import {PresetAxios as axios} from '@kaseihaku.com/cloud-starter-basic';
import Constant from '@/constant/BpmAppConstant.js';

axios.defaults.baseURL = Constant.axios.defaultBaseURL;

/**
 * 对 /v1/ppe/ 开头的 URL 添加额外的前缀
 * */
axios.interceptors.request.use(
  config => {
    if (config.url.startsWith('/v1/ppe/')) {

      let bpmAppName = new URLSearchParams(window.location.search).get('bpmAppName');
      if(!bpmAppName){
        // 报错
        throw new Error('current bpm-app-name not exist');
      }

      config.url = `/${bpmAppName}${config.url}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default axios;
