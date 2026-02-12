const express = require("express");
const OpenAI = require("openai");
const path = require("path");

const app = express();
app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, "../dist")));

// 添加 CORS 支持
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

// 初始化客户端
const client = new OpenAI({
  apiKey: "ms-f726b559-a7ed-408c-a13f-465c82d43b88", // 替换为你的 ModelScope Access Token
  baseURL: "https://api-inference.modelscope.cn/v1/",
});

const initialModelReqCountMap = {
  "moonshotai/Kimi-K2.5": 50,
  "deepseek-ai/DeepSeek-V3.2": 100,
  "meituan-longcat/LongCat-Flash-Lite": 50,
  "Qwen/Qwen3-Coder-480B-A35B-Instruct": 50,
  "Qwen/Qwen3-235B-A22B-Instruct-2507": 100,
};

let modelReqCountMap = { ...initialModelReqCountMap };
let lastResetDate = new Date().toDateString();

function resetModelCountsIfNeeded() {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    modelReqCountMap = { ...initialModelReqCountMap };
    lastResetDate = today;
    console.log("模型调用次数已重置");
  }
}

function getNextAvailableModel() {
  resetModelCountsIfNeeded();
  for (const [model, count] of Object.entries(modelReqCountMap)) {
    if (count > 0) {
      return model;
    }
  }
  return null;
}

function decrementModelCount(model) {
  if (modelReqCountMap[model] > 0) {
    modelReqCountMap[model]--;
    console.log(`模型 ${model} 剩余次数: ${modelReqCountMap[model]}`);
  }
}

// 流式调用模型的异步函数
async function callQwenModel(res, lyrics) {
  try {
    const model = getNextAvailableModel();
    if (!model) {
      return res.status(500).send("所有模型今日调用次数已用完");
    }

    decrementModelCount(model);

    // 创建流式聊天补全请求
    const stream = await client.chat.completions.create({
      model: model, // ModelScope 模型ID
      messages: [
        {
          role: "system",
          content: `你是资深日语语言专家，深耕日语歌词类生活化表达分析，精通日语基础语法、词汇活用、动词 / 形容词变形规则、汉字音读训读，熟悉日语歌词的口语化省略、韵律化表达特点。请针对我提供的日语歌词单句 / 单段 / 单个单词，按结构化、精细化的方式完成全维度分析，适配日语学习和歌词理解需求，具体分析要求如下：
单词解析：每个单词标注假名（汉字单独标注音读 / 训读）、词性、语境专属释义、常见活用形式；
分词拆解：对句子进行精准分词，用分隔符清晰划分，标注分词依据；
语法分析：标注句子各成分（主 / 谓 / 宾 / 定 / 状 / 补）、核心语法点（助词 / 助动词 / 句式用法）、语法功能及使用场景；
变形详解：涉及动词 / 形容词 / 形容动词 / 助动词变形时，明确原词、变形类型、完整变形规则、歌词中使用该变形的原因（如韵律、语气、时态等）；
特殊表达：标注歌词中的口语省略、固定搭配、惯用句、韵律化改写等特殊点，补充常规表达形式；
翻译解读：先给出逐词直译，再给出贴合歌词意境的中文意译，兼顾语义准确和文学性；
总结提示：用 1-2 句话总结该句的核心语法重点和学习要点，便于快速掌握。
分析结果请按逻辑分点 / 分模块呈现，避免晦涩术语，术语需附带简单解释，所有标注精准无误差，适配日语学习者的理解节奏。`,
        },
        {
          role: "user",
          content: `你是专业日语歌词解析助手，严格按以下规则处理输入的日语歌词，只输出最终 JSON，无任何多余内容。
一、核心处理规则
逐行解析：JSON 数组一项对应一行原歌词，保持歌词原有断行顺序， 不要对歌词进行修改保持原样，不要遗漏单词。
精细分词：句子拆分为最小语义单位，单词尽可能短，不合并词汇，助词单独作为一个单词，标点符号也作为一个单词处理。
汉字注音：单词中在汉字后必须用括号标注假名（例：君 (きみ)）。
语法精准：
形容词：标明一类 / 二类形容词
动词：标明五段 / 一段 / サ变 / カ变动词 + 时态 + 变形（如：过去式、て形、た形、可能态、被动态、使役态等）
助词、副词、连词等标注清楚词性与功能
翻译原则：有原译直接沿用，无原译则结合歌词意境自然意译，忠于原意且通顺。
二、JSON 格式强制要求
字段的值里如果存在引号则统一使用单引号。
严格缩进美化，可直接复制使用。
字段不可缺失、不可错名：
fanyi：整行歌词翻译
cizu：单词数组
danci：拆分后的单词（带假名注音）
shendiao：单词声调（数字）
yufa：语法说明（词性、分类、时态、变形）
hanyi：单词中文含义
yuanxing：单词原型（与原形相同时省略此字段）
kuozhan：扩展用法 + 歌词语境说明
输出只返回 JSON，无解释、无注释、无代码块包裹,不需要以${"```json"}开头和${"```"}结尾。
需要严格检查JSON的格式是否正确。

json示例如下：
[
  {
    "fanyi": " 凭着一颗心,就想保护你 ",
    "cizu": [
      {
        "danci": " たった ",
        "shendiao": "0",
        "yufa": " 副词，无变形 ",
        "hanyi": " 只，仅仅，唯有 ",
        "yuanxing": " たった ",
        "kuozhan": " 歌词语境中强调 '仅此一个' 的心意，常用搭配：たった一つ（仅此一个）"
      },
      {
        "danci": " ひとつ ",
        "shendiao": "2",
        "yufa": " 数量词，由 '一（ひと）+ つ' 构成，无变形 ",
        "hanyi": " 一个，一件，（数量）一 ",
        "yuanxing": " ひとつ ",
        "kuozhan": " 歌词语境中对应 '一颗'，常用搭配：ひとつの心（一颗心）"
      },
      {
        "danci": " の ",
        "shendiao": "0",
        "yufa": " 助词，属格助词，无变形 ",
        "hanyi": " 的，（表示所属、限定）",
        "yuanxing": " の ",
        "kuozhan": " 歌词语境中连接 'ひとつ' 和 'ハート'，表所属关系，是日语中最基础的助词之一 "
      },
      {
        "danci": " ハート ",
        "shendiao": "0",
        "yufa": " 名词，外来语（heart），无变形 ",
        "hanyi": " 心，心脏，内心，心形 ",
        "yuanxing": " ハート ",
        "kuozhan": " 歌词语境中对应 '心'，外来语在日语歌词中常见，增强情感表达，常用搭配：ハートで（用心）"
      },
      {
        "danci": " で ",
        "shendiao": "0",
        "yufa": " 助词，工具 / 手段助词，无变形 ",
        "hanyi": " 用，以，通过（某种工具 / 方式）",
        "yuanxing": " で ",
        "kuozhan": " 歌词语境中表示 '凭着（心）'，强调凭借的手段，是日语中表达方式 / 工具的核心助词 "
      },
      {
        "danci": " , ",
      },
      {
        "danci": " 守（まも）り ",
        "shendiao": "2",
        "yufa": " 动词连用形，原形 '守る' 为五段动词，此处是ます形去掉ます的连用形 ",
        "hanyi": " 守护，保护，守卫 ",
        "yuanxing": " 守る（まもる）",
        "kuozhan": " 歌词语境中是 '保护' 的核心动作，连用形后续 'たい' 构成愿望句式，表达想要保护的意愿 "
      },
      {
        "danci": " たい ",
        "shendiao": "2",
        "yufa": " 助动词，愿望助动词，接动词连用形后，无变形 ",
        "hanyi": " 想要（做某事），希望 ",
        "yuanxing": " たい ",
        "kuozhan": " 歌词语境中表达 '想保护' 的愿望，主语默认是第一人称，是日语中表达主观愿望的常用助动词 "
      },
      {
        "danci": " ん ",
        "shendiao": "0",
        "yufa": " 口语中の的音变，终助词，无变形 ",
        "hanyi": "（口语语气词），加强语气，无实际语义 ",
        "yuanxing": " ん（の）",
        "kuozhan": " 歌词语境中是口语化表达，使语气更柔和、亲切，常见于日常对话和歌词中，增强情感的自然流露 "
      },
      {
        "danci": " だ ",
        "shendiao": "0",
        "yufa": " 助动词，断定助动词，口语中常与ん连用，无变形 ",
        "hanyi": "（表示强调、断定），是 ",
        "yuanxing": " だ ",
        "kuozhan": " 歌词语境中配合ん加强 '想要保护你' 的语气，无实际独立语义，仅起语气强化作用 "
      },
      {
        "danci": " きみ ",
        "shendiao": "2",
        "yufa": " 名词，人称代词，无变形 ",
        "hanyi": " 你，（对平辈 / 晚辈的称呼）",
        "yuanxing": " きみ ",
        "kuozhan": " 歌词语境中是 '你' 的核心指代，是日语中较亲昵的第二人称代词，常用于歌词、日常对话中 "
      },
      {
        "danci": " を ",
        "shendiao": "0",
        "yufa": " 助词，宾格助词，无变形 ",
        "hanyi": "（表示动作的对象），把，对 ",
        "yuanxing": " を ",
        "kuozhan": " 歌词语境中表示 '保护' 的对象是 'きみ（你）'，是日语中标记动作宾语的核心助词 "
      }
    ]
  },
  {
    "fanyi": " 能遇见你真好,那个人是你真好 ",
    "cizu": [
      {
        "danci": " 逢（あ）えて ",
        "shendiao": "2",
        "yufa": " 动词て形，原形 '逢う' 为五段动词，此处是可能形 '逢える' 的て形 ",
        "hanyi": " 能遇见，见到 ",
        "yuanxing": " 逢う（あう）",
        "kuozhan": " 歌词语境中表达 '能遇见你' 的庆幸，可能形 + て形是日语中表达 '能够做某事并...' 的常用结构 "
      },
      {
        "danci": " よかった ",
        "shendiao": "3",
        "yufa": " 形容词过去式，原形 'よい'（いい）为イ形容词，此处是过去式变形 ",
        "hanyi": " 真好，太好了，幸好 ",
        "yuanxing": " よい（いい）",
        "kuozhan": " 歌词语境中表达遇见对方后的庆幸和喜悦，过去式强调 '遇见' 这个动作带来的美好结果 "
      },
      {
        "danci": " , ",
      },
      {
        "danci": " きみ ",
        "shendiao": "2",
        "yufa": " 名词，人称代词，无变形 ",
        "hanyi": " 你，（对平辈 / 晚辈的称呼）",
        "yuanxing": " きみ ",
        "kuozhan": " 歌词语境中再次指代 '你'，与上一段歌词中的きみ呼应，强化情感指向 "
      },
      {
        "danci": " で ",
        "shendiao": "0",
        "yufa": " 助词，限定助词，无变形 ",
        "hanyi": "（表示限定），是，以... 身份 ",
        "yuanxing": " で ",
        "kuozhan": " 歌词语境中表示 '是你（真好）'，限定 '好' 的对象是 '你'，区别于其他助词で的工具用法 "
      },
      {
        "danci": " よかった ",
        "shendiao": "3",
        "yufa": " 形容词过去式，原形 'よい'（いい）为イ形容词，此处是过去式变形 ",
        "hanyi": " 真好，太好了，幸好 ",
        "yuanxing": " よい（いい）",
        "kuozhan": " 歌词语境中重复使用，强化 '是你真好' 的情感，是日语中通过重复表达强烈情感的常见手法 "
      }
    ]
  }
]

歌词如下：
${lyrics}
`,
        },
      ],
      stream: true, // 开启流式输出
    });

    // 设置响应头
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // 遍历流式响应并输出内容
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${content.replaceAll("\n", "")}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("调用模型出错：", error.message);
    if (model) {
      modelReqCountMap[model] = 0;
      console.log(`模型 ${model} 调用失败，已将剩余次数设置为0`);
    }
    if (!res.headersSent) {
      res.status(500).send("调用模型出错");
    }
  }
}

async function callAnalysis(res, lyrics) {
  try {
    const model = getNextAvailableModel();
    if (!model) {
      return res.status(500).send("所有模型今日调用次数已用完");
    }

    decrementModelCount(model);

    // 创建非流式聊天补全请求
    const response = await client.chat.completions.create({
      model: model, // ModelScope 模型ID
      messages: [
        {
          role: "system",
          content: `你是资深日语语言专家，深耕日语歌词类生活化表达分析，精通日语基础语法、词汇活用、动词 / 形容词变形规则、汉字音读训读，熟悉日语歌词的口语化省略、韵律化表达特点。请针对我提供的日语歌词单句 / 单段 / 单个单词，按结构化、精细化的方式完成全维度分析，适配日语学习和歌词理解需求，具体分析要求如下：
单词解析：每个单词标注假名（汉字单独标注音读 / 训读）、词性、语境专属释义、常见活用形式；
分词拆解：对句子进行精准分词，用分隔符清晰划分，标注分词依据；
语法分析：标注句子各成分（主 / 谓 / 宾 / 定 / 状 / 补）、核心语法点（助词 / 助动词 / 句式用法）、语法功能及使用场景；
变形详解：涉及动词 / 形容词 / 形容动词 / 助动词变形时，明确原词、变形类型、完整变形规则、歌词中使用该变形的原因（如韵律、语气、时态等）；
特殊表达：标注歌词中的口语省略、固定搭配、惯用句、韵律化改写等特殊点，补充常规表达形式；
翻译解读：先给出逐词直译，再给出贴合歌词意境的中文意译，兼顾语义准确和文学性；
总结提示：用 1-2 句话总结该句的核心语法重点和学习要点，便于快速掌握。
分析结果请按逻辑分点 / 分模块呈现，避免晦涩术语，术语需附带简单解释，所有标注精准无误差，适配日语学习者的理解节奏。`,
        },
        {
          role: "user",
          content: `将句子分行，忽略掉中文翻译，只保留日语歌词，必须把日语歌词保持原样不能进行修改，然后把每行当作一个单独的句子。
          精准识别语义，将相关联的多行歌词合并成一个数组，最多合并4行。
          最后将这些数组合并成一个二维数组返回，只输出最终 JSON，无任何多余内容。
          输出只返回 JSON，无解释、无注释、无代码块包裹,不需要以${"```json"}开头和${"```"}结尾。

歌词如下：
${lyrics}
`,
        },
      ],
      stream: false, // 关闭流式输出
    });

    // 获取完整响应内容
    const content = response.choices[0]?.message?.content;
    if (content) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.send(content);
    } else {
      res.status(500).send("模型未返回分析结果");
    }
  } catch (error) {
    console.error("调用模型出错：", error.message);
    if (model) {
      modelReqCountMap[model] = 0;
      console.log(`模型 ${model} 调用失败，已将剩余次数设置为0`);
    }
    if (!res.headersSent) {
      res.status(500).send("调用模型出错");
    }
  }
}

app.post("/chat", async (req, res) => {
  const { lyrics } = req.body;

  if (!lyrics) {
    return res.status(400).send("缺少 lyrics 参数");
  }

  await callQwenModel(res, lyrics);
});

app.post("/analysis", async (req, res) => {
  const { lyrics } = req.body;

  if (!lyrics) {
    return res.status(400).send("缺少 lyrics 参数");
  }

  await callAnalysis(res, lyrics);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(3000, () => console.log("Server ready on port 3000."));

exports.app = app;
