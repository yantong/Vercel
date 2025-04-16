<template>
  <div>Hello world</div>
</template>

<script>
export default {
  name: "App",
  components: {},
  mounted() {
    fetch('/api/qiuye')
  }
};
</script>

<style></style>
