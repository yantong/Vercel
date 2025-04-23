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
          <img
            v-if="
              !errorImg[item.thumbUrl] || errorImg[item.thumbUrl] === 'retry'
            "
            alt=""
            :src="getUrl(item, errorImg[item.thumbUrl])"
            :style="{ 'aspect-ratio': item.width / item.height, width: '100%' }"
            @click="openImg(item)"
            @error="
              errorImg[item.thumbUrl] = errorImg[item.thumbUrl]
                ? 'fail'
                : 'retry'
            "
          />
          <div
            v-else
            class="error-img"
            :style="{ 'aspect-ratio': item.width / item.height, width: '100%' }"
          ></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { hexMD5 } from "@/utils/md5";

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

const listData = ref([]);
const imgCols = ref([]);
const errorImg = ref({});

const loading = ref(false);
const finished = ref(false);

const isPc = computed(() => {
  let categoryName = props.selCategory.categoryName;

  return (
    categoryName.indexOf("电脑壁纸") >= 0 || categoryName.indexOf("横屏") >= 0
  );
});

let reqId = 0;
let curPage = 0;

onMounted(() => {
  initList();
});

onMounted(() => {
  // 监听滚动事件
  window.addEventListener("scroll", bottomReached);
});

onBeforeUnmount(() => {
  // 监听滚动事件
  window.removeEventListener("scroll", bottomReached);
});

watch(() => [props.searchWord, props.selCategory], initList);

async function initList() {
  imgCols.value = [];

  finished.value = false;
  listData.value = [];
  curPage = 0;

  document.documentElement.scrollTop = 0;

  await getList();
}

async function getList() {
  if (finished.value) return;

  loading.value = true;

  let id = (reqId = Math.random());

  let res = await getQeq();
  let data = await res.json();

  curPage++;

  reqId == id &&
    listData.value.push(
      ...(data || []).filter((item) => {
        return !listData.value.find((img) => img.thumbUrl == item.thumbUrl);
      })
    );
  finished.value = !data?.length;

  calcPosition();

  loading.value = false;
}

function getQeq() {
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

function calcPosition() {
  let colNum = isPc.value ? 4 : 6;
  let heights = new Array(colNum).fill(0);
  let cols = new Array(colNum);

  for (let i = 0; i < colNum; i++) {
    cols[i] = [];
  }

  listData.value.forEach((item) => {
    let picHeight = (item.height / item.width) * 100;
    let index = 0;
    let minHeight = heights[0];

    heights.forEach((height, i) => {
      if (height < minHeight) {
        minHeight = height;
        index = i;
      }
    });

    heights[index] += picHeight;
    cols[index].push(item);
  });

  imgCols.value = cols;
}

function getUrl(item, showLargr) {
  let hbUrl = "http://img.hb.aicdn.com";

  if ((showLargr ? item.largeUrl : item.thumbUrl).indexOf(hbUrl) >= 0) {
    return (showLargr ? item.largeUrl : item.thumbUrl).replace(
      hbUrl,
      "https://hbimg.huaban.com"
    );
  }

  return showLargr ? item.largeUrl : item.thumbUrl;
}

function openImg(item) {
  window.open(item.largeUrl);
}

function bottomReached() {
  if (loading.value) return;

  if (
    document.documentElement.scrollTop + window.innerHeight >=
    document.documentElement.scrollHeight - window.innerHeight / 3
  ) {
    getList();
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

      img,
      .error-img {
        margin-top: 16px;

        border-radius: 8px;

        cursor: pointer;
      }

      .error-img {
        background: #314c67;

        cursor: not-allowed;
      }
    }
  }
}
</style>
