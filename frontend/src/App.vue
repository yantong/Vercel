<template>
  <div>
    <headerCom :type="type" @typeChange="type = $event" />
    <types :type="type" />
    <images />
  </div>
</template>

<script setup>
import { ref } from "vue";

import headerCom from "./components/header.vue";
import types from "./components/types.vue";
import images from "./components/images.vue";

const type = ref("phone");
</script>

<style lang="less">
body {
  height: 100vh;

  transition: color 0.15s, background-color 0.15s, border-color 0.15s;

  background: hsl(var(--background));

  * {
    margin: 0;
    padding: 0;
  }

  #app {
    height: 100%;

    .types {
      position: fixed;

      top: 56px;

      z-index: 1;
    }

    .imgs {
      padding-top: 32px;

      .content {
        min-height: calc(100vh - (56px + 32px));
      }
    }
  }
}
</style>
