<template>
  <div>
    <headerCom
      :type="type"
      :searchWord="searchWord"
      :isSearch="isSearch"
      @searchWordChange="searchWord = $event"
      @isSearchChange="isSearch = $event"
      @typeChange="type = $event"
    />
    <types
      :type="type"
      :isSearch="isSearch"
      :selCategory="selCategory"
      :selCategorySub="selCategorySub"
      @categoryChange="selCategory = $event"
      @categorySubChange="selCategorySub = $event"
    />

    <template v-if="selCategory">
      <searchWallpaper
        v-if="isSearch"
        :selCategory="selCategory"
        :searchWord="searchWord"
      />
      <phoneWallpaper
        v-else-if="type === 'phone'"
        :selCategory="selCategory"
        :selCategorySub="selCategorySub"
      />
      <pcWallpaper
        v-else
        :selCategory="selCategory"
        :selCategorySub="selCategorySub"
      />
    </template>
  </div>
</template>

<script setup>
import { ref } from "vue";

import headerCom from "./components/header.vue";
import types from "./components/types.vue";
import phoneWallpaper from "./components/phoneWallpaper.vue";
import pcWallpaper from "./components/pcWallpaper.vue";
import searchWallpaper from "./components/searchWallpaper.vue";

const type = ref("pc");

const isSearch = ref(false);
const searchWord = ref("");

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
    min-height: 100%;

    .header {
      position: fixed;

      top: 0;
    }

    .types {
      position: fixed;

      top: 56px;

      z-index: 1;
    }

    .imgs {
      padding-top: calc(55px + 54px);

      .content {
        min-height: calc(100vh - (56px + 55px));
      }
    }
  }
}
</style>
