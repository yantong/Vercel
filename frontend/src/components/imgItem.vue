<template>
  <img
    v-if="!errorImg[item.thumbUrl] || errorImg[item.thumbUrl] === 'retry'"
    alt=""
    :src="getUrl(item, errorImg[item.thumbUrl])"
    :style="{ 'aspect-ratio': item.width / item.height, width: '100%' }"
    @click="openImg(item)"
    @error="
      errorImg[item.thumbUrl] = errorImg[item.thumbUrl] ? 'fail' : 'retry'
    "
  />
  <div
    v-else
    class="error-img"
    :style="{ 'aspect-ratio': item.width / item.height, width: '100%' }"
  ></div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  item: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const errorImg = ref({});

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
</script>

<style scoped lang="less">
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
</style>
