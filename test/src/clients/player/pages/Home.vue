<template>
  <div class="contents">
    
    This is the home page. <br>

    <button 
      @click="setCurrentRoute('contacts')">
      Enter
    </button>

  </div>
</template>

<script>
import { mapMutations } from 'vuex';
export default {
  methods: {
    ...mapMutations([
      'setCurrentRoute',
    ]),
  },
};
</script>