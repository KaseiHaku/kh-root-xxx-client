/**
 * 当 package.json 中配置了 {"type": "module"} 时，
 * .eslintrc.js 需要重命名为 .eslintrc.cjs 用于表示当前 js 文件是 CommonJS 的模块系统
 * 目前 .eslintrc.js 不支持使用 ESM 标准的模块系统导出配置文件
 * */
module.exports = {

  /** Configuration Files */
  root: true, // true 表示 eslint 不再查找父目录中的 .eslintrc.js 文件作为 父配置项 加载

  /* Ignoring Pattern: 和 .eslintignore 文件配置规则一致 */
  ignorePatterns: [
    // 'temp.js',
    // '**/vendor/*.js',
    '**/*Test*.*', // 所有测试相关的，不做校验
    '**/util/*', // util 包下的，不做校验
    '**/dist/', // dist 目录下的不做校验
    '**/node_modules/', // dist 目录下的不做校验
  ],



  // 用于配置在所有 rule 之间共享的参数
  settings: {
    sharedData: 'Hello',
  },

  /* 使用别人已经定义好的配置
   * 配置名可以省略 eslint-config- 前缀，例如： standard == eslint-config-standard
   * 因为别人配置好的 configuration 都是一个 npm package， 并且 export 一个 configuration object
   * 所以想引用别人的 configuration，需要先 npm 引入对应的 package
   *
   * 解析规则 从上到下，后面的覆盖前面的; rules 中的优先级永远高于 extends
   */
  extends: [
    // 'eslint:all', // 表示开启当前版本 eslint 所有特性
    // 使用 eslint 推荐的格式，等价于 'eslint:eslint-config-recommended'
    'eslint:recommended',   // 表示开启当前版本 eslint 所有推荐的特性
    /* 使用 plugin 中的 configuration */
    'plugin:vue/vue3-recommended', // 使用 eslint-plugin-vue 插件中的配置，其他通用的 扩展 放在该配置上面
    /* 使用指定的 configuration 文件 */
    // './node_modules/coding-standard/eslintDefaults.js',
  ],



  /** Language Options */
  // env 表示当前编写的 js 脚本的运行环境
  env: {
    es2021: true,
    browser: true,
    node: true,
    /* 使用 plugin 中的插件， 那么该插件必须在 plugins 属性中配置， 且插件名称不能带前缀
     * 格式： unprefixedPluginName/env
     */
    // 'example/custom': true,
  },


  // 配置 js 脚本全局变量的 读写 属性
  globals: {
    'xKaseiJws': 'writable', // writable 表示可写
    'var2': 'readonly',
    // 'Promise': 'off',  // off 表示不准使用该 全局变量
  },


  /** Parser */
  // parser: 'vue-eslint-parser', // eslint 默认使用  Espree  作为 parser
  // 配置 eslint 支持的 js 语法, 默认支持 ECMAScript 5 syntax
  // 注意支持 es6 语法，不代表支持 es6 新增的类， 比如 Set
  parserOptions: {
    ecmaVersion: 2021,  // 2015 相当于 es6
    sourceType: 'module', // 默认为 script， module 表示源代码是 ECMAScript modules 格式的
    ecmaFeatures: {
      globalReturn: false, // 表示不允许在全局作用域中使用 return 语句
      impliedStrict: true, // 表示在 es5 的时候开始 strict mode
      jsx: true, // 表示开启 JSX
    },
    // 因为外层 parse 已经使用了 vue-eslint-parser ，自定义 parser 只能定义在这里
    parser: '@babel/eslint-parser',
  },

  /**
   * Plugins
   * @trap prefix='eslint-plugin-' 的 plugin 可以省略 prefix; 即：eslint-plugin-jquery 可以写作 jquery
   * @trap 如果使用三方插件，需要先 shell> npm install
   * @doc https://eslint.org/docs/latest/use/configure/plugins
   * */
  plugins: [
    // 'jquery', // 相当于 eslint-plugin-jquery
    // '@jquery/jquery', // means @jquery/eslint-plugin-jquery
    // '@foobar', // means @foobar/eslint-plugin
    'vue', // 相当于 eslint-plugin-vue 插件，使 eslint 可以识别 .vue 文件的语法
    '@stylistic/eslint-plugin-js',
  ],

  /** Rules */
  // 关闭所有 inline config comments
  noInlineConfig: true,
  reportUnusedDisableDirectives: true, // 提示所有没有使用到的 eslint disable directive, 就是 eslint 注释

  /**
   * off 0: 表示当前 rule 不生效
   * warn 1: 表示当前 rule 生效，如果 rule 检测不通过则以 warn 形式提示
   * error 2: 表示开启该 rule， 如果 rule 检测不通过则以 error 形式提示
   * @doc https://eslint.org/docs/latest/use/configure/rules
   * */
  rules: {
    /* 用于排除类型不安全的比较，强制使用 === 判相等
     * 数组第一个参数永远用于表示 当前 rule 的 severity(严重程度)
     * 数组第二个参数是传给 eqeqeq 的
     * */
    eqeqeq: ['error', 'always', {'null': 'always'}], // always 强制使用 ===
    /* 流程控制语句后面必须加 curly bracket */
    curly: ['error', 'all'],
    /* 所有声明语句必须分号结尾 */
    semi: ['error', 'always', {omitLastInOneLineBlock: false}],
    /* 字符串使用 单引号，允许在单引号中使用双引号， 允许使用 backtick */
    quotes: ['error', 'single', {avoidEscape: true, allowTemplateLiterals: true}],
    /* 缩进配置
     * @doc https://eslint.style/rules/js/indent
     * */
    // '@stylistic/eslint-plugin-js/rules/indent': [ // 有问题，不知道啥原因
    'indent': [
      'warn',
      2, // 1 indent = 2 space
      {
        // ignoredNodes: ["ConditionalExpression"], // 匹配 AST(abstract syntax tree) 模式，并应用缩进
        SwitchCase: 1, // 检测缩进格式，switch 中 case 缩进 1 个 indent
        VariableDeclarator: 'first', // 多个变量声明换行时，后续变量跟首个变量的首字符对齐
        outerIIFEBody: 1, // IIFE(Immediately Invoked Function Expression) 自调用函数，函数体缩进 1 indent
        MemberExpression: 1, // a.b.c  成员调用换行时，缩进一个 1 indent
        FunctionDeclaration: {
          parameters: 'first',// 函数参数换行时，跟第一个参数对齐
          body: 1,// 函数体缩进 1 indent
        },
        FunctionExpression: {
          parameters: 'first',
          body: 1,
        },
        StaticBlock: {body:1}, // JS Class 中的 静态代码块
        CallExpression: {arguments: 1},// 函数调用参数换行时，参数换行跟第一个参数对齐
        ArrayExpression: 'first', // 数组表达式元素换行时，元素跟第一个元素对齐
        ObjectExpression: 'first',// 对象表达式属性换行时，属性跟第一个属性对齐
        ImportDeclaration: 'first', // import 表达式变量换行时，变量跟第一个变量对齐
        flatTernaryExpressions: false, // 三元表达式 : 后面需要缩进
        offsetTernaryExpressions: true, // 三元表达式 ? : 块需要缩进
        ignoreComments: false, // 注释的缩进也需要检查
      },
    ],

    'no-void': 'error', // 禁止使用 void 关键字
    'no-alert': ['error'], // 禁止直接使用 alert, prompt, and confirm
    'no-eval': ['error'], // 禁止使用 eval(), 使用 Function 替代
    'no-debugger': ['error'], // 禁止使用 debugger; 语句
    'no-new': ['error'], // 禁止 new 出来的对象，不赋值给变量
    'no-mixed-spaces-and-tabs': ['error'], // 禁止 tab 和 space 缩进混用
    'no-import-assign': 'error', // import 过来的变量禁止修改

    /* 禁止使用 JS 隐式类型转换 */
    'no-implicit-coercion': ['error', {
      'disallowTemplateShorthand': false, // false 表示模板字符串中可以进行隐式转换，即：允许 `a${integer}a`
    }],

    /** Variables 相关的限制项 */
    'no-restricted-globals': ['warn', 'event', 'window', 'global'], // 禁用指定的全局变量
    // 禁止在内部作用域声明与外部作用域相同的变量名
    // 'no-shadow': ['error', {
    //   'builtinGlobals': true, // 禁止 shadow(遮蔽) JS 内建对象，例如 Object，Array 等
    //   'hoist': 'functions', // 外部 variables/functions 定义之前，内部作用域中定义的同名标识符报错
    //   'allow': ['xKaseiJws'], // 允许被内部作用域重新声明，而遮蔽的外部作用域的变量
    // }],
    'no-shadow-restricted-names': 'error', // 禁止定义 NaN, Infinity, undefined, eval, arguments 等变量名
    'no-undef': ['error', {'typeof': true}], // 禁止使用未定义的变量，包括 typeof 语句中为定义的变量
    'no-undef-init': 'error', // 禁止将变量初始化为 undefined，即：let a = undefined;
    /* vars=all: 所有没有使用的变量(global or local);
     * args=after-used: 最后一个使用的参数之后没有使用的参数报错; 推荐设置为 none，因为框架函数所有参数写出来更清晰
     * ignoreRestSiblings=false: 扩展运算符(...obj) 中未使用的变量也报错
     * caughtErrors=all: 所有 catch 块中，必须使用 catch 住的 error 对象
     * */
    'no-unused-vars': ['warn', {vars: 'all', args: 'none', ignoreRestSiblings: false, caughtErrors: 'all'}],

    /**
     * 使用插件中的 rule
     * 格式： pluginName/ruleName ， 其中 pluginName 必须在 plugins 属性中配置过的
     * */
    // 'plugin1/rule1': 'error',

    /* eslint-plugin-vue 依赖中内建的针对 .vue 文件的 eslint rules
     * https://eslint.vuejs.org/rules/
     * */
    'vue/multi-word-component-names': ['error', {
      'ignores': ['Array', 'Collection', 'File']
    }],
    'vue/no-unused-vars': ['warn', {}],
    'vue/singleline-html-element-content-newline': ['off', {}],
    'vue/script-indent': ['warn', 2, {'baseIndent': 0, 'switchCase': 1, "ignores": []}],
    'vue/max-attributes-per-line': ['error', {
      'singleline': {'max': 8},
      'multiline': {'max': 16 },
    }],
    'vue/first-attribute-linebreak': ['error', {
      'singleline': 'beside',
      'multiline': 'beside',
    }],
    'vue/html-closing-bracket-newline': ['error', {
      'singleline': 'never',
      'multiline': 'never'
    }],
    'vue/no-mutating-props': ['error', {
      'shallowOnly': true
    }]
  },

  /* 对特定的文件使用特定 rules 配置
   * @doc https://eslint.org/docs/latest/use/configure/rules#using-configuration-files-1
   * */
  overrides: [
    {
      'files': ['*.vue'],
      'rules': {
        'indent': 'off'
      }
    }
  ],



  // processor: '',

};
