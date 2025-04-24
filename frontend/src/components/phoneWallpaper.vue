<template>
  <div class="imgs phoneWallpaper">
    <div class="content">
      <div
        v-for="(col, index) in imgCols"
        :key="index"
        class="col"
        :style="{ width: `calc(${100 / (imgCols.length + 0.5)}%)` }"
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

let { initList, imgCols } = useWallpaper({ getData, isPc: false });

watch(() => [props.selCategory, props.selCategorySub], initList);

async function getData(curPage) {
  let id = (reqId = Math.random());

  let res = await getQeq(curPage);
  let data = await res.json();

  if (["主题壁纸", "情侣"].includes(props.selCategory.categoryName)) {
    let pics = [];
    data.forEach((data) => {
      Object.keys(data).forEach((key) => {
        if (/^w\d+$/.test(key) && data[key].thumbUrl) {
          pics.push(data[key]);
        }
      });
    });

    return reqId === id ? pics : null;
  } else {
    return reqId === id ? data : null;
  }
}

function getQeq(curPage) {
  let categoryName = props.selCategory.categoryName;
  if (
    ["精选", "高清壁纸", "全面屏", "2K壁纸", "4K壁纸"].includes(categoryName)
  ) {
    let data = {
      sort_type: props.selCategorySub.code,
      page: curPage,
    };
    data.size_type = props.selCategory.requestParams.sizeType;

    data.sign = hexMD5(
      `${`page=${curPage}&size_type=${data.size_type}&sort_type=${data.sort_type}`}&key=d9fd3ec394`
    ).toUpperCase();

    return fetch("/wallpaper/v2/home/imageList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } else if (["主题壁纸", "情侣"].includes(categoryName)) {
    let url = `/wallpaper/api/v1/association/list?association_type=${props.selCategory.requestParams.associationType}&page=${curPage}&sort_type=${props.selCategorySub.code}&tag_type=-1&page_size=15&min_width=0&max_width=999999&min_height=0&max_height=999999`;

    return fetch(url);
  } else if (["平板壁纸"].includes(categoryName)) {
    let data = {
      page: curPage,
      sort_type: props.selCategorySub.code,
      table_type: props.selCategory.requestParams.tableType,
    };

    data.sign = hexMD5(
      `page=${data.page}&sort_type=${data.sort_type}&table_type=${data.table_type}&key=d9fd3ec394`
    ).toUpperCase();

    return fetch("/wallpaper/v2/search/commonList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } else {
    let data = {
      page: curPage,
      category: props.selCategory.requestParams.category,
    };

    data.sign = hexMD5(
      `category=${data.category}&page=${data.page}&key=d9fd3ec394`
    ).toUpperCase();

    return fetch("/wallpaper/v2/channel/queryByCategory", {
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
