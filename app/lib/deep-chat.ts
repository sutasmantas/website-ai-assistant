interface DeepChatRequestBody {
  messages?: Array<{ role?: string; text?: string }>;
}

export function extractLatestQuestion(body: unknown): string {
  const messages = (body as DeepChatRequestBody | null)?.messages;
  if (!Array.isArray(messages)) return "";
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role === "user" && typeof message.text === "string") {
      return message.text.trim();
    }
  }
  return "";
}
