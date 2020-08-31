<template>
  <transition name="fade">
    <component :is="layout">
      <component :is="page" />
    </component>
  </transition>
</template>

<script>
import './layouts';
import './pages';
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters([
      'currentRoute'
    ]),
    layout() {
      return `${this.$store.state.routes[this.currentRoute].layout}-layout`;
    },
    page() {
      return `${this.currentRoute}-page`;
    }
  },
};
</script>
