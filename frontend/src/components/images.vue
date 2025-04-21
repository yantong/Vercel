<template>
  <div class="imgs">
    <div class="content"></div>
  </div>
</template>

<script setup></script>

<style scoped lang="less">
.imgs {
  margin-left: auto;
  margin-right: auto;
  width: 100%;

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
  }
}
</style>
