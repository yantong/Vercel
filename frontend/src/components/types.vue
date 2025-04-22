<template>
  <div class="types">
    <div class="content">
      <div class="catagorys" id="catagorys">
        <span
          v-for="item in type === 'phone' ? phoneCatagorys : pcCatagorys"
          :key="item.categoryName"
          @click="emit('categoryChange', item)"
          class="item"
          :class="{ active: selCategory.categoryName === item.categoryName }"
        >
          {{ item.categoryName }}
        </span>
      </div>
      <div
        class="sub-catagorys"
        v-show="type !== 'phone' || showSort(selCategory)"
      >
        <span
          v-for="item in sortTypes"
          :key="item.name"
          @click="emit('categorySubChange', item)"
          class="sub-item"
          :class="{ active: selCategorySub.name === item.name }"
        >
          {{ item.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

const props = defineProps({
  type: {
    type: String,
    default: "phone",
  },
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

const emit = defineEmits(["categoryChange", "categorySubChange"]);

const allTypes = ref([]);
const phoneCatagorys = ref([]);
const pcCatagorys = ref([]);

const sortTypes = [
  {
    name: "热门",
    code: "0",
  },
  {
    name: "最新",
    code: "1",
  },
  {
    name: "最热",
    code: "2",
  },
  {
    name: "发现",
    code: "3",
  },
];

onMounted(async () => {
  await getAllTypes();

  await getPhoneCategoryData();
  await getPcCategoryData();

  emit("categoryChange", phoneCatagorys.value[0]);
  emit("categorySubChange", sortTypes[0]);
});

onMounted(() => {
  let catagorys = document.getElementById("catagorys");

  catagorys.addEventListener("wheel", function (e) {
    catagorys.scrollLeft += e.deltaY;
  });
});

watch(
  () => props.type,
  () => {
    if (props.type === "phone") {
      emit("categoryChange", phoneCatagorys.value[0]);
    } else {
      emit("categoryChange", pcCatagorys.value[0]);
    }

    emit("categorySubChange", sortTypes[0]);
  }
);

async function getAllTypes() {
  let res = await fetch("wallpaper/v1/config/queryConfig", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      config_key: "stsq_web_image_feature_config",
    }),
  });

  allTypes.value = await res.json();
}

async function getPhoneCategoryData() {
  const phoneText = "手机壁纸";
  const phonepage = allTypes.value.find(
    (item) => item.featureName == phoneText
  );

  let res = await fetch("wallpaper/v1/config/queryConfig", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      config_key: phonepage.categoryConfigKey,
    }),
  });

  phoneCatagorys.value = await res.json();
}

async function getPcCategoryData() {
  const pcText = "电脑壁纸";
  const pcpage = allTypes.value.find((item) => item.featureName == pcText);

  let res = await fetch("wallpaper/v1/config/queryConfig", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      config_key: pcpage.categoryConfigKey,
    }),
  });

  pcCatagorys.value = await res.json();
}

function showSort(category) {
  return [
    "精选",
    "主题壁纸",
    "高清壁纸",
    "全面屏",
    "平板壁纸",
    "2K壁纸",
    "4K壁纸",
    "情侣",
  ].includes(category.categoryName);
}
</script>

<style scoped lang="less">
.types {
  margin-left: auto;
  margin-right: auto;
  width: 100%;

  border-bottom: 1px solid hsl(var(--border));

  background: hsl(var(--background));

  .content {
    margin-left: auto;
    margin-right: auto;
    max-width: 1536px;

    padding: 12px 0;

    border: 1px solid hsl(var(--border));
    border-top: 0;
    border-bottom: 0;

    display: flex;
    justify-content: flex-end;
    align-items: center;

    .item,
    .sub-item {
      font-size: 14px;

      color: hsl(var(--card-foreground));
      line-height: 28px;

      padding: 0 10px;
      border-radius: 8px;

      border: 1px solid hsl(var(--input));

      margin-right: 12px;

      cursor: pointer;

      &:nth-last-child(1) {
        margin-right: 0;
      }

      &:hover {
        background-color: hsl(var(--accent));
      }

      &.active {
        border-color: hsl(var(--ring));
        background-color: hsl(var(--accent));
      }
    }

    .catagorys {
      min-height: 30px;

      width: 0;
      flex: 1;

      display: flex;

      margin: 0 16px;

      overflow: auto;
      /* 隐藏滚动条，在 Webkit 浏览器中 */
      &::-webkit-scrollbar {
        width: 0px;
        height: 0px;
      }
      /* 隐藏滚动条，在 Firefox 中 */
      scrollbar-width: none;

      .item {
        flex-shrink: 0;
      }
    }

    .sub-catagorys {
      display: flex;

      padding: 0 16px;

      border-left: 1px solid hsl(var(--border));

      .sub-item {
      }
    }
  }
}
</style>
