import { createI18n } from 'vue-i18n';


/**
 * 特殊字符：{, }, @, $, |;  需要 {'@'} 才能使用
 *
 * */
const i18n = createI18n({
  locale: navigator.language.substring(0, 2),   // 配置当前 locale 信息
  fallbackLocale: 'en',  // 配置找不到兜底 locale
  messages:{
    en: {
      test: `{msg}{'@'}world`,  // {'@'} 必须使用单引号
      linked: '@.capitalize:test link',     // 引用 test 中字符串
      apple: 'no apples | one apple | {count} apples',
    },
    zh:{
      test: `{msg}{'@'}世界`,
      linked: '@.capitalize:test 链接',
      apple: '没苹果 | 一个苹果 | {count} 个苹果',
    },
  },
  datetimeFormats: {
    'en-US': {
      short: {
        year: 'numeric', month: 'short', day: 'numeric'
      },
      long: {
        year: 'numeric', month: 'short', day: 'numeric',
        weekday: 'short', hour: 'numeric', minute: 'numeric'
      }
    },
    'zh-CN': {
      short: {
        year: 'numeric', month: 'short', day: 'numeric'
      },
      long: {
        year: 'numeric', month: 'short', day: 'numeric',
        weekday: 'short', hour: 'numeric', minute: 'numeric'
      }
    },
    numberFormats: {
      'en-US': {},
      'zh-CN': {},
    }
  }
});

export {i18n};
