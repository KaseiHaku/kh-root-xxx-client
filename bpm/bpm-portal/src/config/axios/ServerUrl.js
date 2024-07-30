import {CloudServerUrl} from '@kaseihaku.com/cloud-starter-basic';
export default class ServerUrl extends CloudServerUrl {
  /** default 表示 当前项目 默认的 URL 域名地址，即：不跨域 */
  static default = {
    ...super.default,
    bpmPortal: {
      v1: {
        consul: {
          services: '/consul/v1/agent/services',
        },

      },
      v2: {

      },
    },
  };
}
