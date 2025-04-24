<template>
  <div class="imgs pcWallpaper">
    <div class="content">
      <div
        v-for="(col, index) in imgCols"
        :key="index"
        class="col"
        :style="{ width: `calc(${100 / (imgCols.length + 0.2)}%)` }"
      >
        <template v-for="item in col" :key="item.thumbUrl">
          <imgItem :item></imgItem>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from "vue";

import imgItem from "./imgItem.vue";

import { useWallpaper } from "@/utils/useWallpaper";

const props = defineProps({
  selCategory: {
    type: Object,
    default: () => {
      return {
        categoryName: "精选",
        categoryCode: "0",
      };
    },
  },
  selCategorySub: {
    type: Object,
    default: () => {
      return {
        name: "热门",
        code: "0",
      };
    },
  },
});

let reqId = 0;

let { initList, imgCols } = useWallpaper({ getData, isPc: true });

watch(() => [props.selCategory, props.selCategorySub], initList);

async function getData(curPage) {
  let id = (reqId = Math.random());

  let params = { sort_type: props.selCategorySub.code, page: curPage };

  props.selCategory.requestParams.sizeType !== undefined &&
    (params.size_type = props.selCategory.requestParams.sizeType);
  props.selCategory.requestParams.searchWord !== undefined &&
    (params.search_word = props.selCategory.requestParams.searchWord);

  let res = await fetch("/wallpaper/v1/search/pcScreen", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  let data = await res.json();

  return reqId === id ? data : null;
}

defineExpose({
  initList,
});
</script>

<style scoped lang="less">
.pcWallpaper {
  margin-left: auto;
  margin-right: auto;
  width: 100%;

  background: hsl(var(--background));

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
    justify-content: space-between;

    .col {
      height: auto;
    }
  }
}
</style>
