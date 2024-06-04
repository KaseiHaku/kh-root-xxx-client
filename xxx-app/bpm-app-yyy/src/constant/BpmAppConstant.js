/** 该文件用于保存项目中所有的业务常量，
 * 严禁在项目 js 代码中出现任何业务常量，例如: '', false, 1 等
 *
 * 可以直接在代码中使用常量的情况：
 *      组件内部跟 html 或者 style(css) 相关且跟其他组件毫无关系的常量，例如 height="100%"  id="#id" 组件名称 等
 *      loop 中的 初始值、索引值
 *
 * */
import Profile from '@/constant/BpmAppProfile.js';
import {CloudImConst} from '@kaseihaku.com/cloud-starter-basic';

export default class BpmAppConstant extends CloudImConst {
  static axios = {
    ...super.axios,
    defaultBaseURL: Profile[Profile.activated].baseUrl,
  };

  /**
   * Vue 组件名规范：
   *  禁止使用 HTML 自带的标签作为组件名
   *  组件名必须 kh-xxx 开头，且必须是小写
   * */
  static vue = {
    sfc: {
      tabs: {
        test: 'kh-test-tab',
        welcome: 'kh-welcome-tab',


      }
    },
  };


  /** 对资源执行的动作 */
  static action = {
    create: Symbol('create'),
    delete: Symbol('delete'),
    update: Symbol('update'),
    read: Symbol('read'),
  };
  static message = {};

  static dict = {
    action: 'com.kaseihaku.cloud.starter.basic.constant.ActionClsConst',
  };
}
