import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp
    .use(ArcoVue)
    .use(ArcoVueIcon);
});
