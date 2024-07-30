
/**
 * 部署环境： 针对不同环境有不同配置的情况
 * */
export default class BpmPpeProfile  {
  static activated = process.env.APP_PROFILE;


  static dev = {
    baseUrl: 'http://localhost:8080/api',
    signOutPath: '/cloud-user/v1/Authenticate/signOut',
    asLogoutUrl: 'https://as.kaseihaku.com/cust-logout',
  };
  static sit = {
    baseUrl: 'https://bpm.kaseihaku.com/api',
    signOutPath: '/cloud-user/v1/Authenticate/signOut',
    asLogoutUrl: 'https://as.kaseihaku.com/cust-logout',
  };

  static prod = {
    baseUrl: 'http://localhost:8412',
    signOutPath: '/cloud-user/v1/Authenticate/signOut',
    asLogoutUrl: 'https://as.kaseihaku.com/cust-logout',
  };

}
