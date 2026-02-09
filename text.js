const axios = require("axios");

async function sendChatRequest() {
  try {
    const response = await axios.post(
      "http://localhost:3000/chat",
      {
        lyrics: `たったひとつのハートで
守（まも）りたいんだ きみを`,
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
