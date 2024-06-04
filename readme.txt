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

################################ 前端项目运行 ################################
shell> nvm use 18.16.0                          # 使用指定版本的 node

shell> npm install json5@2.2.3                  # 安装 JSON5 解析库，需要先删掉顶层 package.json, 否则会额外下载 package.json 中的依赖
shell> node ./package.json5.mjs                 # 解析 package.json5 文件中的内容，并写入到 package.json 中
shell> node ./package.json5.mjs delete          # 删除所有 package.json
shell> node ./package.json5.mjs -- core         # 在指定目录下操作
shell> npm install                              # 安装依赖

shell> npm run core-com-build                   # 先构建公共包
shell> npm install                              # 再次 install 将 公共包(core-com) 安装到 node_modules 目录下
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


