const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

// 初始化客户端
const client = new OpenAI({
  apiKey: "ms-f726b559-a7ed-408c-a13f-465c82d43b88", // 替换为你的 ModelScope Access Token
  baseURL: "https://api-inference.modelscope.cn/v1/",
});

const initialModelReqCountMap = {
  "deepseek-ai/DeepSeek-V3.2": 100,
  "deepseek-ai/DeepSeek-R1-0528": 100,
  "Qwen/Qwen3-235B-A22B-Instruct-2507": 100,
  "Qwen/Qwen3-235B-A22B": 100,
  "XiaomiMiMo/MiMo-V2-Flash": 100,
  "moonshotai/Kimi-K2.5": 200,
  "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B": 200,
  "Qwen/Qwen3-235B-A22B-Thinking-2507": 100,
  "ZhipuAI/GLM-4.7": 100,
  "MiniMax/MiniMax-M1-80k": 100,
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
          content: `输入日语歌词，对歌词进行语法分析然后拆解成一个个的单词，生成一个json对象，对象的字段包含单词和单词的描述。

如果日语歌词中有汉字，在汉字后面没有对应的假名备注则需要在汉字后面用将对应的假名写在括号中。

如果输入的歌词有中文翻译则使用本来的翻译，没有则对句子进行翻译。翻译时结合上下文使用意译。

 输出一个数组，数组的每个元素是一个对象，包含fanyi和dancizu两个字段，fanyi字段是这个句子的中文翻译，dancizu字段是个数组，dancizu数组的每个元素是一个对象，包含danci和miaoshu两个字段，其中danci是分割出来的单词，miaoshu字段是单词的语法描述，语法描述需要包含对它的词性、核心含义、用法 / 拓展 + 歌词语境描述，形容词备注是几类形容词，动词备注是几类动词，用的什么时态什么变形并显示动词的原型。miaoshu中的引号使用单引号。

 json示例如下：
[
    {
        "fanyi": "想要守护你",
        "dancizu": [
            {
                "danci": "守（まも）り",
                "miaoshu": "動詞。原形为'守る（まもる）'，属于一类动词 （五段動詞）。核心含义是'保护、守护、遵守'。此为ます形連用形（'守ります'去 掉'ます'），后续'たい'表示愿望。在歌词语境中，表达强烈的保护欲。变形详解： 原形'守る' → ます形连用形'守り'（规则：词尾う段假名'る'变为同行い段假名'り'）。"
            },
            {
                "danci": "たい",
                "miaoshu": "助動詞（願望助動詞）。接在动词ます形连用形 后，表示第一人称（或推測第二、三人称）'想要做...'的愿望。核心含义是'想、希 望'。变形详解：属于形容词型变化，此处为终止形（简体）。在歌词中，'んだ'是其强调表达的一部分。"
            },
            {
                "danci": "んだ",
                "miaoshu": "助動詞（強調表達）。完整形式为'のだ'，口语 中常音便为'んだ'。接在用言（动词、形容词等）连体形或'名词+な'之后，用于说明原因、强调主张、抒发情感。此处接在'たい'（形容词型助动词，连体形同基本形） 后，强烈表达内心的想法和决心。语法功能：終助詞的な用法，加强语气。特殊表达 ：'守りたいんだ'是'守りたいのだ'的口語省略形，使发音更流畅，情感更直接。"  
            },
            {
                "danci": "きみ",
                "miaoshu": "名詞（代名詞）。核心含义是'你'，较親昵或对 同辈、晚辈的称呼。汉字可写为'君'。在歌词语境中，指想要守护的对象，带有亲密 感。"
            },
                "danci": "を",
                "miaoshu": "助詞（格助詞）。核心含义是表示他动词的'直接宾语'（動作的對象）。此处接在宾语'きみ'后，表示'守护'这个动作的对象是'你'。用法/拓展：构成'を'格宾语。"
            }
        ]
    }
]

最后生成一个json，需要检查json格式的正确性，生成的json需要美化，添加缩进，要能直接复制使用。

只需要返回json，不需要其他的内容，不需要${"```json"}开头和${"```"}结尾。

歌词如下：
${lyrics}
`,
        },
      ],
      stream: true, // 开启流式输出
    });

    // 设置响应头
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    // 遍历流式响应并输出内容
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error) {
    console.error("调用模型出错：", error.message);
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

app.listen(3000, () => console.log("Server ready on port 3000."));

exports.app = app;
