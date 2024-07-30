import {BpmPpeServerUrl} from '@kaseihaku.com/bpm-starter-basic';
export default class ServerUrl extends BpmPpeServerUrl {
  /** default 表示 当前项目 默认的 URL 域名地址，即：不跨域 */
  static default = {
    ...super.default,
    bpmAppOne: {
      v1: {
        Feature: {
          empty: '/bpm-app-one/v1/Feature',
        },

      },
      v2: {

      },
    },
  };
}
