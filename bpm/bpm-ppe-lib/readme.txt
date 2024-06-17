Project Structure:
    │
    ├─ src
        ├─ pojo          pojo re 组件，子目录结构和 POJO 中 字段类型的 FQCN 保持一致
            ├─ java
                ├─ lang
                    ├─ String.vue   java.lang.String 对应的渲染组件
                    ├─ Integer.vue  java.lang.Integer 对应的渲染组件
                    ├─ Long.vue     java.lang.Long 对应的渲染组件
                ├─ math
                    ├─ BigInteger.vue   java.math.BigInteger 对应的渲染组件
                    ├─ BigDecimal.vue   java.math.BigDecimal 对应的渲染组件
                ├─ time
                    ├─ Instant.vue      java.time.Instant 对应的渲染组件
                ├─ util
                    ├─ List.vue         java.util.List 对应的渲染组件
                    ├─ Set.vue          java.util.Set 对应的渲染组件
        │
        ├─ native       native re 组件
            ├─ CommonAgree.vue         公共 native 组件
            ├─ CommonDisagree.vue         公共 native 组件
            ├─ procBrand1
                ├─ versionName1
                    ├─ node1Brand.vue   node1 对应的渲染组件
                    ├─ node2Brand.vue   node2 对应的渲染组件
                ├─ versionName2
                    ├─ node2Brand.vue   proc 升级(upgrade)时，仅 node2 对应的渲染组件需要 update

全局组件目录:
    <kh-ace-editor v-model="strVar" :ace-mode="json5" :readonly="true"/>
    <kh-tag-input v-model="[]" />
    <kh-upload v-model="[]" :base-action-url="axios.defaults.baseURL" :limit="1" valid-ext=".jpg,.jpeg,.png"></kh-upload>

    <pojo-re-form-item :pojo-schema="pojoSchemaRaw" v-model:pojo-ins="pojoInsCpt" :readonly="readonlyInit"></pojo-re-form-item>


