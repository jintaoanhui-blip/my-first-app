import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = 3000;
const HOST = "127.0.0.1";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/breakdown", async (req, res) => {
  console.log("收到 AI 拆解请求：", req.body);
  console.log("ZHIPU_API_KEY 是否存在：", !!process.env.ZHIPU_API_KEY);

  const { goal } = req.body;

  if (!goal || goal.trim() === "") {
    return res.status(400).json({ error: "目标不能为空" });
  }

  if (!process.env.ZHIPU_API_KEY) {
    return res.status(500).json({ error: "缺少 ZHIPU_API_KEY" });
  }

  try {
    const response = await axios.post(
      "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      {
        model: "glm-4.5-air",
        messages: [
          {
            role: "system",
            content:
              "你是一个任务拆解助手。请把用户的大目标拆成3到5个简短的待办事项。每行只输出一个任务，不要解释，不要编号。",
          },
          {
            role: "user",
            content: goal,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ZHIPU_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data.choices[0].message.content;

    const tasks = text
      .split("\n")
      .map((task) => task.replace(/^\d+\.?\s*/, "").trim())
      .filter((task) => task)
      .slice(0, 5);

    res.json({ tasks });
  } catch (error) {
    console.error("AI 调用失败完整信息：", error.response?.data || error.message);
    res.status(500).json({ error: "AI 调用失败" });
  }
});

app.use("/", express.static(__dirname));

app.listen(PORT, HOST, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
});