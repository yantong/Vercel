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

sendChatRequest();

async function sendAnalysisRequest() {
  try {
    const response = await axios.post(
      isLocal
        ? "http://localhost:3000/analysis"
        : "https://www.qiuye.asia/analysis",
      {
        lyrics: `たったひとつのハートで
守（まも）りたいんだ きみを
凭着一颗心 就想保护你
逢（あ）えてよかった きみでよかった
能遇见你真好 那个人是你真好
ぼくの大事（だいじ）な人（ひと）が
你是我最重要的人
きみがすぐそばにいてくれる
你在我的身边
それだけで顽张（がんば）れる
单凭这一点就能让我勇气十足
ぼくの淋（さび）しさを吸（す）い込（こ）んで
你把我的悲伤全部吸走
微笑（ほほえ）みにしてくれる
然后回报微笑给我
弱（よわ）いココロは急（きゅう）に 迷路（めいろ）になって
脆弱的内心虽然时常迷路
ぼくの気持（きも）ち 惑（まど）わすけど
虽然心情时常会感到怀疑
たったひとつのハートで
见（み）つめたいんだ 梦（ゆめ）を
凭着一颗心 就想追求梦
运命（うんめい）なんか体当（たいあた）たりして
きっと変（か）えられる
只要相信 命运一定会改变
たったひとつのハートで
信（しん）じたいんだ いつも
凭着一颗心 永远都相信
逢（あ）えてよかった きみでよかった
能遇见你真好 那个人是你真好
ぼくを待（ま）ってた人（ひと）が
你是我等待的人
きみが落（お）ち込（こ）んでメゲてたら
你受挫而沮丧的时候
全力（ぜんりょく）で支（ささ）えるよ
会全力支持你
今（いま）のぼくにしかできないこと
现在的我所无法完成的事
あきらめず积（つ）み重（かさ）ね
绝对不会因此放弃
そしてココロの旅（たび）が 友（とも）达よりも
然而心的旅程　两个人一起
もっと强（つよ）いふたりにする
要比朋友们 还要更坚强
ずっとひとつのハートで
约束（やくそく）するよ きみに
要比朋友们 还要更坚强
きみの心（こころ）の痛（いた）みはみんな
你心中的痛就是所有人
ぼくの痛（いた）みだよ
就是我的痛
たったひとつのハートで
抱（だ）きしめたいよ きみを
凭着一颗心 就想拥抱你
逢（あ）えてよかった きみでよかった
能遇见你真好 那个人是你真好
ぼくの大事（だいじ）な人（ひと）が
你是我最重要的人
运命（うんめい）なんか体当（たいあた）たりして
きっと変（か）えられる
命运之类的事 一定能改变
たったひとつのハートで
守（まも）りたいんだ きみを
凭着一颗心 就想保护你
逢（あ）えてよかった きみでよかった
能遇见你真好 那个人是你真好
ぼくの大事（だいじ）な人（ひと）が
你是我最重要的`,
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

// sendAnalysisRequest();
