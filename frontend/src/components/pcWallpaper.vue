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
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { hexMD5 } from "@/utils/md5";
import axios from "axios";

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

const listData = ref([]);
const imgCols = ref([]);
const errorImg = ref({});

const loading = ref(false);
const finished = ref(false);

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

watch(() => props.selCategory, initList);
watch(() => props.selCategorySub, initList);

async function initList() {
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

  curPage++;

  reqId == id &&
    listData.value.push(
      ...data.filter((item) => {
        return !listData.value.find((img) => img.thumbUrl == item.thumbUrl);
      })
    );

  finished.value = !data.length;

  calcPosition();

  loading.value = false;
}

function calcPosition() {
  let colNum = 4;
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
