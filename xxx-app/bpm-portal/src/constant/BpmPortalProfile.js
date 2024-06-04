import {CloudProfile} from '@kaseihaku.com/cloud-starter-basic';

/**
 * 部署环境： 针对不同环境有不同配置的情况
 * */
export default class BpmPortalProfile extends CloudProfile {
  static activated = 'dev';


  static dev = {
    // baseUrl: 'http://localhost:8080',
    baseUrl: 'https://bpm.kaseihaku.com',
    asLogoutUrl: 'https://as.kaseihaku.com/cust-logout',
  };
  static sit = {
    baseUrl: 'http://localhost:8415',
  };

  static prod = {
    baseUrl: 'http://localhost:8412',
  };

}
