import Vue from 'vue';
import Home from './Home.vue';
import chat from './chat';

// register all components when imported

Vue.component('home-page', Home);

for (let page in chat) {
  Vue.component(`${page}-page`, chat[page]);
}
