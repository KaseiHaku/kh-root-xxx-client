import _ from 'lodash-es';
import {RecognizedAnno, PojoRePrimitiveType} from '@/share/constant/RecognizedJavaCls.js';


function mapJavaType2ClientReValidType(javaTypeName){
  let typeMap = {
    [PojoRePrimitiveType.String]: 'string',
    [PojoRePrimitiveType.Boolean]: 'boolean',
    [PojoRePrimitiveType.Integer]: 'integer',
    [PojoRePrimitiveType.Long]: 'number',
    [PojoRePrimitiveType.BigInteger]: 'number',
    [PojoRePrimitiveType.BigDecimal]: 'number',
    [PojoRePrimitiveType.Instant]: 'date',
    [PojoRePrimitiveType.ClassConstant]: 'string',  // 这里为 enum 会造成所有 rule 的 type 都是 enum 而校验失败
    [PojoRePrimitiveType.Array]: 'array',
    [PojoRePrimitiveType.Collection]: 'array',
    [PojoRePrimitiveType.JavaBean]: 'object',
  };
  return typeMap[javaTypeName] || 'object';
}

export function extractRulesFromSchema(pojoSchema){
  let closure = {};

  if (_.isEmpty(pojoSchema?.nestedPropResults)) {
    return closure;
  }

  pojoSchema.nestedPropResults.forEach(item => {
    closure[item.name] = [];
    let clientReValidType = mapJavaType2ClientReValidType(item.type);
    item.varResults.forEach(el => {
      /******************************* JSR-303 中的注解 *******************************/
      if (el.annoFqcn === RecognizedAnno.jsr303.AssertFalse) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          validator: (rule, value, callback) =>  value === false,
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.AssertTrue) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          validator: (rule, value, callback) =>  value === true,
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.DecimalMax) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          validator(rule, value, callback) {
            if (el.attributes.inclusive === true) {
              return value <= el.attributes.value;
            }
            return value < el.attributes.value;
          },
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.DecimalMin) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          validator(rule, value, callback) {
            if (el.attributes.inclusive === true) {
              return value >= el.attributes.value;
            }
            return value > el.attributes.value;
          },
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.Digits) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          validator(rule, value, callback) {
            let number = Number(value);
            if (Number.isNaN(number)) {
              return false;
            }

            let ary = number.toString().split('.');
            if(ary[0].length > el.attributes.integer){
              return false;
            }
            if(ary[1].length > el.attributes.fraction){
              return false;
            }
            return true;
          },
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.Email) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.Future) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          validator: (rule, value, callback) => Date.now() < value,
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.FutureOrPresent) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          validator: (rule, value, callback) => Date.now() <= value,
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.Max) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          max: el.attributes.value
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.Min) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          min: el.attributes.value
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.Negative) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          validator: (rule, value, callback) =>  value < 0,
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.NegativeOrZero) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          max: 0
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.NotBlank) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          min: 1
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.NotEmpty) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          min: 1
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.NotNull) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          required: true
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.Null) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          validator: (rule, value, callback) =>  _.isNil(value),
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.Past) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          validator: (rule, value, callback) => Date.now() > value,
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.PastOrPresent) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          validator: (rule, value, callback) => Date.now() >= value,
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.Pattern) {
        closure[item.name].push({
          type: 'regexp', message: el.attributes.message,
          // 由于 Java 和 JS 的正则表达式不一定通用，所以这里看情况构建，能用则用，不能用则过
          validator(rule, value, callback) {
            try{
              return new RegExp(el.attributes.regexp).test(value);
            } catch (err) {
              return true;
            }
          },
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.Positive) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          validator: (rule, value, callback) =>  value > 0,
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.PositiveOrZero) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          min: 0,
        });
      }
      if (el.annoFqcn === RecognizedAnno.jsr303.Size) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          min: el.attributes.min, max: el.attributes.max
        });
      }
      /******************************* Hibernate 中的注解 *******************************/
      if (el.annoFqcn === RecognizedAnno.hibernate.Length) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          min: el.attributes.min, max: el.attributes.max
        });
      }
      if (el.annoFqcn === RecognizedAnno.hibernate.Range) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          min: el.attributes.min, max: el.attributes.max
        });
      }
      if (el.annoFqcn === RecognizedAnno.hibernate.URL) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          pattern: /^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?:\/\S*)?$/,
        });
      }
      if (el.annoFqcn === RecognizedAnno.hibernate.UUID) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          pattern: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
        });
      }
      /******************************* Hibernate 中的注解 *******************************/
      if (el.annoFqcn === RecognizedAnno.kaseihaku.CodingIdentifier) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
        });
      }
      if (el.annoFqcn === RecognizedAnno.kaseihaku.Domain) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          pattern: /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/,
        });
      }
      if (el.annoFqcn === RecognizedAnno.kaseihaku.FileName) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          pattern: /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/,
        });
      }
      if (el.annoFqcn === RecognizedAnno.kaseihaku.IdCardNum) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          pattern: /^[1-9]\d{5}[0-9]{4}[0-1][0-9](([0-2][1-9])|[1-3]0|31)\d{3}[0-9xX]$/,
        });
      }
      if (el.annoFqcn === RecognizedAnno.kaseihaku.NoSpecialChar) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          pattern: /^[1-9]\d{5}[0-9]{4}[0-1][0-9](([0-2][1-9])|[1-3]0|31)\d{3}[0-9xX]$/,
        });
      }
      if (el.annoFqcn === RecognizedAnno.kaseihaku.OnlyZhChar) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          pattern: /^[\u4e00-\u9fa5]*/,
        });
      }
      if (el.annoFqcn === RecognizedAnno.kaseihaku.Phone) {
        closure[item.name].push({
          type: clientReValidType, message: el.attributes.message,
          pattern: /^(13[0-9]|14[5|7]|15[0-35-9]|18[0-35-9])\\d{8}$/,
        });
      }

    });


    let ppeFormFieldAnno = item.darResults.find(item => item.annoFqcn === RecognizedAnno.bpm.PpeFormField);
    if(ppeFormFieldAnno){

      if(PojoRePrimitiveType.ClassConstant === item.type){

        let enumRule = [];
        if(ppeFormFieldAnno.attributes.enumeration){
          enumRule = ppeFormFieldAnno.attributes.enumeration.map(value => value.key);
        }
        closure[item.name].push({
          type: 'enum',
          enum: enumRule,
        });
      }


    }


  });

  return closure;
}
