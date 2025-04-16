const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  outputDir: "../backend/public",
  lintOnSave: false,
  devServer: {
    proxy: {
      "/wallpaper": {
        target: "http://localhost:3000/",
        changeOrigin: true,
      },
    },
  },
});
