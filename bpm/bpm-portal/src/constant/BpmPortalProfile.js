import {CloudProfile} from '@kaseihaku.com/cloud-starter-basic';

/**
 * 部署环境： 针对不同环境有不同配置的情况
 * */
export default class BpmPortalProfile extends CloudProfile {
  static activated = process.env.APP_PROFILE;


  static dev = {
    ...super.prod,
    baseUrl: 'http://localhost:8080',
  };
  static sit = {
    ...super.prod,
    baseUrl: 'https://bpm.kaseihaku.com',
  };

  static prod = {
    ...super.prod,
    baseUrl: 'https://bpm.kaseihaku.com',
  };

}
