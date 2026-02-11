const axios = require("axios");

let isLocal = true;

async function sendChatRequest() {
  try {
    const response = await axios.post(
      isLocal ? "http://localhost:3000/chat" : "https://www.qiuye.asia/chat",
      {
        lyrics: `弱いココロは急に迷路になって,ぼくの気持ち惑わすけど
たったひとつのハートで,見つめたいんだ 梦を
運命なんか体当たりして,きっと変えられる
たったひとつのハートで,信じたいんだ いつも`,
      },
      {
        responseType: "stream",
      },
    );

    let fullData = "";
    let buffer = "";

    response.data.on("data", (chunk) => {
      // 将新数据添加到缓冲区
      buffer += chunk.toString();
      
      // 分割事件（事件之间用两个连续的换行符分隔）
      const events = buffer.split('\n\n');
      
      // 处理每个完整的事件
      for (let i = 0; i < events.length - 1; i++) {
        const event = events[i];
        if (event.trim()) {
          // 解析事件数据
          const lines = event.split('\n');
          let eventData = '';
          
          for (const line of lines) {
            if (line.startsWith('data:')) {
              // 提取数据部分（移除'data:'前缀和可能的空格）
              const data = line.substring(5).trim();
              eventData += data;
            }
          }
          
          if (eventData) {
            // 处理数据（这里可以根据需要进行JSON解析等操作）
            fullData += eventData;
            process.stdout.write(eventData);
          }
        }
      }
      
      // 保留最后一个不完整的事件在缓冲区中
      buffer = events[events.length - 1];
    });

    response.data.on("end", () => {
      // 处理缓冲区中可能剩余的最后一个事件
      if (buffer.trim()) {
        const lines = buffer.split('\n');
        let eventData = '';
        
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.substring(5).trim();
            eventData += data;
          }
        }
        
        if (eventData) {
          fullData += eventData;
          process.stdout.write(eventData);
        }
      }
      
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

// sendChatRequest();

async function sendAnalysisRequest() {
  try {
    const response = await axios.post(
      isLocal
        ? "http://localhost:3000/analysis"
        : "https://www.qiuye.asia/analysis",
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
响け恋の歌 `,
      },
    );

    const fullData = response.data;
    console.log(fullData);
    console.log("\n\n=== 完整响应 ===");
    console.log(fullData);
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

sendAnalysisRequest();
