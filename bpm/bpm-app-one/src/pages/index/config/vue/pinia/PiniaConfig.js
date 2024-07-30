/** import */
import { ref, computed } from 'vue';
import { createPinia, defineStore } from 'pinia';





/** Pinia 配置 */
const pinia = createPinia();
const storeNames = {
  aaa: 'aaa',
};





/**
 * 使用类似  Vue Options API 的方式定义一个 store
 * 将返回的 函数名 的格式定义为: useXxx，是一种约定，用于表明该 store 是会跨组件调用的
 * @caveat 推荐优先使用该方式定义 store
 */
export const useAlertsStore = defineStore(storeNames.aaa, {

  // 该字段可以理解为当前 store 的 data
  state: () => ({ count: 0, name: 'Eduardo' }),

  // 该字段可以理解为 state 的 computed 属性
  getters: {
    doubleCount: (state) => state.count * 2,
  },

  // 该字段可以理解为 methods
  actions: {
    increment() {
      this.count++;
    },
  },
});

/**
 * 使用类似  Vue Composition API 的方式定义一个 store
 * @trap 这种方式更 flexibility，但是使用 SSR 时，这种方式会带来更多的复杂性
 * @trap 这方式不能使用 store.$reset() 函数重置为初始值，需要自行定义 $reset() 函数
 */
export const useCounterStore = defineStore('counter', () => {
  // 相当于 Options API 中的 state
  const count = ref(0);
  const name = ref('Eduardo');

  // 相当于 Options API 中的 getters
  const doubleCount = computed(() => count.value * 2);

  // 相当于 Options API 中的 actions
  function increment() {
    count.value++;
  }

  return { count, name, doubleCount, increment };
});






/** export */
export {pinia};
