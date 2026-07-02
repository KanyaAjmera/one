import axios from "axios";
import { NODE_API_URL, PYTHON_API_URL } from "@/config";

const CHAT_TIMEOUT_MS = 90000;

async function tryNodeChat(message: string): Promise<string | null> {
  if (!NODE_API_URL) return null;
  try {
    const res = await axios.post(
      `${NODE_API_URL}/api/chat/ask`,
      { message, mode: "general" },
      { timeout: CHAT_TIMEOUT_MS },
    );
    if (res.data?.response) return res.data.response;
  } catch {
    // try next backend
  }
  return null;
}

async function tryPythonChat(message: string): Promise<string | null> {
  if (!PYTHON_API_URL) return null;

  try {
    const res = await axios.post(
      `${PYTHON_API_URL}/api/chat/ask`,
      { message, mode: "general" },
      { timeout: CHAT_TIMEOUT_MS },
    );
    if (res.data?.response) return res.data.response;
  } catch {
    // fall through to legacy endpoint on older Render deploys
  }

  try {
    const res = await axios.post(
      `${PYTHON_API_URL}/api/ask`,
      { question: message },
      { timeout: CHAT_TIMEOUT_MS },
    );
    if (res.data?.answer) return res.data.answer;
  } catch {
    // exhausted
  }

  return null;
}

export async function askGeneralChat(message: string): Promise<string> {
  const nodeResponse = await tryNodeChat(message);
  if (nodeResponse) return nodeResponse;

  const pythonResponse = await tryPythonChat(message);
  if (pythonResponse) return pythonResponse;

  return "Sorry, I couldn't reach the AI engine. Please try again.";
}
