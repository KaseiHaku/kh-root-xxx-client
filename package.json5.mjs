/**
 * 当前文件用于把 ./package.json5 转换成 package.json
 * 主要作用是为了使 package.json 文件可以添加注释
 * */
import fs from 'fs';
import path from 'path';
import json5 from 'json5';


/**
 * @typedef {Object} Miku
 * @property {string} master - Miku 的属性
 *
 * @param {path} packageJson5Path - package.json5 路径
 * */
function transferJson5ToJson(packageJson5Path){
  let dir = path.dirname(packageJson5Path);
  const json5Str = fs.readFileSync(packageJson5Path, 'utf8');
  let parsedObj = json5.parse(json5Str);
  let newJsonStr = JSON.stringify(parsedObj, null, 2); // 格式化，且每次缩进 2 个 space
  fs.writeFileSync(path.join(dir, './package.json'), newJsonStr, {encoding:'utf8'});
  console.log(`transfer ${packageJson5Path} to package.json`);
}

/**
 *
 * @param {path} initPath 初始递归路径
 * @param {number} deep 递归深度 0 表示只递归当前目录，1 表示递归当前目录及其直接子目录，以此类推
 */
async function recursiveTransform(initPath, deep){
  if(deep < 0) { return ; }

  let dirents = await fs.promises.readdir(initPath, {encoding:'utf8', withFileTypes: true});


  for (const dirent of dirents){
    let path1 = path.join(initPath, dirent.name);
    if (dirent.isDirectory() && dirent.name!=='node_modules'){
      recursiveTransform(path1, deep-1);
    }

    if (dirent.isFile() && dirent.name === 'package.json5') {
      transferJson5ToJson(path1);
    }
  }
}

/**
 * 删除 package.json package-lock.json dist node_modules
 * 但是当前工作目录
 *
 * @param {string} initPath - 执行路径，相对于当前工作目录，即: process.cwd()
 * @param {number} deep - 深入多少层子目录
 * @param {boolean} initial - 是否初次调用当前方法
 * */
async function recursiveDelete(initPath, deep, initial=true){
  if(deep < 0) { return ; }

  let dirents = await fs.promises.readdir(initPath, {encoding:'utf8', withFileTypes: true});


  for (const dirent of dirents){
    let path1 = path.join(initPath, dirent.name);
    if(initial && dirent.name==='node_modules') {
      continue ;
    }

    if (dirent.name === 'package.json' || dirent.name === 'package-lock.json' || dirent.name === 'dist' || dirent.name==='node_modules') {
      console.log(`delete ${path1}`)
      fs.promises.rm(path1, {recursive: true});
      continue ;
    }

    if (dirent.isDirectory()){
      recursiveDelete(path1, deep-1, false);
    }

  }
}


/**
 * 命令行参数解析
 * 常用命令:
 *  shell> node ./package.json5.mjs                       # 解析 package.json5 文件中的内容，并写入到 package.json 中
 *  shell> node ./package.json5.mjs -- --op=delete        # 删除所有 package.json
 *  shell> node ./package.json5.mjs -- --wd=core          # 在 core 目录下执行
 * */
console.log('process.argv: ', process.argv);  // 打印命令行参数
const dashDashSeparatorIdx = process.argv.findIndex(item => item === '--');
let operator = 'transform';
let initPath = '.';
if(dashDashSeparatorIdx > 0 ){
  const args = process.argv.slice(dashDashSeparatorIdx +1);
  for (const item of args) {
    if(item.startsWith('--op=')){
      operator = item.substring('--op='.length);
    }
    if(item.startsWith('--wd=')){
      initPath = item.substring('--wd='.length);
    }
  }

}


switch (operator) {
  case 'transform': {
    recursiveTransform(initPath, 4);
    break ;
  }
  case 'del':
  case 'rm':
  case 'delete': {
    recursiveDelete(initPath, 4);
    break ;
  }
  default: {
    throw new Error('unknown operator type');
  }
}


