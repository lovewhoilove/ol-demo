import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
// 第三方库
import ElementUI from 'element-ui';
// 自定义类
import OL from './util';
// 第三方库样式
import 'element-ui/lib/theme-chalk/index.css';
import 'ol/ol.css';
// 自定义样式
import './assets/style/index.scss';

Vue.config.productionTip = false;
Vue.use(ElementUI, { size: 'small', zIndex: 3000 });
Vue.prototype.$OL = OL;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
