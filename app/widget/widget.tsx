"use client";

import dynamic from "next/dynamic";
import { FormEvent, useEffect, useState } from "react";
import type { PageContext } from "../lib/contracts";
import { extractLatestQuestion } from "../lib/deep-chat";
import { parseSseBlock } from "../lib/sse";

const DeepChat = dynamic(
  () => import("deep-chat-react").then((module) => module.DeepChat),
  { ssr: false },
);

interface DeepChatSignals {
  onOpen: () => void;
  onClose: () => void;
  onResponse: (response: { text?: string; error?: string; overwrite?: boolean }) => Promise<void>;
  stopClicked: { listener: () => void };
}

interface Source {
  title: string;
  source_uri: string;
}

const EMPTY_CONTEXT: PageContext = {
  url: "https://switchback.example/",
  title: "Switchback Cycle Co.",
  text: "Standard delivery takes 2–4 business days. Orders receive a tracking link after dispatch. Unused products may be returned within 30 days. Refunds return to the original payment method after inspection. Bicycles include a two-year warranty for manufacturing defects. Crash damage and ordinary wear are not covered.",
};

function isBrowserWorkspace(): boolean {
  return typeof window !== "undefined"
    && (window.location.hostname.endsWith("github.io")
      || new URLSearchParams(window.location.search).has("static"));
}

function browserAnswer(question: string): { text: string; source?: Source } {
  const normalized = question.toLowerCase();
  if (/ship|deliver|tracking|arrive/.test(normalized)) {
    return {
      text: "Standard delivery takes 2–4 business days. You’ll receive a tracking link after dispatch.",
      source: { title: "Switchback · Shipping", source_uri: "#shipping" },
    };
  }
  if (/return|refund|exchange/.test(normalized)) {
    return {
      text: "Unused products can be returned within 30 days. After inspection, the refund goes back to the original payment method.",
      source: { title: "Switchback · Returns", source_uri: "#returns" },
    };
  }
  if (/warrant|damage|repair|wear/.test(normalized)) {
    return {
      text: "Bicycles include a two-year warranty for manufacturing defects. Crash damage and ordinary wear are not covered.",
      source: { title: "Switchback · Warranty", source_uri: "#warranty" },
    };
  }
  return {
    text: "I can’t verify that from this page. Use “Contact the workshop” and a person can follow up.",
  };
}

function makeSessionId(): string {
  return `web_${crypto.randomUUID().replaceAll("-", "")}`;
}

function safeSourceLine(source: Source, index: number): string {
  const label = `[${index + 1}] ${source.title}`;
  return /^https?:/.test(source.source_uri)
    ? `${label} — ${source.source_uri}`
    : label;
}

export function AssistantWidget() {
  const [context, setContext] = useState<PageContext>(EMPTY_CONTEXT);
  const [sessionId] = useState(makeSessionId);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [handoffStatus, setHandoffStatus] = useState("");

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      const payload = event.data as { type?: unknown; page_context?: unknown };
      if (payload?.type !== "website-assistant:init") return;
      const page = payload.page_context as Partial<PageContext>;
      if (
        typeof page?.url === "string" &&
        typeof page?.title === "string" &&
        typeof page?.text === "string"
      ) {
        setContext({ url: page.url, title: page.title, text: page.text.slice(0, 6000) });
      }
    };
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: "website-assistant:ready" }, "*");
    return () => window.removeEventListener("message", receive);
  }, []);

  async function streamAnswer(body: unknown, signals: DeepChatSignals): Promise<void> {
    const question = extractLatestQuestion(body);
    const controller = new AbortController();
    signals.stopClicked.listener = () => controller.abort();
    try {
      if (isBrowserWorkspace()) {
        signals.onOpen();
        const answer = browserAnswer(question);
        await new Promise((resolve) => window.setTimeout(resolve, 240));
        await signals.onResponse({ text: answer.text });
        if (answer.source) {
          await signals.onResponse({ text: `\n\nSources\n${safeSourceLine(answer.source, 0)}` });
        } else {
          setHandoffOpen(true);
        }
        return;
      }
      const response = await fetch("/api/chat", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, session_id: sessionId, page_context: context }),
      });
      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({})) as { detail?: string };
        throw new Error(payload.detail ?? "The assistant is unavailable.");
      }

      signals.onOpen();
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const sources: Source[] = [];
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const parsed = parseSseBlock(buffer.slice(0, boundary));
          buffer = buffer.slice(boundary + 2);
          boundary = buffer.indexOf("\n\n");
          if (!parsed) continue;
          if (parsed.event === "sources") {
            sources.push(...((parsed.data.sources ?? []) as Source[]));
          }
          if (parsed.event === "delta") {
            await signals.onResponse({ text: String(parsed.data.text ?? "") });
          }
          if (parsed.event === "retracted") {
            await signals.onResponse({
              text: String(
                parsed.data.detail
                  ?? "I couldn't verify that answer. Please contact the workshop instead.",
              ),
              overwrite: true,
            });
            setHandoffOpen(true);
            await reader.cancel();
            return;
          }
          if (parsed.event === "error") {
            throw new Error(String(parsed.data.detail ?? "The query failed."));
          }
        }
      }
      if (sources.length) {
        await signals.onResponse({
          text: `\n\nSources\n${sources.map(safeSourceLine).join("\n")}`,
        });
      }
    } catch (caught) {
      if ((caught as Error).name !== "AbortError") {
        await signals.onResponse({
          text: caught instanceof Error ? caught.message : "The assistant is unavailable.",
          overwrite: true,
        });
        setHandoffOpen(true);
      }
    } finally {
      signals.onClose();
    }
  }

  async function requestHandoff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHandoffStatus("Sending…");
    const data = new FormData(event.currentTarget);
    if (isBrowserWorkspace()) {
      setHandoffStatus("Request captured in this browser workspace.");
      return;
    }
    const response = await fetch("/api/handoff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        name: data.get("name"),
        email: data.get("email"),
        message: data.get("message"),
        consent: data.get("consent") === "on",
        page_context: { url: context.url, title: context.title },
      }),
    });
    const payload = await response.json().catch(() => ({})) as { detail?: string };
    setHandoffStatus(
      response.ok
        ? "Request accepted. A person can follow up."
        : payload.detail ?? "Handoff failed.",
    );
  }

  return (
    <main className="widget-shell">
      <header>
        <div>
          <strong>Trail desk</strong>
          <small>Cited answers from this site</small>
        </div>
        <button
          type="button"
          className="close"
          aria-label="Close assistant"
          onClick={() => window.parent.postMessage({ type: "website-assistant:close" }, "*")}
        >
          ×
        </button>
      </header>

      <DeepChat
        connect={{
          stream: true,
          handler: streamAnswer,
        }}
        introMessage={{ text: "Ask about shipping, returns, or warranty. I’ll show the source I used." }}
        chatStyle={{ width: "100%", height: "100%", border: "0", borderRadius: "0" }}
        textInput={{ placeholder: { text: "Ask a site question…" } }}
        messageStyles={{
          default: {
            shared: { bubble: { borderRadius: "4px", fontFamily: "Arial, sans-serif" } },
            user: { bubble: { backgroundColor: "#1746d1", color: "#ffffff" } },
            ai: { bubble: { backgroundColor: "#f3efe4", color: "#141414" } },
          },
        }}
      />

      <button type="button" className="handoff-toggle" onClick={() => setHandoffOpen(!handoffOpen)}>
        Contact the workshop
      </button>
      {handoffOpen && (
        <form className="handoff" onSubmit={requestHandoff}>
          <label>Name<input name="name" required minLength={2} maxLength={100} /></label>
          <label>Email<input name="email" type="email" required maxLength={254} /></label>
          <label>Message<textarea name="message" required minLength={3} maxLength={1000} /></label>
          <label className="consent"><input name="consent" type="checkbox" required /> I agree to send these details for follow-up.</label>
          <button type="submit">Request follow-up</button>
          {handoffStatus && <p role="status">{handoffStatus}</p>}
        </form>
      )}
    </main>
  );
}
