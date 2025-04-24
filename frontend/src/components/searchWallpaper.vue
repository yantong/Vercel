<template>
  <div class="imgs phoneWallpaper">
    <div class="content">
      <div
        v-for="(col, index) in imgCols"
        :key="index"
        class="col"
        :style="{
          width: `calc(${100 / (imgCols.length + (isPc ? 0.2 : 0.5))}%)`,
        }"
      >
        <template v-for="item in col" :key="item.thumbUrl">
          <imgItem :item></imgItem>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { hexMD5 } from "@/utils/md5";
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
  searchWord: {
    type: String,
    default: "",
  },
});

let reqId = 0;

const isPc = computed(() => {
  let categoryName = props.selCategory.categoryName;

  return (
    categoryName.indexOf("电脑壁纸") >= 0 || categoryName.indexOf("横屏") >= 0
  );
});

let { initList, imgCols } = useWallpaper({ getData, isPc });

watch(() => [props.searchWord, props.selCategory], initList);

async function getData(curPage) {
  let id = (reqId = Math.random());

  let res = await getQeq(curPage);
  let data = await res.json();

  return reqId === id ? data : null;
}

function getQeq(curPage) {
  let categoryName = props.selCategory.categoryName;
  if (
    [
      "高清壁纸",
      "2k壁纸",
      "4k壁纸",
      "全面屏壁纸",
      "1K横屏",
      "2K横屏",
      "4K横屏",
      "5K横屏",
      "8K横屏",
    ].includes(categoryName)
  ) {
    let data = {
      page: curPage,
      word: props.searchWord,
    };
    data.size_type = props.selCategory.requestParams.sizeType;

    data.sign = hexMD5(
      `${`page=${curPage}&size_type=${data.size_type}`}&key=d9fd3ec394`
    ).toUpperCase();

    return fetch("/wallpaper/v1/search/inSizeType", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } else if (["平板壁纸"].includes(categoryName)) {
    let data = {
      page: curPage,
      search_word: props.searchWord,
      table_type: props.selCategory.requestParams.tableType,
    };

    data.sign = hexMD5(
      `page=${data.page}&search_word=${props.searchWord}&table_type=${data.table_type}&key=d9fd3ec394`
    ).toUpperCase();

    return fetch("/wallpaper/v2/search/commonList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } else if (["电脑壁纸"].includes(categoryName)) {
    let data = { size_type: 0, page: curPage, search_word: props.searchWord };

    return fetch("/wallpaper/v1/search/pcScreen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }
}
</script>

<style scoped lang="less">
.phoneWallpaper {
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
