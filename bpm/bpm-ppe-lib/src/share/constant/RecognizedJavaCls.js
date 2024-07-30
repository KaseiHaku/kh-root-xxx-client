
export class RecognizedAnno {
  static jsr303 = {
    AssertFalse: 'jakarta.validation.constraints.AssertFalse',
    AssertTrue: 'jakarta.validation.constraints.AssertTrue',
    DecimalMax: 'jakarta.validation.constraints.DecimalMax',
    DecimalMin: 'jakarta.validation.constraints.DecimalMin',
    Digits: 'jakarta.validation.constraints.Digits',
    Email: 'jakarta.validation.constraints.Email',
    Future: 'jakarta.validation.constraints.Future',
    FutureOrPresent: 'jakarta.validation.constraints.FutureOrPresent',
    Max: 'jakarta.validation.constraints.Max',
    Min: 'jakarta.validation.constraints.Min',
    Negative: 'jakarta.validation.constraints.Negative',
    NegativeOrZero: 'jakarta.validation.constraints.NegativeOrZero',
    NotBlank: 'jakarta.validation.constraints.NotBlank',
    NotEmpty: 'jakarta.validation.constraints.NotEmpty',
    NotNull: 'jakarta.validation.constraints.NotNull',
    Null: 'jakarta.validation.constraints.Null',
    Past: 'jakarta.validation.constraints.Past',
    PastOrPresent: 'jakarta.validation.constraints.PastOrPresent',
    Positive: 'jakarta.validation.constraints.Positive',
    PositiveOrZero: 'jakarta.validation.constraints.PositiveOrZero',
    Size: 'jakarta.validation.constraints.Size',
  };
  static hibernate = {
    Length: 'org.hibernate.validator.constraints.Length',
    Range: 'org.hibernate.validator.constraints.Range',
    URL: 'org.hibernate.validator.constraints.URL',
    UUID: 'org.hibernate.validator.constraints.UUID',
  };
  static kaseihaku = {
    CodingIdentifier: 'com.kaseihaku.core.infra.validate.constraint.CodingIdentifier',
    Domain: 'com.kaseihaku.core.infra.validate.constraint.Domain',
    FileName: 'com.kaseihaku.core.infra.validate.constraint.FileName',
    IdCardNum: 'com.kaseihaku.core.infra.validate.constraint.IdCardNum',
    NoSpecialChar: 'com.kaseihaku.core.infra.validate.constraint.NoSpecialChar',
    OnlyZhChar: 'com.kaseihaku.core.infra.validate.constraint.OnlyZhChar',
    Phone: 'com.kaseihaku.core.infra.validate.constraint.Phone',
  };
  static bpm = {
    PpeFormField: 'com.kaseihaku.bpm.starter.ppe.render.engine.pojo.anno.PpeFormField',
    PpeFormGroup: 'com.kaseihaku.bpm.starter.ppe.render.engine.pojo.anno.PpeFormGroup',
  };

  /**
   * 非框架自带的注解，即: 扩展的注解
   */
  static custom = {

  };


}


export class RecognizedCls {
  static SameWithPropType = 'com.kaseihaku.bpm.starter.ppe.render.engine.pojo.anno.SameWithPropType';
  static FieldsSortTypeDictionary = 'com.kaseihaku.bpm.starter.ppe.render.engine.pojo.anno.FieldsSortTypeDictionary';
  static FieldsSortTypeKeep = 'com.kaseihaku.bpm.starter.ppe.render.engine.pojo.anno.FieldsSortTypeKeep';

  /******************************* 以下为 Pojo Render Engine 相关的组件 *******************************/
  static LocalDate = 'java.time.LocalDate';
  static LocalDateTime = 'java.time.LocalDateTime';
  static File = 'java.io.File';
  static MultiFile = 'com.kaseihaku.bpm.starter.ppe.render.engine.pojo.vue.MultiFile';
  static MultiLineStr = 'com.kaseihaku.bpm.starter.ppe.render.engine.pojo.vue.MultiLineStr';


  /******************************* 以下为 Native Render Engine 相关的组件 *******************************/


}


export class PojoRePrimitiveType {
  static String = 'java.lang.String';
  static Boolean = 'java.lang.Boolean';
  static Integer = 'java.lang.Integer';
  static Long = 'java.lang.Long';
  static BigInteger = 'java.math.BigInteger';
  static BigDecimal = 'java.math.BigDecimal';
  static Instant = 'java.time.Instant';
  static ClassConstant = 'com.kaseihaku.core.infra.constant.AbstractDescClassConstant';
  static JavaBean = 'java.beans.JavaBean';
  static Array = 'java.lang.reflect.Array';
  static Collection = 'java.util.Collection';
}


export function isPrimitive(javaFqcn){
  return javaFqcn === PojoRePrimitiveType.String
    || javaFqcn === PojoRePrimitiveType.Boolean
    || javaFqcn === PojoRePrimitiveType.Integer
    || javaFqcn === PojoRePrimitiveType.Long
    || javaFqcn === PojoRePrimitiveType.BigInteger
    || javaFqcn === PojoRePrimitiveType.BigDecimal
    || javaFqcn === PojoRePrimitiveType.Instant
    || javaFqcn === PojoRePrimitiveType.ClassConstant
  ;
}

export function isAry(javaFqcn){
  return javaFqcn === PojoRePrimitiveType.Array
    || javaFqcn === PojoRePrimitiveType.Collection
  ;
}


export function isJavaBean(javaFqcn){
  return javaFqcn === PojoRePrimitiveType.JavaBean
    || (!isPrimitive(javaFqcn) && !isAry(javaFqcn))
  ;
}


