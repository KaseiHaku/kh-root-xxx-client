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


# 设置私有库密码
# @trap npm login 对于 Nexus 私有库无效
shell> npm login --registry=http://192.168.0.200:8081/repository/npm-hosted/    # login 对于 Nexus 私有库无效
shell> npm config set //192.168.0.200:8081/repository/npm-hosted/:_auth $(echo -n 'admin:cfac158b' | base64)    # 有效


# scope(即: @xxx/) 和 registry 是 n:1 的关系
# @trap 如果登录不上 shell> vim ~/.npmrc 中删掉对应行
shell> npm login --registry=http://192.168.0.200:8081/repository/npm-hosted/ --scope=@kaseihaku.com       # 将 @kaseihaku.com/* 开头的包的 registry 设置为指定 URL
shell> npm config set @kh:registry=http://reg.example.com                       # 将 @kh/* 开头的包的 registry 设置为指定 URL

shell> npm publish --dry-run ./core/core-com


################################ 前端项目运行 ################################
shell> nvm use 20.14.0                          # 使用指定版本的 node

shell> npm install json5@2.2.3                  # 安装 JSON5 解析库，需要先删掉顶层 package.json, 否则会额外下载 package.json 中的依赖
shell> node ./package.json5.mjs                 # 解析 package.json5 文件中的内容，并写入到 package.json 中
shell> node ./package.json5.mjs delete          # 删除所有 package.json
shell> node ./package.json5.mjs -- core         # 在指定目录下操作
shell> npm install                              # 安装依赖

shell> npm run core-com-build                   # 先构建公共包
shell> npm install                              # 再次 install 将 公共包(core-com) 安装到 node_modules 目录下
shell> npm run cloud-starter-basic-build        # 构建 cloud 公共包
shell> npm run cloud-user-build                 # 再构建业务包
shell> npm run cloud-user-start                 # 本地部署前端项目

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


