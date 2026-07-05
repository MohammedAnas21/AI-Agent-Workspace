import express from "express";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Data Persistence
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DATA_FILE = path.join(DATA_DIR, "workspace_store.json");

const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

function getApiKey(): string {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key || key === "MY_DEEPSEEK_API_KEY") {
    throw new Error("DEEPSEEK_API_KEY environment variable is not configured. Please add your key in Settings > Secrets.");
  }
  return key;
}

interface DeepseekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const getInitialStore = () => ({
  chats: [],
  memories: [],
  uploadedFiles: [],
  notes: [],
  todos: [],
  reminders: [],
  calendarEvents: [],
  settings: {
    theme: "dark",
    model: "deepseek-chat",
    memoryEnabled: true,
    voiceName: "Zephyr",
    voiceSpeed: 1.0,
    apiKeys: {},
    notificationsEnabled: true
  }
});

// ----------------------------------------------------
// DATABASE / PERSISTENCE ENDPOINTS
// ----------------------------------------------------

app.get("/api/workspace/data", async (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = await fsPromises.readFile(DATA_FILE, "utf-8");
      if (!data.trim()) throw new Error("Empty file");
      return res.json(JSON.parse(data));
    }
    const initial = getInitialStore();
    await fsPromises.writeFile(DATA_FILE, JSON.stringify(initial, null, 2));
    res.json(initial);
  } catch (error) {
    console.error("Error reading database:", error);
    res.json(getInitialStore());
  }
});

app.post("/api/workspace/data", async (req, res) => {
  try {
    const data = req.body;
    if (!data || typeof data !== "object") {
      return res.status(400).json({ error: "Invalid payload" });
    }
    await fsPromises.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error("Error writing database:", error);
    res.status(500).json({ error: "Failed to persist workspace data" });
  }
});

// ----------------------------------------------------
// DEEPSEEK CHAT STREAMING
// ----------------------------------------------------

app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, currentMessage, agentPrompt, memories, useSearch, useReasoning, files } = req.body;

    if (!currentMessage || typeof currentMessage !== "string") {
      return res.status(400).json({ error: "currentMessage is required" });
    }

    let apiKey: string;
    try {
      apiKey = getApiKey();
    } catch (err: any) {
      return res.status(401).json({ error: err.message });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Build system prompt
    const systemPrompt = `
${agentPrompt || "You are a helpful and intelligent AI workspace assistant."}

LONG-TERM USER MEMORIES (Use these facts to personalize your responses):
${memories && memories.length > 0
  ? memories.map((m: any) => `- ${m.content}`).join("\n")
  : "No memories recorded yet."}

IMPORTANT WORKSPACE COMMANDS:
If the user commands you to remember something, say "Memory updated: Saved!" and make sure to explicitly include the key-phrase "MEM_SAVE: [fact to remember]" at the very end of your response on a new line.
If the user asks you to forget something, say "Memory updated: Removed!" and include "MEM_FORGET: [keywords or exact text to forget]" at the very end of your response on a new line.

Tone & Style: Always respond beautifully using standard Markdown. Use headers, quotes, lists, and tables where appropriate to match the premium, clean design of this workspace.
`;

    const deepseekMessages: DeepseekMessage[] = [{ role: "system", content: systemPrompt }];

    // Build file context text
    let fileContext = "";
    if (files && files.length > 0) {
      for (const file of files) {
        if (file.extractedText) {
          fileContext += `[Attached File: ${file.name}]\nContent:\n${file.extractedText}\n\n`;
        } else {
          fileContext += `[Attached File: ${file.name}]\n`;
        }
      }
    }

    // Map conversation history (last 15 messages)
    if (messages && messages.length > 0) {
      const recent = messages.slice(-15);
      for (const msg of recent) {
        deepseekMessages.push({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content
        });
      }
    }

    // Add current user message with file context
    const userContent = fileContext ? `${fileContext}\n${currentMessage}` : currentMessage;
    deepseekMessages.push({ role: "user", content: userContent });

    const modelToUse = useReasoning ? "deepseek-reasoner" : "deepseek-chat";

    const body: Record<string, unknown> = {
      model: modelToUse,
      messages: deepseekMessages,
      stream: true,
      max_tokens: 8192,
    };

    if (useSearch) {
      // Deepseek doesn't have built-in web search; ignore silently
    }

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Deepseek API error (${response.status}): ${errText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Readable stream not supported");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const choice = parsed.choices?.[0]?.delta;
          if (!choice) continue;

          const content = choice.content || "";
          const reasoning = choice.reasoning_content || "";

          const payload: Record<string, string> = {};
          if (content) payload.text = content;
          if (reasoning) payload.reasoning = reasoning;

          if (content || reasoning) {
            res.write(`data: ${JSON.stringify(payload)}\n\n`);
          }
        } catch {
          // skip malformed JSON lines
        }
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (error: any) {
    console.error("Chat streaming error:", error);
    res.write(`data: ${JSON.stringify({ error: error.message || "An unexpected streaming error occurred" })}\n\n`);
    res.end();
  }
});

// ----------------------------------------------------
// TEXT-TO-SPEECH (always uses local browser fallback)
// ----------------------------------------------------

app.post("/api/gemini/tts", async (_req, res) => {
  res.json({ useLocal: true });
});

// ----------------------------------------------------
// VITE DEV SERVER OR STATIC SERVING
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
