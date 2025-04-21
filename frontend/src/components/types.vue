<template>
  <div class="types">
    <div class="content"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const phonepage = ref(null);

onMounted(async () => {
  const phoneText = "手机壁纸";

  let params = new FormData();

  params.append("config_key", "stsq_web_image_feature_config");

  let res = await fetch("wallpaper/v1/config/queryConfig", {
    method: "POST",
    body: params,
  });
  let types = await res.json();

  phonepage.value = types.find((item) => item.featureName == phoneText);
});
</script>

<style scoped lang="less">
.types {
  margin-left: auto;
  margin-right: auto;
  width: 100%;

  height: 32px;

  border-bottom: 1px solid hsl(var(--border));

  .content {
    height: 100%;

    margin-left: auto;
    margin-right: auto;
    max-width: 1536px;

    border: 1px solid hsl(var(--border));
    border-top: 0;
    border-bottom: 0;

    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
</style>
