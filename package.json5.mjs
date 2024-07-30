/**
 * 当前文件用于把 ./package.json5 转换成 package.json
 * 主要作用是为了使 package.json 文件可以添加注释
 * */
import fs from 'fs';
import path from 'path';
import json5 from 'json5';

/**
 * @param packageJson5Path package.json5 路径
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
 * @param initPath 初始递归路径
 * @param deep 递归深度 0 表示只递归当前目录，1 表示递归当前目录及其直接子目录，以此类推
 */
async function recursiveTransfer(initPath, deep){
  if(deep < 0) { return ; }

  let dirents = await fs.promises.readdir(initPath, {encoding:'utf8', withFileTypes: true});


  for (const dirent of dirents){
    let path1 = path.join(initPath, dirent.name);
    if (dirent.isDirectory() && dirent.name!=='node_modules'){
      recursiveTransfer(path1, deep-1);
    }

    if (dirent.isFile() && dirent.name === 'package.json5') {
      transferJson5ToJson(path1);
    }
  }
}

/**
 * 删除 package.json package-lock.json dist
 * */
async function recursiveDelete(initPath, deep){
  if(deep < 0) { return ; }

  let dirents = await fs.promises.readdir(initPath, {encoding:'utf8', withFileTypes: true});


  for (const dirent of dirents){
    let path1 = path.join(initPath, dirent.name);
    if(dirent.name==='node_modules') {
      continue ;
    }

    if (dirent.name === 'package.json' || dirent.name === 'package-lock.json' || dirent.name === 'dist') {
      console.log(`delete ${path1}`)
      fs.promises.rm(path1, {recursive: true});
      continue ;
    }

    if (dirent.isDirectory()){
      recursiveDelete(path1, deep-1);
    }

  }
}


let initPath = '.';
let dashDashSeparatorIdx = process.argv.findIndex(item => item === '--');
if ( dashDashSeparatorIdx > 0 && process.argv[dashDashSeparatorIdx + 1]) {
  initPath = process.argv[dashDashSeparatorIdx + 1];
}


if(process.argv.includes('delete')){
  recursiveDelete(initPath, 4);
} else {
  recursiveTransfer(initPath, 4);
}



