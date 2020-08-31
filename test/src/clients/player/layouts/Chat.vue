<template>
  <div class="chat-container">
    <div class="chat-navbar">
      <ul>
        <li><span @click="setCurrentRoute('home')">
          Home
        </span></li>
        <li><span @click="setCurrentRoute('contacts')">
          Contacts
        </span></li>
        <li><span @click="setCurrentRoute('discussion')">
          Discussion
        </span></li>
      </ul>
    </div>
    <slot />
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
