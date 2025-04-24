import { onBeforeUnmount, onMounted, ref } from "vue";

export function useWallpaper({ getData, isPc }) {
  const listData = ref([]);
  const imgCols = ref([]);

  const loading = ref(false);
  const finished = ref(false);

  let curPage = 0;

  isPc = ref(isPc);

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

    const data = await getData(curPage);

    if (!data) return;

    listData.value.push(
      ...data.filter((item) => {
        return !listData.value.find((img) => img.thumbUrl == item.thumbUrl);
      })
    );

    curPage++;

    finished.value = !data.length;

    calcPosition();

    loading.value = false;
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

  function bottomReached() {
    if (loading.value) return;

    if (
      document.documentElement.scrollTop + window.innerHeight >=
      document.documentElement.scrollHeight - window.innerHeight / 3
    ) {
      getList();
    }
  }

  return {
    initList,
    imgCols,
  };
}
