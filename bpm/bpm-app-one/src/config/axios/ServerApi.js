import {BpmPpeServerApi} from '@kaseihaku.com/bpm-starter-basic';
import ServerUrl from '@/config/axios/ServerUrl.js';
import axios from '@/config/axios/AxiosConfig.js';

export default class ServerApi extends BpmPpeServerApi {
  /** default 表示 当前项目 默认的 URL 域名地址，即：不跨域 */
  static default = {
    ...super.default,

    bpmAppOne: {
      v1: {
        Feature: {
          empty: {
            async post() {
            },
            async delete() {
            },
            async patch() {
            },
            async get() {
            },
            async put(params){
              return await axios.put(ServerUrl.default.bpmAppOne.v1.Feature.empty, params).then(resp => resp.data);
            },
          },
        },

      },
    }
  };

  /** 跨域访问 www.qq.com 下的 API */
  static www_qq_com = {};
}
