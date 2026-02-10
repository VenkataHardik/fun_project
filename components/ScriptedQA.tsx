"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { AskResponse, AskErrorResponse } from "@/lib/api-types";

type Props = {
  displayName: string;
  onReply: (msg: string, source?: "openai" | "scripted") => void;
};

const MAX_RECENT_REPLIES = 5;

export default function ScriptedQA({ displayName, onReply }: Props) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [openaiConfigured, setOpenaiConfigured] = useState<boolean | null>(null);
  const [recentReplies, setRecentReplies] = useState<{ text: string; source?: "openai" | "scripted" }[]>([]);
  const [recentOpen, setRecentOpen] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const onReplyRef = useRef(onReply);
  onReplyRef.current = onReply;

  useEffect(() => {
    fetch("/api/ask/status")
      .then((r) => r.json())
      .then((d) => setOpenaiConfigured(d.openaiConfigured === true))
      .catch(() => setOpenaiConfigured(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || loading) return;
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18_000);
      const res = await fetch("/api/ask", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = (await res.json().catch(() => ({}))) as AskResponse | AskErrorResponse;

      const showInBubble = (msg: string, source?: "openai" | "scripted") => {
        onReplyRef.current(msg, source);
      };

      if (!res.ok) {
        const errBody = data as AskErrorResponse;
        const errMsg = res.status === 429
          ? "Too many messages—please wait a moment and try again!"
          : errBody?.error
            ? errBody.error
            : "Something went wrong. Try again?";
        setInlineError(errMsg);
        setTimeout(() => setInlineError(null), 5000);
        showInBubble(errMsg);
        return;
      }

      setInlineError(null);
      const rawReply = (data as AskResponse).reply;
      const replyText =
        typeof rawReply === "string"
          ? rawReply.trim()
          : rawReply != null && String(rawReply).trim()
            ? String(rawReply).trim()
            : "";

      if (replyText) {
        const source = (data as AskResponse).source;
        showInBubble(replyText, source);
        setRecentReplies((prev) => [{ text: replyText, source }, ...prev].slice(0, MAX_RECENT_REPLIES));
        setQuestion("");
      } else {
        showInBubble("I'm a little confused right now. Try again?");
      }
    } catch (err) {
      const errMsg =
        (err as Error).name === "AbortError"
          ? "That took too long—try again? I'm still here!"
          : "Something went wrong. I'm still here for you!";
      onReplyRef.current(errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      className="rounded-3xl border border-ice-200/50 bg-white/90 p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Talk to your penguin
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Ask anything—your penguin will answer in the speech bubble above!
        {openaiConfigured === true && (
          <span className="block mt-1 text-ice-500 font-medium">Using AI</span>
        )}
        {openaiConfigured === false && (
          <span className="block mt-1 text-gray-400">Using scripted replies. Add GROQ_API_KEY to .env for AI (free at console.groq.com).</span>
        )}
      </p>
      {inlineError && (
        <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2" role="alert">
          {inlineError}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
        <motion.input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Do you love me?"
          maxLength={500}
          className="flex-1 min-w-[100px] sm:min-w-[200px] px-4 py-2.5 text-base rounded-xl border border-ice-200 bg-white focus:ring-2 focus:ring-ice-400 focus:border-ice-400 outline-none transition shadow-sm"
          disabled={loading}
          aria-label="Ask the penguin"
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        />
        <motion.button
          type="submit"
          disabled={loading || !question.trim()}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-ice-500 text-white font-medium hover:bg-ice-600 disabled:opacity-50 shadow-md"
          whileHover={loading || !question.trim() ? {} : { scale: 1.05, y: -1 }}
          whileTap={loading || !question.trim() ? {} : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {loading ? "…" : "Ask"}
        </motion.button>
      </form>
      {recentReplies.length > 0 && (
        <div className="mt-4 border-t border-ice-200 pt-3">
          <button
            type="button"
            onClick={() => setRecentOpen((o) => !o)}
            className="text-xs font-medium text-ice-500 hover:text-ice-600 transition flex items-center gap-1"
            aria-expanded={recentOpen}
          >
            {recentOpen ? "Hide" : "Show"} recent replies ({recentReplies.length})
          </button>
          {recentOpen && (
            <ul className="mt-2 space-y-2" role="list">
              {recentReplies.map((r, i) => (
                <li key={`${i}-${r.text.slice(0, 20)}`} className="text-sm text-gray-700 pl-2 border-l-2 border-ice-200">
                  &ldquo;{r.text}&rdquo;
                  {r.source && <span className="text-xs text-gray-400 ml-1">({r.source === "openai" ? "AI" : "scripted"})</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </motion.div>
  );
}
