const axios = require("axios");

let isLocal = true;

async function sendChatRequest() {
  try {
    const response = await axios.post(
      isLocal ? "http://localhost:3000/chat" : "https://www.qiuye.asia/chat",
      {
        lyrics: `たったひとつのハートで；守（まも）りたいんだ きみを；逢（あ）えてよかった きみでよかった；ぼくの大事（だいじ）な人（ひと）が
きみがすぐそばにいてくれる；それだけで顽張（がんば）れる；ぼくの淋（さび）しさを吸（す）い込（こ）んで；微笑（ほほえ）みにしてくれる
弱（よわ）いココロは急（きゅう）に 迷路（めいろ）になって；ぼくの気持（きも）ち 惑（まど）わすけど；たったひとつのハートで；见（み）つめたいんだ 梦（ゆめ）を`,
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
        lyrics: `"たったひとつのハートで\n守（まも）りたいんだ きみを\n逢（あ）えてよかった きみでよかった\nぼくの大事（だいじ）な人（ひと）が\nきみがすぐそばにいてくれる\nそれだけで顽张（がんば）れる\nぼくの淋（さび）しさを吸（す）い込（こ）んで\n微笑（ほほえ）みにしてくれる\n弱（よわ）いココロは急（きゅう）に 迷路（めいろ）になって\nぼくの気持（きも）ち 惑（まど）わすけど\nたったひとつのハートで\n见（み）つめたいんだ 梦（ゆめ）を\n运命（うんめい）なんか体当（たいあた）たりして\nきっと変（か）えられる\nたったひとつのハートで\n信（しん）じたいんだ いつも\n逢（あ）えてよかった きみでよかった\nぼくを待（ま）ってた人（ひと）が\nきみが落（お）ち込（こ）んでメゲてたら\n全力（ぜんりょく）で支（ささ）えるよ\n今（いま）のぼくにしかできないこと\nあきらめず积（つ）み重（かさ）ね\nそしてココロの旅（たび）が 友（とも）达よりも\nもっと强（つよ）いふたりにする\nずっとひとつのハートで\n约束（やくそく）するよ きみに\nきみの心（こころ）の痛（いた）みはみんな\nぼくの痛（いた）みだよ\nたったひとつのハートで\n抱（だ）きしめたいよ きみを\n逢（あ）えてよかった きみでよかった\nぼくの大事（だいじ）な人（ひと）が\n运命（うんめい）なんか体当（たいあた）たりして\nきっと変（か）えられる\nたったひとつのハートで\n守（まも）りたいんだ きみを\n逢（あ）えてよかった きみでよかった\nぼくの大事（だいじ）な人（ひと）が" `,
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
