/**
 * 该文件是和 bpm-ppe 项目共享的代码，依赖树中尽可能少的引入外部依赖，最好完全不引入
 * @trap 该文件最好只 import 当前目录下的文件，使依赖树的膨胀可控
 *
 *
 * @trap 严禁修改当前目录下的 变量名/函数名
 *       值 和 函数体 慎重改，最好都別改
 *
 */
import BpmPpeProfile from '@/share/constant/BpmPpeProfile.js';
import * as RecognizedJavaCls from '@/share/constant/RecognizedJavaCls.js';
import * as ConstraintAnnoConverter from '@/share/rule/ConstraintAnnoConverter.js';
import * as PojoReUtil from '@/share/util/PojoReUtil.js';


export {BpmPpeProfile, RecognizedJavaCls, ConstraintAnnoConverter, PojoReUtil};
