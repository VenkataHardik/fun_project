"use client";

type Props = {
  text: string;
  source?: "openai" | "scripted";
  className?: string;
};

export default function ChatBubble({ text, source, className = "" }: Props) {
  return (
    <div
      className={`inline-block max-w-xs rounded-2xl rounded-bl-sm bg-white border-2 border-ice-400 px-4 py-3 shadow-cute-lg ${className}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-relevant="text"
    >
      <p className="text-gray-800 text-sm leading-relaxed">&ldquo;{text}&rdquo;</p>
      {source && (
        <p className="mt-2 text-xs text-gray-400">
          {source === "openai" ? "From AI" : "From scripted reply"}
        </p>
      )}
    </div>
  );
}
