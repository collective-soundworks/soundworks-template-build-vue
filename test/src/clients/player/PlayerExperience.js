import { Experience } from '@soundworks/core/client';
import Vue from 'vue';
import store from './store';
import Player from './Player.vue';
import renderAppInitialization from '../views/renderAppInitialization';
// import renderInitializationScreens from '@soundworks/template-helpers/client/render-initialization-screens.js';

class PlayerExperience extends Experience {
  constructor(client, config = {}, $container) {
    super(client);

    this.config = config;
    this.$container = $container;
    this.rafId = null;

    // require plugins if needed
    this.require('platform');

    renderAppInitialization(client, config, $container);
    // renderInitializationScreens(client, config, $container);
  }

  async start() {
    super.start(); // await ?

    Vue.prototype.$experience = this;

    console.log('instanciating vue');
    this.vue = new Vue({
      store,
      el: this.$container,
      render: h => h(Player),
    });
  }
}

export default PlayerExperience;