# @attention 以下所有命令的执行目录，默认都为 kh-root-client(项目根目录) 下

# Shortcut
# Ctrl+A              # 行首
# Ctrl+E              # 行尾
# Ctrl+Left           # 光标移动到下一个词首
# Ctrl+Right          # 光标移动到下一个词尾

# Ctrl+U              # 删除光标左边所有
# Ctrl+K              # 删除光标右边所有
# Ctrl+Shift+-        # 撤销

# Ctrl+C              # 杀掉当前正在执行的进程
# Ctrl+R              # 历史命令查找
# Ctrl+L              # 清屏
################################ Concept ################################
当前库(kh-root-xxx-client) 为 kh-root-client 库的扩展定制库
由于该库没有任何需要和 kh-root-client 库保持同步的代码，所以可以根据不同的甲方独立建立 git 库，并修改 xxx 为对应甲方名称
当然也可以根据不同甲方创建不同的 git branch，例如: aaa-prod, aaa-sit, bbb-prod 等

################################ 环境配置 ################################
shell> npm config set registry = https://registry.npmmirror.com            # 设置 淘宝 npm 镜像源
shell> npm config set @kaseihaku.com:registry=https://repo.kaseihaku.com/service/rest/repository/browse/npm-hosted/     # 将 @kaseihaku.com/* 开头的包的 registry 设置为指定 URL

################################ 前端项目运行 ################################
# act/pwd: root/1234
# 后端框架默认 JwsUniqueType=clientType ，
#   即：一种 client 类型(例如: 浏览器，手机端，小程序等)下一个 user 只能存在一个有效的 JWT token, 多人登陆同一账号会导致相互踢人
#
shell> nvm use 20.14.0                          # 使用指定版本的 node

shell> npm install json5@2.2.3                  # 安装 JSON5 解析库，需要先删掉顶层 package.json, 否则会额外下载 package.json 中的依赖
shell> node ./package.json5.mjs                 # 解析 package.json5 文件中的内容，并写入到 package.json 中
shell> node ./package.json5.mjs delete          # 删除所有 package.json
shell> node ./package.json5.mjs -- core         # 在指定目录下操作
shell> npm install                              # 安装依赖，并修改 node_modules/vite-plugin-serve-static/dist/index.js#L50 为 "Content-Type": type || 'application/octet-stream'

shell> npm run bpm-ppe-lib-build-dev            # PPE Lib 库
shell> npm run bpm-portal-build-dev             # 门户
shell> npm run bpm-app-one-build-dev            # 应用

shell> cp ./deploy/dev/.env.sample ./deploy/dev/.env                        # 复制并修改称自己想要的值
shell> docker compose -f ./deploy/dev/docker-compose-nginx.yml up -d        # 启动 nginx 部署 bpm-ppe-lib
shell> npm run bpm-portal-dev                                               # 开始开发
shell> npm run bpm-app-one-dev                                              # 必须访问: http://localhost:8080/index.html?bpmAppName=bpm-app-one#/ , 即: 必须带 bpmAppName 参数
                                                                            # 其中 http://localhost:8080/index.html?bpmAppName=bpm-app-one#/proc/feature/v1/DefaultReport.vue
                                                                            # 会访问 http://localhost:8080/api/bpm-app-one/v1/Feature 接口，可以用于对 bpm-app-one 进行本地灰度测试

################################ 常用命令 ################################
shell> NODE_ENV=production node --inspect-brk ./demo/jsTest.mjs                   # node js 测试
shell> npm exec -- webpack --help               # 执行 webpack 包中的命令，查看帮助
shell> npx webpack --help                       # 同上


shell> nvm ls-remote --lts                      # 查看所有可用的 LTS 版本
shell> nvm ls --no-alias                        # 查看所有已经安装的版本
shell> nvm install --lts 18.16.0                # 安装指定版本的 node
shell> nvm uninstall 18.16.0                    # 卸载指定版本的 node
shell> nvm current                              # 当前使用的 node 的版本
shell> nvm which current                        # 查看指定版本的 node 安装路径
shell> nvm use                                  # 使用 ~/.nvmrc 中指定的 node 版本
shell> nvm use 18.16.0                          # 使用指定版本的 node


# npm 缓存清理
shell> npm config get cache                     # 查看缓存位置
shell> npm cache clean --force                  # 清理全部缓存
