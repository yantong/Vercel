<template>
  <div class="header">
    <div class="content">
      <input
        class="search"
        type="text"
        placeholder="搜索..."
        :value="searchWord"
        @keyup.enter="
          emit('isSearchChange', true);
          emit('searchWordChange', $event.target.value);
        "
      />
      <span
        class="type"
        @click="
          emit('typeChange', type === 'phone' ? 'pc' : 'phone');
          emit('isSearchChange', false);
          emit('searchWordChange', '');
        "
      >
        <img
          :src="theme !== 'light' ? phonelightImg : phoneImg"
          alt=""
          v-show="type === 'pc'"
        />
        <img
          :src="theme !== 'light' ? pclightImg : pcImg"
          alt=""
          v-show="type === 'phone'"
        />
      </span>
      <span class="theme" @click="themeChange">
        <img :src="theme !== 'light' ? lightImg : darkImg" alt="" />
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const darkImg = require("@/assets/image/dark.svg");
const lightImg = require("@/assets/image/light.svg");
const phoneImg = require("@/assets/image/phone.svg");
const phonelightImg = require("@/assets/image/phone-light.svg");
const pcImg = require("@/assets/image/pc.svg");
const pclightImg = require("@/assets/image/pc-light.svg");

const props = defineProps({
  type: {
    type: String,
    default: "phone",
  },
  searchWord: {
    type: String,
    default: "",
  },
  isSearch: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["typeChange", "isSearchChange", "searchWordChange"]);

const theme = ref("light");

function themeChange() {
  theme.value = theme.value === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme.value);
}
</script>

<style scoped>
.header {
  margin-left: auto;
  margin-right: auto;
  width: 100%;

  height: 56px;

  backdrop-filter: blur(8px);

  border-bottom: 1px solid hsl(var(--border));

  background: hsl(var(--background) / 0.8);

  .content {
    height: 100%;

    margin-left: auto;
    margin-right: auto;
    max-width: 1536px;

    padding: 0 24px;

    border: 1px solid hsl(var(--border));
    border-top: 0;
    border-bottom: 0;

    display: flex;
    justify-content: flex-end;
    align-items: center;

    .search {
      height: 32px;
      width: 256px;

      border-radius: 8px;

      margin-right: 16px;

      padding: 0 8px;

      font-size: 14px;

      border: 1px solid hsl(var(--input));
      color: hsl(var(--card-foreground));

      &:focus {
        border: 1px solid hsl(var(--ring));
      }
    }

    .type {
      border-radius: 8px;

      cursor: pointer;

      font-size: 0;

      margin-right: 8px;

      padding: 8px;

      img {
        width: 16px;
      }

      &:hover {
        background-color: hsl(var(--accent));
      }
    }

    .theme {
      padding: 4px 8px;

      border-radius: 8px;

      cursor: pointer;

      img {
        width: 16px;
      }

      &:hover {
        background-color: hsl(var(--accent));
      }
    }
  }
}
</style>
