import Vue from 'vue';
import Home from './Home.vue';
import Chat from './Chat.vue';

const layouts = {
  'home': Home,
  'chat': Chat,
};

// register all components when imported

for (let layout in layouts) {
  Vue.component(`${layout}-layout`, layouts[layout]);
}
