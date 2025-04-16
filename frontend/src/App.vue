<template>
  <div></div>
</template>

<script>
export default {
  name: "App",
  components: {},
  mounted() {
    let body = new FormData();

    body.append("config_key", "stsq_web_image_feature_config");

    fetch("/wallpaper/v1/config/queryConfig", {
      method: "POST",
      body,
    });
  },
};
</script>

<style></style>
