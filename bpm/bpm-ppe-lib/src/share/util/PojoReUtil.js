import _ from 'lodash-es';
import {isAry, isJavaBean, isPrimitive, PojoRePrimitiveType, RecognizedAnno, RecognizedCls} from '@/share/constant/RecognizedJavaCls.js';
import {timestamp2LocalDateTimeString, timestamp2LocalDateString} from '@kaseihaku.com/core-infra';

/**
 * 根据 pojoSchema 创建一个 javascript object 返回
 * @param pojoSchema      pojo 描述对象
 * @return {{}|*[]|null}  JavaBean 返回 {} 并且包含字段
 *                        Collection 和 Array 类型返回空 []
 *                        其他基本类型返回 null
 */
export function createJsObjByPojoSchema(pojoSchema){
  if (!pojoSchema?.type) {
    throw new Error('POJO Schema is null or without type attribute');
  }

  const javaFqcn = pojoSchema.type;

  if (isPrimitive(javaFqcn)){
    return null;
  }

  if (isAry(javaFqcn)){
    return [];
  }

  if (isJavaBean(javaFqcn)){
    let createdObj = {};
    initializePojoInsAttrs(pojoSchema, createdObj);
    return createdObj;
  }

  throw new Error('根据 java fqcn 创建 js object 失败');
}


/**
 * 该方法主要是针对 JavaBean 类型，补全 pojoIns 中没有字段，但是字段的值全为 null
 *
 * @trap 特别注意: 当前方法只是 补全字段，但不创建字段的值，
 *       即: 把 字段 从 undefined 变成 defined; 但是字段的值 全部为 null
 *
 * @param pojoSchema
 * @param pojoIns     该值不能为 null undefined
 */
export function initializePojoInsAttrs(pojoSchema, pojoIns){
  if(!pojoSchema || !pojoIns){
    return ;
  }

  if (!pojoSchema.nestedPropResults || pojoSchema.nestedPropResults.length <= 0) {
    return ;
  }

  pojoSchema.nestedPropResults.forEach(item => {
    let type = item.type;
    if (!type) {
      throw new Error('POJO Schema without type attribute');
    }

    // 所有字段都置为 null，当前方法只是 补全字段，但是不创建字段的值
    if (isAry(type) && _.isNil(pojoIns[item.name])) {
      pojoIns[item.name] = null;
    } else if (isJavaBean(type) && _.isNil(pojoIns[item.name])) {
      pojoIns[item.name] = null;
    } else if (_.isUndefined(pojoIns[item.name])) {
      pojoIns[item.name] = null;
    }

  });

}

/**
 *
 * @param pojoSchema
 * @param annoFqcn
 * @param {number} searchFlag 0:all; 1:varResults; 2:darResults
 * @return {[]}
 */
export function findAnno(pojoSchema, annoFqcn, searchFlag=1){
  if(searchFlag === 0){
    let varFilterResults = pojoSchema.varResults.filter(item => item.annoFqcn === annoFqcn);
    let darFilterResults = pojoSchema.darResults.filter(item => item.annoFqcn === annoFqcn);
    return [...varFilterResults, ...darFilterResults];
  }

  if(searchFlag === 1){
    return pojoSchema.varResults.filter(item => item.annoFqcn === annoFqcn);
  }
  if(searchFlag === 2){
    return pojoSchema.darResults.filter(item => item.annoFqcn === annoFqcn);
  }

}

/**
 * 同 {@link #findAnno}
 * @see #findAnno
 */
export function findAnnoFirst(pojoSchema, annoFqcn, searchFlag=1){
  if(searchFlag === 0){
    let varResult = pojoSchema.varResults.find(item => item.annoFqcn === annoFqcn);
    if(varResult){
      return varResult;
    }
    let darResult = pojoSchema.darResults.filter(item => item.annoFqcn === annoFqcn);
    return darResult;
  }

  if(searchFlag === 1){
    return pojoSchema.varResults.find(item => item.annoFqcn === annoFqcn);
  }
  if(searchFlag === 2){
    return pojoSchema.darResults.find(item => item.annoFqcn === annoFqcn);
  }

}

export function getDisplayName(pojoSchema){
  let ppeFormFieldAnno = findAnnoFirst(pojoSchema, RecognizedAnno.bpm.PpeFormField, 2);
  if(!ppeFormFieldAnno){
    return pojoSchema.name;
  }
  return ppeFormFieldAnno.attributes.label;
}


/**
 * 对 PpeFormGroup 中的 Fields 进行排序
 * @param ppeFormGroup    注解信息
 */
export function sortPpeFormGroupFields(ppeFormGroup, field2PojoSchemaMap){
  // 根据排序类型不同，进行排序
  if (ppeFormGroup.attributes.fieldsSortType === RecognizedCls.FieldsSortTypeDictionary) {
    const pojoSchemaAry = [];
    for (let [key, val] of field2PojoSchemaMap) {
      const displayName = getDisplayName(val);
      pojoSchemaAry.push(val);
    }
    return sortPojoSchemaByDisplayNameInLexicographicOrder(pojoSchemaAry);
  }

  if (ppeFormGroup.attributes.fieldsSortType === RecognizedCls.FieldsSortTypeKeep){
    const retAry = [];
    ppeFormGroup.attributes.fields.forEach(item => retAry.push(field2PojoSchemaMap.get(item)));
    return retAry;
  }
  throw new Error('未知的 字段排序类型');
}

export function sortPojoSchemaByDisplayNameInLexicographicOrder(pojoSchemaAry){

  let field2DisplayNameMap = new Map();

  pojoSchemaAry.forEach(item => {
    let displayName = getDisplayName(item);
    field2DisplayNameMap.set(item.name, displayName);
  });

  /* JS Locale Collator */
  // new Intl.Collator('zh-Hans-CN', {
  //   usage: 'sort', number: true, caseFirst: 'lower', sensitivity: 'variant' , ignorePunctuation: false
  // }).compare('时间戳数组', 'decimal');


  return pojoSchemaAry.toSorted((a, b)=>{

    let aDisplayName = field2DisplayNameMap.get(a.name);
    let bDisplayName = field2DisplayNameMap.get(b.name);

    return aDisplayName.localeCompare(bDisplayName, 'zh-Hans-CN');
  });
}


export function computeReadonly(pojoSchema, originReadonlyProp){
  let ppeFormFieldAnno = findAnnoFirst(pojoSchema, RecognizedAnno.bpm.PpeFormField, 2);
  if(!ppeFormFieldAnno){
    return originReadonlyProp;
  }

  return originReadonlyProp || ppeFormFieldAnno.attributes.disabledAnyWay;
}

export function colFormatterChooser(pojoSchema){
  let javaFqcn = resolveFormItemComponent(pojoSchema);
  if ([
        PojoRePrimitiveType.String,
        PojoRePrimitiveType.Boolean,
        PojoRePrimitiveType.Integer,
        PojoRePrimitiveType.Long,
        PojoRePrimitiveType.BigInteger,
        PojoRePrimitiveType.BigDecimal,
        PojoRePrimitiveType.ClassConstant,
      ].includes(javaFqcn)) {
    return (val) => String(val);
  }

  if([PojoRePrimitiveType.Instant, RecognizedCls.LocalDateTime].includes(javaFqcn)){
    return (val) => timestamp2LocalDateTimeString(val);
  }

  if([RecognizedCls.LocalDate].includes(javaFqcn)){
    return (val) => timestamp2LocalDateString(val);
  }

  if([PojoRePrimitiveType.JavaBean, PojoRePrimitiveType.Array, PojoRePrimitiveType.Collection].includes(javaFqcn)){
    return (val) => JSON.stringify(val);
  }

  return (val) => 'unable to format';
}

export function resolveFormItemComponent(pojoSchema){
  if (!_.isEmpty(pojoSchema?.darResults)) {
    let ppeFormField = pojoSchema.darResults.find(item => item.annoFqcn === RecognizedAnno.bpm.PpeFormField);
    if(!ppeFormField){
      return translateIfNotPrimitive(pojoSchema.type);
    }

    if (ppeFormField.attributes.vueComponent === RecognizedCls.SameWithPropType) {
      return translateIfNotPrimitive(pojoSchema.type);
    }
    return ppeFormField.attributes.vueComponent;
  }
  return translateIfNotPrimitive(pojoSchema.type);
}

function translateIfNotPrimitive(javaFqcn){
  if (isPrimitive(javaFqcn)) {
    return javaFqcn;
  }
  if (isAry(javaFqcn)) {
    return javaFqcn;
    // return PojoRePrimitiveType.Collection;
  }
  return PojoRePrimitiveType.JavaBean;
}

export function getBpmAppName(){
  return new URLSearchParams(window.location.search).get('bpmAppName')
}

export function getProcId(){
  let clientRoute = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
  return new URL(clientRoute, 'http://kaseihaku.com').searchParams.get('procId')
}
export function getToDoId(){
  let clientRoute = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
  return new URL(clientRoute, 'http://kaseihaku.com').searchParams.get('todoId')
}

export function reLocationWithoutTodoId(){
  let urlSearchParams = new URLSearchParams(window.location.hash);
  urlSearchParams.delete('todoId');
  let newHash = decodeURIComponent(urlSearchParams.toString());
  window.location.hash = newHash;
}


export function isFile(pojoSchema){

  let ppeFormFieldAnno = findAnnoFirst(pojoSchema, RecognizedAnno.bpm.PpeFormField, 2);
  if(!ppeFormFieldAnno){
    return false;
  }

  let vueComponent = ppeFormFieldAnno.attributes.vueComponent;
  return vueComponent === RecognizedCls.File
    || vueComponent === RecognizedCls.MultiFile ;
}


export function isMultiLineStr(pojoSchema){

  let ppeFormFieldAnno = findAnnoFirst(pojoSchema, RecognizedAnno.bpm.PpeFormField, 2);
  if(!ppeFormFieldAnno){
    return false;
  }

  let vueComponent = ppeFormFieldAnno.attributes.vueComponent;
  return vueComponent === RecognizedCls.MultiLineStr;
}
