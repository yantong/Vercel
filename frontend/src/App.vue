<template>
  <div>
    <headerCom :type="type" @typeChange="type = $event" />
    <types
      :type="type"
      :selCategory="selCategory"
      :selCategorySub="selCategorySub"
      @categoryChange="selCategory = $event"
      @categorySubChange="selCategorySub = $event"
    />

    <template v-if="selCategory">
      <phoneWallpaper
        v-if="type === 'phone'"
        :selCategory="selCategory"
        :selCategorySub="selCategorySub"
      />
      <pcWallpaper v-else />
    </template>
  </div>
</template>

<script setup>
import { ref } from "vue";

import headerCom from "./components/header.vue";
import types from "./components/types.vue";
import phoneWallpaper from "./components/phoneWallpaper.vue";
import pcWallpaper from "./components/pcWallpaper.vue";

const type = ref("phone");
const selCategory = ref();
const selCategorySub = ref();
</script>

<style lang="less">
body {
  height: 100vh;

  transition: color 0.15s, background-color 0.15s, border-color 0.15s;

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
      padding-top: 55px;

      .content {
        min-height: calc(100vh - (56px + 55px));
      }
    }
  }
}
</style>
