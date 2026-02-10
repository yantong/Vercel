const axios = require("axios");

let isLocal = true;

async function sendChatRequest() {
  try {
    const response = await axios.post(
      isLocal ? "http://localhost:3000/chat" : "https://www.qiuye.asia/chat",
      {
        lyrics: `广い宇宙の数ある一つ
靑い地球の广い世界で
小さな恋の思いは届く
小さな岛のあなたのもとへ
あなたと出会い
时は流れる
思いをこめた
手纸もふえる
いつしか二人互いに响く
时に激しく
时に切なく
响くは远く
遥か彼方へ
やさしい歌は
世界を变える
ほらあなたにとって
大事な人ほど
すぐそばにいるの
ただあなたにだけ
届いて欲しい
响け恋の歌
ほら～～ほら～～ほら～～
响け恋の歌
あなたは气づく
二人は步く
暗い道でも
日日照らす月
握りしめた手
离すことなく
思いは强く
永远誓う
永远の渊
きっと仆は言う
思い变わらず同じ言叶を
それでも足りず
泪にかわり
喜びになり
言叶にできず
ただ抱きしめる
ただ抱きしめる
ほらあなたにとって
大事な人ほど
すぐそばにいるの
ただあなたにだけ
届いて欲しい
响け恋の歌
ほら～～ほら～～ほら～～～
响け恋の歌
梦ならば觉めないで
梦ならば觉めないで
あなたと过ごした时
永远の星となる
ほらあなたにとって
大事な人ほど
すぐそばにいるの
ただあなたにだけ
届いて欲しい
响け恋の歌
ほらあなたにとって
大事な人ほど
すぐそばにいるの
ただあなたにだけ
届いて欲しい
响け恋の歌
ほら～～ほら～～ほら～～
响け恋の歌`,
      },
      {
        responseType: "stream",
      },
    );

    let fullData = "";

    response.data.on("data", (chunk) => {
      fullData += chunk.toString();
      process.stdout.write(chunk.toString());
    });

    response.data.on("end", () => {
      console.log("\n\n=== 完整响应 ===");
      console.log(fullData);
    });

    response.data.on("error", (error) => {
      console.error("\n流错误:", error.message);
    });
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

sendChatRequest();
