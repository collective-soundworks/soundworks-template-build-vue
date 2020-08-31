import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

//////////////////////////////// ROUTES

const routes = {
  home: {
    layout: 'home',
  },
  contacts: {
    layout: 'chat',
  },
  discussion: {
    layout: 'chat',
  },
};

//////////////////////////////// STATE

const state = {
  routes,
  currentRoute: 'home',
  value: 0,
};

//////////////////////////////// MUTATIONS

const mutations = {
  setCurrentRoute(state, newRoute) {
    state.currentRoute = newRoute;
  },
  setCurrentValue(state, newValue) {
    state.value = newValue;
  },
};

//////////////////////////////// GETTERS

const getters = {};
// generate a getter for each state key :
for (let key in state) {
  getters[key] = state => state[key];
}

//////////////////////////////// EXPORT STORE

export default new Vuex.Store({
  state,
  mutations,
  getters,
});
